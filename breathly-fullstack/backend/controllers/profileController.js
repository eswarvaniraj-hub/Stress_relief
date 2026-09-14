const pool = require('../config/db');

// GET /api/profile
async function getProfile(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM user_onboarding_profiles WHERE user_id = ? LIMIT 1', [req.userId]);
    res.json({ profile: rows[0] || null });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
}

// PUT /api/profile
async function updateProfile(req, res) {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile data is required' });

    const { occupation, dailyHours, peakTime, sleepDuration, hurdles, motivationStyle, stressBaseline, stressCauses, recoverySuperpowers } = profile;

    await pool.query(
      `INSERT INTO user_onboarding_profiles 
        (user_id, occupation_type, daily_hours, peak_time, sleep_duration, hurdles, motivation_style, stress_baseline, stress_causes, recovery_activities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        occupation_type = VALUES(occupation_type),
        daily_hours = VALUES(daily_hours),
        peak_time = VALUES(peak_time),
        sleep_duration = VALUES(sleep_duration),
        hurdles = VALUES(hurdles),
        motivation_style = VALUES(motivation_style),
        stress_baseline = VALUES(stress_baseline),
        stress_causes = VALUES(stress_causes),
        recovery_activities = VALUES(recovery_activities)`,
      [
        req.userId,
        occupation || 'Student',
        dailyHours || '6-8 hours',
        peakTime || 'evening',
        sleepDuration || '7-8 hours',
        JSON.stringify(hurdles || []),
        motivationStyle || 'streaks',
        stressBaseline || 5,
        JSON.stringify(stressCauses || []),
        JSON.stringify(recoverySuperpowers || [])
      ]
    );

    const [rows] = await pool.query('SELECT * FROM user_onboarding_profiles WHERE user_id = ? LIMIT 1', [req.userId]);
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
}

module.exports = { getProfile, updateProfile };
