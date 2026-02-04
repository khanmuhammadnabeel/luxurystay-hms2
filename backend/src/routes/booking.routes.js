const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, numberOfGuests } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    if (room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        error: 'Room is not available for booking'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    const overlappingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        error: 'Room is already booked for the selected dates'
      });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price;

    const bookingData = {
      ...req.body,
      totalAmount,
      checkInDate: checkIn,
      checkOutDate: checkOut
    };

    const booking = await Booking.create(bookingData);

    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (status === 'checked-in') {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'Occupied' });
    } else if (status === 'checked-out') {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'Cleaning' });
    } else if (status === 'cancelled') {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
    }
    
    res.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
    await Booking.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;