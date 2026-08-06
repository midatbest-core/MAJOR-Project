const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Structured Request Logger Middleware (Chapter 4 Section 4.8)
 * Generates Request ID and logs method, path, status, and duration
 */
const requestLogger = (req, res, next) => {
  req.requestId = `req_${crypto.randomBytes(6).toString('hex')}`;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId: req.requestId,
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userAgent: req.get('user-agent') || 'unknown'
    });
  });

  next();
};

module.exports = requestLogger;
