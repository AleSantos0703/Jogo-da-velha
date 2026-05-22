# Guia de contribuicao

Este documento explica, passo a passo, como subir o projeto e como contribuir com seguranca.

## 1. Pre-requisitos

- Node.js 20+
- npm
- Docker Desktop com engine Linux ativo (recomendado para ambiente padrao)
- Git

## 2. Clonar e preparar

1. Clone o repositorio:

```bash
git clone <url-do-repositorio>
cd Projeto-IFC
```

2. Instale dependencias de cada modulo (local):

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 3. Como subir o projeto

### Opcao A: Docker (recomendado)

1. Primeira vez (ou apos mudar Dockerfile/dependencias):

```bash
docker compose up --build -d
```

2. Subidas seguintes:

```bash
docker compose up -d
```

3. Acessos:
- Frontend: http://localhost:8081
- Backend: http://localhost:3001

4. Ver status:

```bash
docker compose ps
```

5. Ver logs:

```bash
docker compose logs -f
```

6. Derrubar stack:

```bash
docker compose down
```

### Opcao B: Local (sem Docker)

1. Subir backend:

```bash
cd backend
npm run dev
```

Backend local: http://localhost:3000

2. Em outro terminal, subir frontend:

```bash
cd frontend
npm run dev
```

Frontend local: http://localhost:5173

## 4. Fluxo de contribuicao

1. Atualize sua branch principal local:

```bash
git checkout main
git pull origin main
```

2. Crie uma branch para sua tarefa:

```bash
git checkout -b feat/nome-curto-da-feature
```

Use prefixos sugeridos:
- feat/: nova funcionalidade
- fix/: correcao de bug
- chore/: ajuste tecnico
- docs/: documentacao
- refactor/: refatoracao sem mudar comportamento

3. Implemente sua alteracao mantendo escopo pequeno e objetivo.

4. Rode verificacoes locais antes do commit:

```bash
# backend
cd backend && npm run dev

# frontend (novo terminal)
cd frontend && npm run dev

# build frontend
cd frontend && npm run build
```

5. Commit com mensagem clara:

```bash
git add .
git commit -m "feat: descricao curta da alteracao"
```

6. Publique sua branch:

```bash
git push origin feat/nome-curto-da-feature
```

7. Abra um Pull Request para main com:
- objetivo da mudanca
- o que foi alterado
- como testar
- evidencias (prints/logs quando fizer sentido)

## 5. Checklist antes do PR

- Projeto sobe com Docker
- Frontend abre sem erro no navegador
- Backend responde em / com sucesso
- Sem arquivos desnecessarios versionados
- Documentacao atualizada quando houver mudanca de fluxo

## 6. Comandos uteis na raiz

- Subir Docker com build: npm run docker:up
- Derrubar Docker: npm run docker:down
- Logs Docker: npm run docker:logs
- Dev frontend: npm run dev:frontend
- Dev backend: npm run dev:backend

## 7. Solucao de problemas

### Porta ja em uso

Verifique portas ocupadas:

```bash
ss -ltnp | grep -E ':8081|:3001|:5173|:3000'
```

Troque mapeamento no docker-compose.yml ou pare o processo que ocupa a porta.

### Erro de compose sem arquivo

Execute comandos de Docker sempre na raiz do projeto, onde esta o arquivo docker-compose.yml.

### Erro no Windows: failed to connect to npipe dockerDesktopLinuxEngine

Esse erro indica que o daemon do Docker nao esta disponivel.

Passos para corrigir:
1. Abra o Docker Desktop e aguarde Engine running.
2. Garanta que o ambiente esta em Linux containers.
3. Valide no terminal:

```bash
docker version
docker info
docker compose version
```

4. Tente novamente:

```bash
docker compose up --build -d
```
