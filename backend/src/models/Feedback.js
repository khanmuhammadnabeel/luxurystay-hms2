const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number between 1-5'
    }
  },
  reviewTitle: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review text cannot exceed 1000 characters']
  },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  staffResponse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedbackResponse',
    default: null
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
feedbackSchema.index({ guestId: 1, createdAt: -1 });
feedbackSchema.index({ roomId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ rating: -1 });

// Ensure virtuals are returned in toObject / toJSON
feedbackSchema.set('toObject', { virtuals: true });
feedbackSchema.set('toJSON', { virtuals: true });

// Pre-save hook to update updatedAt
feedbackSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtuals for populated details
feedbackSchema.virtual('guestDetails', {
  ref: 'User',
  localField: 'guestId',
  foreignField: '_id',
  justOne: true
});

feedbackSchema.virtual('roomDetails', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

feedbackSchema.virtual('bookingDetails', {
  ref: 'Booking',
  localField: 'bookingId',
  foreignField: '_id',
  justOne: true
});

/**
 * Get average rating for a room (approved reviews only)
 * @param {mongoose.Types.ObjectId | string} roomId
 * @returns {Promise<Object>} { average: Number|null, count: Number }
 */
feedbackSchema.statics.getAverageRating = async function (roomId) {
  const roomObjectId = typeof roomId === 'string' ? new mongoose.Types.ObjectId(roomId) : roomId;
  const result = await this.aggregate([
    { $match: { roomId: roomObjectId, status: 'approved' } },
    { $group: { _id: '$roomId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (!result || result.length === 0) return { average: null, count: 0 };
  return { average: parseFloat(result[0].avgRating.toFixed(2)), count: result[0].count };
};

/**
 * Get recent reviews (approved and public by default)
 * @param {Number} limit
 * @returns {Promise<Array>} recent review documents populated with guest/room/booking
 */
feedbackSchema.statics.getRecentReviews = async function (limit = 10) {
  const reviews = await this.find({ status: 'approved', isPublic: true })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('guestId', 'name email')
    .populate('roomId', 'roomNumber type')
    .populate('bookingId', 'checkInDate checkOutDate')
    .lean();

  return reviews;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
