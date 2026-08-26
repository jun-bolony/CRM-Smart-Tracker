// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, deleteAccount } = require('../controllers/auth');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Protected route – delete account
router.delete('/account', auth, asyncHandler(deleteAccount));

module.exports = router;