const { runMigrations } = require('./src/data/connection_db');
runMigrations().then(()=>console.log('MIGRATIONS_OK')).catch(e=>{ console.error('MIGRATIONS_ERROR:', e && e.message ? e.message : e); process.exit(1); });
