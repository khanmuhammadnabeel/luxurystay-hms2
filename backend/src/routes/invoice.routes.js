const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

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
