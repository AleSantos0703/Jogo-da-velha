# Jogo da Velha Multiplayer

Aplicação web de Jogo da Velha para dois jogadores em tempo real. Um jogador cria a partida, compartilha o link de convite e o segundo jogador entra pelo link — sem precisar estar na mesma rede.

## Integrantes

| Nome | Matrícula | GitHub |
|---|---|---|
| Cremilson | 2023009691 | @crezin |
| Rafael | 2024009266 | @RafaelHenriqueReichardt |
| Alessandro | 2024007780 | @AleSantos0703 |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express |
| Banco de dados | MySQL 8.0 |
| Autenticação | JWT + bcrypt |
| Infraestrutura | Docker + Docker Compose + Nginx |

## Como subir o projeto

### Com Docker (recomendado)

Necessário ter [Docker](https://www.docker.com/) instalado.

```bash
# Clone o repositório
git clone <url do repositório>
cd Projeto-IFC

# Sobe os 3 containers (banco, backend, frontend)
docker-compose up --build -d
```

Acesse em: **http://localhost:8081**

Para parar:
```bash
docker-compose down
```

---

### Sem Docker (desenvolvimento local)

Necessário ter Node.js e MySQL instalados.

**Backend:**
```bash
cd backend
npm install
npm run dev
# roda em http://localhost:3000
```

**Frontend** (em outro terminal):
```bash
cd frontend
npm install
npm run dev
# roda em http://localhost:5173
```

## Estrutura do projeto

```
Projeto-IFC/
├── backend/
│   └── src/
│       ├── server.js         # ponto de entrada
│       ├── data/             # banco de dados e migrations
│       ├── middleware/       # autenticação JWT
│       ├── routes/           # endpoints da API
│       └── utils/            # lógica do jogo
├── frontend/
│   └── src/
│       ├── pages/            # telas do app
│       ├── layouts/          # proteção de rotas
│       ├── store/            # estado global (Zustand)
│       └── lib/              # comunicação com o backend
├── docker/                   # Dockerfiles e configuração Nginx
└── docker-compose.yml        # orquestração dos containers
```

## Histórico de entregas

| Etapa | Descrição | Data | Status |
|---|---|---|---|
| E1 | Definição do projeto | 13/04 | ✅ |
| E2 | Modelagem | 13/04 | ✅ |
| E3 | Backend + BD | — | ✅ |
| E4 | Interface integrada | — | ✅ |
| E5 | Projeto final | — | 🔄 |

> ✅ Concluído | 🔄 Em andamento | ⏳ Pendente
