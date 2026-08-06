const mongoose = require('mongoose');
const environment = require('../config/environment');
const logger = require('../config/logger');

/**
 * MongoDB Connection Handler (Chapter 4 Section 4.4)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(environment.mongoUri);
    logger.info(`[MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.warn(`[MongoDB Warning] Local DB connection unestablished (${error.message}). Running with in-memory fallback.`);
    return null;
  }
};

module.exports = connectDB;
