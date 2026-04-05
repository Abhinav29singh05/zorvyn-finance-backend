const recordService = require('../services/recordService');

const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

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

const getAllRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, minAmount, maxAmount, search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await recordService.findAll({
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.records,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

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

const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

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
