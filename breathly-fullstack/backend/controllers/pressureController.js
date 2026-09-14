const pool = require('../config/db');

// GET /api/pressure-events
async function listPressureEvents(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM pressure_events WHERE user_id = ? ORDER BY start_date ASC', [req.userId]);
    res.json({ pressureEvents: rows });
  } catch (err) {
    console.error('List pressure events error:', err);
    res.status(500).json({ error: 'Could not fetch pressure events' });
  }
}

// POST /api/pressure-events
async function createPressureEvent(req, res) {
  try {
    const { title, eventType, startDate, endDate, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const [result] = await pool.query(
      'INSERT INTO pressure_events (user_id, title, event_type, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, title, eventType || 'Exams', startDate, endDate || startDate, notes || '']
    );

    const [rows] = await pool.query('SELECT * FROM pressure_events WHERE id = ?', [result.insertId]);
    res.json({ pressureEvent: rows[0] });
  } catch (err) {
    console.error('Create pressure event error:', err);
    res.status(500).json({ error: 'Could not create pressure event' });
  }
}

// DELETE /api/pressure-events/:id
async function deletePressureEvent(req, res) {
  try {
    await pool.query('DELETE FROM pressure_events WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete pressure event error:', err);
    res.status(500).json({ error: 'Could not delete pressure event' });
  }
}

module.exports = { listPressureEvents, createPressureEvent, deletePressureEvent };
