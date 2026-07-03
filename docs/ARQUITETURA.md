# Arquitetura do Projeto

## Visão Geral

O projeto é dividido em 3 camadas que rodam em containers Docker separados e se comunicam entre si:

```
Navegador
    │
    ▼
┌─────────────────────────────────┐
│         Nginx (porta 8081)      │
│  - serve os arquivos do React   │
│  - redireciona /auth /matches   │
│    /ranking pro backend         │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Backend Node.js (3000)     │
│  - API REST com Express         │
│  - valida JWT                   │
│  - aplica regras do jogo        │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        MySQL 8.0 (3306)         │
│  - users                        │
│  - partidas                     │
│  - estatisticas                 │
└─────────────────────────────────┘
```

---

## Fluxo de uma requisição

**Exemplo: jogador faz uma jogada**

```
1. MatchPage.tsx chama PATCH /matches/:id/move
        ↓
2. Nginx recebe na porta 8081
   vê que começa com /matches → repassa pro backend:3000
        ↓
3. Express recebe a requisição
   requireAuth verifica o token JWT
        ↓
4. matches.js valida: é sua vez? posição livre?
   chama checkWinner() para ver se alguém ganhou
        ↓
5. Atualiza tabuleiro, status e estatísticas no MySQL
        ↓
6. Devolve o estado atualizado da partida em JSON
        ↓
7. MatchPage.tsx renderiza o novo estado na tela
```

---

## Comunicação entre os containers

Os 3 containers estão na mesma rede Docker interna:

| De | Para | Como |
|---|---|---|
| Navegador | Nginx | HTTP porta 8081 |
| Nginx | Backend | HTTP interno `backend:3000` |
| Backend | MySQL | TCP interno `db:3306` |

O banco de dados **nunca é acessado diretamente pelo frontend** — tudo passa pelo backend.

---

## Autenticação

O projeto usa **JWT (JSON Web Token)** — autenticação stateless:

```
Login bem sucedido
        ↓
Backend gera token JWT assinado (válido por 7 dias)
        ↓
Frontend salva no localStorage ("tictactoe_token")
        ↓
Toda requisição seguinte envia o token no cabeçalho:
Authorization: Bearer <token>
        ↓
Backend valida o token antes de processar qualquer rota protegida
```

O servidor não guarda sessão — o token carrega todas as informações necessárias.

---

## Atualização do jogo em tempo real

O projeto usa **polling** — o frontend pergunta pro backend a cada 2,5 segundos:

```
MatchPage monta na tela
        ↓
setInterval a cada 2500ms:
  GET /matches/:id → recebe estado atual
        ↓
Se o estado mudou → React re-renderiza o tabuleiro
```

Não usa WebSockets — o polling é suficiente para um jogo de turnos.

---

## Banco de dados

Três tabelas principais:

| Tabela | Guarda |
|---|---|
| `users` | Conta dos jogadores (senha criptografada com bcrypt) |
| `partidas` | Estado de cada partida (tabuleiro em JSON, status, turno atual) |
| `estatisticas` | Vitórias, derrotas e empates de cada jogador |

As tabelas são criadas automaticamente na primeira vez que o backend sobe (`runMigrations()`).
