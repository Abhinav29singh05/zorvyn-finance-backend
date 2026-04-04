// Load environment variables FIRST — before any other module reads them.
require('dotenv').config();

const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Test database connection, then start the server.
// If DB is unreachable, we fail fast with a clear error instead of starting
// a server that will crash on the first query.
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
