 const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version();');
    console.log('✅ Connected successfully!');
    console.log('Database:', res.rows[0].db_name);
    console.log('Server time:', res.rows[0].current_time);

    console.log('\nApplying schema.sql to Neon PostgreSQL...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    
    await pool.query(schemaSql);
    console.log('✅ Schema migration completed successfully!');

    // Verify created tables
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified tables in database:');
    tableRes.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
