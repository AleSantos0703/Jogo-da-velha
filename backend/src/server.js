<<<<<<< HEAD
const express = require('express');
=======
<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const cors = require('cors');
=======
const express = require('express');
>>>>>>> 37042e4 (criado migração do banco)
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
const { runMigrations } = require('./data/connection_db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount auth controller if present
try {
  const authController = require('./controllers/authController');
  app.use('/api/auth', authController);
} catch (e) {
  console.warn('Auth controller not found:', e.message);
}

app.get('/', (req, res) => {
  res.send('Backend rodando com sucesso!');
});

<<<<<<< HEAD
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
=======
<<<<<<< HEAD
(async () => {
  try {
    await runMigrations();
    console.log('Migrations executadas com sucesso.');
  } catch (err) {
    // Não abortar o servidor em ambiente de desenvolvimento se o DB não estiver disponível
    console.warn('Migrations falharam (seguindo sem aplicar migrations):', err && err.message ? err.message : err);
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend ouvindo na porta ${PORT}`);
  });
})();
=======
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
>>>>>>> 37042e4 (criado migração do banco)
>>>>>>> 948049873f3447cdf39448fb00ea87e577214768
