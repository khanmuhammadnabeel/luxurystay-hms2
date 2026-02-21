const mongoose = require('mongoose');
const Room = require('./Room');
const User = require('./User');

const housekeepingTaskSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Must assign task to a housekeeping staff member'],
    validate: {
      validator: async function (userId) {
        const user = await User.findById(userId);
        return user && user.role === 'housekeeping';
      },
      message: 'Assigned user must have housekeeping role'
    }
  },
  taskType: {
    type: String,
    enum: {
      values: ['cleaning', 'maintenance', 'inspection'],
      message: 'Task type must be cleaning, maintenance, or inspection'
    },
    default: 'cleaning'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'verified'],
      message: 'Status must be pending, in_progress, completed, or verified'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

housekeepingTaskSchema.index({ roomId: 1, status: 1 });
housekeepingTaskSchema.index({ assignedTo: 1 });
housekeepingTaskSchema.index({ priority: 1 });

housekeepingTaskSchema.virtual('roomDetails', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

housekeepingTaskSchema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

housekeepingTaskSchema.virtual('verifierDetails', {
  ref: 'User',
  localField: 'verifiedBy',
  foreignField: '_id',
  justOne: true
});

housekeepingTaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }

  next();
});

housekeepingTaskSchema.pre('save', async function (next) {
  if (this.isModified('status')) {
    const roomStatusMap = {
      'in_progress': 'Cleaning',
      'completed': 'Cleaning',
      'verified': 'Available'
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

housekeepingTaskSchema.methods.startTask = function () {
  if (this.status !== 'pending') {
    throw new Error('Only pending tasks can be started');
  }
  this.status = 'in_progress';
  return this.save();
};

housekeepingTaskSchema.methods.completeTask = function () {
  if (this.status !== 'in_progress') {
    throw new Error('Only in-progress tasks can be completed');
  }
  this.status = 'completed';
  this.completedAt = Date.now();
  return this.save();
};

housekeepingTaskSchema.methods.verifyTask = function (userId) {
  if (this.status !== 'completed') {
    throw new Error('Only completed tasks can be verified');
  }
  this.status = 'verified';
  this.verifiedBy = userId;
  return this.save();
};

housekeepingTaskSchema.methods.toJSON = function () {
  const obj = this.toObject();

  const convertId = (id) => id ? id.toString() : id;

  return {
    id: convertId(obj._id),
    roomId: convertId(obj.roomId),
    assignedTo: convertId(obj.assignedTo),
    taskType: obj.taskType,
    status: obj.status,
    priority: obj.priority,
    notes: obj.notes,
    scheduledDate: obj.scheduledDate,
    completedAt: obj.completedAt,
    verifiedBy: convertId(obj.verifiedBy),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

housekeepingTaskSchema.statics.findByRoomId = function (roomId) {
  return this.find({ roomId }).populate('assignedTo').populate('roomDetails');
};

housekeepingTaskSchema.statics.findPendingTasks = function (userId) {
  return this.find({ assignedTo: userId, status: 'pending' })
    .populate('roomDetails')
    .sort({ priority: -1, scheduledDate: 1 });
};

housekeepingTaskSchema.statics.findInProgressTasks = function () {
  return this.find({ status: 'in_progress' })
    .populate('assignedUser')
    .populate('roomDetails');
};

housekeepingTaskSchema.statics.findAwaitingVerification = function () {
  return this.find({ status: 'completed' })
    .populate('assignedUser')
    .populate('roomDetails')
    .sort({ completedAt: -1 });
};

housekeepingTaskSchema.statics.findUrgentTasks = function () {
  return this.find({ priority: 'urgent', status: { $ne: 'verified' } })
    .populate('assignedUser')
    .populate('roomDetails')
    .sort({ scheduledDate: 1 });
};

const HousekeepingTask = mongoose.model('HousekeepingTask', housekeepingTaskSchema);

module.exports = HousekeepingTask;