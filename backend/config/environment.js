const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Environment Configuration Manager (Chapter 4 Section 4.4 & 4.7)
 */
const environment = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_creator_dashboard',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  pythonPath: process.env.PYTHON_PATH || 'python',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

module.exports = environment;
