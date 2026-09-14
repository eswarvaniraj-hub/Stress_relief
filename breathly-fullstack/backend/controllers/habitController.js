const pool = require('../config/db');

// GET /api/habits
async function listHabits(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_habits WHERE user_id = ? AND is_active = TRUE ORDER BY created_at ASC',
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

    const [result] = await pool.query(
      `INSERT INTO user_habits (user_id, goal_id, title, category, icon, target_val, target_unit, min_mode_val, min_mode_unit, preferred_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, goalId || null, title, category || 'Focus', icon || '⚡', targetVal || 30, targetUnit || 'min', minModeVal || 5, minModeUnit || 'min', preferredTime || 'anytime']
    );

    const [rows] = await pool.query('SELECT * FROM user_habits WHERE id = ?', [result.insertId]);
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
    await pool.query(
      `UPDATE user_habits
       SET title = COALESCE(?, title),
           goal_id = COALESCE(?, goal_id),
           category = COALESCE(?, category),
           icon = COALESCE(?, icon),
           target_val = COALESCE(?, target_val),
           target_unit = COALESCE(?, target_unit),
           min_mode_val = COALESCE(?, min_mode_val),
           min_mode_unit = COALESCE(?, min_mode_unit),
           preferred_time = COALESCE(?, preferred_time),
           current_streak = COALESCE(?, current_streak),
           best_streak = COALESCE(?, best_streak)
       WHERE id = ? AND user_id = ?`,
      [title, goalId, category, icon, targetVal, targetUnit, minModeVal, minModeUnit, preferredTime, currentStreak, bestStreak, req.params.id, req.userId]
    );

    const [rows] = await pool.query('SELECT * FROM user_habits WHERE id = ?', [req.params.id]);
    res.json({ habit: rows[0] });
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ error: 'Could not update habit' });
  }
}

// DELETE /api/habits/:id
async function deleteHabit(req, res) {
  try {
    await pool.query('DELETE FROM user_habits WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
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

    const [result] = await pool.query(
      'INSERT INTO habit_failure_logs (user_id, habit_id, reason, note) VALUES (?, ?, ?, ?)',
      [req.userId, habitId || null, reason, note || '']
    );

    res.json({ success: true, logId: result.insertId });
  } catch (err) {
    console.error('Log failure error:', err);
    res.status(500).json({ error: 'Could not log failure' });
  }
}

// GET /api/habits/failures
async function listFailures(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM habit_failure_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 50',
      [req.userId]
    );
    res.json({ failures: rows });
  } catch (err) {
    console.error('List failures error:', err);
    res.status(500).json({ error: 'Could not fetch failures' });
  }
}

module.exports = { listHabits, createHabit, updateHabit, deleteHabit, logHabitFailure, listFailures };
