const pool = require('../config/db');

// GET /api/goals
async function listGoals(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM user_goals WHERE user_id = ? ORDER BY created_at ASC', [req.userId]);
    res.json({ goals: rows });
  } catch (err) {
    console.error('List goals error:', err);
    res.status(500).json({ error: 'Could not fetch goals' });
  }
}

// POST /api/goals
async function createGoal(req, res) {
  try {
    const { title, category, icon, targetDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const [result] = await pool.query(
      'INSERT INTO user_goals (user_id, title, category, icon, target_date) VALUES (?, ?, ?, ?, ?)',
      [req.userId, title, category || 'Growth', icon || '🎯', targetDate || null]
    );

    const [rows] = await pool.query('SELECT * FROM user_goals WHERE id = ?', [result.insertId]);
    res.json({ goal: rows[0] });
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Could not create goal' });
  }
}

// DELETE /api/goals/:id
async function deleteGoal(req, res) {
  try {
    await pool.query('DELETE FROM user_goals WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ error: 'Could not delete goal' });
  }
}

module.exports = { listGoals, createGoal, deleteGoal };
