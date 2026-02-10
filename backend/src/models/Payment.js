const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice ID is required'],
    index: true
  },

  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },

  currency: {
    type: String,
    default: 'PKR',
    trim: true,
    uppercase: true,
    enum: ['PKR', 'USD', 'EUR', 'GBP', 'AED']
  },

  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['card', 'cash', 'bank_transfer', 'online', 'wallet'],
      message: 'Invalid payment method'
    }
  },

  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending',
    index: true
  },

  transactionId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  last4Digits: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{4}$/.test(v);
      },
      message: 'last4Digits must be exactly 4 digits'
    }
  },

  paymentDate: {
    type: Date,
    sparse: true
  },

  refundDate: {
    type: Date,
    sparse: true
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Performance indexes
paymentSchema.index({ invoiceId: 1, status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'status': 1, 'paymentDate': -1 });

// Pre-save hooks
paymentSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  next();
});

paymentSchema.pre('save', function(next) {
  if (this.refundAmount > 0 && !this.refundDate) {
    this.refundDate = new Date();
  }
  next();
});

paymentSchema.pre('save', function(next) {
  if (this.refundAmount > this.amount) {
    return next(new Error('Refund amount cannot exceed payment amount'));
  }
  next();
});

paymentSchema.pre('save', async function(next) {
  try {
    if ((this.paymentMethod === 'online' || this.paymentMethod === 'card') && !this.transactionId) {
      this.transactionId = await this.constructor.generateTransactionId();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

paymentSchema.methods.canRefund = function() {
  const isCompleted = this.status === 'completed' || this.status === 'partially_refunded';
  const hasRefundableAmount = this.amount > (this.refundAmount || 0);
  return isCompleted && hasRefundableAmount;
};

paymentSchema.methods.markAsRefunded = function(refundAmount) {
  if (!this.canRefund()) {
    throw new Error('Payment cannot be refunded in current state');
  }

  if (refundAmount <= 0) {
    throw new Error('Refund amount must be greater than 0');
  }

  const totalRefunded = (this.refundAmount || 0) + refundAmount;

  if (totalRefunded > this.amount) {
    throw new Error('Total refund amount exceeds payment amount');
  }

  this.refundAmount = totalRefunded;

  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  } else if (this.refundAmount > 0) {
    this.status = 'partially_refunded';
  }

  if (!this.refundDate) {
    this.refundDate = new Date();
  }

  return this;
};

paymentSchema.methods.getPaymentSummary = function() {
  const refundableAmount = this.canRefund() ? this.amount - (this.refundAmount || 0) : 0;

  return {
    id: this._id,
    invoiceId: this.invoiceId,
    amount: this.amount,
    currency: this.currency,
    formattedAmount: this.formattedAmount,
    paymentMethod: this.paymentMethod,
    paymentMethodDisplay: this.paymentMethodDisplay,
    status: this.status,
    statusDisplay: this.statusDisplay,
    transactionId: this.transactionId || 'N/A',
    refundAmount: this.refundAmount,
    refundableAmount,
    paymentDate: this.paymentDate ? this.paymentDate.toISOString() : null,
    daysSincePayment: this.daysSincePayment,
    canRefund: this.canRefund(),
    isSuccessful: this.isSuccessful(),
    notes: this.notes,
    lastUpdated: this.updatedAt
  };
};

// Static methods
paymentSchema.statics.generateTransactionId = async function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const lastPayment = await this.findOne(
    { transactionId: new RegExp(`^TXN-${datePrefix}`) },
    { transactionId: 1 }
  ).sort({ transactionId: -1 });

  let sequence = 1;
  if (lastPayment && lastPayment.transactionId) {
    const lastSeq = parseInt(lastPayment.transactionId.split('-')[2], 10);
    sequence = lastSeq + 1;
  }

  const sequencePadded = String(sequence).padStart(5, '0');
  return `TXN-${datePrefix}-${sequencePadded}`;
};

paymentSchema.statics.getTotalRevenue = async function(dateRange = {}, status = 'completed') {
  try {
    const { startDate, endDate } = dateRange;

    const matchFilter = {};
    if (status) matchFilter.status = status;

    if (startDate || endDate) {
      matchFilter.paymentDate = {};
      if (startDate) matchFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) matchFilter.paymentDate.$lte = new Date(endDate);
    }

    // FIXED: Include partially_refunded payments in stats
    const statsMatchFilter = {
      ...matchFilter,
      status: { $in: ['completed', 'partially_refunded'] }
    };

    const result = await this.aggregate([
      { $match: statsMatchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          totalRefunded: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          count: 1,
          totalRefunded: 1,
          netRevenue: 1
        }
      }
    ]);

    const byMethodResult = await this.aggregate([
      { $match: statsMatchFilter },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const byStatusResult = await this.aggregate([
      {
        $match: {
          ...matchFilter,
          status: { $in: ['completed', 'partially_refunded', 'refunded', 'failed'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const revenue = result[0] || {
      total: 0,
      count: 0,
      totalRefunded: 0,
      netRevenue: 0
    };

    return {
      ...revenue,
      byMethod: byMethodResult,
      byStatus: byStatusResult,
      dateRange: { startDate, endDate }
    };
  } catch (error) {
    console.error('Error calculating revenue:', error);
    throw error;
  }
};

// Virtuals (PROFESSIONAL VERSION - NO EMOJIS)
paymentSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(this.amount);
});

paymentSchema.virtual('paymentMethodDisplay').get(function() {
  const methodMap = {
    card: 'Credit/Debit Card',
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    online: 'Online Payment',
    wallet: 'Digital Wallet'
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
});

paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  };
  return statusMap[this.status] || this.status;
});

paymentSchema.virtual('daysSincePayment').get(function() {
  if (!this.paymentDate) return null;
  const days = Math.floor((new Date() - this.paymentDate) / (1000 * 60 * 60 * 24));
  return days;
});

module.exports = mongoose.model('Payment', paymentSchema);