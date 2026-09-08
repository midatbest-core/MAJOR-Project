const path = require('path');
const environment = require('./config/environment');
const logger = require('./config/logger');
const connectDB = require('./database/connection');
const { cleanupDirectory } = require('./services/storageCleanup');
const app = require('./app');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`[Uncaught Exception] ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error(`[Unhandled Rejection] Reason: ${reason}`);
});

// Connect Database
connectDB();

// Periodic Storage Cleanup
setInterval(() => {
  cleanupDirectory(path.join(__dirname, 'uploads'), 86400000);
  cleanupDirectory(path.join(__dirname, 'temp'), 86400000);
}, 3600000);

// Start Server
const server = app.listen(environment.port, () => {
  logger.info(`===================================================`);
  logger.info(`🚀 AI Creator Dashboard Backend running on port ${environment.port}`);
  logger.info(`📡 Health Check: http://localhost:${environment.port}/api/health`);
  logger.info(`===================================================`);
});

module.exports = server;
