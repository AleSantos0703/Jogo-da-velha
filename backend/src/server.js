const express = require('express');
const { runMigrations } = require('./data/connection_db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend rodando com sucesso!');
});

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor backend ouvindo na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao executar migrations:', err);
    process.exit(1);
  });
