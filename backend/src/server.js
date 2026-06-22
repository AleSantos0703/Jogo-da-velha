const express = require('express');
const { runMigrations } = require('./data/connection_db');
const authRoutes    = require('./routes/auth');
const matchRoutes   = require('./routes/matches');
const rankingRoutes = require('./routes/ranking');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend rodando!' }));

app.use('/auth',    authRoutes);
app.use('/matches', matchRoutes);
app.use('/ranking', rankingRoutes);

// ── Inicialização ────────────────────────────────────────────
runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor backend ouvindo na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao executar migrations:', err);
    process.exit(1);
  });
