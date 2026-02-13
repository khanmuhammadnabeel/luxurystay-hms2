/**
 * Error Handler Middleware
 * Centralized error handling for all routes and errors
 */

const { logger, logError, isDev } = require('../utils/logger');

// ============================================================================
// ERROR MAPPING
// ============================================================================

/**
 * Map MongoDB errors to appropriate HTTP status codes and messages
 */
function handleMongoError(err) {
  // Duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return {
      statusCode: 400,
      message: `${field} already exists. Please use a unique value.`,
      isOperational: true
    };
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return {
      statusCode: 400,
      message: 'Validation error',
      errors: messages,
      isOperational: true
    };
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      isOperational: true
    };
  }

  return null;
}

/**
 * Map Express-validator errors to response format
 */
function handleValidationErrors(errors) {
  const messages = errors.map(err => ({
    field: err.param || err.path,
    message: err.msg || 'Invalid input'
  }));

  return {
    statusCode: 400,
    message: 'Validation error',
    errors: messages,
    isOperational: true
  };
}

/**
 * Get status code from error
 */
function getStatusCode(err) {
  // If already set, use it
  if (err.statusCode && typeof err.statusCode === 'number') {
    return err.statusCode;
  }

  // Map common error names
  switch (err.name) {
    case 'UnauthorizedError':
    case 'AuthenticationError':
      return 401;
    case 'ForbiddenError':
      return 403;
    case 'NotFoundError':
      return 404;
    case 'ValidationError':
      return 400;
    case 'ConflictError':
      return 409;
    case 'RateLimitError':
      return 429;
    default:
      return err.statusCode || 500;
  }
}

/**
 * Get error message
 */
function getErrorMessage(err) {
  if (err.message) return err.message;
  return 'An unexpected error occurred';
}

// ============================================================================
// MAIN ERROR HANDLER MIDDLEWARE
// ============================================================================

/**
 * Centralized error handling middleware
 * Should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Ensure proper structure
  if (!err) {
    return next();
  }

  // Initialize response object
  let response = {
    success: false,
    message: getErrorMessage(err),
    statusCode: getStatusCode(err)
  };

  // Handle MongoDB errors
  const mongoError = handleMongoError(err);
  if (mongoError) {
    response = { success: false, ...mongoError };
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    if (validationErrors.length > 0) {
      const validation = handleValidationErrors(validationErrors);
      response = { success: false, ...validation };
    }
  }

  // Determine if operational or programming error
  const isOperational = response.isOperational || err.isOperational || response.statusCode < 500;

  // Log error
  logError(err, req, {
    isOperational,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });

  // In development, include stack trace
  if (isDev && !isOperational) {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code
    };
  }

  // Remove internal fields
  delete response.isOperational;

  // Send response
  return res.status(response.statusCode || 500).json(response);
};

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

/**
 * Handle 404 - Not Found
 * Should be placed after all route definitions
 */
const notFoundHandler = (req, res) => {
  const message = `Cannot find ${req.method} ${req.originalUrl}`;
  logger.warn(message, {
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    success: false,
    message,
    statusCode: 404
  });
};

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

/**
 * Wrap async route handlers to catch errors
 * Usage: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Operational Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message = 'Validation error', errors = []) {
    super(message, 400, true);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (duplicate, etc.)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  getStatusCode,
  getErrorMessage,
  handleMongoError,
  handleValidationErrors
};
