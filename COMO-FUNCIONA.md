# Como funciona o projeto — Jogo da Velha

Este documento explica, de forma simples, **o que o projeto faz**, **como as partes se conectam** e **pra que serve cada pasta**. O objetivo é que qualquer pessoa do grupo consiga entender e apresentar o projeto, mesmo sem ter escrito o código.

---

## 1. O que o projeto faz

É um **Jogo da Velha (Tic-Tac-Toe) multiplayer pela internet**. O fluxo básico é:

1. A pessoa cria uma conta e faz login.
2. Cria uma partida e gera um **link de convite**.
3. Manda esse link pra outra pessoa (WhatsApp, etc.).
4. A outra pessoa abre o link, faz login, e entra na partida.
5. Os dois jogam por turnos — cada jogada é salva no servidor.
6. No final, o resultado entra no **ranking geral** (vitórias, derrotas, empates).

Não é preciso estar na mesma rede/Wi-Fi — tudo passa por um servidor central, então funciona com os dois jogadores em lugares diferentes.

---

## 2. Visão geral da arquitetura

O projeto é dividido em 3 partes que conversam entre si:

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│  FRONTEND   │ ──────▶│   BACKEND   │ ──────▶│ BANCO DE     │
│  (React)    │◀────── │ (Node/      │◀────── │ DADOS        │
│  o que o    │  HTTP  │  Express)   │  SQL   │ (MySQL)      │
│  usuario vê │        │ a "logica"  │        │ onde fica    │
│  e clica    │        │ do jogo     │        │ tudo salvo   │
└─────────────┘        └─────────────┘        └─────────────┘
```

- **Frontend**: a parte visual, que roda no navegador (telas de login, menu, tabuleiro do jogo).
- **Backend**: o "cérebro" do sistema. Recebe pedidos do frontend (ex: "criar uma partida", "jogar na posição 3"), aplica as regras do jogo e fala com o banco de dados.
- **Banco de dados (MySQL)**: onde ficam guardados os usuários, as partidas e as estatísticas — de forma permanente, mesmo se o servidor reiniciar.

Essas três partes rodam dentro de **containers Docker** (explicado na seção 5), o que facilita rodar tudo com um único comando.

---

## 3. Tecnologias usadas (e por quê)

| Tecnologia | Onde é usada | Pra que serve |
|---|---|---|
| **React + Vite** | Frontend | Monta as telas (login, menu, tabuleiro) de forma reativa |
| **TypeScript** | Frontend | JavaScript com verificação de tipos, ajuda a evitar erros bobos |
| **Node.js + Express** | Backend | Recebe as requisições HTTP e processa a lógica do jogo |
| **MySQL** | Banco de dados | Guarda usuários, partidas e estatísticas |
| **JWT (JSON Web Token)** | Backend + Frontend | "Crachá digital" — depois do login, o usuário recebe um token que prova quem ele é nas próximas requisições, sem precisar digitar senha de novo |
| **bcrypt** | Backend | Criptografa a senha antes de salvar no banco (nem o próprio sistema sabe a senha original) |
| **Docker / Docker Compose** | Tudo | Empacota frontend, backend e banco em "caixinhas" prontas, pra rodar com um comando só, sem instalar nada manualmente |
| **Nginx** | Frontend (produção) | Servidor que entrega os arquivos do site e repassa pedidos de API pro backend |

---

## 4. Estrutura de pastas

```
Projeto-IFC/
├── frontend/        → tudo que o usuário vê (telas, botões, tabuleiro)
├── backend/         → a API (regras do jogo, login, banco de dados)
├── docker/          → receitas pra empacotar o projeto em containers
├── docs/            → documentação (este tipo de arquivo)
└── docker-compose.yml → "liga tudo": frontend + backend + banco juntos
```

### `frontend/` — a parte visual

```
frontend/src/
├── main.tsx              → ponto de entrada: liga o React na página
├── App.tsx               → define as rotas (qual tela abre em qual endereço)
├── pages/                → cada arquivo é uma tela completa
│   ├── LoginPage.tsx        → tela de login
│   ├── RegisterPage.tsx     → tela de cadastro
│   ├── MenuPage.tsx         → menu principal (criar partida, ranking, perfil)
│   ├── MatchPage.tsx        → o tabuleiro do jogo em si
│   └── JoinMatchPage.tsx    → tela que processa o link de convite
├── layouts/
│   ├── PublicLayout.tsx     → moldura usada nas páginas públicas
│   └── RequireAuth.tsx      → "segurança": bloqueia quem não fez login de acessar o menu/jogo
├── store/
│   └── useAuthStore.ts      → guarda na memória se o usuário está logado e quem ele é
├── lib/
│   ├── api.ts               → todas as chamadas pro backend (login, criar partida, jogar, etc.)
│   └── jogo.ts              → regras de quem venceu o jogo (usado só pra exibir na tela)
└── assets/, images/         → imagens, fontes, ícones
```

> Se quiser mudar algo visual (cor, texto, layout), o lugar certo é dentro de `pages/`.

### `backend/` — a API (o "cérebro")

```
backend/src/
├── server.js             → ponto de entrada: liga o servidor e as rotas
├── routes/               → cada arquivo define um grupo de endereços da API
│   ├── auth.js              → /auth/register, /auth/login, /auth/me, /auth/logout
│   ├── matches.js           → /matches — criar partida, entrar, jogar, abandonar
│   └── ranking.js           → /ranking — lista geral e posição do usuário
├── middleware/
│   └── auth.js              → verifica o "crachá" (JWT) antes de liberar uma rota protegida
├── utils/
│   └── gameLogic.js         → função que checa se alguém ganhou o jogo da velha
└── data/
    ├── connection_db.js     → conecta no MySQL e roda as migrations (criação de tabelas)
    └── migration.sql        → o "molde" das tabelas do banco de dados
