// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  createBulkApplications
} = require('../controllers/applications');
const asyncHandler = require('../utils/asyncHandler');

// Middleware for checking the validity of ObjectId (can be moved to a separate middleware)
const { isValidObjectId } = require('mongoose');

const validateId = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

// CRUD routes
router.get('/', asyncHandler(getAllApplications));
router.post('/', asyncHandler(createApplication));
router.get('/:id', validateId, asyncHandler(getApplicationById));
router.put('/:id', validateId, asyncHandler(updateApplication));
router.delete('/:id', validateId, asyncHandler(deleteApplication));

// Bulk create
router.post('/bulk', asyncHandler(createBulkApplications));

module.exports = router;