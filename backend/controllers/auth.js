// backend/controllers/auth.js
const User = require('../models/User');
const Application = require('../models/Application');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message,
});

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(formatResponse(false, null, 'Email and password are required'));
    }

    if (password.length < 6) {
      return res.status(400).json(formatResponse(false, null, 'Password must be at least 6 characters'));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json(formatResponse(false, null, 'Email is already registered'));
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json(formatResponse(true, {
      token,
      email: newUser.email,
    }));
  } catch (err) {
    next(err);
  }
};

// Login existing user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(formatResponse(false, null, 'Email and password are required'));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json(formatResponse(false, null, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(false, null, 'Invalid email or password'));
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json(formatResponse(true, {
      token,
      email: user.email,
    }));
  } catch (err) {
    next(err);
  }
};

// Delete user account and all associated data
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Delete all applications of the user
    await Application.deleteMany({ userId });

    // Delete the user itself
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    res.status(200).json(formatResponse(true, null, 'Account deleted successfully'));
  } catch (err) {
    next(err);
  }
};