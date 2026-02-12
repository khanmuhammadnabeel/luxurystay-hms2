const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const emailController = require('../controllers/emailController');
const { authenticate, authorize } = require('../middleware/auth');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Handle validation errors
 * Special handling for public tracking endpoints - always return GIF/redirect
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Special case: tracking open endpoint ALWAYS returns GIF
    if (req.path.includes('/track/open')) {
      if (errors.array().length > 0) {
        console.warn('Email tracking open validation failed:', {
          id: req.params.id,
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      }
      res.set('Content-Type', 'image/gif');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Expires', '0');
      return res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    }
    // Special case: tracking click endpoint ALWAYS attempts redirect
    if (req.path.includes('/track/click')) {
      if (errors.array().length > 0) {
        console.warn('Email tracking click validation failed:', {
          id: req.params.id,
          url: req.query.url,
          errors: errors.array(),
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      }
      const url = req.query.url || 'https://luxurystay.com';
      return res.redirect(302, url);
    }
    // Standard error response for protected endpoints
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

// ============================================================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// ============================================================================

/**
 * @route   GET /api/email/track/open/:id
 * @desc    Track email open event (tracking pixel)
 * @access  Public
 * @param   {string} id - Email log ID (optional)
 * @returns {Buffer} 1x1 transparent GIF image
 */
router.get(
  '/track/open/:id',
  [
    param('id')
      .optional()
      .isMongoId()
      .withMessage('Invalid email log ID format')
  ],
  handleValidation,
  emailController.trackOpen
);

/**
 * @route   GET /api/email/track/click/:id
 * @desc    Track email click event and redirect
 * @access  Public
 * @param   {string} id - Email log ID (optional)
 * @query   {string} url - Redirect destination URL (required)
 * @returns {object} 302 redirect to destination URL
 */
router.get(
  '/track/click/:id',
  [
    param('id')
      .optional()
      .isMongoId()
      .withMessage('Invalid email log ID format'),
    query('url')
      .notEmpty()
      .withMessage('Redirect URL is required')
      .isURL()
      .withMessage('Valid URL is required')
  ],
  handleValidation,
  emailController.trackClick
);

// ============================================================================
// PRIVATE ROUTES (AUTHENTICATION REQUIRED)
// ============================================================================

/**
 * @route   POST /api/email/send
 * @desc    Send transactional email
 * @access  Private (authenticated user)
 * @body    {string} templateName - Name of email template
 * @body    {string} recipient - Recipient email address
 * @body    {string} priority - Email priority (low|normal|high|urgent)
 * @body    {object} data - Template data variables
 * @body    {object} metadata - Additional metadata
 * @returns {object} { success, data: { queued, emailLogId } }
 */
router.post(
  '/send',
  authenticate,
  [
    body('templateName')
      .notEmpty()
      .withMessage('Template name is required')
      .isString(),
    body('recipient')
      .notEmpty()
      .withMessage('Recipient email is required')
      .isEmail()
      .withMessage('Valid email address is required'),
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object')
  ],
  handleValidation,
  emailController.sendTransactionalEmail
);

/**
 * @route   GET /api/email/preview/:templateName
 * @desc    Preview email template with sample data
 * @access  Private (admin, manager, receptionist)
 * @param   {string} templateName - Name of email template
 * @query   {string} data - Optional custom template data (JSON)
 * @returns {object} { html, text, subject, variables }
 */
router.get(
  '/preview/:templateName',
  authenticate,
  authorize('admin', 'manager', 'receptionist'),
  [
    param('templateName')
      .notEmpty()
      .withMessage('Template name is required')
      .isString()
      .trim(),
    query('data')
      .optional()
      .custom((value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Data must be valid JSON');
        }
      })
  ],
  handleValidation,
  emailController.previewTemplate
);

// ============================================================================
// ADMIN ROUTES (AUTHENTICATION + AUTHORIZATION REQUIRED)
// ============================================================================

/**
 * @route   POST /api/email/bulk
 * @desc    Send bulk email to multiple recipients
 * @access  Private (admin, manager only)
 * @body    {string} templateName - Name of email template
 * @body    {array} recipients - Array of recipient email addresses
 * @body    {object} data - Template data variables
 * @body    {string} scheduleDate - Optional scheduled send date (ISO8601)
 * @returns {object} { success, data: { queued, batchId, recipientCount } }
 */
router.post(
  '/bulk',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('templateName')
      .notEmpty()
      .withMessage('Template name is required')
      .isString(),
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('Recipients must be a non-empty array'),
    body('recipients.*')
      .isEmail()
      .withMessage('All recipients must be valid email addresses'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
    body('scheduleDate')
      .optional()
      .isISO8601()
      .withMessage('Schedule date must be in ISO8601 format')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Schedule date cannot be in the past');
        }
        return true;
      })
  ],
  handleValidation,
  emailController.sendBulkEmail
);

/**
 * @route   GET /api/email/logs
 * @desc    Get email history and logs
 * @access  Private (admin, manager only)
 * @query   {string} status - Filter by status (queued|sent|delivered|opened|clicked|failed|bounced)
 * @query   {string} category - Filter by category (booking|payment|feedback|auth|promotional|alert|report)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20, max: 100)
 * @query   {string} search - Search in recipient email
 * @query   {string} startDate - Filter from date (ISO8601)
 * @query   {string} endDate - Filter to date (ISO8601)
 * @returns {object} { logs, pagination, summary }
 */
router.get(
  '/logs',
  authenticate,
  authorize('admin', 'manager'),
  [
    query('status')
      .optional()
      .isIn(['queued', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'])
      .withMessage('Invalid status value'),
    query('category')
      .optional()
      .isIn(['booking', 'payment', 'feedback', 'auth', 'promotional', 'alert', 'report'])
      .withMessage('Invalid category value'),
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
    query('search')
      .optional()
      .isString()
      .trim(),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format')
  ],
  handleValidation,
  emailController.getEmailLogs
);

/**
 * @route   GET /api/email/stats
 * @desc    Get email statistics and analytics
 * @access  Private (admin, manager only)
 * @query   {string} period - Analysis period (day|week|month|year, default: month)
 * @query   {string} startDate - Custom start date (ISO8601)
 * @query   {string} endDate - Custom end date (ISO8601)
 * @returns {object} { sent, delivered, opened, clicked, bounced, failed, rates }
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  [
    query('period')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Period must be one of: day, week, month, year'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format')
  ],
  handleValidation,
  emailController.getEmailStats
);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;