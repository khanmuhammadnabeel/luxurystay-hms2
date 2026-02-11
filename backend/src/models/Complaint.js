const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest ID is required']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  category: {
    type: String,
    enum: ['noise', 'cleanliness', 'maintenance', 'service', 'billing', 'other'],
    required: [true, 'Complaint category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [150, 'Subject cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['submitted', 'acknowledged', 'investigating', 'resolved', 'closed'],
    default: 'submitted'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  attachments: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
complaintSchema.index({ guestId: 1, status: 1 });
complaintSchema.index({ roomId: 1, status: 1 });
complaintSchema.index({ priority: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

// Ensure virtuals are included
complaintSchema.set('toObject', { virtuals: true });
complaintSchema.set('toJSON', { virtuals: true });

// Pre-save hook: update updatedAt
complaintSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // If status changed to 'resolved' and resolvedAt not set, set it
  if (this.isModified('status') && this.status === 'resolved') {
    if (!this.resolvedAt) this.resolvedAt = Date.now();
  }

  next();
});

// Instance methods
complaintSchema.methods.acknowledge = async function () {
  this.status = 'acknowledged';
  this.updatedAt = Date.now();
  return this.save();
};

complaintSchema.methods.resolve = async function () {
  this.status = 'resolved';
  this.resolvedAt = Date.now();
  this.updatedAt = Date.now();
  return this.save();
};

// Static methods
complaintSchema.statics.getPendingCount = function () {
  // Pending statuses: submitted, acknowledged, investigating
  return this.countDocuments({ status: { $in: ['submitted', 'acknowledged', 'investigating'] } });
};

complaintSchema.statics.getByPriority = function (priority) {
  return this.find({ priority })
    .sort({ createdAt: -1 })
    .populate('guestId', 'name email')
    .populate('roomId', 'roomNumber')
    .populate('bookingId', 'checkInDate checkOutDate');
};

// Virtuals
complaintSchema.virtual('guestDetails', {
  ref: 'User',
  localField: 'guestId',
  foreignField: '_id',
  justOne: true
});

complaintSchema.virtual('roomDetails', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

complaintSchema.virtual('bookingDetails', {
  ref: 'Booking',
  localField: 'bookingId',
  foreignField: '_id',
  justOne: true
});

complaintSchema.virtual('assignedStaff', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
