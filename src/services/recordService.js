const db = require('../config/db');

// --- Create a financial record ---
const createRecord = async ({ user_id, amount, type, category, date, description }) => {
  const { rows } = await db.query(
    `INSERT INTO financial_records (user_id, amount, type, category, date, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, amount, type, category, date, description]
  );
  return rows[0];
};

// --- Get all records with optional filters ---
// This is the most complex query in the project because it builds
// a WHERE clause dynamically based on which filters the client sends.
//
// Supported filters (all optional, from query string):
//   ?type=income
//   ?category=salary
//   ?startDate=2025-01-01&endDate=2025-03-31
//   ?minAmount=100&maxAmount=5000
//
// The approach: start with a base query, then conditionally append
// WHERE conditions. Each condition uses a parameterized placeholder ($1, $2, ...)
// to prevent SQL injection.

const findAll = async (filters = {}) => {
  const { type, category, startDate, endDate, minAmount, maxAmount } = filters;

  // Base query — joins with users table to get the creator's name.
  // This avoids a second query to look up who created each record.
  let query = `
    SELECT fr.*, u.name AS created_by
    FROM financial_records fr
    JOIN users u ON fr.user_id = u.id
  `;

  // conditions[] holds SQL fragments like "fr.type = $1"
  // params[] holds the actual values like "income"
  // The index of each param matches its $N placeholder.
  const conditions = [];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`fr.type = $${params.length}`);
    // If type is the first filter: params = ['income'], condition = 'fr.type = $1'
    // params.length gives us the correct $N number automatically.
  }

  if (category) {
    params.push(category);
    conditions.push(`fr.category = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`fr.date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`fr.date <= $${params.length}`);
  }

  if (minAmount) {
    params.push(minAmount);
    conditions.push(`fr.amount >= $${params.length}`);
  }

  if (maxAmount) {
    params.push(maxAmount);
    conditions.push(`fr.amount <= $${params.length}`);
  }

  // If any filters were provided, join them with AND into a WHERE clause.
  // Example: WHERE fr.type = $1 AND fr.date >= $2 AND fr.date <= $3
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY fr.date DESC`;

  const { rows } = await db.query(query, params);
  return rows;
};

// --- Get a single record by ID ---
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT fr.*, u.name AS created_by
     FROM financial_records fr
     JOIN users u ON fr.user_id = u.id
     WHERE fr.id = $1`,
    [id]
  );
  return rows[0];
};

// --- Update a record ---
// Same COALESCE pattern as userService — only updates provided fields.
const updateRecord = async (id, { amount, type, category, date, description }) => {
  const { rows } = await db.query(
    `UPDATE financial_records
     SET amount = COALESCE($1, amount),
         type = COALESCE($2, type),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         description = COALESCE($5, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [amount, type, category, date, description, id]
  );
  return rows[0];
};

// --- Delete a record ---
const deleteRecord = async (id) => {
  const { rows } = await db.query(
    `DELETE FROM financial_records WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0];
};

module.exports = {
  createRecord,
  findAll,
  findById,
  updateRecord,
  deleteRecord,
};
