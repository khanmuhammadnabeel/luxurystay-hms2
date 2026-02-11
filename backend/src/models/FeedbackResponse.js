const mongoose = require('mongoose');

const feedbackResponseSchema = new mongoose.Schema({
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    default: null
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff ID is required']
  },
  responseText: {
    type: String,
    required: [true, 'Response text is required'],
    trim: true,
    maxlength: [1000, 'Response cannot exceed 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
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

// Indexes
feedbackResponseSchema.index({ feedbackId: 1 });
feedbackResponseSchema.index({ complaintId: 1 });
feedbackResponseSchema.index({ staffId: 1 });

// Ensure virtuals returned
feedbackResponseSchema.set('toObject', { virtuals: true });
feedbackResponseSchema.set('toJSON', { virtuals: true });

// Pre-save hook to update updatedAt
feedbackResponseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Custom validation: exactly one of feedbackId or complaintId must be provided
feedbackResponseSchema.pre('validate', function (next) {
  const hasFeedback = !!this.feedbackId;
  const hasComplaint = !!this.complaintId;

  if ((hasFeedback && hasComplaint) || (!hasFeedback && !hasComplaint)) {
    this.invalidate('feedbackId', 'Either feedbackId or complaintId must be provided (but not both)');
    this.invalidate('complaintId', 'Either feedbackId or complaintId must be provided (but not both)');
    return next(new Error('Either feedbackId or complaintId must be provided (but not both)'));
  }

  next();
});

// Virtuals
feedbackResponseSchema.virtual('staffDetails', {
  ref: 'User',
  localField: 'staffId',
  foreignField: '_id',
  justOne: true
});

feedbackResponseSchema.virtual('feedbackDetails', {
  ref: 'Feedback',
  localField: 'feedbackId',
  foreignField: '_id',
  justOne: true
});

feedbackResponseSchema.virtual('complaintDetails', {
  ref: 'Complaint',
  localField: 'complaintId',
  foreignField: '_id',
  justOne: true
});

// Static methods
feedbackResponseSchema.statics.getResponsesForFeedback = function (feedbackId) {
  return this.find({ feedbackId })
    .sort({ createdAt: -1 })
    .populate('staffId', 'name email')
    .lean();
};

feedbackResponseSchema.statics.getResponsesForComplaint = function (complaintId) {
  return this.find({ complaintId })
    .sort({ createdAt: -1 })
    .populate('staffId', 'name email')
    .lean();
};

const FeedbackResponse = mongoose.model('FeedbackResponse', feedbackResponseSchema);

module.exports = FeedbackResponse;
