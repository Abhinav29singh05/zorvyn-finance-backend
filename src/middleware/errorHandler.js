// Global error handler — catches any error thrown in routes/controllers/services.
// Express recognizes this as an error handler because it has 4 parameters (err, req, res, next).
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // If we already set a status code on the error, use it. Otherwise default to 500.
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show the stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
