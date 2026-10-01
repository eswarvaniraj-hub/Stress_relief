const pool = require('../config/db');
const { predictStressForUser, evaluateTrend } = require('../services/stressPredictionService');

// GET /api/stress
async function listRecords(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM stress_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ records: rows });
  } catch (err) {
    console.error('listRecords error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/stress
async function createRecord(req, res) {
  try {
    const level = Number(req.body.stressLevel);
    const notes = req.body.notes || null;
    if (!Number.isFinite(level) || level < 0 || level > 10) {
      return res.status(400).json({ error: 'stressLevel must be a number between 0 and 10' });
    }
    const { rows } = await pool.query(
      `INSERT INTO stress_records (user_id, stress_level, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.userId, level, notes]
    );
    res.status(201).json({ record: rows[0] });
  } catch (err) {
    console.error('createRecord error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/stress/current
// Returns current stress score, category, trend, data sufficiency
async function getCurrentStress(req, res) {
  try {
    const prediction = await predictStressForUser(req.userId);
    res.json({ current: prediction });
  } catch (err) {
    console.error('getCurrentStress error:', err.message);
    res.status(500).json({ error: 'Could not compute current stress' });
  }
}

// GET /api/stress/trend
// Chronological trend history comparing baseline, check-ins, and moving average
async function getStressTrend(req, res) {
  try {
    // 1. Get check-ins
    const checkInsRes = await pool.query(
      `SELECT check_in_date, stress_rating, overall_feeling, created_at 
       FROM daily_check_ins 
       WHERE user_id = $1 AND stress_rating IS NOT NULL
       ORDER BY check_in_date ASC, created_at ASC`,
      [req.userId]
    );

    // 2. Get direct stress records
    const stressRes = await pool.query(
      `SELECT stress_level, notes, created_at 
       FROM stress_records 
       WHERE user_id = $1 
       ORDER BY created_at ASC`,
      [req.userId]
    );

    // 3. User baseline
    const profileRes = await pool.query(
      `SELECT stress_baseline FROM user_onboarding_profiles WHERE user_id = $1 LIMIT 1`,
      [req.userId]
    );
    const baseline = profileRes.rows[0]?.stress_baseline || 5;

    const trend = evaluateTrend(checkInsRes.rows, stressRes.rows, baseline);

    // Format unified chronological data points
    const points = [];
    checkInsRes.rows.forEach(c => {
      points.push({
        source: 'checkin',
        value: Number(c.stress_rating),
        date: c.check_in_date,
        feeling: c.overall_feeling,
        timestamp: new Date(c.created_at).getTime()
      });
    });

    stressRes.rows.forEach(s => {
      points.push({
        source: 'record',
        value: Number(s.stress_level),
        notes: s.notes,
        timestamp: new Date(s.created_at).getTime()
      });
    });

    points.sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      trend,
      baseline,
      historyPoints: points.slice(-30),
      totalDataPoints: points.length
    });
  } catch (err) {
    console.error('getStressTrend error:', err.message);
    res.status(500).json({ error: 'Could not fetch stress trend' });
  }
}

// POST /api/stress/predict
async function predictStress(req, res) {
  try {
    const customThresholds = req.body?.thresholds;
    const prediction = await predictStressForUser(req.userId, customThresholds);
    res.json({ prediction });
  } catch (err) {
    console.error('predictStress error:', err.message);
    res.status(500).json({ error: 'Prediction failed' });
  }
}

module.exports = {
  listRecords,
  createRecord,
  getCurrentStress,
  getStressTrend,
  predictStress
};
