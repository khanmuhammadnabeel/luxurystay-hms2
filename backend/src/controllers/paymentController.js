const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const User = require('../models/User');
const socketHelper = require('../utils/socketHelper');

/**
 * Validate payment data before processing
 */
function validatePaymentData(paymentData) {
  const { amount, paymentMethod, invoiceId } = paymentData;

  if (!amount || amount <= 0) {
    return { valid: false, error: 'Invalid payment amount' };
  }

  if (!paymentMethod || !['card', 'cash', 'bank_transfer', 'online', 'wallet'].includes(paymentMethod)) {
    return { valid: false, error: 'Invalid payment method' };
  }

  if (!invoiceId) {
    return { valid: false, error: 'Invoice ID is required' };
  }

  return { valid: true };
}

/**
 * Simulate Stripe payment gateway
 */
async function simulateStripePayment(paymentData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() < 0.95;

      if (isSuccess) {
        const chargeId = `ch_${Date.now().toString().slice(-12)}`;
        resolve({
          success: true,
          transactionId: chargeId,
          gatewayResponse: {
            gateway: 'stripe',
            chargeId,
            last4: paymentData.last4Digits || '4242',
            status: 'succeeded',
            timestamp: new Date().toISOString(),
            amount: paymentData.amount,
            currency: paymentData.currency || 'PKR'
          }
        });
      } else {
        resolve({
          success: false,
          error: 'Card declined by issuer',
          code: 'card_declined'
        });
      }
    }, 800);
  });
}

/**
 * Simulate PayPal payment gateway
 */
async function simulatePaypalPayment(paymentData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() < 0.98;

      if (isSuccess) {
        const transactionId = `PP-${Date.now().toString().slice(-10)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        resolve({
          success: true,
          transactionId,
          gatewayResponse: {
            gateway: 'paypal',
            transactionId,
            payerEmail: paymentData.email || 'customer@example.com',
            status: 'completed',
            timestamp: new Date().toISOString(),
            amount: paymentData.amount,
            currency: paymentData.currency || 'PKR'
          }
        });
      } else {
        resolve({
          success: false,
          error: 'PayPal account not active',
          code: 'account_error'
        });
      }
    }, 1200);
  });
}

/**
 * Simulate cash payment
 */
async function simulateCashPayment(paymentData) {
  return Promise.resolve({
    success: true,
    transactionId: `CASH-${Date.now()}`,
    gatewayResponse: {
      gateway: 'cash',
      method: 'direct_payment',
      timestamp: new Date().toISOString(),
      amount: paymentData.amount,
      currency: paymentData.currency || 'PKR'
    }
  });
}

/**
 * Simulate bank transfer payment
 */
async function simulateBankTransferPayment(paymentData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transactionId = `BT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      resolve({
        success: true,
        transactionId,
        gatewayResponse: {
          gateway: 'bank_transfer',
          method: 'manual_verification',
          status: 'pending_verification',
          timestamp: new Date().toISOString(),
          amount: paymentData.amount,
          currency: paymentData.currency || 'PKR',
          note: 'Payment requires manual verification'
        }
      });
    }, 500);
  });
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return !!signature && signature.length > 0;
  }
  
  console.warn('Webhook signature verification needed for production');
  return true;
}

/**
 * Process payment from invoice
 */
