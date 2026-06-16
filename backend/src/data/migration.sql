-- =============================================================
<<<<<<< HEAD
-- Jogo da Velha IFC — Migration inicial (PostgreSQL)
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
=======
-- Jogo da Velha IFC — Migration inicial
-- Executa CREATE TABLE IF NOT EXISTS para ser idempotente
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  senha       VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
>>>>>>> 37042e4 (criado migração do banco)
);

-- partidas: cada registro é uma sessão de jogo
-- token é o código único enviado via WhatsApp
<<<<<<< HEAD
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
=======
-- tabuleiro guarda o estado atual como JSON: ["X","","O","X","","","","",""]
CREATE TABLE IF NOT EXISTS partidas (
  id           INT      AUTO_INCREMENT PRIMARY KEY,
  token        VARCHAR(64)   NOT NULL UNIQUE,
  jogador1_id  INT           NOT NULL,
  jogador2_id  INT           NULL,
  vencedor_id  INT           NULL,
  status       ENUM('aguardando', 'em_andamento', 'finalizada') NOT NULL DEFAULT 'aguardando',
  tabuleiro    JSON          NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at  TIMESTAMP     NULL,
>>>>>>> 37042e4 (criado migração do banco)
  FOREIGN KEY (jogador1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jogador2_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (vencedor_id) REFERENCES users(id) ON DELETE SET NULL
);

<<<<<<< HEAD
-- estatisticas: uma linha por usuário
CREATE TABLE IF NOT EXISTS estatisticas (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  partidas_ganhas INT NOT NULL DEFAULT 0,
  partidas_perdidas INT NOT NULL DEFAULT 0,
  empates INT NOT NULL DEFAULT 0,
  pontuacao INT GENERATED ALWAYS AS (partidas_ganhas * 3 + empates) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
=======
-- estatisticas: uma linha por usuário, atualizada ao fim de cada partida
-- pontuacao = wins*3 + draws (coluna gerada automaticamente pelo MySQL)
CREATE TABLE IF NOT EXISTS estatisticas (
  id                 INT       AUTO_INCREMENT PRIMARY KEY,
  user_id            INT       NOT NULL UNIQUE,
  partidas_ganhas    INT       NOT NULL DEFAULT 0,
  partidas_perdidas  INT       NOT NULL DEFAULT 0,
  empates            INT       NOT NULL DEFAULT 0,
  pontuacao          INT       GENERATED ALWAYS AS (partidas_ganhas * 3 + empates) STORED,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
>>>>>>> 37042e4 (criado migração do banco)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
