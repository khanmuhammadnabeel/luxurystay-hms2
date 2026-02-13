/**
 * @swagger
 * tags:
 *   name: Service Orders
 *   description: Staff service order management
 */

/**
 * @swagger
 * /api/service-orders:
 *   post:
 *     tags:
 *       - Service Orders
 *     summary: Create service order
 *     description: Staff creates order from service request
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceRequestId]
 *             properties:
 *               serviceRequestId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */

/**
 * @swagger
 * /api/service-orders/active:
 *   get:
 *     tags:
 *       - Service Orders
 *     summary: Get active orders
 *     description: List orders not yet delivered
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [received, preparing, ready]
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
 *         description: Active orders
 */

/**
 * @swagger
 * /api/service-orders/{id}/status:
 *   put:
 *     tags:
 *       - Service Orders
 *     summary: Update order status
 *     description: Update order progress (received → preparing → ready → delivered)
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
 *                 enum: [received, preparing, ready, delivered]
 *     responses:
 *       200:
 *         description: Status updated
 */

const express = require('express');
const router = express.Router();
const serviceOrdersController = require('../controllers/serviceOrdersController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const createOrderValidation = [
  body('serviceRequestId').notEmpty().withMessage('Service request ID is required').isMongoId(),
  body('notes').optional().trim()
];

const updateOrderStatusValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['received', 'preparing', 'ready', 'delivered']).withMessage('Invalid status')
];

/**
 * @route   POST /api/service-orders
 * @desc    Create service order from request (staff)
 * @access  Private (staff, admin, manager)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  createOrderValidation,
  serviceOrdersController.createServiceOrder
);

/**
 * @route   GET /api/service-orders/active
 * @desc    Get active service orders (staff)
 * @access  Private (staff, admin, manager)
 */
router.get(
  '/active',
  authenticate,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  [
    query('status').optional().isIn(['received', 'preparing', 'ready'])
  ],
  serviceOrdersController.getActiveOrders
);

/**
 * @route   PUT /api/service-orders/:id/status
 * @desc    Update order status (staff)
 * @access  Private (staff, admin, manager)
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  updateOrderStatusValidation,
  serviceOrdersController.updateOrderStatus
);

module.exports = router;