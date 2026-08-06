const express = require('express');
const router = express.Router();
const { analyzeYouTubeVideo, generateInspiration } = require('../controllers/creatorController');

// Standard API v1 & Legacy routes
router.post('/analyze', analyzeYouTubeVideo);
router.post('/inspire', generateInspiration);
router.post('/youtube/analyze', analyzeYouTubeVideo);
router.post('/creator/inspire', generateInspiration);

module.exports = router;
