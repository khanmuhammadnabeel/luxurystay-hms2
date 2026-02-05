const { verifyToken } = require('../utils/jwt');
const socketHelper = require('../utils/socketHelper');  // Add this import

function initializeSocketEvents(io) {
  if (!io) {
    console.error('SocketServer: io instance is required');
    return;
  }

  // Socket authentication middleware using JWT from handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token
        || (socket.handshake?.headers?.authorization && socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        // Allow unauthenticated connections but mark as guest
        socket.user = { role: 'guest' };
        return next();
      }

      const decoded = verifyToken(token);
      if (!decoded) return next(new Error('Authentication error'));

      socket.user = decoded; // attach user info

      // Join role-based rooms for server-side broadcasting
      if (decoded.role === 'admin') socket.join('admins');
      if (decoded.role === 'staff') socket.join('staff');
      if (decoded.role === 'housekeeping') socket.join('housekeeping');

      return next();
    } catch (err) {
      console.error('SocketServer auth middleware error:', err);
      return next(new Error('Authentication error'));
    }
  });

  // Central connection handler (app-level events)
  io.on('connection', (socket) => {
    console.log(`SocketServer: connection established - id=${socket.id} user=${socket.user ? socket.user.userId : 'guest'}`);

    // Allow clients to join room-specific channels
    socket.on('join_room', ({ roomId } = {}) => {
      try {
        const roomName = `room_${roomId}`;
        socket.join(roomName);
        console.log('join_room:', { socketId: socket.id, room: roomName });
      } catch (err) {
        console.error('join_room error:', err);
      }
    });

    socket.on('leave_room', ({ roomId } = {}) => {
      try {
        const roomName = `room_${roomId}`;
        socket.leave(roomName);
        console.log('leave_room:', { socketId: socket.id, room: roomName });
      } catch (err) {
        console.error('leave_room error:', err);
      }
    });

    // Room status change (e.g., available, occupied, cleaning)
    socket.on('room_status_change', async (payload = {}) => {
      try {
        const { roomId, newStatus } = payload;
        console.log('Event: room_status_change', { socketId: socket.id, roomId, newStatus, user: socket.user });
        socketHelper.emitRoomStatus(roomId, newStatus);  // Use socketHelper
      } catch (err) {
        console.error('Error handling room_status_change:', err);
      }
    });

    // New booking created
    socket.on('new_booking', async (bookingData = {}) => {
      try {
        console.log('Event: new_booking', { socketId: socket.id, bookingData, user: socket.user });
        socketHelper.notifyNewBooking(bookingData);  // Use socketHelper
      } catch (err) {
        console.error('Error handling new_booking:', err);
      }
    });

    // Guest check-in
    socket.on('check_in', async (payload = {}) => {
      try {
        const { roomId, guestName } = payload;
        console.log('Event: check_in', { socketId: socket.id, roomId, guestName, user: socket.user });
        socketHelper.notifyCheckIn(roomId, guestName);  // Use socketHelper
        // Notify clients in the room as well
        io.to(`room_${roomId}`).emit('check_in', { roomId, guestName, timestamp: new Date() });
      } catch (err) {
        console.error('Error handling check_in:', err);
      }
    });

    // Guest check-out
    socket.on('check_out', async (payload = {}) => {
      try {
        const { roomId, invoiceData } = payload;
        console.log('Event: check_out', { socketId: socket.id, roomId, invoiceData, user: socket.user });
        // Notify admin/staff and the room
        io.to('admins').emit('check_out', { roomId, invoiceData });
        io.to(`room_${roomId}`).emit('check_out', { roomId, invoiceData });
      } catch (err) {
        console.error('Error handling check_out:', err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`SocketServer: disconnected - id=${socket.id} reason=${reason}`);
    });
  });
}

// Export only initializeSocketEvents
module.exports = {
  initializeSocketEvents
};
