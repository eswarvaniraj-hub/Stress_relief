#!/usr/bin/env python3
"""
BREATHLY — AI Stress Prediction Model Training Pipeline
Trains an XGBoost / Gradient Boosting Regressor on genuine tabular user check-ins.

CRITICAL RULES:
- Never fabricates synthetic fake user rows to pretend the model is accurate.
- If fewer than 50 real labeled sessions exist, logs a transparent advisory
  and instructs the system to safely use the calibrated rule-based baseline.
"""

import os
import sys
import json
from datetime import datetime

MINIMUM_REQUIRED_SAMPLES = 50

def check_dependencies():
    missing = []
    for pkg in ['numpy', 'pandas', 'sklearn']:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    
    has_xgboost = True
    try:
        import xgboost
    except ImportError:
        has_xgboost = False

    return missing, has_xgboost

def load_data_from_postgres(db_url):
    try:
        import psycopg2
        import pandas as pd
    except ImportError as e:
        print(f"[ML Pipeline] Missing database dependencies: {e}")
        return None

    query = """
    SELECT 
        c.user_id,
        c.check_in_date,
        c.overall_feeling,
        c.workload_rating,
        c.sleep_quality,
        c.stress_rating,
        c.stressful_event,
        p.occupation_type,
        p.daily_hours,
        p.sleep_duration,
        p.stress_baseline
    FROM daily_check_ins c
    LEFT JOIN user_onboarding_profiles p ON c.user_id = p.user_id
    WHERE c.stress_rating IS NOT NULL
    ORDER BY c.created_at ASC;
    """

    try:
        conn = psycopg2.connect(db_url)
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df
    except Exception as err:
        print(f"[ML Pipeline] Database connection error: {err}")
        return None

def engineer_features(df):
    import pandas as pd
    import numpy as np

    # Encode categorical check-in fields into standardized numerical scales
    sleep_map = {'great': 4, 'normal': 3, 'poor': 2, 'very_little': 1}
    workload_map = {'light': 1, 'manageable': 2, 'heavy': 3, 'overload': 4}
    feeling_map = {'rested': 4, 'focused': 4, 'neutral': 3, 'demanding': 2, 'exhausted': 1, 'anxious': 1}

    df['feature_sleep_quality'] = df['sleep_quality'].map(sleep_map).fillna(3)
    df['feature_workload'] = df['workload_rating'].map(workload_map).fillna(2)
    df['feature_feeling'] = df['overall_feeling'].map(feeling_map).fillna(3)
    df['feature_stressful_event'] = df['stressful_event'].astype(int).fillna(0)
    df['feature_baseline_stress'] = df['stress_baseline'].fillna(5).astype(float)

    # Sleep hours parser
    def parse_sleep(s):
        if pd.isna(s): return 7.5
        st = str(s).lower()
        if '< 5' in st: return 4.5
        if '5-6' in st or '5–6' in st: return 5.5
        if '7-8' in st or '7–8' in st: return 7.5
        if '8+' in st: return 8.5
        return 7.5
    
    df['feature_baseline_sleep_hours'] = df['sleep_duration'].apply(parse_sleep)

    # Work hours parser
    def parse_work(w):
        if pd.isna(w): return 7.0
        wt = str(w).lower()
        if '< 4' in wt: return 3.5
        if '4-6' in wt or '4–6' in wt: return 5.0
        if '6-8' in wt or '6–8' in wt: return 7.0
        if '8+' in wt: return 9.5
        return 7.0

    df['feature_baseline_work_hours'] = df['daily_hours'].apply(parse_work)

    # Ground-truth target: 0-100 scale
    df['target_stress_score'] = df['stress_rating'].astype(float) * 10.0

    feature_cols = [
        'feature_sleep_quality',
        'feature_workload',
        'feature_feeling',
        'feature_stressful_event',
        'feature_baseline_stress',
        'feature_baseline_sleep_hours',
        'feature_baseline_work_hours'
    ]

    X = df[feature_cols]
    y = df['target_stress_score']

    return X, y, feature_cols

