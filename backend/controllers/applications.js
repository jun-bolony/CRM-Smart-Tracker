const Application = require('../models/Application');

// Helper function for formatting the response
const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message
});

// Get all applications (with filtering and sorting – later, now a simple list)
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, applications));
  } catch (err) {
    next(err);
  }
};

// Get one application by ID
exports.getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }
    res.status(200).json(formatResponse(true, application));
  } catch (err) {
    next(err);
  }
};

// Create a new request
exports.createApplication = async (req, res, next) => {
  try {
    const data = req.body;

    // Basic validation of required fields (duplicate for reliability)
    if (!data.company || !data.position) {
      return res.status(400).json(
        formatResponse(false, null, 'Company and position are required')
      );
    }

    // If the status is not passed, the default from the scheme will be used
    const newApp = new Application(data);
    const saved = await newApp.save();
    res.status(201).json(formatResponse(true, saved));
  } catch (err) {
    // Handling Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(formatResponse(false, null, messages.join(', ')));
    }
    next(err);
  }
};

// Update the application (full or partial)
exports.updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Search and update, return the updated document
    const updated = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // return new, start validation
    );

    if (!updated) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }
    res.status(200).json(formatResponse(true, updated));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(formatResponse(false, null, messages.join(', ')));
    }
    next(err);
  }
};

// Delete the application
exports.deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }
    res.status(200).json(formatResponse(true, null, 'Application deleted successfully'));
  } catch (err) {
    next(err);
  }
};