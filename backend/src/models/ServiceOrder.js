const mongoose = require('mongoose');

const serviceOrderSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service Request ID is required']
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: {
      values: ['received', 'preparing', 'ready', 'delivered'],
      message: 'Status must be one of: received, preparing, ready, or delivered'
    },
    default: 'received'
  },
  notes: {
    type: String,
    trim: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ===== INDEXES =====
serviceOrderSchema.index({ serviceRequestId: 1 });

// ===== PRE-SAVE HOOKS =====
/**
 * Set startedAt when status changes from 'received' to any other status
 */
serviceOrderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'received' && !this.startedAt) {
    this.startedAt = Date.now();
  }
  next();
});

const ServiceOrder = mongoose.model('ServiceOrder', serviceOrderSchema);

module.exports = ServiceOrder;
