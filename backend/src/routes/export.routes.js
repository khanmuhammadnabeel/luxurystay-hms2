/**
 * @swagger
 * /api/exports/bookings:
 *   post:
 *     tags:
 *       - Exports
 *     summary: Export bookings
 *     description: Export bookings in CSV, Excel, or PDF format
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf]
 *                 default: csv
 *               filters:
 *                 type: object
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Export job created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 jobId:
 *                   type: string
 */

/**
 * @swagger
 * /api/exports/{jobId}/download:
 *   get:
 *     tags:
 *       - Exports
 *     summary: Download export file
 *     description: Download a completed export file
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Your existing export routes code below...

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 exports per window
  message: 'Too many export requests, please try again later'
});

// Validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
  }
  next();
};

// 1. POST /api/exports/bookings
router.post(
  '/bookings',
  authenticate,
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid format'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  handleValidationErrors,
  exportController.exportBookings
);

// 2. POST /api/exports/invoices
router.post(
  '/invoices',
  authenticate,
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid format'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  handleValidationErrors,
  exportController.exportInvoices
);

// 3. POST /api/exports/financial
router.post(
  '/financial',
  authenticate,
  authorize('admin', 'manager'),
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid format'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  handleValidationErrors,
  exportController.exportFinancial
);

// 4. POST /api/exports/guests
router.post(
  '/guests',
  authenticate,
  authorize('admin', 'manager'),
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid format'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  handleValidationErrors,
  exportController.exportGuests
);

// 5. POST /api/exports/search
router.post(
  '/search',
  authenticate,
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf', 'json']).withMessage('Invalid format'),
    body('searchQuery').custom((value) => {
  return typeof value === 'object' || typeof value === 'string';
}).withMessage('Search query must be object or string'),
    body('filters').optional().isObject().withMessage('Filters must be an object')
  ],
  handleValidationErrors,
  exportController.exportSearch
);

// 6. POST /api/exports/analytics
router.post(
  '/analytics',
  authenticate,
  authorize('admin', 'manager'),
  exportLimiter,
  [
    body('format').isIn(['csv', 'excel', 'pdf', 'json']).withMessage('Invalid format'),
    body('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  exportController.exportAnalytics
);

// 7. GET /api/exports/:jobId/download
router.get(
  '/:jobId/download',
  authenticate,
  [param('jobId').isString().notEmpty().withMessage('jobId is required')],
  handleValidationErrors,
  exportController.downloadExport
);

// 8. GET /api/exports/history
router.get(
  '/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed'])
  ],
  handleValidationErrors,
  exportController.getExportHistory
);

// Error handler
router.use((err, req, res, next) => {
  console.error('Export route error:', err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Export route error' });
});

module.exports = router;
