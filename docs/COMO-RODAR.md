# Como rodar o projeto (frontend + backend)

Este guia mostra duas formas de subir o projeto:
- Com Docker (recomendado)
- Sem Docker (local)

Para fluxo de contribuicao (branch, commit, PR e checklist), consulte `CONTRIBUTING.md` na raiz do projeto.

## 1. Pre-requisitos

- Node.js 20+ e npm
- Docker e Docker Compose (para o modo Docker)

## 2. Subir com Docker (recomendado)

Na raiz do projeto, execute:

```bash
cd /home/alessandro/Projeto-IFC
docker-compose up --build -d
```

Acesso dos servicos:
- Frontend: http://localhost:8081
- Backend: http://localhost:3001

Ver status dos containers:

```bash
docker-compose ps
```

Ver logs:

```bash
docker-compose logs -f
```

Parar os servicos:

```bash
docker-compose down
```

## 3. Subir sem Docker (modo local)

### 3.1 Backend

```bash
cd /home/alessandro/Projeto-IFC/backend
npm install
npm run dev
```

Backend local:
- http://localhost:3000

Teste rapido:

```bash
curl http://localhost:3000/
```

Resposta esperada:
- Backend rodando com sucesso!

### 3.2 Frontend (React + Vite)

Em outro terminal:

```bash
cd /home/alessandro/Projeto-IFC/frontend
npm install
npm run dev
```

Frontend local:
- http://localhost:5173

## 4. Solucao de problemas

### Erro: no configuration file provided: not found

Causa:
- Voce executou o compose em um local sem arquivo de configuracao.

Correcao:
- Rode o comando na raiz do projeto, onde existe `docker-compose.yml`.

### Erro de porta em uso (bind failed)

Exemplo:
- 8080/8081 ou 3000/3001 ja estao ocupadas.

Como diagnosticar:

```bash
ss -ltnp | grep -E ':8081|:3001|:8080|:3000'
```

Como resolver:
- Pare o processo que esta usando a porta, ou
- Altere o mapeamento de porta em `docker-compose.yml`.

## 5. Observacao importante sobre o frontend

Hoje o frontend esta em padrao de producao com build Vite e entrega via Nginx no Docker.

- Desenvolvimento local: `npm run dev` em `frontend/`
- Producao no Docker: build de `frontend/dist` + Nginx com fallback de SPA
