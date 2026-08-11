// backend/controllers/applications.js
const Application = require('../models/Application');

const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message,
});

// Maximum number of applications per user
const MAX_APPLICATIONS_PER_USER = 1000;
// Batch size for bulk import
const BULK_BATCH_SIZE = 50;

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

// ========== UPDATED bulk import with safety measures ==========
exports.createBulkApplications = async (req, res, next) => {
  try {
    const { applications } = req.body;
    if (!Array.isArray(applications)) {
      return res.status(400).json(formatResponse(false, null, 'Expected array of applications'));
    }

    // 1. Enforce per-user application limit (max 1000)
    const currentCount = await Application.countDocuments({ userId: req.userId });
    if (currentCount >= MAX_APPLICATIONS_PER_USER) {
      return res.status(400).json(
        formatResponse(false, null, `Maximum number of applications (${MAX_APPLICATIONS_PER_USER}) reached. Cannot import more.`)
      );
    }

    // 2. Limit the total number of applications that can be imported in one request
    //    (additional safety, though the 1MB payload limit already restricts it)
    const MAX_IMPORT_BATCH = 500; // safe upper bound
    if (applications.length > MAX_IMPORT_BATCH) {
      return res.status(400).json(
        formatResponse(false, null, `Too many applications in one request. Maximum allowed: ${MAX_IMPORT_BATCH}`)
      );
    }

    // 3. Process in batches to avoid overloading MongoDB
    const created = [];
    const errors = [];
    const batchSize = BULK_BATCH_SIZE;

    // Helper to process a single application
    const processOne = async (data) => {
      if (!data.company || !data.position) {
        errors.push(`Missing company or position for application: ${JSON.stringify(data)}`);
        return null;
      }

      try {
        // Check if application already exists (by _id or company+position)
        let existing = null;
        if (data._id) {
          existing = await Application.findOne({ _id: data._id, userId: req.userId });
        }
        if (!existing) {
          existing = await Application.findOne({
            userId: req.userId,
            company: data.company,
            position: data.position,
          });
        }

        if (existing) {
          // Update existing application (preserve statusHistory)
          delete data.statusHistory;
          delete data._id;
          const updated = await Application.findOneAndUpdate(
            { _id: existing._id, userId: req.userId },
            { $set: data },
            { new: true, runValidators: true }
          );
          return updated;
        } else {
          // Create new application
          const newApp = new Application({
            ...data,
            userId: req.userId,
            statusHistory: [{ status: data.status || 'Sent', changedAt: new Date() }],
          });
          const saved = await newApp.save();
          return saved;
        }
      } catch (err) {
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          errors.push(`Validation error for ${data.company}: ${messages.join('; ')}`);
        } else {
          errors.push(err.message);
        }
        return null;
      }
    };

    // Process in batches
    for (let i = 0; i < applications.length; i += batchSize) {
      const batch = applications.slice(i, i + batchSize);
      // Process each item in the batch sequentially to avoid too many parallel operations
      // but we can use Promise.all for parallel within batch to speed up.
      // However, to be gentle on the free tier, we process sequentially with a small delay.
      // We'll use a for...of loop with await for each item.
      for (const data of batch) {
        const result = await processOne(data);
        if (result) {
          created.push(result);
        }
      }
      // Small pause between batches to reduce load
      if (i + batchSize < applications.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Prepare response
    if (created.length === 0 && errors.length > 0) {
      return res.status(400).json(formatResponse(false, null, `Import failed: ${errors.join('; ')}`));
    }

    if (errors.length > 0) {
      // Partial success
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
// ============================================================