exports.processPayment = asyncHandler(async (req, res) => {
  const { invoiceId, amount, paymentMethod, last4Digits, email, notes, createdBy } = req.body;

  const validation = validatePaymentData({ amount, paymentMethod, invoiceId });
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const invoice = await Invoice.findById(invoiceId).populate('bookingId');
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }

  if (Math.abs(amount - invoice.totalAmount) > 0.01) {
    return res.status(400).json({ 
      success: false, 
      error: `Payment amount (${amount}) does not match invoice total (${invoice.totalAmount})` 
    });
  }

  if (invoice.status === 'paid') {
    return res.status(400).json({ 
      success: false, 
      error: 'Invoice is already paid' 
    });
  }

  const existingPayment = await Payment.findOne({
    invoiceId,
    status: { $in: ['completed', 'processing'] }
  });
  if (existingPayment) {
    return res.status(400).json({ 
      success: false, 
      error: 'Payment already exists for this invoice',
      data: existingPayment 
    });
  }

  try {
    let payment = await Payment.create({
      invoiceId,
      amount,
      currency: 'PKR',
      paymentMethod,
      status: 'processing',
      last4Digits: last4Digits || null,
      notes,
      createdBy: createdBy || req.user?._id || null
    });

    let gatewayResult;
    const paymentData = { amount, last4Digits, email, currency: 'PKR' };
    
    switch (paymentMethod) {
      case 'card':
        gatewayResult = await simulateStripePayment(paymentData);
        break;
      case 'online':
        gatewayResult = await simulatePaypalPayment(paymentData);
        break;
      case 'cash':
        gatewayResult = await simulateCashPayment(paymentData);
        break;
      case 'bank_transfer':
        gatewayResult = await simulateBankTransferPayment(paymentData);
        break;
      case 'wallet':
        gatewayResult = {
          success: true,
          transactionId: `WALLET-${Date.now()}`,
          gatewayResponse: {
            gateway: 'wallet',
            timestamp: new Date().toISOString(),
            amount,
            currency: 'PKR',
            status: 'completed'
          }
        };
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    if (gatewayResult.success) {
      payment.status = 'completed';
      payment.transactionId = gatewayResult.transactionId;
      payment.gatewayResponse = gatewayResult.gatewayResponse;
      payment.paymentDate = new Date();
      
      if (paymentMethod === 'bank_transfer') {
        payment.status = 'pending';
        payment.notes = (payment.notes || '') + ' | Requires manual verification';
      }
    } else {
      payment.status = 'failed';
      payment.gatewayResponse = {
        error: gatewayResult.error,
        code: gatewayResult.code,
        timestamp: new Date().toISOString()
      };
    }

    payment = await payment.save();

    if (gatewayResult.success && paymentMethod !== 'bank_transfer') {
      invoice.status = 'paid';
      invoice.paymentStatus = 'paid';
      invoice.paymentMethod = paymentMethod;
      invoice.paymentDate = new Date();
      await invoice.save();

      if (invoice.bookingId) {
        const booking = await Booking.findById(invoice.bookingId);
        if (booking && booking.status === 'confirmed') {
          booking.paymentStatus = 'paid';
          await booking.save();
        }
      }

      try {
        const guest = await User.findById(invoice.guestId).select('name');
        if (socketHelper.getIO()) {
          socketHelper.getIO().to('admins').emit('payment_completed', {
            paymentId: payment._id,
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            guestName: guest?.name || 'Guest',
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (socketErr) {
        console.error('Socket error:', socketErr);
      }
    }

    const responsePayment = payment.toObject();
    if (responsePayment.last4Digits && responsePayment.paymentMethod === 'card') {
      responsePayment.last4Digits = `****${responsePayment.last4Digits}`;
    }
    
    if (responsePayment.gatewayResponse) {
      delete responsePayment.gatewayResponse.raw;
    }

    return res.status(gatewayResult.success ? 201 : 400).json({
      success: gatewayResult.success,
      data: responsePayment,
      message: gatewayResult.success 
        ? (paymentMethod === 'bank_transfer' 
          ? 'Bank transfer initiated. Requires manual verification.' 
          : 'Payment processed successfully')
        : `Payment failed: ${gatewayResult.error}`
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * Get payment for specific invoice
 */
exports.getPaymentByInvoice = asyncHandler(async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payment = await Payment.findOne({ invoiceId })
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found for this invoice',
        data: null 
      });
    }

    const responsePayment = payment.toObject();
    if (responsePayment.last4Digits && responsePayment.paymentMethod === 'card') {
      responsePayment.last4Digits = `****${responsePayment.last4Digits}`;
    }

    return res.json({ 
      success: true, 
      data: responsePayment 
    });
  } catch (error) {
    console.error('Get payment by invoice error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payment' 
    });
  }
});

/**
 * Get all payments with optional filters
 */
exports.getAllPayments = asyncHandler(async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('invoiceId', 'invoiceNumber totalAmount guestId')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const safePayments = payments.map(payment => {
      const paymentObj = payment.toObject();
      if (paymentObj.last4Digits && paymentObj.paymentMethod === 'card') {
        paymentObj.last4Digits = `****${paymentObj.last4Digits}`;
      }
      return paymentObj;
    });

    const total = await Payment.countDocuments(filter);

    return res.json({
      success: true,
      data: safePayments,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payments' 
    });
  }
});

/**
 * Get detailed payment statistics - FIXED VERSION
 */
exports.getPaymentStats = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate);
    }

    // Get all payments for total count
    const allPayments = await Payment.find(dateFilter);

    // Get successful payments (completed or partially refunded)
    const successfulPayments = await Payment.countDocuments({
      ...dateFilter,
      status: { $in: ['completed', 'partially_refunded'] }
    });

    // Calculate success rate
    const successRate = allPayments.length > 0 
      ? ((successfulPayments / allPayments.length) * 100).toFixed(2) 
      : 0;

    // Get revenue stats - use the model's method
    const revenueStats = await Payment.getTotalRevenue(
      { startDate, endDate }
    );

    // Get payment method breakdown for successful payments
    const methodStats = await Payment.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          status: { $in: ['completed', 'partially_refunded'] }
        } 
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get daily revenue for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'partially_refunded'] },
          paymentDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    return res.json({
      success: true,
      data: {
        revenue: revenueStats,
        successRate: `${successRate}%`,
        totalPayments: allPayments.length,
        successfulPayments,
        failedPayments: allPayments.length - successfulPayments,
        methodBreakdown: methodStats,
        dailyRevenue,
        dateRange: { startDate: startDate || 'all', endDate: endDate || 'all' }
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payment statistics' 
    });
  }
});

