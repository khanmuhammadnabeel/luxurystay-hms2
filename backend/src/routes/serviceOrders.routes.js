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