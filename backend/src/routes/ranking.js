const express = require('express');
const { pool } = require('../data/connection_db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function formatEntry(row, position) {
  return {
    position,
    player: { id: String(row.user_id), username: row.nome },
    wins:       row.partidas_ganhas,
    losses:     row.partidas_perdidas,
    draws:      row.empates,
    totalGames: row.partidas_ganhas + row.partidas_perdidas + row.empates,
  };
}

// GET /ranking/me — posição do usuário autenticado (DEVE VIR ANTES DE /)
router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         e.*,
         u.nome,
         (SELECT COUNT(*) + 1
          FROM estatisticas e2
          WHERE e2.pontuacao > e.pontuacao
             OR (e2.pontuacao = e.pontuacao AND e2.partidas_ganhas > e.partidas_ganhas)
         ) AS posicao
       FROM estatisticas e
       JOIN users u ON u.id = e.user_id
       WHERE e.user_id = ?`,
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ statusCode: 404, message: 'Estatísticas não encontradas' });
    }

    const row = rows[0];
    return res.json(formatEntry(row, row.posicao));
  } catch (err) {
    console.error('[GET /ranking/me]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// GET /ranking?page=1&limit=10 — ranking global paginado
router.get('/', async (req, res) => {
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM estatisticas');

    const [rows] = await pool.query(
      `SELECT e.*, u.nome
       FROM estatisticas e
       JOIN users u ON u.id = e.user_id
       ORDER BY e.pontuacao DESC, e.partidas_ganhas DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const data = rows.map((row, i) => formatEntry(row, offset + i + 1));
    return res.json({ data, total });
  } catch (err) {
    console.error('[GET /ranking]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

module.exports = router;
