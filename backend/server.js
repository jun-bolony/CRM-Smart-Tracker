// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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