const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const uploadRoutes = require('./routes/uploadRoutes');
const studioRoutes = require('./routes/studioRoutes');
const captionRoutes = require('./routes/captionRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const { cleanupDirectory } = require('./services/storageCleanup');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (with fallback)
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads for preview if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI Creator Dashboard API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api', studioRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api', creatorRoutes);

// Automatic hourly cleanup task for temporary upload files
setInterval(() => {
  cleanupDirectory(path.join(__dirname, 'uploads'), 3600000);
  cleanupDirectory(path.join(__dirname, 'temp'), 3600000);
}, 1800000); // Check every 30 mins

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 AI Creator Dashboard Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});
