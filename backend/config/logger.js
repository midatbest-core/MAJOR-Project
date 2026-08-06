const winston = require('winston');
const path = require('path');
const fs = require('fs');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Winston Structured Logger (Chapter 4 Section 4.4 & 4.8)
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-creator-dashboard-backend' },
  transports: [
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'combined.log')
    })
  ]
});

// If not in production, log to console with human-readable colorized format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      )
    })
  );
}

module.exports = logger;
