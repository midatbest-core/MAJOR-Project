const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadMedia } = require('../controllers/studioController');

router.post('/', upload.single('file'), uploadMedia);

module.exports = router;
