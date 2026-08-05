const express = require('express');
const router = express.Router();
const { analyzeYouTubeVideo, generateInspiration } = require('../controllers/creatorController');

router.post('/youtube/analyze', analyzeYouTubeVideo);
router.post('/creator/inspire', generateInspiration);

module.exports = router;
