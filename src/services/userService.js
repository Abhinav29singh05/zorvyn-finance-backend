const db = require('../config/db');
const bcrypt = require('bcrypt');

// Salt rounds = how many times bcrypt re-hashes the password.
// 10 is the standard — secure enough, but doesn't make login slow.
// Higher = more secure but slower. 10 takes ~100ms, 14 takes ~1s.
const SALT_ROUNDS = 10;

// --- Create a new user ---
// Hashes the password before storing. Never store plain-text passwords.
const createUser = async ({ name, email, password, role = 'viewer' }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, status, created_at`,
    [name, email, hashedPassword, role]
  );

  // RETURNING gives us the created row back without a second SELECT query.
  // Notice we don't return the password — never send hashed passwords in responses.
  return rows[0];
};

// --- Get all users ---
// ORDER BY created_at DESC = newest users first.
const findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, name, email, role, status, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
};

// --- Get a single user by ID ---
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, name, email, role, status, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  // rows[0] is undefined if no user found — the controller checks for this.
  return rows[0];
};

// --- Find user by email (used during login) ---
// This one DOES return the password because bcrypt.compare() needs it.
const findByEmail = async (email) => {
  const { rows } = await db.query(
    `SELECT id, name, email, password, role, status
     FROM users
     WHERE email = $1`,
    [email]
  );
  return rows[0];
};

// --- Update a user ---
// Only updates the fields that are provided (partial update).
// Uses COALESCE — if the new value is null/undefined, keep the old value.
const updateUser = async (id, { name, email, role, status }) => {
  const { rows } = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         status = COALESCE($4, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, name, email, role, status, created_at, updated_at`,
    [name, email, role, status, id]
  );
  return rows[0];
};

// --- Delete a user ---
// Hard delete — the row is permanently removed.
// ON DELETE CASCADE in schema.sql means their financial records are deleted too.
const deleteUser = async (id) => {
  const { rows } = await db.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [id]
  );
  // Returns the deleted row's id, or undefined if the user didn't exist.
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
