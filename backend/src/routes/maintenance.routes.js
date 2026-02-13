/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance request management
 */

/**
 * @swagger
 * /api/maintenance/requests:
 *   post:
 *     tags:
 *       - Maintenance
 *     summary: Create maintenance request
 *     description: Report maintenance issue
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomId, description]
 *             properties:
 *               roomId:
 *                 type: string
 *               issueType:
 *                 type: string
 *                 enum: [plumbing, electrical, furniture, appliance, other]
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Request created
 *   get:
 *     tags:
 *       - Maintenance
 *     summary: Get all requests
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [reported, assigned, in_progress, resolved]
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
 *         description: Requests list
 */

/**
 * @swagger
 * /api/maintenance/requests/{id}:
 *   put:
 *     tags:
 *       - Maintenance
 *     summary: Update request
 *     description: Update status, assign staff
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
 *                 enum: [reported, assigned, in_progress, resolved]
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request updated
 */

/**
 * @swagger
 * /api/maintenance/requests/{id}/assign:
 *   post:
 *     tags:
 *       - Maintenance
 *     summary: Assign to staff
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request assigned
 */

/**
 * @swagger
 * /api/maintenance/requests/{id}/resolve:
 *   post:
 *     tags:
 *       - Maintenance
 *     summary: Mark as resolved
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Request resolved
 */

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