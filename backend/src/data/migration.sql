CREATE TABLE IF NOT EXISTS users (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  senha       VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partidas (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  token        VARCHAR(64)   NOT NULL UNIQUE,
  jogador1_id  INT           NOT NULL,
  jogador2_id  INT           NULL,
  vencedor_id  INT           NULL,
  empate       BOOLEAN       NOT NULL DEFAULT FALSE,
  turno_atual  INT           NULL,
  status       ENUM('aguardando', 'em_andamento', 'finalizada', 'abandonada') NOT NULL DEFAULT 'aguardando',
  tabuleiro    JSON          NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  finished_at  TIMESTAMP     NULL,
  FOREIGN KEY (jogador1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jogador2_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (vencedor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS estatisticas (
  id                 INT       AUTO_INCREMENT PRIMARY KEY,
  user_id            INT       NOT NULL UNIQUE,
  partidas_ganhas    INT       NOT NULL DEFAULT 0,
  partidas_perdidas  INT       NOT NULL DEFAULT 0,
  empates            INT       NOT NULL DEFAULT 0,
  pontuacao          INT       GENERATED ALWAYS AS (partidas_ganhas * 3 + empates) STORED,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
