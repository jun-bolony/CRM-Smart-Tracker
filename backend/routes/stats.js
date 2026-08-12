// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const { getStats, getSources } = require('../controllers/stats');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(getStats));
router.get('/sources', asyncHandler(getSources));

module.exports = router;