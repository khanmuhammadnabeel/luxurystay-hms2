const mongoose = require('mongoose');
const Room = require('./Room');
const User = require('./User');

const maintenanceRequestSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    ref: 'Room',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required']
  },
  issueType: {
    type: String,
    enum: {
      values: ['plumbing', 'electrical', 'furniture', 'appliance', 'other'],
      message: 'Issue type must be plumbing, electrical, furniture, appliance, or other'
    },
    default: 'other'
  },
  description: {
    type: String,
    required: [true, 'Description of the issue is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['reported', 'assigned', 'in_progress', 'resolved'],
      message: 'Status must be reported, assigned, in_progress, or resolved'
    },
    default: 'reported'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (urls) {
        return urls.every(url => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        });
      },
      message: 'All image URLs must be valid URLs'
    }
  },
  resolvedAt: {
    type: Date
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

maintenanceRequestSchema.index({ roomId: 1, status: 1 });
maintenanceRequestSchema.index({ reportedBy: 1 });
maintenanceRequestSchema.index({ issueType: 1 });
maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ createdAt: -1 });

maintenanceRequestSchema.virtual('roomDetails', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.virtual('reporterDetails', {
  ref: 'User',
  localField: 'reportedBy',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.virtual('assignedUserDetails', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

maintenanceRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = Date.now();
  }

  next();
});

maintenanceRequestSchema.pre('save', async function (next) {
  if (this.isModified('status')) {
    const roomStatusMap = {
      'reported': 'Maintenance',
      'assigned': 'Maintenance',
      'in_progress': 'Maintenance',
      'resolved': 'Available'
    };

    if (roomStatusMap[this.status]) {
      try {
        await Room.findByIdAndUpdate(
          this.roomId,
          { status: roomStatusMap[this.status] },
          { new: true }
        );
      } catch (err) {
        console.error('Failed to update room status:', err);
      }
    }
  }
  next();
});

maintenanceRequestSchema.methods.assign = async function (userId) {
  if (this.status === 'resolved') {
    throw new Error('Cannot assign a resolved maintenance request');
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'housekeeping') {
    throw new Error('Can only assign to housekeeping staff');
  }

  this.assignedTo = userId;
  this.status = 'assigned';
  return this.save();
};

maintenanceRequestSchema.methods.startWork = function () {
  if (this.status !== 'assigned') {
    throw new Error('Only assigned requests can be started');
  }
  this.status = 'in_progress';
  return this.save();
};

maintenanceRequestSchema.methods.resolve = function () {
  if (this.status !== 'in_progress') {
    throw new Error('Only in-progress requests can be resolved');
  }
  this.status = 'resolved';
  this.resolvedAt = Date.now();
  return this.save();
};

maintenanceRequestSchema.methods.addImages = function (imageUrls = []) {
  if (!Array.isArray(imageUrls)) {
    throw new Error('Images must be an array');
  }
  this.images = [...new Set([...this.images, ...imageUrls])];
  return this.save();
};

maintenanceRequestSchema.methods.toJSON = function () {
  const obj = this.toObject();

  const convertId = (id) => id ? id.toString() : id;

  return {
    id: convertId(obj._id),
    roomId: convertId(obj.roomId),
    reportedBy: convertId(obj.reportedBy),
    issueType: obj.issueType,
    description: obj.description,
    status: obj.status,
    assignedTo: convertId(obj.assignedTo),
    images: obj.images,
    resolvedAt: obj.resolvedAt,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

maintenanceRequestSchema.statics.findByRoomId = function (roomId) {
  return this.find({ roomId })
    .populate('reportedBy')
    .populate('assignedUserDetails')
    .populate('roomDetails')
    .sort({ createdAt: -1 });
};

maintenanceRequestSchema.statics.findPendingRequests = function () {
  return this.find({ status: 'reported' })
    .populate('reporterDetails')
    .populate('roomDetails')
    .sort({ createdAt: 1 });
};

maintenanceRequestSchema.statics.findActiveRequests = function () {
  return this.find({ status: { $in: ['assigned', 'in_progress'] } })
    .populate('assignedUserDetails')
    .populate('roomDetails')
    .sort({ createdAt: -1 });
};

maintenanceRequestSchema.statics.findByAssignedTo = function (userId) {
  return this.find({ assignedTo: userId, status: { $ne: 'resolved' } })
    .populate('roomDetails')
    .populate('reporterDetails')
    .sort({ createdAt: 1 });
};

maintenanceRequestSchema.statics.findByIssueType = function (issueType) {
  return this.find({ issueType })
    .populate('assignedUserDetails')
    .populate('roomDetails')
    .sort({ createdAt: -1 });
};

maintenanceRequestSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return {
    byStatus: stats.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    })),
    total
  };
};

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;