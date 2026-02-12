const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  recipient: {
    email: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true
    },
    name: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required']
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'feedback', 'auth', 'promotional', 'alert', 'report'],
    required: [true, 'Email category is required']
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'],
    default: 'queued'
  },
  tracking: {
    messageId: String,
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    firstOpenedAt: Date,
    lastOpenedAt: Date,
    links: [
      {
        url: String,
        clickedAt: Date,
        clickCount: { type: Number, default: 0 }
      }
    ]
  },
  metadata: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint'
    }
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  attempts: {
    type: Number,
    default: 1
  },
  sentAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
emailLogSchema.index({ 'recipient.email': 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ category: 1 });
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ 'tracking.messageId': 1 }, { sparse: true });

// Ensure virtuals are returned
emailLogSchema.set('toObject', { virtuals: true });
emailLogSchema.set('toJSON', { virtuals: true });

/**
 * Instance method: Track email open
 */
emailLogSchema.methods.trackOpen = function (ip, userAgent) {
  this.tracking.openCount += 1;
  this.tracking.lastOpenedAt = new Date();

  if (!this.tracking.firstOpenedAt) {
    this.tracking.firstOpenedAt = new Date();
  }

  // Update status if not already opened/clicked
  if (this.status !== 'opened' && this.status !== 'clicked') {
    this.status = 'opened';
  }

  return this.save();
};

/**
 * Instance method: Track click on link
 */
emailLogSchema.methods.trackClick = function (url, ip, userAgent) {
  this.tracking.clickCount += 1;

  // Find or create link entry
  const existingLink = this.tracking.links.find(link => link.url === url);
  if (existingLink) {
    existingLink.clickCount += 1;
    existingLink.clickedAt = new Date();
  } else {
    this.tracking.links.push({
      url,
      clickedAt: new Date(),
      clickCount: 1
    });
  }

  // Update status
  if (this.status !== 'clicked') {
    this.status = 'clicked';
  }

  // Ensure opened timestamps are set
  if (!this.tracking.firstOpenedAt) {
    this.tracking.firstOpenedAt = new Date();
  }
  if (!this.tracking.lastOpenedAt) {
    this.tracking.lastOpenedAt = new Date();
  }

  return this.save();
};

/**
 * Static method: Mark email as sent
 */
emailLogSchema.statics.markSent = async function (id, messageId) {
  return this.findByIdAndUpdate(
    id,
    {
      status: 'sent',
      sentAt: new Date(),
      'tracking.messageId': messageId
    },
    { new: true }
  );
};

/**
 * Static method: Mark email as delivered
 */
emailLogSchema.statics.markDelivered = async function (id) {
  return this.findByIdAndUpdate(
    id,
    {
      status: 'delivered',
      deliveredAt: new Date()
    },
    { new: true }
  );
};

/**
 * Static method: Mark email as opened (used by tracking pixel)
 */
emailLogSchema.statics.markOpened = async function (id, ip, userAgent) {
  const log = await this.findById(id);
  if (!log) return null;
  return log.trackOpen(ip, userAgent);
};

/**
 * Static method: Mark link clicked in email
 */
emailLogSchema.statics.markClicked = async function (id, url, ip, userAgent) {
  const log = await this.findById(id);
  if (!log) return null;
  return log.trackClick(url, ip, userAgent);
};

/**
 * Static method: Get email statistics for date range
 */
emailLogSchema.statics.getStats = async function (dateRange = {}) {
  const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = dateRange;

  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          }
        ],
        trackingMetrics: [
          {
            $group: {
              _id: null,
              totalSent: {
                $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
              },
              totalDelivered: {
                $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
              },
              totalOpened: {
                $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] }
              },
              totalClicked: {
                $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] }
              },
              totalFailed: {
                $sum: { $cond: [{ $in: ['$status', ['failed', 'bounced']] }, 1, 0] }
              },
              avgOpenCount: { $avg: '$tracking.openCount' },
              avgClickCount: { $avg: '$tracking.clickCount' }
            }
          }
        ]
      }
    }
  ]);

  return {
    period: { startDate, endDate },
    statusBreakdown: stats[0].byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    categoryBreakdown: stats[0].byCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    metrics: stats[0].trackingMetrics[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalFailed: 0,
      avgOpenCount: 0,
      avgClickCount: 0
    }
  };
};

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
