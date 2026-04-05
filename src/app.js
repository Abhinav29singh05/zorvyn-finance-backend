const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// redirect root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Finance Dashboard API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// health check for deployment platforms
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// must be registered last
app.use(errorHandler);

module.exports = app;
