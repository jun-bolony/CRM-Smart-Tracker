// Global error handler
module.exports = (err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack || err);

  // If the response has already been sent, we delegate further
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message
  });
};