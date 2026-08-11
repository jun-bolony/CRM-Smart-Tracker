// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  createBulkApplications   // NEW
} = require('../controllers/applications');

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
router.get('/', getAllApplications);
router.post('/', createApplication);
router.get('/:id', validateId, getApplicationById);
router.put('/:id', validateId, updateApplication);
router.delete('/:id', validateId, deleteApplication);

// NEW: Bulk create
router.post('/bulk', createBulkApplications);

module.exports = router;