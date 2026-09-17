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
        `INSERT INTO user_preferences (user_id, theme, notification_enabled)
         VALUES ($1, 'porcelain', TRUE)
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
    const { theme, notificationEnabled } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO user_preferences (user_id, theme, notification_enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = EXCLUDED.theme,
         notification_enabled = EXCLUDED.notification_enabled
       RETURNING *`,
      [req.userId, theme || 'porcelain', notificationEnabled !== undefined ? !!notificationEnabled : true]
    );
    res.json({ preferences: rows[0] });
  } catch (err) {
    console.error('updatePreferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getPreferences, updatePreferences };
