const pool = require('../config/db');

// GET /api/games/sessions
// Returns list of authenticated user's game sessions
async function listSessions(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM game_sessions 
       WHERE user_id = $1 
       ORDER BY played_at DESC 
       LIMIT 50`,
      [req.userId]
    );
    res.json({ sessions: rows });
  } catch (err) {
    console.error('listSessions error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve game sessions' });
  }
}

// POST /api/games/sessions
// Creates a new game session log for the authenticated user
async function createSession(req, res) {
  try {
    const {
      gameName = 'Bubble Rhythm',
      gameMode = 'rhythm_pop',
      rhythmPreset = null,
      durationSeconds = 0,
      bubblesPopped = 0,
      completed = true,
      feeling = null,
      enjoyment = null
    } = req.body;

    // Validate mode
    const validModes = ['free_pop', 'rhythm_pop'];
    const sanitizedMode = validModes.includes(gameMode) ? gameMode : 'rhythm_pop';

    // Validate feeling
    const validFeelings = ['better', 'same', 'stressed'];
    const sanitizedFeeling = validFeelings.includes(feeling) ? feeling : null;

    // Validate enjoyment
    const validEnjoyment = ['yes', 'little', 'no'];
    const sanitizedEnjoyment = validEnjoyment.includes(enjoyment) ? enjoyment : null;

    const { rows } = await pool.query(
      `INSERT INTO game_sessions 
       (user_id, game_name, game_mode, rhythm_preset, duration_seconds, bubbles_popped, completed, feeling, enjoyment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.userId,
        gameName.slice(0, 100),
        sanitizedMode,
        rhythmPreset ? String(rhythmPreset).slice(0, 50) : null,
        Math.max(0, parseInt(durationSeconds) || 0),
        Math.max(0, parseInt(bubblesPopped) || 0),
        Boolean(completed),
        sanitizedFeeling,
        sanitizedEnjoyment
      ]
    );

    res.status(201).json({ session: rows[0] });
  } catch (err) {
    console.error('createSession error:', err.message);
    res.status(500).json({ error: 'Failed to save game session' });
  }
}

// GET /api/games/summary
// Returns aggregate statistics for the user based strictly on genuine sessions
async function getSummary(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT 
         COUNT(*)::int AS total_sessions,
         COALESCE(SUM(duration_seconds), 0)::int AS total_duration_seconds,
         COALESCE(SUM(bubbles_popped), 0)::int AS total_bubbles_popped,
         COUNT(CASE WHEN feeling = 'better' THEN 1 END)::int AS feeling_better_count,
         COUNT(CASE WHEN feeling = 'same' THEN 1 END)::int AS feeling_same_count,
         COUNT(CASE WHEN feeling = 'stressed' THEN 1 END)::int AS feeling_stressed_count,
         COUNT(CASE WHEN enjoyment = 'yes' THEN 1 END)::int AS enjoyed_count,
         COUNT(CASE WHEN game_mode = 'rhythm_pop' THEN 1 END)::int AS rhythm_pop_count,
         COUNT(CASE WHEN game_mode = 'free_pop' THEN 1 END)::int AS free_pop_count
       FROM game_sessions
       WHERE user_id = $1`,
      [req.userId]
    );

    const summary = rows[0] || {
      total_sessions: 0,
      total_duration_seconds: 0,
      total_bubbles_popped: 0,
      feeling_better_count: 0,
      feeling_same_count: 0,
      feeling_stressed_count: 0,
      enjoyed_count: 0,
      rhythm_pop_count: 0,
      free_pop_count: 0
    };

    res.json({ summary });
  } catch (err) {
    console.error('getSummary error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve game summary' });
  }
}

module.exports = {
  listSessions,
  createSession,
  getSummary
};
