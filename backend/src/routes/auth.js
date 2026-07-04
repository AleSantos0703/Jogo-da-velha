const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../data/connection_db');
const { requireAuth, JWT_SECRET, JWT_EXPIRES } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ statusCode: 400, message: 'Campos obrigatórios ausentes' });
  }
  if (username.length < 3) {
    return res.status(400).json({ statusCode: 400, message: 'Nome deve ter pelo menos 3 caracteres' });
  }
  if (password.length < 4) {
    return res.status(400).json({ statusCode: 400, message: 'Senha deve ter pelo menos 4 caracteres' });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    const userId = result.insertId;

    // Cria linha de estatísticas zerada para o novo usuário
    await pool.query('INSERT INTO estatisticas (user_id) VALUES (?)', [userId]);

    const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({ accessToken });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ statusCode: 409, message: 'Email já cadastrado' });
    }
    console.error('[POST /auth/register]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ statusCode: 400, message: 'Campos obrigatórios ausentes' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ statusCode: 401, message: 'Credenciais inválidas' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.senha);
    if (!passwordMatch) {
      return res.status(401).json({ statusCode: 401, message: 'Credenciais inválidas' });
    }

    const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ accessToken });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// POST /auth/logout — JWT é stateless; apenas confirma ao cliente
router.post('/logout', requireAuth, (req, res) => {
  res.status(204).end();
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome FROM users WHERE id = ?',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ statusCode: 404, message: 'Usuário não encontrado' });
    }
    const user = rows[0];
    return res.json({ id: String(user.id), username: user.nome });
  } catch (err) {
    console.error('[GET /auth/me]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

module.exports = router;
