const MaintenanceRequest = require('../models/MaintenanceRequest');
const Room = require('../models/Room');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const socketHelper = require('../utils/socketHelper');

/**
 * @desc    Create a new maintenance request
 * @route   POST /api/maintenance/requests
 * @access  Private (all authenticated users)
 */
exports.createRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { roomId, issueType, description, images } = req.body;
    const reportedBy = req.user.userId;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Create request
    const requestData = {
      roomId,
      reportedBy,
      issueType: issueType || 'other',
      description: description.trim(),
      status: 'reported',
      images: images || []
    };

    const request = await MaintenanceRequest.create(requestData);
    
    // Populate for response
    const populatedRequest = await MaintenanceRequest.findById(request._id)
      .populate('reportedBy', 'name email role')
      .populate('roomDetails', 'roomNumber type status');

    // Emit room status update
    socketHelper.emitRoomStatus(roomId, 'Maintenance');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });

  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating maintenance request'
    });
  }
};

/**
 * @desc    Get all maintenance requests with filters
 * @route   GET /api/maintenance/requests
 * @access  Private (admin, manager, housekeeping)
 */
exports.getRequests = async (req, res) => {
  try {
    const { status, issueType, roomId, reportedBy, assignedTo, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;
    if (roomId) filter.roomId = roomId;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch requests
    const requests = await MaintenanceRequest.find(filter)
      .populate('reportedBy', 'name email role')
      .populate('assignedUserDetails', 'name email role')
      .populate('roomDetails', 'roomNumber type status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MaintenanceRequest.countDocuments(filter);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching maintenance requests'
    });
  }
};

/**
 * @desc    Update a maintenance request
 * @route   PUT /api/maintenance/requests/:id
 * @access  Private (admin, manager, housekeeping)
 */
exports.updateRequest = async (req, res) => {
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

    // Find request
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    // Authorization check
    if (role === 'housekeeping' && request.assignedTo?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Validate assignedTo if provided
    if (updates.assignedTo) {
      const user = await User.findById(updates.assignedTo);
      if (!user || user.role !== 'housekeeping') {
        return res.status(400).json({
          success: false,
          message: 'Can only assign to housekeeping staff'
        });
      }
    }

    // Update request
    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('reportedBy', 'name email role')
    .populate('assignedUserDetails', 'name email role')
    .populate('roomDetails', 'roomNumber type status');

    // Emit socket event if status changed
    if (updates.status && updates.status !== request.status) {
      const roomStatus = updates.status === 'resolved' ? 'Available' : 'Maintenance';
      socketHelper.emitRoomStatus(request.roomId, roomStatus);
    }

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating maintenance request'
    });
  }
};

/**
 * @desc    Get maintenance statistics
 * @route   GET /api/maintenance/stats
 * @access  Private (admin, manager)
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await MaintenanceRequest.getStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching maintenance statistics'
    });
  }
};