# Estrutura de Pastas e Arquivos

## Raiz do projeto

| Arquivo / Pasta | Para que serve |
|---|---|
| `docker-compose.yml` | Define e liga os 3 containers (banco, backend, frontend) |
| `package.json` | Scripts de conveniência: `npm run dev:frontend`, `docker:up`, etc. |
| `README.md` | Apresentação do projeto e instruções de como subir |
| `CONTRIBUTING.md` | Guia de como contribuir (branches, commits, PRs) |
| `.gitignore` | O que o Git deve ignorar (`node_modules`, `.env`, `dist`) |
| `index.html` | ⚠️ Legado — página estática anterior ao React, não é usada |

---

## `docker/`

| Arquivo | Para que serve |
|---|---|
| `Dockerfile.backend` | Receita para empacotar o backend em uma imagem Docker |
| `Dockerfile.frontend` | Receita para buildar o React com Vite e servir com Nginx |
| `nginx.frontend.conf` | Configuração do Nginx: arquivos estáticos + proxy pro backend |
| `docker-compose.yml` | ⚠️ Arquivo duplicado/órfão — não é usado por nenhum script |

---

## `backend/`

| Arquivo / Pasta | Para que serve |
|---|---|
| `package.json` | Dependências do backend (Express, MySQL2, JWT, bcrypt) |
| `src/server.js` | Ponto de entrada — cria o servidor e registra as rotas |
| `src/data/` | Conexão com o banco, migrations e diagrama |
| `src/data/connection_db.js` | Abre a conexão com o MySQL e cria as tabelas automaticamente |
| `src/data/migration.sql` | Definição das tabelas: `users`, `partidas`, `estatisticas` |
| `src/data/diagrama_banco.png` | Diagrama visual do banco de dados |
| `src/middleware/` | Funções que interceptam requisições antes das rotas |
| `src/middleware/auth.js` | Valida o token JWT antes de liberar rotas protegidas |
| `src/routes/` | Endpoints da API agrupados por assunto |
| `src/routes/auth.js` | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me` |
| `src/routes/matches.js` | Criar partida, jogar, convidar, abandonar, deletar |
| `src/routes/ranking.js` | Ranking geral paginado e posição do jogador logado |
| `src/utils/gameLogic.js` | Função `checkWinner` — verifica se alguém ganhou |
| `src/teste.md` | ⚠️ Arquivo vazio sem uso |

---

## `frontend/`

| Arquivo / Pasta | Para que serve |
|---|---|
| `package.json` | Dependências do frontend (React, Vite, Zustand) |
| `index.html` | Página real carregada pelo navegador — contém `<div id="root">` |
| `vite.config.ts` | Configuração do Vite (plugin React + proxy pro backend em dev) |
| `tsconfig.json` | Regras do TypeScript para o código em `src/` |
| `vite.config.js`, `vite.config.d.ts` | ⚠️ Artefatos de compilação commitados por engano — ignorar |

### `frontend/src/`

| Arquivo / Pasta | Para que serve |
|---|---|
| `main.tsx` | Ponto de entrada — monta o React dentro do `<div id="root">` |
| `App.tsx` | Define as rotas: qual tela aparece em qual URL |
| `vite-env.d.ts` | Ensina o TypeScript a entender variáveis do Vite |
| `pages/` | As telas do app |
| `pages/LoginPage.tsx` | Tela de login |
| `pages/RegisterPage.tsx` | Tela de cadastro |
| `pages/MenuPage.tsx` | Menu principal: criar partida, ranking, perfil |
| `pages/MatchPage.tsx` | Tabuleiro do jogo com polling a cada 2,5 segundos |
| `pages/JoinMatchPage.tsx` | Processa o link de convite e redireciona pro jogo |
| `layouts/PublicLayout.tsx` | Moldura das páginas públicas (login, registro) |
| `layouts/RequireAuth.tsx` | Bloqueia rotas privadas para quem não está logado |
| `store/useAuthStore.ts` | Estado global de autenticação (Zustand) |
| `lib/api.ts` | Todas as chamadas HTTP pro backend — único arquivo que fala com o servidor |
| `lib/jogo.ts` | Verifica vencedor localmente para destacar a linha ganhadora na tela |
| `images/dog_run.png` | ⚠️ Imagem não referenciada em nenhuma tela |

### `frontend/assets/` — Legado

| Arquivo / Pasta | Situação |
|---|---|
| `assets/css/style.css` | ⚠️ CSS do site estático antigo, não usado pelo React |
| `assets/js/main.js` | ⚠️ JS do site estático antigo, não usado |
| `assets/fonts/`, `assets/img/` | ⚠️ Pastas vazias do site antigo |

---

## `docs/`

| Arquivo | Para que serve |
|---|---|
| `ARQUITETURA.md` | Como as camadas do sistema se comunicam |
| `ESTRUTURA.md` | Este arquivo — para que serve cada pasta e arquivo |

---

> ⚠️ Arquivos marcados com este símbolo existem no repositório mas não fazem parte do app que funciona hoje.
