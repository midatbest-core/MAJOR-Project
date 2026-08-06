const express = require('express');
const router = express.Router();
const {
  uploadMedia,
  transcribeMedia,
  analyzeText,
  generateTitlesController,
  generateDescriptionController,
  generateHashtagsController
} = require('../controllers/studioController');

router.post('/upload', uploadMedia);
router.post('/transcribe', transcribeMedia);
router.post('/analyze', analyzeText);
router.post('/generate-title', generateTitlesController);
router.post('/generate-description', generateDescriptionController);
router.post('/generate-hashtags', generateHashtagsController);

module.exports = router;
