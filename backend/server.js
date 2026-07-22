// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // terminate the process so that Render restarts
  });

app.get('/', (req, res) => {
  res.send('CRM Smart Tracker API is running 🚀');
});

const applicationsRouter = require('./routes/applications');
app.use('/api/applications', applicationsRouter);

// ---- Stats route (added for analytics) ----
const statsRouter = require('./routes/stats');
app.use('/api/stats', statsRouter);

// ---- Global error handler (must be after all routes) ----
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});