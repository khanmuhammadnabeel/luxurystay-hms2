/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Get invoice by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *   put:
 *     tags:
 *       - Invoices
 *     summary: Update invoice status
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
 *                 enum: [pending, paid, overdue, cancelled]
 *     responses:
 *       200:
 *         description: Invoice updated
 */

/**
 * @swagger
 * /api/invoices/{id}/download:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Download invoice PDF
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
/**
 * @swagger
 * /api/invoices:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Get all invoices
 *     description: Retrieve list of invoices
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue, cancelled]
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

// Your existing invoice routes code below...

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

const { authenticate } = require('../middleware/auth');

// GET current user's invoices
router.get('/my', authenticate, invoiceController.getMyInvoices);

// GET all invoices with optional filters (status, date range)
router.get('/', invoiceController.getAllInvoices);

// GET invoice for a specific booking
router.get('/booking/:bookingId', invoiceController.getInvoiceByBooking);

// GET single invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// POST create new invoice from booking
router.post('/', invoiceController.createInvoice);

// PATCH update invoice status (draft → issued → paid → cancelled)
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

// DELETE invoice (soft delete - marks as cancelled)
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
