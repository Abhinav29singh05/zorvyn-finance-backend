// express needs all 4 params to treat this as an error handler
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // stack trace only in dev
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
