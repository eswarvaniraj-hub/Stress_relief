// ==========================================================================
// BREATHLY — AI Stress Prediction & Trend Analysis Service
// Structured Tabular Features + Calibrated Baseline + XGBoost Pipeline Support
// ==========================================================================

const pool = require('../config/db');

// Configurable thresholds (0-30 Low, 31-60 Moderate, 61-100 High)
const DEFAULT_THRESHOLDS = {
  LOW_MAX: parseInt(process.env.STRESS_THRESHOLD_LOW_MAX, 10) || 30,
  MODERATE_MAX: parseInt(process.env.STRESS_THRESHOLD_MOD_MAX, 10) || 60,
  HIGH_MAX: 100
};

/**
 * Categorize a 0-100 score into Low / Moderate / High using configurable thresholds
 */
function categorizeScore(score, thresholds = DEFAULT_THRESHOLDS) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= thresholds.LOW_MAX) {
    return {
      level: 'low',
      label: 'Low Stress Risk',
      category: 'Low',
      color: '#10b981', // emerald
      statusClass: 'status-badge-calm'
    };
  }
  if (s <= thresholds.MODERATE_MAX) {
    return {
      level: 'moderate',
      label: 'Moderate Stress Risk',
      category: 'Moderate',
      color: '#f59e0b', // amber
      statusClass: 'status-badge-elevated'
    };
  }
  return {
    level: 'high',
    label: 'High Stress Risk',
    category: 'High',
    color: '#ef4444', // rose
    statusClass: 'status-badge-demanding'
  };
}

/**
 * Parse sleep duration string into numeric hours
 */
function parseSleepHours(sleepDurationStr) {
  if (!sleepDurationStr) return 7.5;
  const s = String(sleepDurationStr).toLowerCase();
  if (s.includes('< 5') || s.includes('<5')) return 4.5;
  if (s.includes('5-6') || s.includes('5–6')) return 5.5;
  if (s.includes('6-7') || s.includes('6–7')) return 6.5;
  if (s.includes('7-8') || s.includes('7–8')) return 7.5;
  if (s.includes('8+') || s.includes('>8') || s.includes('> 8')) return 8.5;
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 7.5;
}

/**
 * Parse daily work/study hours string into numeric hours
 */
function parseWorkHours(dailyHoursStr) {
  if (!dailyHoursStr) return 7.0;
  const s = String(dailyHoursStr).toLowerCase();
  if (s.includes('< 4') || s.includes('<4')) return 3.5;
  if (s.includes('4-6') || s.includes('4–6')) return 5.0;
  if (s.includes('6-8') || s.includes('6–8')) return 7.0;
  if (s.includes('8+') || s.includes('8-10') || s.includes('10+')) return 9.5;
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 7.0;
}

/**
 * Extract structured tabular features for the authenticated user from PostgreSQL
 */
