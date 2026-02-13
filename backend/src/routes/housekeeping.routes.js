/**
 * @swagger
 * tags:
 *   name: Housekeeping
 *   description: Housekeeping task management
 */

/**
 * @swagger
 * /api/housekeeping/tasks:
 *   post:
 *     tags:
 *       - Housekeeping
 *     summary: Create task
 *     description: Assign housekeeping task
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomId, assignedTo]
 *             properties:
 *               roomId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               taskType:
 *                 type: string
 *                 enum: [cleaning, maintenance, inspection]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               notes:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 *   get:
 *     tags:
 *       - Housekeeping
 *     summary: Get all tasks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, verified]
 *       - name: priority
 *         in: query
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - name: assignedTo
 *         in: query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Tasks list
 */

/**
 * @swagger
 * /api/housekeeping/tasks/{id}:
 *   get:
 *     tags:
 *       - Housekeeping
 *     summary: Get task by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Task details
 *   put:
 *     tags:
 *       - Housekeeping
 *     summary: Update task
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, verified]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     tags:
 *       - Housekeeping
 *     summary: Delete task (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Task deleted
 */

/**
 * @swagger
 * /api/housekeeping/stats:
 *   get:
 *     tags:
 *       - Housekeeping
 *     summary: Get task statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Task stats
 */

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