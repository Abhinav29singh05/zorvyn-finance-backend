const db = require('../config/db');
const bcrypt = require('bcrypt');

// 10 rounds is the standard sweet spot for bcrypt
const SALT_ROUNDS = 10;

const createUser = async ({ name, email, password, role = 'viewer' }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, status, created_at`,
    [name, email, hashedPassword, role]
  );
  return rows[0];
};

// paginated list, excluding soft-deleted users
const findAll = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    db.query(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL`
    ),
  ]);

  return {
    users: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].total / limit),
  };
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, name, email, role, status, created_at, updated_at
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0];
};

// includes password hash — needed for bcrypt.compare during login
const findByEmail = async (email) => {
  const { rows } = await db.query(
    `SELECT id, name, email, password, role, status
     FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return rows[0];
};

// COALESCE keeps existing values for fields not provided
const updateUser = async (id, { name, email, role, status }) => {
  const { rows } = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         status = COALESCE($4, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 AND deleted_at IS NULL
     RETURNING id, name, email, role, status, created_at, updated_at`,
    [name, email, role, status, id]
  );
  return rows[0];
};

// soft delete — set deleted_at instead of removing the row
const deleteUser = async (id) => {
  const { rows } = await db.query(
    `UPDATE users
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [id]
  );
  return rows[0];
};

module.exports = {
  createUser,
  findAll,
  findById,
  findByEmail,
  updateUser,
  deleteUser,
};
