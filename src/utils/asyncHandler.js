/**
 * asyncHandler for Express 5
 * Express 5 handles async middleware errors automatically.
 * This is now mostly a pass-through for easier migration.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return fn(req, res, next);
};

module.exports = asyncHandler;
