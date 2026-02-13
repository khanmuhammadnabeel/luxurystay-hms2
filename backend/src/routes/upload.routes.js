const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, param, query, validationResult } = require('express-validator');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');
const { config: uploadConfig } = require('../config/uploadConfig');

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: uploadConfig.limits.maxFileSize,
    files: uploadConfig.limits.maxFilesPerUpload
  },
    fileFilter: (req, file, cb) => {
    // Validate file type
    const validation = {
      valid: true,
      error: null
    };
    
    // Manual validation since uploadConfig.validateFile might not be available
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', 
      '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.zip'];
    
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(file.mimetype)) {
      validation.valid = false;
      validation.error = 'File type not allowed';
    } else if (!allowedExtensions.includes(ext)) {
      validation.valid = false;
      validation.error = 'File extension not allowed';
    } else if (file.size > (10 * 1024 * 1024)) {
      validation.valid = false;
      validation.error = 'File size exceeds 10MB limit';
    }

    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error), false);
    }
  }
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Handle validation errors from express-validator
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

// ============================================================================
// PUBLIC ROUTES (NO AUTHENTICATION)
// ============================================================================

/**
 * @route   GET /api/upload/public/:filename
 * @desc    Get public file (no authentication required)
 * @access  Public
 * @param   {string} filename - File name/identifier
 * @returns {Buffer} File stream with appropriate Content-Type
 */
router.get(
  '/public/:filename',
  [
    param('filename')
      .notEmpty()
      .withMessage('Filename is required')
      .isString()
      .trim()
      .withMessage('Filename must be a string')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Filename contains invalid characters')
  ],
  handleValidation,
  uploadController.getPublicFile
);

// ============================================================================
// PRIVATE ROUTES (AUTHENTICATION REQUIRED)
// ============================================================================

/**
 * @route   POST /api/upload
 * @desc    Upload single file with metadata
 * @access  Private (authenticated users)
 * @body    {File} file - File to upload
 * @body    {boolean} isPublic - Is file public (default: false)
 * @body    {string} referenceId - Referenced document ID (optional)
 * @body    {string} referenceModel - Referenced model name (optional)
 * @body    {string} tags - JSON array of tags (optional)
 * @returns {object} { success, data: fileDocument }
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  [
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('referenceId')
      .optional()
      .isMongoId()
      .withMessage('Invalid reference ID'),
    body('referenceModel')
      .optional()
      .isIn(['Booking', 'Room', 'User', 'Complaint', 'Invoice', 'EmailLog', 'MaintenanceRequest'])
      .withMessage('Invalid reference model'),
    body('tags')
      .optional()
      .isString()
      .withMessage('Tags must be a JSON string')
  ],
  handleValidation,
  uploadController.uploadSingle
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files (max 10) with shared metadata
 * @access  Private (authenticated users)
 * @body    {File[]} files - Files to upload (max 10)
 * @body    {boolean} isPublic - Is files public (default: false)
 * @body    {string} referenceId - Referenced document ID (optional)
 * @body    {string} referenceModel - Referenced model name (optional)
 * @body    {string} tags - JSON array of tags (optional)
 * @returns {object} { success, data: { uploaded: [], failed: [] } }
 */
router.post(
  '/multiple',
  authenticate,
  upload.array('files', uploadConfig.limits.maxFilesPerUpload),
  [
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('referenceId')
      .optional()
      .isMongoId()
      .withMessage('Invalid reference ID'),
    body('referenceModel')
      .optional()
      .isIn(['Booking', 'Room', 'User', 'Complaint', 'Invoice', 'EmailLog', 'MaintenanceRequest'])
      .withMessage('Invalid reference model'),
    body('tags')
      .optional()
      .isString()
      .withMessage('Tags must be a JSON string')
  ],
  handleValidation,
  uploadController.uploadMultiple
);

/**
 * @route   GET /api/upload/:id
 * @desc    Get file metadata by ID
 * @access  Private (file owner or admin)
 * @param   {string} id - File ID (MongoDB ObjectId)
 * @returns {object} { success, data: fileDocument }
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID format')
  ],
  handleValidation,
  uploadController.getFile
);

/**
 * @route   GET /api/upload/:id/download
 * @desc    Download file with streaming
 * @access  Private (file owner or admin)
 * @param   {string} id - File ID (MongoDB ObjectId)
 * @returns {Buffer} File stream with Content-Disposition: attachment
 */
router.get(
  '/:id/download',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID format')
  ],
  handleValidation,
  uploadController.downloadFile
);

/**
 * @route   DELETE /api/upload/:id
 * @desc    Delete file (soft or permanent)
 * @access  Private (file owner or admin)
 * @param   {string} id - File ID (MongoDB ObjectId)
 * @query   {boolean} permanent - Permanently delete (default: false)
 * @returns {object} { success, message: 'File deleted' }
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID format'),
    query('permanent')
      .optional()
      .isBoolean()
      .withMessage('Permanent must be a boolean')
  ],
  handleValidation,
  uploadController.deleteFile
);

/**
 * @route   GET /api/upload/user/:userId
 * @desc    Get all files for a user with pagination
 * @access  Private (user owner or admin)
 * @param   {string} userId - User ID (MongoDB ObjectId)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20, max: 100)
 * @query   {string} mimeType - Filter by MIME type (optional)
 * @query   {string} referenceModel - Filter by reference model (optional)
 * @returns {object} { success, data: { files, pagination, storage } }
 */
router.get(
  '/user/:userId',
  authenticate,
  [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('mimeType')
      .optional()
      .isString()
      .trim(),
    query('referenceModel')
      .optional()
      .isIn(['Booking', 'Room', 'User', 'Complaint', 'Invoice', 'EmailLog', 'MaintenanceRequest'])
      .withMessage('Invalid reference model')
  ],
  handleValidation,
  uploadController.getUserFiles
);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Multer error handler
 * Catches file upload errors (size limit, file count, format, etc.)
 */
router.use((err, req, res, next) => {
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', {
      code: err.code,
      message: err.message,
      field: err.field
    });

    let message = 'File upload error';
    let statusCode = 400;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size exceeds maximum of ${uploadConfig.getMaxFileSizeFormatted()}`;
        statusCode = 413;
        break;
      case 'LIMIT_FILE_COUNT':
        message = `Maximum ${uploadConfig.limits.maxFilesPerUpload} files per upload`;
        statusCode = 400;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        statusCode = 400;
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in request';
        statusCode = 400;
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        statusCode = 400;
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        statusCode = 400;
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        statusCode = 400;
        break;
      default:
        message = err.message;
        statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  // Handle fileFilter validation errors
  if (err && err.message && (
    err.message.includes('validation') || 
    err.message.includes('not allowed') ||
    err.message.includes('invalid') ||
    err.message.includes('extension')
  )) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Pass other errors to next handler
  next(err); // ✅ FIXED: Changed from 'next(error)' to 'next(err)'
});

// ============================================================================
// 404 HANDLER - UNMATCHED ROUTES
// ============================================================================

/**
 * Catch-all for unmatched upload routes
 * Returns 404 instead of falling through to app's 404
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Upload endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;