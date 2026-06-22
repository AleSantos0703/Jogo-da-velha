const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troque_em_producao';
const JWT_EXPIRES = '7d';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ statusCode: 401, message: 'Token ausente' });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = Number(payload.sub);
    next();
  } catch {
    return res.status(401).json({ statusCode: 401, message: 'Token inválido ou expirado' });
  }
}

module.exports = { requireAuth, JWT_SECRET, JWT_EXPIRES };
