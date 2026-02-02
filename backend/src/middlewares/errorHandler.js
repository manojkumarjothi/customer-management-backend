/**
 * Centralized error handler middleware.
 * Maps known errors to HTTP status and JSON response.
 */

const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler - must be registered after all routes.
 */
function notFound(req, res, next) {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
}

/**
 * Global error handler - 4 args signature for Express.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id or parameter';
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value for unique field';
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  logger.error(err.stack || err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler, notFound, AppError };
