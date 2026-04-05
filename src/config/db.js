const { Pool } = require('pg');

// reuse connections instead of opening a new one per query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // production PG on Render needs SSL
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// shorthand for pool.query
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
