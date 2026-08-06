const express = require('express');
const cors = require('cors');
const path = require('path');

const corsOptions = require('./config/cors');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const uploadRoutes = require('./routes/uploadRoutes');
const studioRoutes = require('./routes/studioRoutes');
const captionRoutes = require('./routes/captionRoutes');
const creatorRoutes = require('./routes/creatorRoutes');

const app = express();

// Global Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Static Asset Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI Creator Dashboard API Server',
    version: '2.0.0',
    architecture: 'Layered SaaS Architecture (Winston + Zod + Express + MongoDB)',
    timestamp: new Date().toISOString()
  });
});

// Versioned API v1 Routes (Section 4.12)
app.use('/api/v1/text-studio', studioRoutes);
app.use('/api/v1/caption-studio', captionRoutes);
app.use('/api/v1/creator-intelligence', creatorRoutes);

// Backwards Compatible Aliases
app.use('/api/upload', uploadRoutes);
app.use('/api', studioRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api', creatorRoutes);

// 404 Route Not Found Middleware
app.use(notFound);

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
