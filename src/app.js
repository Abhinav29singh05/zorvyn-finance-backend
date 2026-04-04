const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Core Middleware ---

// cors() — allows requests from any origin (e.g., a React frontend on a different port).
// Without this, browsers block cross-origin API calls.
app.use(cors());

// express.json() — parses incoming JSON request bodies.
// Without this, req.body would be undefined when clients send JSON.
app.use(express.json());

// --- Root redirect ---
// When someone visits the base URL, take them straight to the API docs.
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// --- Swagger API Documentation ---
// Serves interactive API docs at /api-docs.
// The evaluator can open this in a browser and test all endpoints directly.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Finance Dashboard API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// --- Health Check ---
// A simple endpoint to verify the server is running.
// Useful for deployment platforms (Render, Railway) that ping your app to check health.
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// --- Routes ---
// Each route file handles a specific resource. The first argument is the URL prefix,
// so routes defined as '/' inside authRoutes actually become '/api/auth/'.
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Global Error Handler (must be last middleware) ---
app.use(errorHandler);

module.exports = app;
