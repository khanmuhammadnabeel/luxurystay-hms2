const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceOrder = require('../models/ServiceOrder');
const HousekeepingTask = require('../models/HousekeepingTask');
const MaintenanceRequest = require('../models/MaintenanceRequest');

/**
 * Get complete system overview with key metrics
 * GET /api/admin/overview
 */
exports.getSystemOverview = asyncHandler(async (req, res) => {
  try {
    // Aggregate data from multiple sources
    const totalBookings = await Booking.countDocuments();
    const activeGuests = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'checked-in'] } 
    });
    
    // Calculate today's revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysPayments = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    const revenueToday = todaysPayments.length > 0 ? todaysPayments[0].totalRevenue : 0;

    // Count pending requests
    const pendingServiceRequests = await ServiceRequest.countDocuments({ 
      status: { $in: ['pending', 'confirmed'] } 
    });
    const pendingMaintenanceRequests = await MaintenanceRequest.countDocuments({ 
      status: 'reported' 
    });
    const pendingHousekeepingTasks = await HousekeepingTask.countDocuments({ 
      status: 'pending' 
    });

    // Total rooms and occupancy
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    // Total users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const overviewData = {
      totalBookings,
      activeGuests,
      revenueToday,
      totalRooms,
      occupiedRooms,
      occupancyRate: parseFloat(occupancyRate),
      pendingRequests: {
        serviceRequests: pendingServiceRequests,
        maintenanceRequests: pendingMaintenanceRequests,
        housekeepingTasks: pendingHousekeepingTasks
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: overviewData,
      message: 'System overview retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all users with filtering and pagination
 * GET /api/admin/users
 * Query params: role, isActive, search, page, limit
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update user role (admin only cannot be demoted)
 * PUT /api/admin/users/:id/role
 * Body: { role: string }
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role provided'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent demotion of last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot demote the last admin user. Assign another admin first.'
        });
      }
    }

    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get financial overview and trends
 * GET /api/admin/financial
 */
