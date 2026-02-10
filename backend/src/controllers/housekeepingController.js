const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const socketHelper = require('../utils/socketHelper');

/**
 * @desc    Create a new housekeeping task
 * @route   POST /api/housekeeping/tasks
 * @access  Private (admin, manager, receptionist)
 */
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { roomId, assignedTo, taskType, priority, scheduledDate, notes } = req.body;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Verify user exists and has housekeeping role
    const user = await User.findById(assignedTo);
    if (!user || user.role !== 'housekeeping') {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must be housekeeping staff'
      });
    }

    // Create task
    const taskData = {
      roomId,
      assignedTo,
      taskType: taskType || 'cleaning',
      priority: priority || 'medium',
      status: 'pending',
      notes: notes || '',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    };

    const task = await HousekeepingTask.create(taskData);
    
    // Populate for response
    const populatedTask = await HousekeepingTask.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('roomDetails', 'roomNumber type status');

    // Emit room status update via existing socket method
    socketHelper.emitRoomStatus(roomId, 'Cleaning');

    res.status(201).json({
      success: true,
      data: populatedTask
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
};

/**
 * @desc    Get all housekeeping tasks with filters
 * @route   GET /api/housekeeping/tasks
 * @access  Private (admin, manager, housekeeping)
 */
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, roomId, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (roomId) filter.roomId = roomId;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch tasks
    const tasks = await HousekeepingTask.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('roomDetails', 'roomNumber type status')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await HousekeepingTask.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
};

/**
 * @desc    Update a housekeeping task
 * @route   PUT /api/housekeeping/tasks/:id
 * @access  Private (admin, manager, housekeeping)
 */
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;
    const { userId, role } = req.user;

    // Find task
    const task = await HousekeepingTask.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Authorization check
    if (role === 'housekeeping' && task.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Update task
    const updatedTask = await HousekeepingTask.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role')
     .populate('roomDetails', 'roomNumber type status');

    // Emit socket event if status changed
    if (updates.status && updates.status !== task.status) {
      socketHelper.emitRoomStatus(task.roomId, updates.status === 'verified' ? 'Available' : 'Cleaning');
    }

    res.json({
      success: true,
      data: updatedTask
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
};

/**
 * @desc    Get housekeeping statistics
 * @route   GET /api/housekeeping/stats
 * @access  Private (admin, manager)
 */
exports.getStats = async (req, res) => {
  try {
    const [byStatus, byPriority, urgentCount] = await Promise.all([
      // Tasks by status
      HousekeepingTask.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Tasks by priority
      HousekeepingTask.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      // Urgent tasks
      HousekeepingTask.countDocuments({ priority: 'urgent', status: { $ne: 'verified' } })
    ]);

    const total = await HousekeepingTask.countDocuments();

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        urgent: urgentCount
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};