/**
 * Update payment status manually
 */
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid payment status. Allowed: ${allowedStatuses.join(', ')}` 
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber status');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    if (payment.status === 'refunded' && status !== 'refunded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot change status of a refunded payment' 
      });
    }

    const oldStatus = payment.status;
    payment.status = status;
    if (notes) payment.notes = (payment.notes || '') + ` | Status update: ${notes}`;
    
    if (status === 'completed' && !payment.paymentDate) {
      payment.paymentDate = new Date();
    }

    const updatedPayment = await payment.save();

    if (status === 'completed' && payment.invoiceId) {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice && invoice.status !== 'paid') {
        invoice.status = 'paid';
        invoice.paymentStatus = 'paid';
        invoice.paymentDate = new Date();
        await invoice.save();
      }
    }

    try {
      if (socketHelper.getIO()) {
        socketHelper.getIO().to('admins').emit('payment_status_changed', {
          paymentId: updatedPayment._id,
          invoiceId: updatedPayment.invoiceId,
          invoiceNumber: payment.invoiceId?.invoiceNumber,
          oldStatus,
          newStatus: updatedPayment.status,
          timestamp: new Date().toISOString(),
          updatedBy: req.user?.name || 'System'
        });
      }
    } catch (socketErr) {
      console.error('Socket error:', socketErr);
    }

    return res.json({
      success: true,
      data: updatedPayment,
      message: `Payment status updated from ${oldStatus} to ${status}`
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update payment status' 
    });
  }
});

/**
 * Process refund for a payment
 */
exports.processRefund = asyncHandler(async (req, res) => {
  try {
    const { refundAmount, reason, gatewayRefundId } = req.body;

    const payment = await Payment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber status');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    if (!payment.canRefund()) {
      return res.status(400).json({
        success: false,
        error: 'Payment cannot be refunded in current state',
        currentStatus: payment.status,
        refundableAmount: payment.amount - (payment.refundAmount || 0)
      });
    }

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refund amount must be greater than 0' 
      });
    }

    const refundable = payment.amount - (payment.refundAmount || 0);
    if (refundAmount > refundable) {
      return res.status(400).json({
        success: false,
        error: `Maximum refundable amount is ${refundable}`,
        refundable,
        alreadyRefunded: payment.refundAmount || 0
      });
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      payment.markAsRefunded(refundAmount);
      
      const refundNote = `Refund: ${refundAmount} | Reason: ${reason || 'N/A'} | Gateway: ${gatewayRefundId || 'manual'}`;
      payment.notes = (payment.notes || '') + ' | ' + refundNote;

      const updatedPayment = await payment.save();

      if (updatedPayment.status === 'refunded' && payment.invoiceId) {
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          invoice.status = 'refunded';
          await invoice.save();
        }
      }

      try {
        if (socketHelper.getIO()) {
          socketHelper.getIO().to('admins').emit('refund_processed', {
            paymentId: updatedPayment._id,
            invoiceId: updatedPayment.invoiceId,
            invoiceNumber: payment.invoiceId?.invoiceNumber,
            refundAmount,
            totalRefunded: updatedPayment.refundAmount,
            status: updatedPayment.status,
            reason: reason || 'Not specified',
            timestamp: new Date().toISOString(),
            processedBy: req.user?.name || 'System'
          });
        }
      } catch (socketErr) {
        console.error('Socket error:', socketErr);
      }

      return res.json({
        success: true,
        data: updatedPayment,
        message: `Refund of ${refundAmount} processed successfully. ${refundable - refundAmount} remaining refundable.`
      });
    } catch (gatewayErr) {
      console.error('Refund gateway error:', gatewayErr);
      return res.status(502).json({
        success: false,
        error: `Refund gateway error: ${gatewayErr.message}`
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process refund',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * Handle webhook from payment gateway
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  try {
    const { event, data, signature } = req.body;

    if (!verifyWebhookSignature(data, signature)) {
      console.warn('Invalid webhook signature:', signature);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid webhook signature' 
      });
    }

    console.log(`Payment webhook received: ${event}`, {
      timestamp: new Date().toISOString(),
      eventId: data.id || 'unknown',
      amount: data.amount
    });

    switch (event) {
      case 'payment.completed':
      case 'charge.succeeded': {
        const payment = await Payment.findOne({ 
          transactionId: data.transactionId || data.chargeId 
        });
        
        if (payment) {
          payment.status = 'completed';
          payment.paymentDate = new Date();
          payment.gatewayResponse = {
            ...payment.gatewayResponse,
            webhookData: data,
            webhookReceivedAt: new Date()
          };
          await payment.save();

          const invoice = await Invoice.findById(payment.invoiceId);
          if (invoice && invoice.status !== 'paid') {
            invoice.status = 'paid';
            invoice.paymentStatus = 'paid';
            invoice.paymentDate = new Date();
            await invoice.save();
          }
        }
        break;
      }

      case 'payment.failed':
      case 'charge.failed': {
        const failedPayment = await Payment.findOne({ 
          transactionId: data.transactionId || data.chargeId 
        });
        
        if (failedPayment) {
          failedPayment.status = 'failed';
          failedPayment.gatewayResponse = {
            error: data.error?.message || 'Payment failed',
            code: data.error?.code || 'unknown',
            timestamp: new Date(),
            webhookData: data
          };
          await failedPayment.save();
        }
        break;
      }

      case 'refund.completed':
      case 'charge.refunded': {
        const refundPayment = await Payment.findOne({ 
          transactionId: data.transactionId || data.chargeId 
        });
        
        if (refundPayment) {
          const refundAmount = data.refundAmount || data.amount_refunded || 0;
          refundPayment.markAsRefunded(refundAmount);
          refundPayment.gatewayResponse = {
            ...refundPayment.gatewayResponse,
            refundWebhookData: data,
            refundProcessedAt: new Date()
          };
          await refundPayment.save();

          if (refundPayment.status === 'refunded') {
            const invoice = await Invoice.findById(refundPayment.invoiceId);
            if (invoice) {
              invoice.status = 'refunded';
              await invoice.save();
            }
          }
        }
        break;
      }

      default:
        console.warn(`Unhandled webhook event: ${event}`, data);
    }

    return res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook handling error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * Get payment by ID
 */
exports.getPaymentById = asyncHandler(async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber totalAmount guestId status')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    const responsePayment = payment.toObject();
    if (responsePayment.last4Digits && responsePayment.paymentMethod === 'card') {
      responsePayment.last4Digits = `****${responsePayment.last4Digits}`;
    }

    return res.json({ 
      success: true, 
      data: responsePayment 
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payment' 
    });
  }
});