const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new Map(); // armazenamento em memória (dev)

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

async function registerUser(email, password) {
  if (!email || !password) throw new Error('Email e senha são obrigatórios');
  if (users.has(email)) throw new Error('Usuário já existe');

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = { id: Date.now().toString(), email, passwordHash };
  users.set(email, user);
  return { id: user.id, email: user.email };
}

async function loginUser(email, password) {
  if (!email || !password) throw new Error('Email e senha são obrigatórios');
  const user = users.get(email);
  if (!user) throw new Error('Credenciais inválidas');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Credenciais inválidas');

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return token;
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
  // exportado apenas para debugging/desenvolvimento
  users,
};