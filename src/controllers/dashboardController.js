const dashboardService = require('../services/dashboardService');

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

// ?limit=5 to override default of 10
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