exports.getFinancialOverview = asyncHandler(async (req, res) => {
  try {
    // Today's revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Pending payments
    const pendingPayments = await Payment.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Payment methods breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const financialData = {
      todaysRevenue: todaysRevenue.length > 0 ? todaysRevenue[0].total : 0,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].total : 0,
      monthlyTrends: monthlyRevenue,
      paymentMethodBreakdown
    };

    res.json({
      success: true,
      data: financialData,
      message: 'Financial overview retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create or update room details
 * POST /api/admin/rooms - Create new room
 * PUT /api/admin/rooms/:id - Update existing room
 */
exports.manageRoom = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, type, price, status, description, amenities } = req.body;

    // Validate required fields
    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        error: 'Room number is required'
      });
    }

    if (id) {
      // Update existing room
      const room = await Room.findById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Check room number uniqueness if changed
      if (roomNumber !== room.roomNumber) {
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
          return res.status(400).json({
            success: false,
            error: 'Room number already exists'
          });
        }
      }

      // Update fields
      if (roomNumber) room.roomNumber = roomNumber;
      if (type) room.type = type;
      if (price) room.price = price;
      if (status) room.status = status;
      if (description !== undefined) room.description = description;
      if (amenities) room.amenities = amenities;

      await room.save();

      res.json({
        success: true,
        data: room,
        message: 'Room updated successfully'
      });
    } else {
      // Create new room
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          error: 'Room number already exists'
        });
      }

      const newRoom = new Room({
        roomNumber,
        type: type || 'Standard',
        price: price || 0,
        status: status || 'Available',
        description: description || '',
        amenities: amenities || []
      });

      await newRoom.save();

      res.status(201).json({
        success: true,
        data: newRoom,
        message: 'Room created successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get staff performance metrics
 * GET /api/admin/staff-performance
 */
exports.getStaffPerformance = asyncHandler(async (req, res) => {
  try {
    // Get housekeeping staff performance
    const housekeepingPerformance = await HousekeepingTask.aggregate([
      {
        $match: { assignedTo: { $exists: true } }
      },
      {
        $group: {
          _id: '$assignedTo',
          tasksCompleted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'verified'] }, 1, 0]
            }
          },
          tasksPending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          tasksInProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
            }
          },
          totalTasks: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails'
        }
      },
      {
        $unwind: '$staffDetails'
      },
      {
        $project: {
          staffId: '$_id',
          staffName: '$staffDetails.name',
          staffRole: '$staffDetails.role',
          tasksCompleted: 1,
          tasksPending: 1,
          tasksInProgress: 1,
          totalTasks: 1
        }
      }
    ]);

    // Get service request handling performance by assigned staff
    const servicePerformance = await ServiceRequest.aggregate([
      {
        $match: { assignedTo: { $exists: true } }
      },
      {
        $group: {
          _id: '$assignedTo',
          requestsCompleted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          requestsPending: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'confirmed']] }, 1, 0]
            }
          },
          totalRequests: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails'
        }
      },
      {
        $unwind: '$staffDetails'
      },
      {
        $project: {
          staffId: '$_id',
          staffName: '$staffDetails.name',
          staffRole: '$staffDetails.role',
          requestsCompleted: 1,
          requestsPending: 1,
          totalRequests: 1
        }
      }
    ]);

    const performanceData = {
      housekeepingStaff: housekeepingPerformance,
      serviceStaff: servicePerformance
    };

    res.json({
      success: true,
      data: performanceData,
      message: 'Staff performance metrics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get system activity logs from recent activities
 * GET /api/admin/logs
 */
exports.getSystemLogs = asyncHandler(async (req, res) => {
  try {
    const logLimit = parseInt(req.query.limit) || 50;

    // Gather recent activities from all models
    const logs = [];

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('guestId', 'name email')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .limit(logLimit)
      .select('guestId roomId status createdAt');

    recentBookings.forEach(booking => {
      logs.push({
        timestamp: booking.createdAt,
        type: 'BOOKING',
        action: `Guest ${booking.guestId?.name} - ${booking.status}`,
        details: `Room ${booking.roomId?.roomNumber}`,
        severity: 'info'
      });
    });

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('invoiceId', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .limit(logLimit)
      .select('amount status paymentMethod createdAt');

    recentPayments.forEach(payment => {
      logs.push({
        timestamp: payment.createdAt,
        type: 'PAYMENT',
        action: `Payment ${payment.status} - ${payment.amount}`,
        details: `Method: ${payment.paymentMethod}`,
        severity: payment.status === 'completed' ? 'success' : 'warning'
      });
    });

    // Recent maintenance requests
    const recentMaintenance = await MaintenanceRequest.find()
      .populate('roomId', 'roomNumber')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(logLimit)
      .select('roomId reportedBy status issueType createdAt');

    recentMaintenance.forEach(maintenance => {
      logs.push({
        timestamp: maintenance.createdAt,
        type: 'MAINTENANCE',
        action: `${maintenance.issueType} - ${maintenance.status}`,
        details: `Room ${maintenance.roomId?.roomNumber} reported by ${maintenance.reportedBy?.name}`,
        severity: maintenance.status === 'reported' ? 'warning' : 'info'
      });
    });

    // Recent housekeeping tasks
    const recentHousekeeping = await HousekeepingTask.find()
      .populate('roomId', 'roomNumber')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(logLimit)
      .select('roomId assignedTo status taskType createdAt');

    recentHousekeeping.forEach(task => {
      logs.push({
        timestamp: task.createdAt,
        type: 'HOUSEKEEPING',
        action: `${task.taskType} - ${task.status}`,
        details: `Room ${task.roomId?.roomNumber} assigned to ${task.assignedTo?.name}`,
        severity: task.status === 'pending' ? 'warning' : 'info'
      });
    });

    // Sort all logs by timestamp (descending)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return top limit items
    const paginatedLogs = logs.slice(0, logLimit);

    res.json({
      success: true,
      data: paginatedLogs,
      totalLogs: logs.length,
      message: 'System logs retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});