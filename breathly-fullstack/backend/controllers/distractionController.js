const pool = require('../config/db');

function formatDistraction(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: Number(row.duration_minutes) || 0,
    note: row.note,
    focusSessionId: row.focus_session_id,
    loggedAt: row.logged_at
  };
}

// GET /api/distractions
async function listDistractions(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM distractions WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 100',
      [req.userId]
    );
    res.json({ distractions: rows.map(formatDistraction) });
  } catch (err) {
    console.error('listDistractions error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/distractions
async function createDistraction(req, res) {
  try {
    const {
      category,
      startTime,
      endTime,
      durationMinutes,
      note,
      focusSessionId,
      loggedAt
    } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Distraction category is required' });
    }

    let dur = Number(durationMinutes);
    if (!Number.isFinite(dur) || dur < 0) {
      if (startTime && endTime) {
        const diffMs = new Date(endTime) - new Date(startTime);
        dur = Math.max(1, Math.round(diffMs / 60000));
      } else {
        dur = 5; // default 5 min
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO distractions 
        (user_id, category, start_time, end_time, duration_minutes, note, focus_session_id, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP))
       RETURNING *`,
      [
        req.userId,
        category.trim(),
        startTime || null,
        endTime || null,
        Math.round(dur),
        note ? String(note).slice(0, 500) : null,
        focusSessionId || null,
        loggedAt || null
      ]
    );

    res.status(201).json({ distraction: formatDistraction(rows[0]) });
  } catch (err) {
    console.error('createDistraction error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/distractions/:id
async function deleteDistraction(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM distractions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteDistraction error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/distractions/summary
async function getDistractionSummary(req, res) {
  try {
    // Today's summary
    const todayRes = await pool.query(
      `SELECT 
         COALESCE(SUM(duration_minutes), 0) AS total_today_minutes,
         COUNT(*) AS today_count,
         COALESCE(AVG(duration_minutes), 0) AS avg_duration
       FROM distractions 
       WHERE user_id = $1 AND logged_at >= CURRENT_DATE`,
      [req.userId]
    );

    // Top category today
    const topCatRes = await pool.query(
      `SELECT category, COUNT(*) as count, SUM(duration_minutes) as total_min
       FROM distractions
       WHERE user_id = $1 AND logged_at >= CURRENT_DATE
       GROUP BY category
       ORDER BY total_min DESC, count DESC
       LIMIT 1`,
      [req.userId]
    );

    // Weekly summary (past 7 days)
    const weekRes = await pool.query(
      `SELECT 
         COALESCE(SUM(duration_minutes), 0) AS total_week_minutes,
         COUNT(*) AS week_count
       FROM distractions 
       WHERE user_id = $1 AND logged_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [req.userId]
    );

    res.json({
      today: {
        totalMinutes: Number(todayRes.rows[0]?.total_today_minutes) || 0,
        count: Number(todayRes.rows[0]?.today_count) || 0,
        avgDuration: Math.round(Number(todayRes.rows[0]?.avg_duration) || 0),
        topCategory: topCatRes.rows[0]?.category || null
      },
      weekly: {
        totalMinutes: Number(weekRes.rows[0]?.total_week_minutes) || 0,
        count: Number(weekRes.rows[0]?.week_count) || 0
      }
    });
  } catch (err) {
    console.error('getDistractionSummary error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listDistractions,
  createDistraction,
  deleteDistraction,
  getDistractionSummary
};
