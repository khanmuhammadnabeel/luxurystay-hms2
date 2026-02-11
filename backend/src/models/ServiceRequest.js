const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest ID is required']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, preparing, delivered, or cancelled'
    },
    default: 'pending'
  },
  requestedTime: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ===== INDEXES =====
serviceRequestSchema.index({ guestId: 1 });
serviceRequestSchema.index({ roomId: 1 });
serviceRequestSchema.index({ status: 1 });

// ===== VIRTUAL FIELDS =====
serviceRequestSchema.virtual('guestDetails', {
  ref: 'User',
  localField: 'guestId',
  foreignField: '_id',
  justOne: true
});

serviceRequestSchema.virtual('roomDetails', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

serviceRequestSchema.virtual('serviceDetails', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true
});

// ===== PRE-SAVE HOOKS =====
/**
 * Auto-update updatedAt timestamp on every save
 * Calculate totalPrice if serviceId or quantity changes
 */
serviceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Note: We'll calculate totalPrice in controller
  // This keeps model clean and avoids circular dependencies
  
  next();
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;