const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'db',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'ifc_user',
  password: process.env.DB_PASSWORD || 'ifc_pass',
  database: process.env.DB_NAME     || 'jogo_velha',
  waitForConnections: true,
  connectionLimit:    10,
});

async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');

  // Divide por ";" ignorando blocos vazios
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      await conn.query(statement);
    }
    console.log('Migrations executadas com sucesso.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, runMigrations };
