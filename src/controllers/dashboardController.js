const dashboardService = require('../services/dashboardService');

// GET /api/dashboard/summary — Total income, expenses, net balance
const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/category-totals — Totals grouped by category and type
const getCategoryTotals = async (req, res, next) => {
  try {
    const totals = await dashboardService.getCategoryTotals();

    res.json({
      success: true,
      data: totals,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent-activity — Last N transactions
// Optional query param: ?limit=5 (defaults to 10)
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const activity = await dashboardService.getRecentActivity(limit);

    res.json({
      success: true,
      count: activity.length,
      data: activity,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/trends — Monthly income vs expense
const getTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getMonthlyTrends();

    res.json({
      success: true,
      data: trends,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getTrends,
};
