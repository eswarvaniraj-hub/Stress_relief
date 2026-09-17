const pool = require('../config/db');

async function findUserByGoogleId(googleId) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE google_id = $1 LIMIT 1',
    [googleId]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, google_id, name, email, profile_picture, created_at, updated_at, last_login FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// Creates the user on first login, or updates profile info + last_login
// on every subsequent verified login.
async function upsertUserFromGoogle({ googleId, name, email, picture }) {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email, profile_picture, last_login)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (google_id)
     DO UPDATE SET
       name = EXCLUDED.name,
       email = EXCLUDED.email,
       profile_picture = EXCLUDED.profile_picture,
       last_login = NOW()
     RETURNING id, google_id, name, email, profile_picture, created_at, updated_at, last_login`,
    [googleId, name, email, picture || null]
  );

  const user = rows[0];

  // Default preferences row for a brand new user (if not already existing)
  await pool.query(
    `INSERT INTO user_preferences (user_id, theme, notification_enabled)
     VALUES ($1, 'porcelain', TRUE)
     ON CONFLICT (user_id) DO NOTHING`,
    [user.id]
  );

  return user;
}

module.exports = { findUserByGoogleId, findUserById, upsertUserFromGoogle };
