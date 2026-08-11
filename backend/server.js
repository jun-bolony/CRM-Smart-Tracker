// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CORS and Body Parser ----------
app.use(cors());
// Global limit: 10KB for all JSON requests
app.use(express.json({ limit: '10kb' }));

// Special middleware for import endpoint with larger limit (1MB)
app.use('/api/applications/import', express.json({ limit: '1mb' }));
// -------------------------------------------

// ---------- Rate Limiting ----------
// General API limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific route groups
app.use('/api/auth', authLimiter);
app.use('/api/applications', apiLimiter);
app.use('/api/stats', apiLimiter);
// ------------------------------------

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('CRM Smart Tracker API is running 🚀');
});

// Auth routes (public)
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Protected routes
const authMiddleware = require('./middleware/auth');
const applicationsRouter = require('./routes/applications');
const statsRouter = require('./routes/stats');

app.use('/api/applications', authMiddleware, applicationsRouter);
app.use('/api/stats', authMiddleware, statsRouter);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});