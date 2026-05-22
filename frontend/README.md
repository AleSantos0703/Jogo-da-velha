# Frontend - Como rodar

Este frontend esta configurado com React + Vite.

## Rodar localmente

```bash
cd /home/alessandro/Projeto-IFC/frontend
npm install
npm run dev
```

Frontend local:
- http://localhost:5173

## Rodar com Docker (via raiz do projeto)

```bash
cd /home/alessandro/Projeto-IFC
docker-compose up --build -d
```

Frontend no Docker:
- http://localhost:8081

## Observacao

No Docker, o frontend roda em modo producao com build Vite e entrega via Nginx.
