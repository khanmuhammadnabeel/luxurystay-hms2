const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const taskValidation = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('taskType').optional().isIn(['cleaning', 'maintenance', 'inspection']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('notes').optional().trim(),
  body('scheduledDate').optional().isISO8601()
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'verified']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('notes').optional().trim()
];

/**
 * @route   POST /api/housekeeping/tasks
 * @desc    Create a new housekeeping task
 * @access  Private (admin, manager, receptionist)
 */
router.post(
  '/tasks',
  authenticate,
  authorize('admin', 'manager', 'receptionist'),
  taskValidation,
  housekeepingController.createTask
);

/**
 * @route   GET /api/housekeeping/tasks
 * @desc    Get all housekeeping tasks with filters
 * @access  Private (admin, manager, housekeeping)
 */
router.get(
  '/tasks',
  authenticate,
  authorize('admin', 'manager', 'housekeeping'),
  [
    query('status').optional().isIn(['pending', 'in_progress', 'completed', 'verified']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('assignedTo').optional().isMongoId(),
    query('roomId').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  housekeepingController.getTasks
);

/**
 * @route   PUT /api/housekeeping/tasks/:id
 * @desc    Update a housekeeping task
 * @access  Private (admin, manager, housekeeping)
 */
router.put(
  '/tasks/:id',
  authenticate,
  authorize('admin', 'manager', 'housekeeping'),
  updateTaskValidation,
  housekeepingController.updateTask
);

/**
 * @route   GET /api/housekeeping/stats
 * @desc    Get housekeeping statistics
 * @access  Private (admin, manager)
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin', 'manager'),
  housekeepingController.getStats
);

module.exports = router;