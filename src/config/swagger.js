const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'Backend API for a finance dashboard with role-based access control. Supports user management, financial record CRUD, and dashboard analytics.',
    },
    servers: [
      {
        url: '/api',
        description: 'API base path',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from POST /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Admin User' },
            email: { type: 'string', format: 'email', example: 'admin@finance.com' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        FinancialRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', example: 5000.00 },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'salary' },
            date: { type: 'string', format: 'date', example: '2025-01-15' },
            description: { type: 'string', example: 'Monthly salary' },
            created_by: { type: 'string', example: 'Admin User' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
  // scan route files for @swagger annotations
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
