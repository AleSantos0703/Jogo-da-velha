// backend/check_db.js
// Verifica conexão e lista tabelas não-sistema no banco configurado em backend/.env
require('dotenv').config();
const { pool } = require('./src/data/connection_db');

(async () => {
  try {
    const info = await pool.query("SELECT current_database() AS db, current_schema() AS schema");
    console.log('Connected to:', info.rows[0]);

    const server = await pool.query("SELECT inet_server_addr() AS server_addr, inet_server_port() AS server_port");
    console.log('Server:', server.rows[0]);

    const tables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name
    `);
    if (tables.rowCount === 0) {
      console.log('No user tables found.');
    } else {
      console.log('Tables:');
      tables.rows.forEach(r => console.log(` - ${r.table_schema}.${r.table_name}`));
    }

    // Check users table count if present
    const hasUsers = tables.rows.some(r => r.table_name === 'users');
    if (hasUsers) {
      const cnt = await pool.query('SELECT COUNT(*)::int AS count FROM users');
      console.log('users count:', cnt.rows[0].count);
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('CHECK_DB_ERROR:', err && err.message ? err.message : err);
    try { await pool.end(); } catch (e) {}
    process.exit(1);
  }
})();