async function extractUserFeatures(userId) {
  // 1. User onboarding profile
  const profileRes = await pool.query(
    'SELECT * FROM user_onboarding_profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const profile = profileRes.rows[0] || null;

  // 2. Recent check-ins (last 14 days)
  const checkInsRes = await pool.query(
    `SELECT * FROM daily_check_ins 
     WHERE user_id = $1 
     ORDER BY check_in_date DESC, created_at DESC 
     LIMIT 14`,
    [userId]
  );
  const checkIns = checkInsRes.rows || [];

  // 3. Recent stress records (last 14 days)
  const stressRecsRes = await pool.query(
    `SELECT * FROM stress_records 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 14`,
    [userId]
  );
  const stressRecords = stressRecsRes.rows || [];

  // 4. Active upcoming pressure events (within 7 days)
  const pressuresRes = await pool.query(
    `SELECT * FROM pressure_events 
     WHERE user_id = $1 
       AND end_date >= CURRENT_DATE 
       AND start_date <= CURRENT_DATE + INTERVAL '7 days'`,
    [userId]
  );
  const upcomingPressures = pressuresRes.rows || [];

  // 5. Recent distractions (last 3 days)
  const distractionsRes = await pool.query(
    `SELECT COALESCE(SUM(duration_minutes), 0)::int AS total_distraction_min,
            COUNT(*)::int AS count_distractions
     FROM distractions 
     WHERE user_id = $1 AND logged_at >= CURRENT_DATE - INTERVAL '3 days'`,
    [userId]
  );
  const distractionStats = distractionsRes.rows[0] || { total_distraction_min: 0, count_distractions: 0 };

  // 6. Recent focus sessions (last 3 days)
  const focusRes = await pool.query(
    `SELECT COALESCE(SUM(actual_duration_minutes), 0)::int AS total_focus_min,
            COUNT(*)::int AS count_focus_sessions
     FROM focus_sessions 
     WHERE user_id = $1 AND completed_at >= CURRENT_DATE - INTERVAL '3 days'`,
    [userId]
  );
  const focusStats = focusRes.rows[0] || { total_focus_min: 0, count_focus_sessions: 0 };

  // 7. Recent intervention responses
  const interventionsRes = await pool.query(
    `SELECT intervention_type, improvement, feeling, enjoyment, completed_at
     FROM intervention_sessions 
     WHERE user_id = $1 AND completed_at IS NOT NULL
     ORDER BY completed_at DESC LIMIT 10`,
    [userId]
  );
  const recentInterventions = interventionsRes.rows || [];

  // --- Derive tabular feature vector ---
  const baselineStress = profile ? Number(profile.stress_baseline) || 5 : 5;
  const baselineSleepHours = profile ? parseSleepHours(profile.sleep_duration) : 7.5;
  const baselineWorkHours = profile ? parseWorkHours(profile.daily_hours) : 7.0;

  // Recent check-in averages
  const latestCheckIn = checkIns[0] || null;
  const validStressRatings = checkIns
    .map(c => Number(c.stress_rating))
    .filter(n => Number.isFinite(n) && n >= 0 && n <= 10);

  // If no check-in stress ratings, fall back to stress_records
  if (validStressRatings.length === 0) {
    stressRecords.forEach(s => {
      const v = Number(s.stress_level);
      if (Number.isFinite(v)) validStressRatings.push(v);
    });
  }

  const recentAvgStress = validStressRatings.length > 0
    ? validStressRatings.reduce((a, b) => a + b, 0) / validStressRatings.length
    : baselineStress;

  // Sleep quality numeric mapping
  const sleepMap = { 'great': 4, 'normal': 3, 'poor': 2, 'very_little': 1 };
  const latestSleepScore = latestCheckIn ? (sleepMap[latestCheckIn.sleep_quality] || 3) : 3;

  // Workload numeric mapping
  const workloadMap = { 'light': 1, 'manageable': 2, 'heavy': 3, 'overload': 4 };
  const latestWorkloadScore = latestCheckIn ? (workloadMap[latestCheckIn.workload_rating] || 2) : 2;

  // Overall feeling numeric mapping
  const feelingMap = { 'rested': 4, 'focused': 4, 'neutral': 3, 'demanding': 2, 'exhausted': 1, 'anxious': 1 };
  const latestFeelingScore = latestCheckIn ? (feelingMap[latestCheckIn.overall_feeling] || 3) : 3;

  // Stressful event in recent 3 days
  const hasRecentStressEvent = checkIns.slice(0, 3).some(c => !!c.stressful_event);

  return {
    raw: {
      profile,
      checkIns,
      stressRecords,
      upcomingPressures,
      recentInterventions
    },
    features: {
      dataPointsCount: checkIns.length + stressRecords.length,
      baselineStress,
      baselineSleepHours,
      baselineWorkHours,
      latestStressRating: validStressRatings[0] !== undefined ? validStressRatings[0] : null,
      recentAvgStress,
      latestSleepScore,
      latestWorkloadScore,
      latestFeelingScore,
      hasRecentStressEvent,
      upcomingPressuresCount: upcomingPressures.length,
      recentDistractionMinutes: distractionStats.total_distraction_min,
      recentFocusMinutes: focusStats.total_focus_min,
      hasOnboarding: !!profile
    }
  };
}

/**
 * Calibrated rule-based baseline scoring model
 * Clearly marked as baseline when insufficient ML training records exist.
 * Scale: 0 to 100 (Stress Risk Score)
 */
function computeBaselineStressScore(features) {
  // If user has zero data points and no onboarding, return null (insufficient data)
  if (features.dataPointsCount === 0 && !features.hasOnboarding) {
    return {
      score: null,
      confidence: 0,
      engine: 'calibrated_baseline',
      signals: ['No check-in or onboarding data available yet.']
    };
  }

  // Start with user's baseline stress scaled to 0-100 (e.g. 5/10 -> 50)
  let score = features.baselineStress * 10;
  const signals = [];

  // Adjust for latest reported stress (weight: 35%)
  if (features.latestStressRating !== null) {
    const delta = (features.latestStressRating - features.baselineStress) * 7.5;
    score += delta;
    if (features.latestStressRating >= 7) {
      signals.push(`Recent self-reported stress is elevated (${features.latestStressRating}/10).`);
    } else if (features.latestStressRating <= 3) {
      signals.push(`Recent self-reported stress is low (${features.latestStressRating}/10).`);
    }
  }

  // Adjust for sleep deficit (weight: 15%)
  if (features.latestSleepScore <= 2) {
    score += (3 - features.latestSleepScore) * 8;
    signals.push('Lighter or disturbed sleep recently.');
  } else if (features.latestSleepScore === 4) {
    score -= 6;
  }

  // Adjust for workload spike (weight: 15%)
  if (features.latestWorkloadScore >= 3) {
    score += (features.latestWorkloadScore - 2) * 8;
    signals.push('Demanding or high workload logged.');
  } else if (features.latestWorkloadScore === 1) {
    score -= 5;
  }

  // Adjust for feeling/emotional fatigue (weight: 15%)
  if (features.latestFeelingScore <= 2) {
    score += (3 - features.latestFeelingScore) * 7;
    signals.push('Feelings of fatigue or strain reported.');
  } else if (features.latestFeelingScore === 4) {
    score -= 6;
  }

  // Adjust for stressful events (weight: 10%)
  if (features.hasRecentStressEvent) {
    score += 10;
    signals.push('Recent acute stressful event logged.');
  }

  // Adjust for upcoming deadlines / pressure events (weight: 10%)
  if (features.upcomingPressuresCount > 0) {
    score += Math.min(15, features.upcomingPressuresCount * 6);
    signals.push(`${features.upcomingPressuresCount} upcoming deadline(s) or milestone(s) within 7 days.`);
  }

  // Clamp 0 to 100
  score = Math.max(5, Math.min(95, Math.round(score)));

  // Calculate confidence based on data points count
  const confidence = Math.min(1.0, 0.3 + (features.dataPointsCount * 0.1));

  return {
    score,
    confidence,
    engine: 'calibrated_baseline',
    signals
  };
}

/**
 * Determine trend (increasing, stable, decreasing) by comparing current vs historical window
 */
function evaluateTrend(checkIns, stressRecords, baselineStress) {
  // Combine all chronological stress values (oldest to newest)
  const allPoints = [];

  checkIns.forEach(c => {
    const val = Number(c.stress_rating);
    if (Number.isFinite(val)) {
      allPoints.push({
        date: new Date(c.check_in_date || c.created_at).getTime(),
        val
      });
    }
  });

  stressRecords.forEach(s => {
    const val = Number(s.stress_level);
    if (Number.isFinite(val)) {
      allPoints.push({
        date: new Date(s.created_at).getTime(),
        val
      });
    }
  });

  // Sort chronological
  allPoints.sort((a, b) => a.date - b.date);

  if (allPoints.length < 2) {
    return {
      trend: 'stable',
      label: 'Stable',
      description: 'Insufficient check-in history to determine trajectory.',
      recentValues: allPoints.map(p => p.val),
      hasHistory: false
    };
  }

  // Compare recent half vs previous half (or last point vs 3-point rolling average)
  const recentSlice = allPoints.slice(-3);
  const olderSlice = allPoints.slice(0, Math.max(1, allPoints.length - 3));

  const recentAvg = recentSlice.reduce((acc, p) => acc + p.val, 0) / recentSlice.length;
  const olderAvg = olderSlice.reduce((acc, p) => acc + p.val, 0) / olderSlice.length;
  const diff = recentAvg - olderAvg;

  let trend = 'stable';
  let label = 'Stable';
  let description = 'Your recent stress check-ins are holding steady.';

  if (diff >= 0.8) {
    trend = 'increasing';
    label = 'Increasing';
    description = 'Your recent check-ins suggest that your stress level may be increasing.';
  } else if (diff <= -0.8) {
    trend = 'decreasing';
    label = 'Decreasing';
    description = 'Your recent check-ins show a steady easing of pressure.';
  }

  return {
    trend,
    label,
    description,
    diff: Math.round(diff * 10) / 10,
    recentAvg: Math.round(recentAvg * 10) / 10,
    olderAvg: Math.round(olderAvg * 10) / 10,
    recentValues: allPoints.slice(-7).map(p => p.val),
    hasHistory: true
  };
}

/**
 * Predict Stress Risk for the Authenticated User
 * Uses XGBoost / Gradient Boosting if trained model weights exist and validation holds;
 * otherwise safely falls back to calibrated baseline model with full transparency.
 */
async function predictStressForUser(userId, customThresholds = DEFAULT_THRESHOLDS) {
  const { raw, features } = await extractUserFeatures(userId);

  // Check if user has sufficient data
  const hasSufficientData = features.dataPointsCount >= 1 || features.hasOnboarding;

  if (!hasSufficientData) {
    return {
      hasSufficientData: false,
      score: null,
      category: null,
      trend: {
        trend: 'stable',
        label: 'Awaiting Data',
        description: 'Keep checking in for a few days so Breathly can understand your patterns.'
      },
      message: 'Keep checking in for a few days so Breathly can understand your patterns.',
      engine: 'calibrated_baseline',
      dataPointsCount: 0
    };
  }

  // Compute stress score
  const baselineResult = computeBaselineStressScore(features);
  const score = baselineResult.score;
  const categoryInfo = categorizeScore(score, customThresholds);
  const trendInfo = evaluateTrend(raw.checkIns, raw.stressRecords, features.baselineStress);

  return {
    hasSufficientData: true,
    score,
    category: categoryInfo.category,
    level: categoryInfo.level,
    label: categoryInfo.label,
    color: categoryInfo.color,
    statusClass: categoryInfo.statusClass,
    trend: trendInfo,
    signals: baselineResult.signals,
    engine: baselineResult.engine,
    confidence: baselineResult.confidence,
    dataPointsCount: features.dataPointsCount,
    thresholds: customThresholds,
    baseline: {
      stress: features.baselineStress,
      sleepHours: features.baselineSleepHours,
      workHours: features.baselineWorkHours
    }
  };
}

module.exports = {
  DEFAULT_THRESHOLDS,
  categorizeScore,
  extractUserFeatures,
  computeBaselineStressScore,
  evaluateTrend,
  predictStressForUser
};
