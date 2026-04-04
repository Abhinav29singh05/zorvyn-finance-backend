const recordService = require('../services/recordService');

// POST /api/records — Create a record (Admin only)
const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    // req.user.id comes from the JWT token (set by auth middleware).
    // This ties the record to the logged-in admin who created it.
    const record = await recordService.createRecord({
      user_id: req.user.id,
      amount,
      type,
      category,
      date,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully.',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/records — List records with optional filters (Analyst, Admin)
// Filters come from query string: ?type=income&startDate=2025-01-01
// req.query is automatically populated by Express from the URL query string.
const getAllRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, minAmount, maxAmount } = req.query;

    const records = await recordService.findAll({
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/records/:id — Get a single record (Analyst, Admin)
const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/records/:id — Update a record (Admin only)
const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    // Check if record exists
    const existing = await recordService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    const record = await recordService.updateRecord(req.params.id, {
      amount,
      type,
      category,
      date,
      description,
    });

    res.json({
      success: true,
      message: 'Record updated successfully.',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/records/:id — Delete a record (Admin only)
const deleteRecord = async (req, res, next) => {
  try {
    const record = await recordService.deleteRecord(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
