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