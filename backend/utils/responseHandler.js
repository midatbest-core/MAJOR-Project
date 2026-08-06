/**
 * Global Response Standard Handler (Chapter 3 Section 3.3)
 */

const sendSuccess = (res, data = {}, message = 'Operation completed successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
    errors: null
  });
};

const sendError = (res, message = 'An error occurred', errors = null, statusCode = 400) => {
  const formattedErrors = Array.isArray(errors)
    ? errors.map(err => ({
        field: err.field || 'general',
        code: err.code || 'ERROR',
        description: err.description || err.message || String(err),
        severity: err.severity || 'MEDIUM'
      }))
    : errors
    ? [{ field: 'general', code: 'ERROR', description: String(errors), severity: 'MEDIUM' }]
    : null;

  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    data: null,
    errors: formattedErrors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
