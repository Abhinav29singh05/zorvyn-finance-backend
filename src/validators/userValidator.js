const Joi = require('joi');

// create user — all fields required except role (defaults to viewer)
const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name must be at most 100 characters.',
      'any.required': 'Name is required.',
    }),

  email: Joi.string().trim().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least 6 characters.',
      'any.required': 'Password is required.',
    }),

  role: Joi.string().valid('viewer', 'analyst', 'admin').default('viewer')
    .messages({
      'any.only': 'Role must be viewer, analyst, or admin.',
    }),
});

// update user — all optional, but need at least one field
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name must be at most 100 characters.',
    }),

  email: Joi.string().trim().email()
    .messages({
      'string.email': 'Please provide a valid email address.',
    }),

  role: Joi.string().valid('viewer', 'analyst', 'admin')
    .messages({
      'any.only': 'Role must be viewer, analyst, or admin.',
    }),

  status: Joi.string().valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be active or inactive.',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update.',
  });

// takes a Joi schema, returns validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false so the client gets all errors at once
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);

      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // use validated + trimmed body going forward
    req.body = value;
    next();
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  validate,
};
