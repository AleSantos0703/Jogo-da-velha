-- =============================================================
-- Jogo da Velha IFC — Migration inicial (PostgreSQL)
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- partidas: cada registro é uma sessão de jogo
-- token é o código único enviado via WhatsApp
-- tabuleiro guarda o estado atual como JSON
CREATE TABLE IF NOT EXISTS partidas (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  jogador1_id INT NOT NULL,
  jogador2_id INT NULL,
  vencedor_id INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando','em_andamento','finalizada')),
  tabuleiro JSON NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ NULL,
  FOREIGN KEY (jogador1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jogador2_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (vencedor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- estatisticas: uma linha por usuário
CREATE TABLE IF NOT EXISTS estatisticas (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  partidas_ganhas INT NOT NULL DEFAULT 0,
  partidas_perdidas INT NOT NULL DEFAULT 0,
  empates INT NOT NULL DEFAULT 0,
  pontuacao INT GENERATED ALWAYS AS (partidas_ganhas * 3 + empates) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
