const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../data/connection_db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

async function registerUser(email, password) {
  if (!email || !password) throw new Error('Email e senha são obrigatórios');

  const client = await pool.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (rowCount > 0) throw new Error('Usuário já existe');

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const res = await client.query(
      'INSERT INTO users (email, senha) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );
    const user = res.rows[0];
    return { id: user.id.toString(), email: user.email };
  } finally {
    client.release();
  }
}

async function loginUser(email, password) {
  if (!email || !password) throw new Error('Email e senha são obrigatórios');

  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, email, senha FROM users WHERE email = $1', [email]);
    if (res.rowCount === 0) throw new Error('Credenciais inválidas');

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.senha);
    if (!match) throw new Error('Credenciais inválidas');

    const token = jwt.sign({ id: user.id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
  } finally {
    client.release();
  }
}

function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token não enviado' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  authenticateMiddleware,
};
