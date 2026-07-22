// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const formatResponse = (success, data = null, message = '') => ({
  success,
  data,
  message,
});

module.exports = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(formatResponse(false, null, 'No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach userId to request
    req.userEmail = decoded.email; // Optional
    next();
  } catch (err) {
    return res.status(401).json(formatResponse(false, null, 'Invalid or expired token'));
  }
};