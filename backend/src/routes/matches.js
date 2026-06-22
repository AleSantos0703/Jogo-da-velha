const express = require('express');
const crypto = require('crypto');
const { pool } = require('../data/connection_db');
const { requireAuth } = require('../middleware/auth');
const { checkWinner } = require('../utils/gameLogic');

const router = express.Router();
router.use(requireAuth);

// ── Helpers ──────────────────────────────────────────────────

const STATUS_MAP = {
  aguardando:   'waiting',
  em_andamento: 'in_progress',
  finalizada:   'finished',
  abandonada:   'abandoned',
};

function formatPlayer(row) {
  if (!row) return null;
  return { id: String(row.id), username: row.nome };
}

function formatMatch(row, playerX, playerO) {
  return {
    id:           String(row.id),
    inviteToken:  row.token,
    board:        row.tabuleiro ?? Array(9).fill(null),
    status:       STATUS_MAP[row.status] ?? row.status,
    currentTurn:  row.turno_atual ? String(row.turno_atual) : null,
    playerX:      formatPlayer(playerX),
    playerO:      formatPlayer(playerO),
    winner:       row.empate ? 'draw' : (row.vencedor_id ? String(row.vencedor_id) : null),
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

async function getMatchWithPlayers(conn, matchId) {
  const [rows] = await conn.query('SELECT * FROM partidas WHERE id = ?', [matchId]);
  if (rows.length === 0) return null;
  const m = rows[0];

  const [[p1]] = m.jogador1_id
    ? await conn.query('SELECT id, nome FROM users WHERE id = ?', [m.jogador1_id])
    : [[]];
  const [[p2]] = m.jogador2_id
    ? await conn.query('SELECT id, nome FROM users WHERE id = ?', [m.jogador2_id])
    : [[]];

  return formatMatch(m, p1 ?? null, p2 ?? null);
}

// ── Rotas ────────────────────────────────────────────────────

// POST /matches — criar nova partida
router.post('/', async (req, res) => {
  const token = crypto.randomUUID();
  const board = Array(9).fill(null);

  try {
    const [result] = await pool.query(
      `INSERT INTO partidas (token, jogador1_id, tabuleiro, turno_atual, status)
       VALUES (?, ?, ?, ?, 'aguardando')`,
      [token, req.userId, JSON.stringify(board), req.userId]
    );
    const match = await getMatchWithPlayers(pool, result.insertId);
    return res.status(201).json(match);
  } catch (err) {
    console.error('[POST /matches]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// GET /matches/my — listar minhas partidas (DEVE VIR ANTES DE /:id)
router.get('/my', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id FROM partidas
       WHERE jogador1_id = ? OR jogador2_id = ?
       ORDER BY updated_at DESC LIMIT 20`,
      [req.userId, req.userId]
    );
    const result = await Promise.all(rows.map((r) => getMatchWithPlayers(pool, r.id)));
    return res.json(result);
  } catch (err) {
    console.error('[GET /matches/my]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// GET /matches/invite/:inviteToken — preview do convite (DEVE VIR ANTES DE /:id)
router.get('/invite/:inviteToken', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM partidas WHERE token = ?',
      [req.params.inviteToken]
    );
    if (rows.length === 0) {
      return res.status(404).json({ statusCode: 404, message: 'Convite não encontrado' });
    }
    const row = rows[0];
    const valid = row.status === 'aguardando' && row.jogador2_id === null;
    const match = await getMatchWithPlayers(pool, row.id);
    return res.json({ match, valid });
  } catch (err) {
    console.error('[GET /matches/invite]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// GET /matches/:id — buscar partida por ID
router.get('/:id', async (req, res) => {
  try {
    const match = await getMatchWithPlayers(pool, req.params.id);
    if (!match) {
      return res.status(404).json({ statusCode: 404, message: 'Partida não encontrada' });
    }
    return res.json(match);
  } catch (err) {
    console.error('[GET /matches/:id]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

// POST /matches/join/:inviteToken — entrar na partida pelo link
router.post('/join/:inviteToken', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM partidas WHERE token = ? FOR UPDATE',
      [req.params.inviteToken]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ statusCode: 404, message: 'Convite não encontrado' });
    }

    const row = rows[0];

    if (row.status !== 'aguardando') {
      await conn.rollback();
      return res.status(409).json({ statusCode: 409, message: 'Partida já iniciada ou encerrada' });
    }
    if (row.jogador1_id === req.userId) {
      await conn.rollback();
      return res.status(409).json({ statusCode: 409, message: 'Você já é o criador desta partida' });
    }

    await conn.query(
      `UPDATE partidas
       SET jogador2_id = ?, status = 'em_andamento'
       WHERE id = ?`,
      [req.userId, row.id]
    );

    await conn.commit();
    const match = await getMatchWithPlayers(pool, row.id);
    return res.json(match);
  } catch (err) {
    await conn.rollback();
    console.error('[POST /matches/join]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  } finally {
    conn.release();
  }
});

// PATCH /matches/:id/move — fazer uma jogada
router.patch('/:id/move', async (req, res) => {
  const position = Number(req.body.position);

  if (isNaN(position) || position < 0 || position > 8) {
    return res.status(400).json({ statusCode: 400, message: 'Posição inválida (0–8)' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM partidas WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ statusCode: 404, message: 'Partida não encontrada' });
    }

    const row = rows[0];

    if (row.status !== 'em_andamento') {
      await conn.rollback();
      return res.status(409).json({ statusCode: 409, message: 'Partida não está em andamento' });
    }
    if (row.turno_atual !== req.userId) {
      await conn.rollback();
      return res.status(403).json({ statusCode: 403, message: 'Não é sua vez' });
    }

    const board = row.tabuleiro ?? Array(9).fill(null);
    if (board[position] !== null) {
      await conn.rollback();
      return res.status(409).json({ statusCode: 409, message: 'Posição já ocupada' });
    }

    // Jogador1 sempre joga X, Jogador2 sempre joga O
    const symbol = row.jogador1_id === req.userId ? 'X' : 'O';
    board[position] = symbol;

    const result = checkWinner(board);

    let newStatus = 'em_andamento';
    let vencedorId = null;
    let empate = false;
    const proximoTurno = row.jogador1_id === req.userId ? row.jogador2_id : row.jogador1_id;
    let finishedAt = null;

    if (result === 'X') {
      newStatus = 'finalizada';
      vencedorId = row.jogador1_id;
      finishedAt = new Date();
    } else if (result === 'O') {
      newStatus = 'finalizada';
      vencedorId = row.jogador2_id;
      finishedAt = new Date();
    } else if (result === 'draw') {
      newStatus = 'finalizada';
      empate = true;
      finishedAt = new Date();
    }

    await conn.query(
      `UPDATE partidas
       SET tabuleiro = ?, status = ?, turno_atual = ?, vencedor_id = ?, empate = ?, finished_at = ?
       WHERE id = ?`,
      [JSON.stringify(board), newStatus, proximoTurno, vencedorId, empate, finishedAt, row.id]
    );

    if (newStatus === 'finalizada') {
      if (empate) {
        await conn.query(
          'UPDATE estatisticas SET empates = empates + 1 WHERE user_id IN (?, ?)',
          [row.jogador1_id, row.jogador2_id]
        );
      } else {
        const perdedorId = vencedorId === row.jogador1_id ? row.jogador2_id : row.jogador1_id;
        await conn.query(
          'UPDATE estatisticas SET partidas_ganhas = partidas_ganhas + 1 WHERE user_id = ?',
          [vencedorId]
        );
        await conn.query(
          'UPDATE estatisticas SET partidas_perdidas = partidas_perdidas + 1 WHERE user_id = ?',
          [perdedorId]
        );
      }
    }

    await conn.commit();
    const match = await getMatchWithPlayers(pool, row.id);
    return res.json(match);
  } catch (err) {
    await conn.rollback();
    console.error('[PATCH /matches/:id/move]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  } finally {
    conn.release();
  }
});

// PATCH /matches/:id/abandon — abandonar partida
router.patch('/:id/abandon', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM partidas WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ statusCode: 404, message: 'Partida não encontrada' });
    }

    const row = rows[0];

    if (row.jogador1_id !== req.userId && row.jogador2_id !== req.userId) {
      await conn.rollback();
      return res.status(403).json({ statusCode: 403, message: 'Você não participa desta partida' });
    }
    if (row.status === 'finalizada' || row.status === 'abandonada') {
      await conn.rollback();
      return res.status(409).json({ statusCode: 409, message: 'Partida já encerrada' });
    }

    // Se estava em andamento, o adversário ganha
    const vencedorId =
      row.status === 'em_andamento'
        ? (row.jogador1_id === req.userId ? row.jogador2_id : row.jogador1_id)
        : null;

    await conn.query(
      `UPDATE partidas
       SET status = 'abandonada', vencedor_id = ?, finished_at = NOW()
       WHERE id = ?`,
      [vencedorId, row.id]
    );

    if (vencedorId) {
      await conn.query(
        'UPDATE estatisticas SET partidas_ganhas = partidas_ganhas + 1 WHERE user_id = ?',
        [vencedorId]
      );
      await conn.query(
        'UPDATE estatisticas SET partidas_perdidas = partidas_perdidas + 1 WHERE user_id = ?',
        [req.userId]
      );
    }

    await conn.commit();
    const match = await getMatchWithPlayers(pool, row.id);
    return res.json(match);
  } catch (err) {
    await conn.rollback();
    console.error('[PATCH /matches/:id/abandon]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  } finally {
    conn.release();
  }
});

// DELETE /matches/:id — remover partida (apenas o criador)
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partidas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ statusCode: 404, message: 'Partida não encontrada' });
    }
    if (rows[0].jogador1_id !== req.userId) {
      return res.status(403).json({ statusCode: 403, message: 'Apenas o criador pode deletar' });
    }
    await pool.query('DELETE FROM partidas WHERE id = ?', [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    console.error('[DELETE /matches/:id]', err);
    return res.status(500).json({ statusCode: 500, message: 'Erro interno' });
  }
});

module.exports = router;
