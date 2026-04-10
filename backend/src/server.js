// Backend básico com Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend ouvindo na porta ${PORT}`);
});
