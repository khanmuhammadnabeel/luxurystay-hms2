/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Process payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId, amount, paymentMethod]
 *             properties:
 *               invoiceId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, online, bank_transfer]
 *               last4Digits:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Payment processed
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get all payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded]
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Payments list
 */

/**
 * @swagger
 * /api/payments/invoice/{invoiceId}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment by invoice
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Payment details
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Payment details
 *   put:
 *     tags:
 *       - Payments
 *     summary: Update payment status
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
 *                 enum: [pending, processing, completed, failed, refunded, partially_refunded]
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Process refund
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
 *             properties:
 *               refundAmount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment stats
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth'); // CORRECT PATH

// Public routes (webhooks don't need authentication)
router.post('/webhook/gateway', paymentController.handleWebhook);

// Protected routes (require authentication)
router.use(authenticate);

// Process a new payment for an invoice (guest, admin, receptionist)
router.post('/', authorize('guest', 'admin', 'receptionist'), paymentController.processPayment);

// Get all payments with filters and pagination (admin/staff only)
router.get('/', authorize('admin', 'receptionist', 'accountant'), paymentController.getAllPayments);

// Get payment statistics and revenue (admin only)
router.get('/stats', authorize('admin', 'accountant'), paymentController.getPaymentStats);

// Get payment by ID (all authenticated users can see their own payments)
router.get('/:id', paymentController.getPaymentById);

// Get payment for a specific invoice (all authenticated users)
router.get('/invoice/:invoiceId', paymentController.getPaymentByInvoice);

// Update payment status manually (admin/accountant only)
router.patch('/:id/status', authorize('admin', 'accountant'), paymentController.updatePaymentStatus);

// Process refund for a payment (admin/accountant only)
router.post('/:id/refund', authorize('admin', 'accountant'), paymentController.processRefund);

module.exports = router;