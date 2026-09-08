const logger = require('../config/logger');
const environment = require('../config/environment');
const { sendError } = require('../utils/responseHandler');

/**
 * Centralized Global Error Handler Middleware (Chapter 4 Section 4.10)
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_FAILURE';
  const field = err.field || 'general';

  // Log error using Winston logger
  logger.error({
    requestId: req.requestId || 'unknown',
    message,
    statusCode,
    errorCode,
    stack: environment.isDevelopment ? err.stack : undefined
  });

  const errorDetail = {
    field,
    code: errorCode,
    description: environment.isProduction && statusCode === 500 ? 'An unexpected error occurred' : message,
    severity: statusCode >= 500 ? 'HIGH' : 'MEDIUM'
  };

  return sendError(res, message, [errorDetail], statusCode);
};

module.exports = errorHandler;
