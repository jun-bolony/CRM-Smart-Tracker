// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const { getStats, getSources } = require('../controllers/stats');

router.get('/', getStats);
router.get('/sources', getSources);

module.exports = router;