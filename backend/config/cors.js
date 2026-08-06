const environment = require('./environment');

/**
 * CORS Configuration (Chapter 4 Section 4.4)
 */
const corsOptions = {
  origin: environment.isProduction ? false : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
