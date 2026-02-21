const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: Number,
    ref: 'Room',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', null],
    default: null
  },
  paymentDate: {
    type: Date
  },

  // Line items breakdown
  lineItems: [lineItemSchema],

  // Summary
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.16, // 16% default tax
    min: 0,
    max: 1
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Additional charges
  additionalCharges: {
    type: Map,
    of: Number,
    default: {}
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // PDF reference
  pdfUrl: {
    type: String,
    trim: true
  },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Virtual for formatted invoice number
invoiceSchema.virtual('formattedInvoiceNumber').get(function () {
  return `INV-${this.invoiceNumber.padStart(6, '0')}`;
});

// Auto-calculate totals before save
invoiceSchema.pre('save', function (next) {
  // Calculate line item totals if not set
  this.lineItems.forEach(item => {
    if (!item.total) {
      item.total = item.quantity * item.unitPrice;
    }
  });

  // Calculate subtotal from line items
  const lineItemsTotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);

  // Calculate subtotal (line items + additional charges)
  const additionalChargesTotal = Array.from(this.additionalCharges.values())
    .reduce((sum, charge) => sum + charge, 0);

  this.subtotal = lineItemsTotal + additionalChargesTotal;

  // Calculate tax
  this.taxAmount = this.subtotal * this.taxRate;

  // Calculate final total
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;

  // Auto-set due date if not provided (30 days from issue)
  if (!this.dueDate) {
    const due = new Date(this.issueDate);
    due.setDate(due.getDate() + 30);
    this.dueDate = due;
  }

  next();
});

// Method to check if invoice is overdue
invoiceSchema.methods.isOverdue = function () {
  if (this.status === 'paid' || this.status === 'cancelled') return false;
  return new Date() > this.dueDate;
};

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const lastInvoice = await this.findOne(
    { invoiceNumber: new RegExp(`^${year}${month}`) },
    { invoiceNumber: 1 }
  ).sort({ invoiceNumber: -1 });

  if (!lastInvoice) {
    return `${year}${month}0001`;
  }

  const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
  const nextNumber = String(lastNumber + 1).padStart(4, '0');

  return `${year}${month}${nextNumber}`;
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;