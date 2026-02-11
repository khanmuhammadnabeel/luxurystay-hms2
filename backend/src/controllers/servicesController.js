const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Room = require('../models/Room');
const User = require('../models/User');
const socketHelper = require('../utils/socketHelper');

/**
 * @desc    Get all available services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    filter.available = true;

    const services = await Service.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching services'
    });
  }
};

/**
 * @desc    Request a service
 * @route   POST /api/services/request
 * @access  Private (guest)
 */
exports.requestService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { serviceId, roomId, quantity, specialInstructions } = req.body;
    const guestId = req.user.userId;

    // Verify service
    const service = await Service.findById(serviceId);
    if (!service || !service.available) {
      return res.status(400).json({
        success: false,
        message: 'Service not available'
      });
    }

    // Verify room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Calculate total price
    const totalPrice = service.price * (quantity || 1);

    // Create service request
    const serviceRequest = new ServiceRequest({
      guestId,
      roomId,
      serviceId,
      quantity: quantity || 1,
      specialInstructions,
      totalPrice,
      status: 'pending'
    });

    await serviceRequest.save();

    // Populate for response
    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('guestDetails', 'name email')
      .populate('roomDetails', 'roomNumber type')
      .populate('serviceDetails', 'name category price');

    // Emit socket event (use existing admin room)
    socketHelper.emitRoomStatus(roomId, 'Service Requested');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });

  } catch (error) {
    console.error('Request service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating service request'
    });
  }
};

/**
 * @desc    Get current user's service requests
 * @route   GET /api/services/my-requests
 * @access  Private (guest)
 */
exports.getMyServiceRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const guestId = req.user.userId;

    const filter = { guestId };
    if (status) filter.status = status;

    const requests = await ServiceRequest.find(filter)
      .populate('serviceDetails', 'name category price')
      .populate('roomDetails', 'roomNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your requests'
    });
  }
};

/**
 * @desc    Update service request status
 * @route   PUT /api/services/requests/:id/status
 * @access  Private (staff, admin)
 */
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const { userId, role } = req.user;

    // Find request
    const request = await ServiceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Authorization: staff can only update if assigned to them
    if (role === 'staff' && request.assignedTo?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update
    const updates = { status };
    if (assignedTo) updates.assignedTo = assignedTo;

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('guestDetails', 'name email')
    .populate('roomDetails', 'roomNumber')
    .populate('serviceDetails', 'name price');

    // Emit socket event
    socketHelper.emitRoomStatus(request.roomId, `Service ${status}`);

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating request status'
    });
  }
};