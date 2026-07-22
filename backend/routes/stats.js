// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/stats');

router.get('/', getStats);

module.exports = router;