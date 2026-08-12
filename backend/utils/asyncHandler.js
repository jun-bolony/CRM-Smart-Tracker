// backend/utils/asyncHandler.js
/**
 * Wraps an async route handler to catch any errors and pass them to Express error middleware.
 * @param {Function} fn - Async function (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;