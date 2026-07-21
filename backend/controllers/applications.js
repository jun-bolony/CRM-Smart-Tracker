const Application = require('../models/Application');

// Helper function for formatting the response
const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message
});

// Get all applications with filtering, sorting, search and pagination
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, source, search, sortBy, sortOrder, page, limit } = req.query;
    const filter = {};

    // Log incoming query parameters for debugging
    console.log('[getAllApplications] Query params:', { status, source, search, sortBy, sortOrder, page, limit });

    // Status filter
    if (status) {
      let statusArray;
      if (Array.isArray(status)) {
        statusArray = status;
      } else {
        // Split by comma and trim each value
        statusArray = status.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
        console.log('[getAllApplications] Status filter:', statusArray);
      }
    }

    // Source filter (exact match, case-insensitive optional)
    if (source) {
      // Trim and allow case-insensitive if you prefer, but exact match is fine
      const sourceTrimmed = source.trim();
      if (sourceTrimmed) {
        filter.source = sourceTrimmed;
        console.log('[getAllApplications] Source filter:', sourceTrimmed);
      }
    }

    // Search filter (case-insensitive regex on company or position)
    if (search) {
      const searchTrimmed = search.trim();
      if (searchTrimmed) {
        filter.$or = [
          { company: { $regex: searchTrimmed, $options: 'i' } },
          { position: { $regex: searchTrimmed, $options: 'i' } }
        ];
        console.log('[getAllApplications] Search filter:', searchTrimmed);
      }
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = order;
    } else {
      sort.createdAt = -1; // default sort by newest
    }
    console.log('[getAllApplications] Sort:', sort);

    // Pagination (optional, keep default values)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    console.log('[getAllApplications] Final filter:', JSON.stringify(filter));

    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    console.log(`[getAllApplications] Found ${applications.length} applications`);

    res.status(200).json(formatResponse(true, applications));
  } catch (err) {
    console.error('[getAllApplications] Error:', err);
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