def train_model(X, y, feature_names, use_xgboost=True):
    from sklearn.model_selection import cross_val_score, KFold
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    import numpy as np

    if use_xgboost:
        import xgboost as xgb
        print("[ML Pipeline] Initializing XGBoost Regressor...")
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
    else:
        from sklearn.ensemble import GradientBoostingRegressor
        print("[ML Pipeline] Initializing Scikit-Learn GradientBoostingRegressor...")
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.08,
            random_state=42
        )

    # K-Fold Cross Validation
    cv = KFold(n_splits=min(5, len(X)), shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring='neg_mean_absolute_error')
    mae_cv = -scores.mean()

    # Fit final model on full set
    model.fit(X, y)
    y_pred = model.predict(X)

    mae = mean_absolute_error(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    r2 = r2_score(y, y_pred)

    print("\n--- MODEL PERFORMANCE EVALUATION ---")
    print(f"Training Samples: {len(X)}")
    print(f"Cross-Validated MAE: {mae_cv:.2f} pts (on 0-100 scale)")
    print(f"Training MAE:        {mae:.2f} pts")
    print(f"Training RMSE:       {rmse:.2f} pts")
    print(f"R² Score:            {r2:.3f}")

    # Feature Importance
    importances = model.feature_importances_
    print("\n--- FEATURE IMPORTANCES ---")
    for feat, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
        print(f" - {feat:30s}: {imp * 100:.1f}%")

    # Save model artifact
    output_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'stress_xgboost_model.json' if use_xgboost else 'stress_gb_model.joblib')

    if use_xgboost:
        model.save_model(model_path)
    else:
        import joblib
        joblib.dump(model, model_path)

    metadata = {
        'model_type': 'XGBoost Regressor' if use_xgboost else 'GradientBoostingRegressor',
        'training_date': datetime.now().isoformat(),
        'samples_count': len(X),
        'cross_val_mae': float(mae_cv),
        'features': feature_names,
        'feature_importances': {f: float(i) for f, i in zip(feature_names, importances)}
    }
    with open(os.path.join(output_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[ML Pipeline] Model artifact successfully saved to: {model_path}")
    return metadata

def main():
    print("==================================================")
    print("BREATHLY AI STRESS PREDICTION — ML PIPELINE")
    print("==================================================")

    missing, has_xgboost = check_dependencies()
    if missing:
        print(f"[ML Pipeline] Note: Missing Python ML packages: {', '.join(missing)}")
        print("To install dependencies for offline ML training, run:")
        print("  pip install -r backend/ml/requirements.txt")
        print("\nBreathly will continue operating safely using its calibrated baseline scoring engine.")
        return

    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[ML Pipeline] DATABASE_URL environment variable is not set.")
        print("Provide DATABASE_URL to pull genuine labeled check-in records from Neon PostgreSQL.")
        return

    df = load_data_from_postgres(db_url)
    if df is None:
        print("[ML Pipeline] Could not retrieve data from database.")
        return

    labeled_samples = len(df)
    print(f"[ML Pipeline] Retrieved {labeled_samples} genuine user check-in records.")

    if labeled_samples < MINIMUM_REQUIRED_SAMPLES:
        print(f"\n[ML Pipeline] Status: INSUFFICIENT LABELED DATA ({labeled_samples}/{MINIMUM_REQUIRED_SAMPLES} required).")
        print("Per project safety standards: No fake synthetic data will be fabricated.")
        print("Breathly will continue utilizing its calibrated baseline scoring engine until sufficient")
        print(f"real user check-in history ({MINIMUM_REQUIRED_SAMPLES}+ samples) has been accrued.")
        return

    X, y, feature_names = engineer_features(df)
    train_model(X, y, feature_names, use_xgboost=has_xgboost)

if __name__ == '__main__':
    main()
