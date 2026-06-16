<<<<<<< HEAD
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

=======
<<<<<<< HEAD
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jogo_velha',
  max: 10,
=======
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'db',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'ifc_user',
  password: process.env.DB_PASSWORD || 'ifc_pass',
  database: process.env.DB_NAME     || 'jogo_velha',
  waitForConnections: true,
  connectionLimit:    10,
<<<<<<< HEAD
=======
>>>>>>> 37042e4 (criado migração do banco)
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
});

async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');

<<<<<<< HEAD
  // Divide por ";" ignorando blocos vazios
=======
<<<<<<< HEAD
  // Split by ";" and ignore empty / comment lines
=======
  // Divide por ";" ignorando blocos vazios
>>>>>>> 37042e4 (criado migração do banco)
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

<<<<<<< HEAD
  const conn = await pool.getConnection();
=======
<<<<<<< HEAD
  const client = await pool.connect();
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
  try {
    for (const statement of statements) {
      await conn.query(statement);
    }
    console.log('Migrations executadas com sucesso.');
  } finally {
<<<<<<< HEAD
    conn.release();
=======
    client.release();
=======
  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      await conn.query(statement);
    }
    console.log('Migrations executadas com sucesso.');
  } finally {
    conn.release();
>>>>>>> 37042e4 (criado migração do banco)
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
  }
}

module.exports = { pool, runMigrations };
