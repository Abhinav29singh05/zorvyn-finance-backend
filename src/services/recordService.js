const db = require('../config/db');

const createRecord = async ({ user_id, amount, type, category, date, description }) => {
  const { rows } = await db.query(
    `INSERT INTO financial_records (user_id, amount, type, category, date, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, amount, type, category, date, description]
  );
  return rows[0];
};

// supports filtering, search, and pagination
const findAll = async (filters = {}) => {
  const { type, category, startDate, endDate, minAmount, maxAmount, search, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let baseFrom = `
    FROM financial_records fr
    JOIN users u ON fr.user_id = u.id
  `;

  const conditions = ['fr.deleted_at IS NULL'];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`fr.type = $${params.length}`);
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

  // case-insensitive search across category and description
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(fr.category ILIKE $${params.length} OR fr.description ILIKE $${params.length})`);
  }

  const whereClause = ` WHERE ${conditions.join(' AND ')}`;

  // run data + count queries in parallel
  const countParams = [...params];
  const dataParams = [...params];
  dataParams.push(limit);
  dataParams.push(offset);

  const [dataResult, countResult] = await Promise.all([
    db.query(
      `SELECT fr.*, u.name AS created_by ${baseFrom} ${whereClause}
       ORDER BY fr.date DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    ),
    db.query(
      `SELECT COUNT(*)::int AS total ${baseFrom} ${whereClause}`,
      countParams
    ),
  ]);

  return {
    records: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].total / limit),
  };
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT fr.*, u.name AS created_by
     FROM financial_records fr
     JOIN users u ON fr.user_id = u.id
     WHERE fr.id = $1 AND fr.deleted_at IS NULL`,
    [id]
  );
  return rows[0];
};

const updateRecord = async (id, { amount, type, category, date, description }) => {
  const { rows } = await db.query(
    `UPDATE financial_records
     SET amount = COALESCE($1, amount),
         type = COALESCE($2, type),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         description = COALESCE($5, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND deleted_at IS NULL
     RETURNING *`,
    [amount, type, category, date, description, id]
  );
  return rows[0];
};

// soft delete
const deleteRecord = async (id) => {
  const { rows } = await db.query(
    `UPDATE financial_records
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
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
