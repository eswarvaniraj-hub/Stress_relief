const pool = require('../config/db');

// GET /api/preferences
async function getPreferences(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1 LIMIT 1',
      [req.userId]
    );
    if (rows.length === 0) {
      // Shouldn't normally happen (created at signup), but self-heal just in case.
      const { rows: fresh } = await pool.query(
        `INSERT INTO user_preferences (user_id, theme, notification_enabled, daily_distraction_goal_minutes)
         VALUES ($1, 'porcelain', TRUE, 45)
         ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme
         RETURNING *`,
        [req.userId]
      );
      return res.json({ preferences: fresh[0] });
    }
    res.json({ preferences: rows[0] });
  } catch (err) {
    console.error('getPreferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/preferences
async function updatePreferences(req, res) {
  try {
    const { theme, notificationEnabled, dailyDistractionGoalMinutes } = req.body;
    const goalMin = Number.isFinite(Number(dailyDistractionGoalMinutes))
      ? Math.max(5, Math.min(300, Number(dailyDistractionGoalMinutes)))
      : 45;

    const { rows } = await pool.query(
      `INSERT INTO user_preferences (user_id, theme, notification_enabled, daily_distraction_goal_minutes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = COALESCE(EXCLUDED.theme, user_preferences.theme),
         notification_enabled = COALESCE(EXCLUDED.notification_enabled, user_preferences.notification_enabled),
         daily_distraction_goal_minutes = COALESCE(EXCLUDED.daily_distraction_goal_minutes, user_preferences.daily_distraction_goal_minutes)
       RETURNING *`,
      [
        req.userId,
        theme || 'porcelain',
        notificationEnabled !== undefined ? !!notificationEnabled : true,
        goalMin
      ]
    );
    res.json({ preferences: rows[0] });
  } catch (err) {
    console.error('updatePreferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getPreferences, updatePreferences };
