require('dotenv').config();
const pool = require('./config/db');

async function listAllUsers() {
  try {
    console.log('Connecting to database...');
    const res = await pool.query(
      `SELECT 
         id, 
         name, 
         email, 
         last_login, 
         created_at 
       FROM users 
       ORDER BY created_at DESC;`
    );

    if (res.rows.length === 0) {
      console.log('\nNo users found in the database yet.\n');
    } else {
      console.log(`\n================== LOGGED IN USERS (${res.rows.length}) ==================`);
      console.table(
        res.rows.map(u => ({
          'ID': u.id,
          'Name': u.name,
          'Email': u.email,
          'Last Login': u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          'Registered On': new Date(u.created_at).toLocaleString()
        }))
      );
      console.log('===============================================================\n');
    }
  } catch (err) {
    console.error('Error fetching users:', err.message);
    console.log('\nTip: Make sure your DATABASE_URL or DB_PASSWORD is configured in your .env file.');
  } finally {
    await pool.end();
  }
}

listAllUsers();
