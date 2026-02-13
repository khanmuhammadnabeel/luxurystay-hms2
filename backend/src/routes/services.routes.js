/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Guest service requests
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get available services
 *     description: List all bookable services
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [food, laundry, spa, transport, other]
 *     responses:
 *       200:
 *         description: Services list
 */

/**
 * @swagger
 * /api/services/request:
 *   post:
 *     tags:
 *       - Services
 *     summary: Request service
 *     description: Guest requests hotel service
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, roomId]
 *             properties:
 *               serviceId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service requested
 */

/**
 * @swagger
 * /api/services/my-requests:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get my service requests
 *     description: Guest's own service history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, delivered, cancelled]
 *     responses:
 *       200:
 *         description: My requests
 */

/**
 * @swagger
 * /api/services/requests/{id}/status:
 *   put:
 *     tags:
 *       - Services
 *     summary: Update request status
 *     description: Staff updates service request status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */

const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const requestServiceValidation = [
  body('serviceId').notEmpty().withMessage('Service ID is required').isMongoId(),
  body('roomId').notEmpty().withMessage('Room ID is required').isMongoId(),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('specialInstructions').optional().trim()
];

const updateStatusValidation = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('status').isIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID')
];

/**
 * @route   GET /api/services
 * @desc    Get available services (public)
 * @access  Public
 */
router.get(
  '/',
  [
    query('category').optional().isIn(['food', 'laundry', 'spa', 'transport', 'other'])
  ],
  servicesController.getServices
);

/**
 * @route   POST /api/services/request
 * @desc    Request a service (guest)
 * @access  Private (guest)
 */
router.post(
  '/request',
  authenticate,
  authorize('guest', 'admin', 'manager', 'receptionist'), // Guests can request services
  requestServiceValidation,
  servicesController.requestService
);

/**
 * @route   GET /api/services/my-requests
 * @desc    Get current user's service requests
 * @access  Private (guest)
 */
router.get(
  '/my-requests',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'])
  ],
  servicesController.getMyServiceRequests
);

/**
 * @route   PUT /api/services/requests/:id/status
 * @desc    Update service request status (staff/admin)
 * @access  Private (staff, admin, manager)
 */
router.put(
  '/requests/:id/status',
  authenticate,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  updateStatusValidation,
  servicesController.updateServiceRequestStatus
);

module.exports = router;