const pool = require('../config/db');

// GET /api/breathing/sessions
async function listSessions(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM breathing_sessions WHERE user_id = $1 ORDER BY completed_at DESC',
      [req.userId]
    );
    res.json({ sessions: rows });
  } catch (err) {
    console.error('listSessions error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/breathing/sessions
async function createSession(req, res) {
  try {
    const { exerciseName, durationSeconds } = req.body;
    if (!exerciseName) return res.status(400).json({ error: 'exerciseName is required' });

    const { rows } = await pool.query(
      `INSERT INTO breathing_sessions (user_id, exercise_name, duration_seconds)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.userId, exerciseName, Number(durationSeconds) || 0]
    );
    res.status(201).json({ session: rows[0] });
  } catch (err) {
    console.error('createSession error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listSessions, createSession };
