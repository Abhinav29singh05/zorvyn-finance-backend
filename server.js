// load env vars before anything else
require('dotenv').config();

const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// fail fast if DB is unreachable
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Connected to PostgreSQL');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
