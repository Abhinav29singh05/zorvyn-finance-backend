const db = require('../config/db');

// conditional aggregation to get income, expenses, and net in one query
const getSummary = async () => {
  const { rows } = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)  AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
        0
      ) AS net_balance
    FROM financial_records
    WHERE deleted_at IS NULL
  `);

  // pg returns DECIMAL as strings, parse to numbers
  const summary = rows[0];
  return {
    total_income: parseFloat(summary.total_income),
    total_expenses: parseFloat(summary.total_expenses),
    net_balance: parseFloat(summary.net_balance),
  };
};

// totals per category, split by income/expense
const getCategoryTotals = async () => {
  const { rows } = await db.query(`
    SELECT
      category,
      type,
      SUM(amount)   AS total,
      COUNT(*)::int AS count
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY category, type
    ORDER BY total DESC
  `);

  return rows.map((row) => ({
    ...row,
    total: parseFloat(row.total),
  }));
};

// last N transactions, defaults to 10
const getRecentActivity = async (limit = 10) => {
  const { rows } = await db.query(
    `SELECT fr.*, u.name AS created_by
     FROM financial_records fr
     JOIN users u ON fr.user_id = u.id
     WHERE fr.deleted_at IS NULL
     ORDER BY fr.date DESC, fr.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

// monthly income vs expense breakdown
const getMonthlyTrends = async () => {
  const { rows } = await db.query(`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)  AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
      COALESCE(
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
        0
      ) AS net
    FROM financial_records
    WHERE deleted_at IS NULL
    GROUP BY TO_CHAR(date, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return rows.map((row) => ({
    ...row,
    income: parseFloat(row.income),
    expenses: parseFloat(row.expenses),
    net: parseFloat(row.net),
  }));
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
};
