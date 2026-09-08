const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadMedia,
  transcribeMedia,
  analyzeText,
  downloadTranscript,
  generateScriptImprovementsController,
  generateTitlesController,
  generateDescriptionController,
  generateHashtagsController
} = require('../controllers/studioController');

router.post('/upload', upload.single('file'), uploadMedia);
router.post('/transcribe', transcribeMedia);
router.post('/analyze', analyzeText);
router.get('/download/:projectId/:format', downloadTranscript);
router.post('/improve-script', generateScriptImprovementsController);
router.post('/generate-title', generateTitlesController);
router.post('/generate-description', generateDescriptionController);
router.post('/generate-hashtags', generateHashtagsController);

module.exports = router;
