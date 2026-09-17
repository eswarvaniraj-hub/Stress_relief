const pool = require('../config/db');

// GET /api/journal
async function listEntries(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ entries: rows });
  } catch (err) {
    console.error('listEntries error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/journal
async function createEntry(req, res) {
  try {
    const { content, mood } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO journal_entries (user_id, content, mood)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.userId, content || null, mood || null]
    );
    res.status(201).json({ entry: rows[0] });
  } catch (err) {
    console.error('createEntry error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/journal/:id
async function updateEntry(req, res) {
  try {
    const { content, mood } = req.body;
    const { rows } = await pool.query(
      `UPDATE journal_entries
       SET content = $1, mood = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [content || null, mood || null, req.params.id, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ entry: rows[0] });
  } catch (err) {
    console.error('updateEntry error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/journal/:id
async function deleteEntry(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteEntry error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listEntries, createEntry, updateEntry, deleteEntry };
