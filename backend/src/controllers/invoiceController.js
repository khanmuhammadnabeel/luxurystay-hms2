const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const socketHelper = require('../utils/socketHelper');

/**
 * Calculate a complete invoice from booking data
 * Includes room charges, service charges, tax (16%), and returns invoice object
 * @param {Object} booking - Booking document
 * @param {Object} room - Room document
 * @param {Object} additionalCharges - Map of additional service charges
 * @returns {Promise<Object>} Invoice calculation object
 */
async function calculateInvoice(booking, room, additionalCharges = {}) {
  try {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    // Calculate nights
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Create line items
    const lineItems = [
      {
        description: `Room ${room.roomNumber} (${room.type}) - ${nights} night(s)`,
        quantity: nights,
        unitPrice: room.price,
        total: nights * room.price
      }
    ];
    
    // Add any service charges from booking
    if (booking.specialRequests && booking.specialRequests.length > 0) {
      lineItems.push({
        description: 'Special requests/services',
        quantity: 1,
        unitPrice: 0, // Assuming no charge unless specified
        total: 0
      });
    }
    
    // Calculate subtotal (room + booking service charges if any)
    const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    
    // Add additional charges
    const additionalChargesArray = Array.isArray(additionalCharges) ? additionalCharges : Object.entries(additionalCharges || {}).map(([desc, amount]) => ({ description: desc, amount }));
    const additionalChargesTotal = additionalChargesArray.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    
    const subtotal = lineItemsTotal + additionalChargesTotal;
    
    // Calculate tax (default 16%)
    const TAX_RATE = 0.16;
    const taxAmount = subtotal * TAX_RATE;
    
    // Calculate final total
    const totalAmount = subtotal + taxAmount;
    
    return {
      lineItems,
      additionalCharges: additionalChargesArray,
      subtotal,
      taxAmount,
      taxRate: TAX_RATE,
      totalAmount,
      discountAmount: 0
    };
  } catch (error) {
    console.error('Invoice calculation error:', error);
    throw new Error('Failed to calculate invoice: ' + error.message);
  }
}

/**
 * Get all invoices with optional filters (status, date range)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAllInvoices = asyncHandler(async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const invoices = await Invoice.find(filter)
      .populate('bookingId', 'checkInDate checkOutDate numberOfGuests')
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber type price')
      .sort({ issueDate: -1 });
    
    return res.json({ success: true, data: invoices, message: 'Invoices retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get a single invoice by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('bookingId')
      .populate('guestId', 'name email phone')
      .populate('roomId');
    
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get invoice for a specific booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getInvoiceByBooking = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.bookingId })
      .populate('bookingId')
      .populate('guestId', 'name email phone')
      .populate('roomId');
    
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found for this booking' });
    }
    
    return res.json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create new invoice from a booking
 * Auto-generates invoice number, calculates totals, and emits socket notification
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.createInvoice = asyncHandler(async (req, res) => {
  try {
    const { bookingId, additionalCharges, notes, createdBy } = req.body;
    
    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    // Check if invoice already exists for this booking
    const existingInvoice = await Invoice.findOne({ bookingId });
    if (existingInvoice) {
      return res.status(400).json({ success: false, error: 'Invoice already exists for this booking' });
    }
    
    // Fetch room and guest details
    const room = await Room.findById(booking.roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    
    const guest = await User.findById(booking.guestId);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    // Calculate invoice totals
    const invoiceCalc = await calculateInvoice(booking, room, additionalCharges || {});
    
    // Generate invoice number
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    
    // Create invoice document
    const invoiceData = {
      invoiceNumber,
      bookingId,
      guestId: booking.guestId,
      roomId: booking.roomId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'draft',
      lineItems: invoiceCalc.lineItems,
      subtotal: invoiceCalc.subtotal,
      taxAmount: invoiceCalc.taxAmount,
      taxRate: invoiceCalc.taxRate,
      discountAmount: invoiceCalc.discountAmount || 0,
      totalAmount: invoiceCalc.totalAmount,
      additionalCharges: additionalCharges || {},
      notes: notes || '',
      createdBy: createdBy || null
    };
    
    const invoice = await Invoice.create(invoiceData);
    
    // Emit socket notification (non-blocking)
    try {
      if (socketHelper.getIO()) {
        socketHelper.getIO().to('admins').emit('invoice_created', {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          bookingId,
          guestName: guest.name,
          totalAmount: invoice.totalAmount,
          timestamp: new Date().toISOString(),
          type: 'INVOICE_CREATED'
        });
      }
    } catch (socketErr) {
      console.error('Socket error (createInvoice):', socketErr);
    }
    
    return res.status(201).json({ success: true, data: invoice, message: 'Invoice created successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Update invoice status
 * Workflow: draft → issued → paid → cancelled (or refunded)
 * Emits socket updates when status changes to 'paid' or 'issued'
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateInvoiceStatus = asyncHandler(async (req, res) => {
  try {
    const { status, paymentMethod, paymentDate } = req.body;
    const allowedStatuses = ['draft', 'issued', 'paid', 'overdue', 'cancelled', 'refunded'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid invoice status' });
    }
    
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    // Update status
    invoice.status = status;
    
    // Set payment details if status is 'paid'
    if (status === 'paid') {
      invoice.paymentMethod = paymentMethod || 'cash';
      invoice.paymentDate = paymentDate || new Date();
    }
    
    const updatedInvoice = await invoice.save();
    
    // Emit socket notification (non-blocking)
    try {
      if (socketHelper.getIO()) {
        const payload = {
          invoiceId: updatedInvoice._id,
          invoiceNumber: updatedInvoice.invoiceNumber,
          status: updatedInvoice.status,
          totalAmount: updatedInvoice.totalAmount,
          timestamp: new Date().toISOString(),
          type: 'INVOICE_STATUS_UPDATE'
        };
        
        socketHelper.getIO().to('admins').emit('invoice_status_updated', payload);
        
        // If paid, also notify accounting
        if (status === 'paid') {
          socketHelper.getIO().to('accounting').emit('payment_received', {
            ...payload,
            paymentMethod: updatedInvoice.paymentMethod,
            paymentDate: updatedInvoice.paymentDate
          });
        }
      }
    } catch (socketErr) {
      console.error('Socket error (updateInvoiceStatus):', socketErr);
    }
    
    return res.json({ success: true, data: updatedInvoice, message: `Invoice status updated to ${status}` });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Soft delete an invoice (mark as cancelled)
 * Updates related booking status if needed
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    // Soft delete by setting status to cancelled
    invoice.status = 'cancelled';
    await invoice.save();
    
    // Emit socket notification (non-blocking)
    try {
      if (socketHelper.getIO()) {
        socketHelper.getIO().to('admins').emit('invoice_cancelled', {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          timestamp: new Date().toISOString(),
          type: 'INVOICE_CANCELLED'
        });
      }
    } catch (socketErr) {
      console.error('Socket error (deleteInvoice):', socketErr);
    }
    
    return res.json({ success: true, message: 'Invoice cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
