const express = require('express');
const router = express.Router();
const { renderCaptions } = require('../controllers/captionController');

router.post('/render', renderCaptions);

module.exports = router;
