const pool = require('../config/db');

function formatSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    taskName: row.task_name,
    plannedDurationMinutes: Number(row.planned_duration_minutes) || 0,
    actualDurationMinutes: Number(row.actual_duration_minutes) || 0,
    distractionsCount: Number(row.distractions_count) || 0,
    totalDistractionMinutes: Number(row.total_distraction_minutes) || 0,
    focusRate: Number(row.focus_rate) || 100,
    habitId: row.habit_id,
    notes: row.notes,
    completedAt: row.completed_at
  };
}

// GET /api/focus-sessions
async function listFocusSessions(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 100',
      [req.userId]
    );
    res.json({ sessions: rows.map(formatSession) });
  } catch (err) {
    console.error('listFocusSessions error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/focus-sessions
async function createFocusSession(req, res) {
  try {
    const {
      taskName,
      plannedDurationMinutes,
      actualDurationMinutes,
      distractionsCount,
      totalDistractionMinutes,
      focusRate,
      habitId,
      notes,
      completedAt
    } = req.body;

    if (!taskName || !taskName.trim()) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    const plannedMin = Math.max(1, Number(plannedDurationMinutes) || 25);
    const actualMin = Math.max(0, Number(actualDurationMinutes) || plannedMin);
    const distCount = Math.max(0, Number(distractionsCount) || 0);
    const distMin = Math.max(0, Number(totalDistractionMinutes) || 0);
    
    // Calculate focus rate if not provided: actual focus time / total session time
    let computedRate = Number(focusRate);
    if (!Number.isFinite(computedRate)) {
      if (actualMin > 0) {
        const netFocus = Math.max(0, actualMin - distMin);
        computedRate = Math.min(100, Math.max(0, Math.round((netFocus / actualMin) * 100)));
      } else {
        computedRate = 100;
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO focus_sessions
        (user_id, task_name, planned_duration_minutes, actual_duration_minutes, distractions_count, total_distraction_minutes, focus_rate, habit_id, notes, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, CURRENT_TIMESTAMP))
       RETURNING *`,
      [
        req.userId,
        taskName.trim(),
        plannedMin,
        actualMin,
        distCount,
        distMin,
        computedRate,
        habitId || null,
        notes ? String(notes).slice(0, 1000) : null,
        completedAt || null
      ]
    );

    res.status(201).json({ session: formatSession(rows[0]) });
  } catch (err) {
    console.error('createFocusSession error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/focus-sessions/:id
async function deleteFocusSession(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM focus_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteFocusSession error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listFocusSessions,
  createFocusSession,
  deleteFocusSession
};
