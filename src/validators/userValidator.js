const Joi = require('joi');

// Joi schemas define WHAT valid input looks like.
// If the input doesn't match, Joi returns a detailed error message.
// This prevents bad data from ever reaching the controller/service.

// Schema for POST /api/users (creating a new user)
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

// Schema for PATCH /api/users/:id (updating a user)
// All fields are optional here — the user only sends what they want to change.
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
  // At least one field must be provided — an empty update makes no sense.
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update.',
  });

// Validate function factory — takes a schema and returns middleware.
// Same pattern as authorize() in rbac.js: a function that returns a function.
//
// Usage in routes:
//   router.post('/', validate(createUserSchema), controller.create);
const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false → collect ALL errors, not just the first one.
    // This way the client can fix everything in one go instead of
    // fixing one error, submitting, finding another, fixing, submitting...
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Joi returns errors in a nested structure. We extract just the messages.
      const errors = error.details.map((detail) => detail.message);

      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Replace req.body with the validated (and trimmed/defaulted) value.
    // This ensures the controller gets clean, validated data.
    req.body = value;
    next();
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  validate,
};
