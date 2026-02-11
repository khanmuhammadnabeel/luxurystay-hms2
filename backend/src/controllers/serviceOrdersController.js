const { validationResult } = require('express-validator');
const ServiceOrder = require('../models/ServiceOrder');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const socketHelper = require('../utils/socketHelper');

/**
 * @desc    Create service order from service request
 * @route   POST /api/service-orders
 * @access  Private (staff, admin, manager)
 */
exports.createServiceOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { serviceRequestId, notes } = req.body;
    const preparedBy = req.user.userId;
    const role = req.user.role;

    // Authorization: only staff roles
    if (!['admin', 'manager', 'receptionist', 'housekeeping'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Verify service request exists
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check for existing order
    const existingOrder = await ServiceOrder.findOne({ serviceRequestId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order already exists for this request'
      });
    }

    // Create order
    const serviceOrder = new ServiceOrder({
      serviceRequestId,
      preparedBy,
      status: 'received',
      notes: notes || ''
    });

    await serviceOrder.save();

    // Populate for response
    const populatedOrder = await ServiceOrder.findById(serviceOrder._id)
      .populate({
        path: 'serviceRequestId',
        populate: [
          { path: 'guestDetails', select: 'name email' },
          { path: 'roomDetails', select: 'roomNumber' },
          { path: 'serviceDetails', select: 'name category price' }
        ]
      })
      .populate('preparedBy', 'name email role');

    // Update service request status
    serviceRequest.status = 'confirmed';
    await serviceRequest.save();

    // Emit socket event
    socketHelper.emitRoomStatus(serviceRequest.roomId, 'Order Created');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
};

/**
 * @desc    Get active service orders
 * @route   GET /api/service-orders/active
 * @access  Private (staff, admin, manager)
 */
exports.getActiveOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const { userId, role } = req.user;

    // Authorization
    if (!['admin', 'manager', 'receptionist', 'housekeeping'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Build filter
    const filter = { status: { $ne: 'delivered' } };
    if (status) filter.status = status;

    // Non-admin staff see only their orders
    if (!['admin', 'manager'].includes(role)) {
      filter.preparedBy = userId;
    }

    const orders = await ServiceOrder.find(filter)
      .populate({
        path: 'serviceRequestId',
        populate: [
          { path: 'guestDetails', select: 'name email' },
          { path: 'roomDetails', select: 'roomNumber' },
          { path: 'serviceDetails', select: 'name category' }
        ]
      })
      .populate('preparedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get active orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/service-orders/:id/status
 * @access  Private (staff, admin, manager)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user;

    // Find order
    const order = await ServiceOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization
    if (!['admin', 'manager', 'receptionist', 'housekeeping'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Non-admin staff can only update their own orders
    if (!['admin', 'manager'].includes(role) && order.preparedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own orders'
      });
    }

    // Update
    const updatedOrder = await ServiceOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'serviceRequestId',
      populate: [
        { path: 'guestDetails', select: 'name email' },
        { path: 'roomDetails', select: 'roomNumber' },
        { path: 'serviceDetails', select: 'name' }
      ]
    })
    .populate('preparedBy', 'name email');

    // Emit socket event
    const serviceRequest = updatedOrder.serviceRequestId;
    if (serviceRequest) {
      socketHelper.emitRoomStatus(serviceRequest.roomId, `Order ${status}`);
    }

    res.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
};