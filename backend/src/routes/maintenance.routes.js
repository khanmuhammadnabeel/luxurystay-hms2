const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const requestValidation = [
  body('roomId').notEmpty().withMessage('Room ID is required').isMongoId(),
  body('issueType').optional().isIn(['plumbing', 'electrical', 'furniture', 'appliance', 'other']),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('images').optional().isArray(),
  body('images.*').optional().isURL().withMessage('Invalid image URL')
];

const updateRequestValidation = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('status').optional().isIn(['reported', 'assigned', 'in_progress', 'resolved']),
  body('assignedTo').optional().isMongoId(),
  body('images').optional().isArray(),
  body('images.*').optional().isURL()
];

/**
 * @route   POST /api/maintenance/requests
 * @desc    Create a new maintenance request
 * @access  Private (all authenticated users)
 */
router.post(
  '/requests',
  authenticate,
  requestValidation,
  maintenanceController.createRequest
);

/**
 * @route   GET /api/maintenance/requests
 * @desc    Get all maintenance requests with filters
 * @access  Private (admin, manager, housekeeping)
 */
router.get(
  '/requests',
  authenticate,
  authorize('admin', 'manager', 'housekeeping'),
  [
    query('status').optional().isIn(['reported', 'assigned', 'in_progress', 'resolved']),
    query('issueType').optional().isIn(['plumbing', 'electrical', 'furniture', 'appliance', 'other']),
    query('roomId').optional().isMongoId(),
    query('reportedBy').optional().isMongoId(),
    query('assignedTo').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  maintenanceController.getRequests
);

/**
 * @route   PUT /api/maintenance/requests/:id
 * @desc    Update a maintenance request
 * @access  Private (admin, manager, housekeeping)
 */
router.put(
  '/requests/:id',
  authenticate,
  authorize('admin', 'manager', 'housekeeping'),
  updateRequestValidation,
  maintenanceController.updateRequest
);

/**
 * @route   GET /api/maintenance/stats
 * @desc    Get maintenance statistics
 * @access  Private (admin, manager)
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  maintenanceController.getStats
);

module.exports = router;