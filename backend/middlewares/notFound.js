const { sendError } = require('../utils/responseHandler');

/**
 * 404 Route Not Found Middleware (Chapter 4 Section 4.10)
 */
const notFound = (req, res, next) => {
  return sendError(
    res,
    `Resource not found: ${req.method} ${req.originalUrl}`,
    [{ field: 'url', code: 'NOT_FOUND', description: 'Endpoint does not exist', severity: 'LOW' }],
    404
  );
};

module.exports = notFound;
