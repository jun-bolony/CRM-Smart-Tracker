// backend/models/Application.js
const mongoose = require('mongoose');

const applicationStatuses = [
  'Sent',
  'Viewed',
  'Interview',
  'Test',
  'Offer',
  'Rejected',
  'Archived'
];

const contactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true }
}, { _id: false });

const statusHistoryItemSchema = new mongoose.Schema({
  status: { type: String, enum: applicationStatuses, required: true },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  url: { type: String, trim: true },
  contact: contactSchema,
  salaryMin: { type: Number, min: 0 },
  salaryMax: { type: Number, min: 0 },
  source: { type: String, trim: true },
  status: {
    type: String,
    enum: applicationStatuses,
    required: true,
    default: 'Sent'
  },
  appliedDate: { type: Date, required: true, default: Date.now },
  nextEventDate: { type: Date },
  notes: {
    type: [String],
    default: [],
    validate: {
      validator: function(notes) {
        // Maximum 50 notes and each note at most 1000 characters
        if (notes.length > 50) return false;
        for (const note of notes) {
          if (note.length > 1000) return false;
        }
        return true;
      },
      message: 'Notes must not exceed 50 items and each note must be at most 1000 characters long.'
    }
  },
  statusHistory: { type: [statusHistoryItemSchema], default: [] }
}, {
  timestamps: true
});

// Indexes for fast searching
applicationSchema.index({ company: 'text', position: 'text' });

// -------- Additional indexes for performance --------
// Compound index for filtering by user and status (frequent query)
applicationSchema.index({ userId: 1, status: 1 });

// Index for sorting by appliedDate (common)
applicationSchema.index({ userId: 1, appliedDate: -1 });
// ----------------------------------------------------

module.exports = mongoose.model('Application', applicationSchema);