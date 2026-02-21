const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');  // Added for guest names
const socketHelper = require('../utils/socketHelper');

/**
 * Get all bookings
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    return res.json({ success: true, data: bookings, message: 'Bookings retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a single booking by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    return res.json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create new booking with validation (room availability, price calculation)
 * Emits a new booking notification via socketHelper (non-blocking)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.createBooking = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, numberOfGuests } = req.body;

    // Coerce roomId to Number — frontend sends it as a string
    const roomId = Number(req.body.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ success: false, error: 'Invalid room ID' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (room.status !== 'Available') {
      return res.status(400).json({ success: false, error: 'Room is not available for booking' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, error: 'Check-out date must be after check-in date' });
    }

    const overlappingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ success: false, error: 'Room is already booked for the selected dates' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.price;

    const bookingData = {
      roomId,                             // already a Number (coerced above)
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestName: req.body.guestName || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      numberOfGuests: Number(numberOfGuests) || 1,
      totalAmount,
      paymentMethod: req.body.paymentMethod || 'hotel',
      paymentStatus: req.body.paymentStatus || 'pending',
      specialRequests: req.body.specialRequests || '',
      ...(req.body.guestId ? { guestId: req.body.guestId } : {})
    };

    const booking = await Booking.create(bookingData);

    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });

    // Notify via sockets (non-blocking)
    try {
      const notified = socketHelper.notifyNewBooking(booking);
      if (!notified) console.warn('Socket: notifyNewBooking returned false');
      // also emit room status change
      const emitted = socketHelper.emitRoomStatus(roomId, 'Occupied');
      if (!emitted) console.warn('Socket: emitRoomStatus returned false');
    } catch (socketErr) {
      console.error('Socket error (createBooking):', socketErr);
    }

    return res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update booking status
 * If status becomes 'checked-in', update room status and emit room status via socket
 * If status becomes 'checked-out', update room status accordingly
 * If status becomes 'cancelled', free the room and emit availability
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    try {
      if (status === 'checked-in') {
        await Room.findByIdAndUpdate(booking.roomId, { status: 'Occupied' });
        // emit room status via socket
        const emitted = socketHelper.emitRoomStatus(booking.roomId, 'Occupied');
        if (!emitted) console.warn('Socket: emitRoomStatus returned false (checked-in)');

        // Notify housekeeping about check-in with guest name
        try {
          let guestName = 'Guest';
          // Get actual guest name from User model
          if (booking.guestId) {
            const user = await User.findById(booking.guestId).select('name');
            if (user && user.name) {
              guestName = user.name;
            }
          }
          socketHelper.notifyCheckIn(booking.roomId, guestName);
        } catch (sErr) {
          console.error('Socket notifyCheckIn failed:', sErr);
        }

      } else if (status === 'checked-out') {
        // Set room to Cleaning (housekeeping will later mark as Available)
        await Room.findByIdAndUpdate(booking.roomId, { status: 'Cleaning' });
        const emitted = socketHelper.emitRoomStatus(booking.roomId, 'Cleaning');
        if (!emitted) console.warn('Socket: emitRoomStatus returned false (checked-out)');

      } else if (status === 'cancelled') {
        await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
        const emitted = socketHelper.emitRoomStatus(booking.roomId, 'Available');
        if (!emitted) console.warn('Socket: emitRoomStatus returned false (cancelled)');
      }
    } catch (socketErr) {
      console.error('Socket error (updateBookingStatus):', socketErr);
    }

    return res.json({ success: true, data: booking, message: `Booking status updated to ${status}` });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete/cancel a booking
 * Frees the room and emits 'Available' status via socket
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' });
    await Booking.findByIdAndDelete(req.params.id);

    try {
      const emitted = socketHelper.emitRoomStatus(booking.roomId, 'Available');
      if (!emitted) console.warn('Socket: emitRoomStatus returned false (deleteBooking)');
    } catch (socketErr) {
      console.error('Socket error (deleteBooking):', socketErr);
    }

    return res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};