```

> Se quiser mudar uma regra do jogo ou adicionar uma funcionalidade nova na API, o lugar certo é dentro de `routes/`.

As pastas `backend/assets`, `backend/dist`, `backend/lib` e `backend/docs` estão vazias (só têm um arquivo `.gitkeep` pra manter a pasta no Git) — são reservadas, mas não são usadas no momento.

### `docker/` — empacotamento

```
docker/
├── Dockerfile.backend       → receita pra empacotar o backend numa "caixinha" (container)
├── Dockerfile.frontend      → receita pra empacotar o frontend (gera o build e usa Nginx)
└── nginx.frontend.conf      → configuração do Nginx: o que é página e o que é chamado de API
```

### `docs/`

Documentação do projeto — por exemplo, [`COMO-RODAR.md`](docs/COMO-RODAR.md) explica passo a passo como subir o projeto na sua máquina.

---

## 5. Como tudo se conecta (passo a passo de uma partida)

1. **Cadastro/Login** (`RegisterPage`/`LoginPage` → `auth.js` no backend) — o backend confere a senha (com `bcrypt`) e devolve um token JWT. O frontend guarda esse token e usa em toda requisição seguinte (`api.ts`).
2. **Criar partida** (`MenuPage` → `POST /matches` em `matches.js`) — o backend cria uma linha na tabela `partidas` com um código de convite único (`token`).
3. **Convidar** — o frontend monta um link com esse código (ex: `.../match/join/AbCd1234`) e o jogador compartilha.
4. **Entrar na partida** (`JoinMatchPage` → `POST /matches/join/:token`) — o segundo jogador é vinculado à partida.
5. **Jogar** (`MatchPage` → `PATCH /matches/:id/move`) — a cada clique, o frontend manda a posição pro backend. O backend confere se é a vez do jogador, atualiza o tabuleiro e checa se alguém venceu (`gameLogic.js`).
6. **Atualização em tempo real (quase)** — como não tem nada de "tempo real" instantâneo, o `MatchPage` consulta o servidor **a cada 2,5 segundos** pra ver se o adversário já jogou.
7. **Fim de jogo** — quando alguém vence (ou empata), o backend atualiza a tabela `estatisticas`, que alimenta o **ranking geral** (`ranking.js` / painel de Ranking no menu).

---

## 6. Banco de dados — as 3 tabelas

Definidas em [`backend/src/data/migration.sql`](backend/src/data/migration.sql):

- **`users`** — quem se cadastrou (nome, email, senha criptografada).
- **`partidas`** — cada jogo: quem é o jogador 1 e 2, o tabuleiro atual, de quem é a vez, status (aguardando / em andamento / finalizada / abandonada) e quem venceu.
- **`estatisticas`** — um resumo por jogador: quantas vitórias, derrotas e empates (usado pro ranking).

As tabelas são criadas automaticamente quando o backend liga (função `runMigrations()` em `connection_db.js`) — não precisa criar nada manualmente.

---

## 7. Como rodar o projeto

Forma mais simples (com Docker), na raiz do projeto:

```bash
docker compose up --build -d
```

- Frontend: http://localhost:8081
- Backend: http://localhost:3000

Guia completo, com solução de problemas comuns, em [`docs/COMO-RODAR.md`](docs/COMO-RODAR.md).

---

## 8. Dica pra apresentação

Uma ordem que costuma funcionar bem pra apresentar:

1. Mostrar o projeto rodando (cadastro → login → criar partida → jogar em duas abas/dois dispositivos).
2. Explicar a arquitetura com o diagrama da seção 2 (frontend ↔ backend ↔ banco).
3. Abrir uma pasta de cada vez (`frontend/src/pages`, `backend/src/routes`) e mostrar onde cada coisa que acabou de ser demonstrada "vive" no código.
4. Se perguntarem sobre o banco de dados, mostrar as 3 tabelas da seção 6.
