const logger = require('../services/logger');

const notFoundMiddleware = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message || 'Unhandled error', {
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
