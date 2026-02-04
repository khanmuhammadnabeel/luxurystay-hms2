const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const router = express.Router();

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET check room availability for dates
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'checkIn and checkOut dates are required as query parameters'
      });
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
    
    res.json({
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST create room
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;