const Room = require('../models/Room');
const Booking = require('../models/Booking');
const socketHelper = require('../utils/socketHelper');


/**
 * Get all rooms, sorted by roomNumber
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    return res.json({ success: true, data: rooms, message: 'Rooms retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check room availability for provided dates
 * Uses the same logic as the former route handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, error: 'checkIn and checkOut dates are required as query parameters' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBookings = await Booking.find({
      roomId: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });

    const isAvailable = overlappingBookings.length === 0;

    return res.json({
      success: true,
      data: {
        roomId: req.params.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        isAvailable,
        overlappingBookings: overlappingBookings.length,
        message: isAvailable ? 'Room is available for these dates' : 'Room is not available for these dates'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a single room by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    return res.json({ success: true, data: room });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new room
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json({ success: true, data: room, message: 'Room created successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update a room by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    return res.json({ success: true, data: room, message: 'Room updated successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete a room by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    return res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update room status and emit a socket event (does not let socket errors break API response)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({ success: false, error: 'status field is required in body' });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true, runValidators: true });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Emit socket update, but don't let it break the response
          try {
          socketHelper.emitRoomStatus(req.params.id, newStatus);
          } catch (socketErr) {
          console.error('Socket emit failed in updateRoomStatus:', socketErr);
          }

    return res.json({ success: true, data: room, message: 'Room status updated successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
