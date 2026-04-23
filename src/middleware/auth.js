const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes - verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Akses ditolak. Token tidak ditemukan.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return errorResponse(res, 401, 'Token tidak valid. Pengguna tidak ditemukan.');
  }

  if (!user.isActive) {
    return errorResponse(res, 401, 'Akun Anda telah dinonaktifkan.');
  }

  req.user = user;
  next();
});

/**
 * Authorize roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' tidak memiliki akses ke resource ini.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
