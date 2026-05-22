# Backend - Como rodar

## Rodar localmente

```bash
cd /home/alessandro/Projeto-IFC/backend
npm install
npm run dev
```

Backend local:
- http://localhost:3000

Teste:

```bash
curl http://localhost:3000/
```

## Rodar com Docker (via raiz do projeto)

```bash
cd /home/alessandro/Projeto-IFC
docker-compose up --build -d
```

Backend no Docker:
- http://localhost:3001
