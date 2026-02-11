const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Service name must be at least 3 characters'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['food', 'laundry', 'spa', 'transport', 'other'],
      message: 'Category must be one of: food, laundry, spa, transport, or other'
    },
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
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
serviceSchema.index({ category: 1 });
serviceSchema.index({ available: 1 });

// ===== PRE-SAVE HOOKS =====
/**
 * Auto-update updatedAt timestamp on every save
 */
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ===== STATIC METHODS =====
/**
 * Find services by category
 */
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ name: 1 });
};

/**
 * Find all available services
 */
serviceSchema.statics.findAvailable = function() {
  return this.find({ available: true }).sort({ category: 1, name: 1 });
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
