const { errorResponse } = require('../utils/response');

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR DETAILS:', {
      name: err.name,
      message: err.message,
      code: err.code,
    });
    console.trace(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Data dengan ID '${err.value}' tidak ditemukan.`;
    return errorResponse(res, 404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' sudah digunakan. Gunakan nilai yang berbeda.`;
    return errorResponse(res, 400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 400, 'Data tidak valid.', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Token tidak valid.');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token telah kadaluarsa.');
  }

  // Default error
  return errorResponse(res, error.statusCode || 500, error.message || 'Terjadi kesalahan server.');
};

/**
 * Not Found Handler
 */
const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Route '${req.originalUrl}' tidak ditemukan.`);
};

module.exports = { errorHandler, notFound };
