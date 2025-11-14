/**
 * Utility wrapper for async controller functions.
 * Catches errors and passes them to the Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;