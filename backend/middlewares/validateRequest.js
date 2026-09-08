const { sendError } = require('../utils/responseHandler');

/**
 * Zod Request Validation Middleware (Chapter 4 Section 4.9)
 * Validates req.body, req.query, or req.params against Zod schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          code: 'INVALID_INPUT',
          description: e.message,
          severity: 'LOW'
        }));
        return sendError(res, 'Validation failed', formattedErrors, 400);
      }
      return sendError(res, 'Invalid request payload', err.message, 400);
    }
  };
};

module.exports = validateRequest;
