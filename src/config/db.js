const { Pool } = require('pg');

// Pool manages a set of reusable database connections.
// Instead of opening/closing a connection for every query,
// the pool keeps connections alive and reuses them — much faster.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production (like Render), PostgreSQL often requires SSL
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Quick helper: pass a SQL query string + params array, get rows back.
// Usage: const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
