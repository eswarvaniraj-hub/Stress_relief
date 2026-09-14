const pool = require('../config/db');

async function findUserByGoogleId(googleId) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE google_id = ? LIMIT 1',
    [googleId]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, google_id, name, email, profile_picture, created_at, updated_at, last_login FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// Creates the user on first login, or updates profile info + last_login
// on every subsequent verified login.
async function upsertUserFromGoogle({ googleId, name, email, picture }) {
  const existing = await findUserByGoogleId(googleId);

  if (existing) {
    await pool.query(
      `UPDATE users
       SET name = ?, email = ?, profile_picture = ?, last_login = NOW()
       WHERE id = ?`,
      [name, email, picture || null, existing.id]
    );
    return findUserById(existing.id);
  }

  const [result] = await pool.query(
    `INSERT INTO users (google_id, name, email, profile_picture, last_login)
     VALUES (?, ?, ?, ?, NOW())`,
    [googleId, name, email, picture || null]
  );

  // Default preferences row for a brand new user
  await pool.query(
    `INSERT INTO user_preferences (user_id, theme, notification_enabled)
     VALUES (?, 'dusk', TRUE)`,
    [result.insertId]
  );

  return findUserById(result.insertId);
}

module.exports = { findUserByGoogleId, findUserById, upsertUserFromGoogle };
