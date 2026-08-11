// backend/controllers/applications.js
const Application = require('../models/Application');

const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message,
});

exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, source, search, sortBy, sortOrder, page, limit } = req.query;
    const filter = { userId: req.userId };

    if (status) {
      let statusArray;
      if (Array.isArray(status)) {
        statusArray = status;
      } else {
        statusArray = status.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
      }
    }

    if (source) {
      let sourceArray;
      if (Array.isArray(source)) {
        sourceArray = source;
      } else {
        sourceArray = source.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      if (sourceArray.length > 0) {
        filter.source = { $in: sourceArray };
      }
    }

    if (search) {
      const searchTrimmed = search.trim();
      if (searchTrimmed) {
        filter.$or = [
          { company: { $regex: searchTrimmed, $options: 'i' } },
          { position: { $regex: searchTrimmed, $options: 'i' } },
        ];
      }
    }

    const sort = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = order;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const requestedLimit = parseInt(limit, 10) || 10;
    const limitNum = Math.min(requestedLimit, 50);
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json(formatResponse(true, applications));
  } catch (err) {
    next(err);
  }
};

exports.getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, userId: req.userId });
    if (!application) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }
    res.status(200).json(formatResponse(true, application));
  } catch (err) {
    next(err);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.company || !data.position) {
      return res.status(400).json(
        formatResponse(false, null, 'Company and position are required')
      );
    }

    const newApp = new Application({
      ...data,
      userId: req.userId,
    });
    newApp.statusHistory = [{ status: newApp.status, changedAt: new Date() }];
    const saved = await newApp.save();
    res.status(201).json(formatResponse(true, saved));
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Extract all validation error messages into a single readable string
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(formatResponse(false, null, messages.join('; ')));
    }
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.statusHistory;

    const existing = await Application.findOne({ _id: id, userId: req.userId });
    if (!existing) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }

    const updateOperations = {};

    if (updateData.status && updateData.status !== existing.status) {
      updateOperations['$push'] = {
        statusHistory: { status: updateData.status, changedAt: new Date() },
      };
      updateOperations['$set'] = { status: updateData.status };
    } else {
      updateOperations['$set'] = {};
    }

    for (const key in updateData) {
      if (key !== 'status') {
        updateOperations['$set'][key] = updateData[key];
      }
    }

    if (Object.keys(updateOperations['$set']).length === 0 && !updateOperations['$push']) {
      return res.status(200).json(formatResponse(true, existing));
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      updateOperations,
      { new: true, runValidators: true }
    );

    res.status(200).json(formatResponse(true, updated));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(formatResponse(false, null, messages.join('; ')));
    }
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Application.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json(formatResponse(false, null, 'Application not found'));
    }
    res.status(200).json(formatResponse(true, null, 'Application deleted successfully'));
  } catch (err) {
    next(err);
  }
};

exports.createBulkApplications = async (req, res, next) => {
  try {
    const { applications } = req.body;
    if (!Array.isArray(applications)) {
      return res.status(400).json(formatResponse(false, null, 'Expected array of applications'));
    }

    const created = [];
    const errors = [];
    for (const data of applications) {
      if (!data.company || !data.position) {
        errors.push(`Missing company or position for application: ${JSON.stringify(data)}`);
        continue;
      }
      try {
        const newApp = new Application({
          ...data,
          userId: req.userId,
          statusHistory: [{ status: data.status || 'Sent', changedAt: new Date() }],
        });
        const saved = await newApp.save();
        created.push(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          errors.push(`Validation error: ${messages.join('; ')}`);
        } else {
          errors.push(err.message);
        }
      }
    }

    if (created.length === 0 && errors.length > 0) {
      return res.status(400).json(formatResponse(false, null, `Import failed: ${errors.join('; ')}`));
    }

    if (errors.length > 0) {
      // Partial success – return created items plus warning
      return res.status(207).json({
        success: true,
        data: created,
        message: `Imported ${created.length} applications. Errors: ${errors.join('; ')}`,
      });
    }

    res.status(201).json(formatResponse(true, created));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(formatResponse(false, null, messages.join('; ')));
    }
    next(err);
  }
};