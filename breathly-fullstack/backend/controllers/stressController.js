const pool = require('../config/db');

// GET /api/stress
async function listRecords(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM stress_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ records: rows });
  } catch (err) {
    console.error('listRecords error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/stress
async function createRecord(req, res) {
  try {
    const level = Number(req.body.stressLevel);
    const notes = req.body.notes || null;
    if (!Number.isFinite(level) || level < 0 || level > 10) {
      return res.status(400).json({ error: 'stressLevel must be a number between 0 and 10' });
    }
    const { rows } = await pool.query(
      `INSERT INTO stress_records (user_id, stress_level, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.userId, level, notes]
    );
    res.status(201).json({ record: rows[0] });
  } catch (err) {
    console.error('createRecord error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listRecords, createRecord };
