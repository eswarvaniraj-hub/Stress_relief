const pool = require('../config/db');

// GET /api/habits
async function listHabits(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_habits WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at ASC',
      [req.userId]
    );
    res.json({ habits: rows });
  } catch (err) {
    console.error('List habits error:', err);
    res.status(500).json({ error: 'Could not fetch habits' });
  }
}

// POST /api/habits
async function createHabit(req, res) {
  try {
    const { title, goalId, category, icon, targetVal, targetUnit, minModeVal, minModeUnit, preferredTime } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { rows } = await pool.query(
      `INSERT INTO user_habits (user_id, goal_id, title, category, icon, target_val, target_unit, min_mode_val, min_mode_unit, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.userId, goalId || null, title, category || 'Focus', icon || '⚡', targetVal || 30, targetUnit || 'min', minModeVal || 5, minModeUnit || 'min', preferredTime || 'anytime']
    );

    res.json({ habit: rows[0] });
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ error: 'Could not create habit' });
  }
}

// PUT /api/habits/:id
async function updateHabit(req, res) {
  try {
    const { title, goalId, category, icon, targetVal, targetUnit, minModeVal, minModeUnit, preferredTime, currentStreak, bestStreak } = req.body;
    const { rows } = await pool.query(
      `UPDATE user_habits
       SET title = COALESCE($1, title),
           goal_id = COALESCE($2, goal_id),
           category = COALESCE($3, category),
           icon = COALESCE($4, icon),
           target_val = COALESCE($5, target_val),
           target_unit = COALESCE($6, target_unit),
           min_mode_val = COALESCE($7, min_mode_val),
           min_mode_unit = COALESCE($8, min_mode_unit),
           preferred_time = COALESCE($9, preferred_time),
           current_streak = COALESCE($10, current_streak),
           best_streak = COALESCE($11, best_streak)
       WHERE id = $12 AND user_id = $13
       RETURNING *`,
      [title, goalId, category, icon, targetVal, targetUnit, minModeVal, minModeUnit, preferredTime, currentStreak, bestStreak, req.params.id, req.userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
    res.json({ habit: rows[0] });
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ error: 'Could not update habit' });
  }
}

// DELETE /api/habits/:id
async function deleteHabit(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM user_habits WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Habit not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete habit error:', err);
    res.status(500).json({ error: 'Could not delete habit' });
  }
}

// POST /api/habits/failure
async function logHabitFailure(req, res) {
  try {
    const { habitId, reason, note } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason is required' });

    const { rows } = await pool.query(
      `INSERT INTO habit_failure_logs (user_id, habit_id, reason, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, habitId || null, reason, note || '']
    );

    res.json({ success: true, log: rows[0] });
  } catch (err) {
    console.error('Log failure error:', err);
    res.status(500).json({ error: 'Could not log failure' });
  }
}

// GET /api/habits/failures
async function listFailures(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM habit_failure_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 50',
      [req.userId]
    );
    res.json({ failures: rows });
  } catch (err) {
    console.error('List failures error:', err);
    res.status(500).json({ error: 'Could not fetch failures' });
  }
}

module.exports = { listHabits, createHabit, updateHabit, deleteHabit, logHabitFailure, listFailures };
