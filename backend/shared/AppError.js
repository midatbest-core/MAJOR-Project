/**
 * AppError Custom Operational Error Class (Chapter 4 Section 4.10)
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', field = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.field = field;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
