const Joi = require('joi');
const { validate } = require('./userValidator');

// reusing validate() from userValidator — it's generic

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required()
    .messages({
      'number.base': 'Amount must be a number.',
      'number.positive': 'Amount must be a positive number.',
      'any.required': 'Amount is required.',
    }),

  type: Joi.string().valid('income', 'expense').required()
    .messages({
      'any.only': 'Type must be income or expense.',
      'any.required': 'Type is required.',
    }),

  category: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Category must be at least 2 characters.',
      'any.required': 'Category is required.',
    }),

  date: Joi.date().iso().required()
    .messages({
      'date.format': 'Date must be in ISO format (YYYY-MM-DD).',
      'any.required': 'Date is required.',
    }),

  description: Joi.string().trim().max(500).allow('', null)
    .messages({
      'string.max': 'Description must be at most 500 characters.',
    }),
});

// all optional, at least one required
const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2)
    .messages({
      'number.base': 'Amount must be a number.',
      'number.positive': 'Amount must be a positive number.',
    }),

  type: Joi.string().valid('income', 'expense')
    .messages({
      'any.only': 'Type must be income or expense.',
    }),

  category: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Category must be at least 2 characters.',
    }),

  date: Joi.date().iso()
    .messages({
      'date.format': 'Date must be in ISO format (YYYY-MM-DD).',
    }),

  description: Joi.string().trim().max(500).allow('', null)
    .messages({
      'string.max': 'Description must be at most 500 characters.',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update.',
  });

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  validate,
};
