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
  userId: { type: String, index: true }, // reserved for authentication
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
  notes: { type: [String], default: [] },
  statusHistory: { type: [statusHistoryItemSchema], default: [] }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Indexes for fast searching
applicationSchema.index({ company: 'text', position: 'text' });

module.exports = mongoose.model('Application', applicationSchema);