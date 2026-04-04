const db = require('../config/db');

// --- Summary: total income, total expenses, net balance ---
// Uses conditional aggregation — one query calculates all three values.
// SUM(CASE WHEN ...) is like an if/else inside the SUM function:
//   "For each row, if type is 'income', add the amount to the income total.
//    If type is 'expense', add it to the expense total."
// COALESCE wraps each SUM to return 0 instead of null when there are no records.

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
  `);

  // rows[0] contains { total_income, total_expenses, net_balance }
  // PostgreSQL returns DECIMAL as strings to avoid floating point issues.
  // We parse them to numbers for the JSON response.
  const summary = rows[0];
  return {
    total_income: parseFloat(summary.total_income),
    total_expenses: parseFloat(summary.total_expenses),
    net_balance: parseFloat(summary.net_balance),
  };
};

// --- Category-wise totals ---
// GROUP BY category groups all rows with the same category into one result row.
// SUM(amount) then adds up the amounts within each group.
// We also split by type so you see income vs expense per category.

const getCategoryTotals = async () => {
  const { rows } = await db.query(`
    SELECT
      category,
      type,
      SUM(amount)   AS total,
      COUNT(*)::int AS count
    FROM financial_records
    GROUP BY category, type
    ORDER BY total DESC
  `);

  // Parse total from string to number
  return rows.map((row) => ({
    ...row,
    total: parseFloat(row.total),
  }));
};

// --- Recent activity: last N transactions ---
// Simple query — just ORDER BY date DESC and LIMIT.
// Default to 10 records if no limit specified.

const getRecentActivity = async (limit = 10) => {
  const { rows } = await db.query(
    `SELECT fr.*, u.name AS created_by
     FROM financial_records fr
     JOIN users u ON fr.user_id = u.id
     ORDER BY fr.date DESC, fr.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

// --- Monthly trends: income vs expense per month ---
// TO_CHAR(date, 'YYYY-MM') extracts the year-month from a date:
//   '2025-01-15' → '2025-01'
//   '2025-03-05' → '2025-03'
// Then we GROUP BY that month string and use conditional SUM
// to get income and expense totals per month.

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
