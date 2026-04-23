/**
 * Success response helper
 */
const successResponse = (res, statusCode, message, data = null, pagination = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;

  return res.status(statusCode).json(response);
};

/**
 * Error response helper
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 */
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / perPage);

  return {
    total,
    page: currentPage,
    limit: perPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

module.exports = { successResponse, errorResponse, getPagination };
