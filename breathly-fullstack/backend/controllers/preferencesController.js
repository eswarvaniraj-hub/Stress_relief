const pool = require('../config/db');

// GET /api/preferences
async function getPreferences(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1',
      [req.userId]
    );
    if (rows.length === 0) {
      // Shouldn't normally happen (created at signup), but self-heal just in case.
      await pool.query(
        'INSERT INTO user_preferences (user_id, theme, notification_enabled) VALUES (?, ?, ?)',
        [req.userId, 'dusk', true]
      );
      const [fresh] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [req.userId]);
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
    await pool.query(
      `INSERT INTO user_preferences (user_id, theme, notification_enabled)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE theme = VALUES(theme), notification_enabled = VALUES(notification_enabled)`,
      [req.userId, theme || 'dusk', notificationEnabled !== undefined ? !!notificationEnabled : true]
    );
    const [rows] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [req.userId]);
    res.json({ preferences: rows[0] });
  } catch (err) {
    console.error('updatePreferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getPreferences, updatePreferences };
