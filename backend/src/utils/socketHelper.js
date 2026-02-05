// Used by controllers to emit socket events safely

let ioInstance = null;

const socketHelper = {
  // Called by server.js after Socket.io initialization
  setIO: (io) => {
    ioInstance = io;
    console.log('Socket Helper: IO instance set');
  },
  
  // Safe getter - returns null if not initialized
  getIO: () => {
    return ioInstance;
  },
  
  // Room status updates
  emitRoomStatus: (roomId, status) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (room status)');
      return false;
    }
    
    try {
      const payload = { 
        roomId, 
        status, 
        timestamp: new Date().toISOString(),
        type: 'ROOM_STATUS_UPDATE'
      };
      
      ioInstance.to(`room_${roomId}`).emit('room_status_update', payload);
      console.log('Socket Helper: Room status emitted', { roomId, status });
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  },
  
  // New booking notifications
  notifyNewBooking: (bookingData) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (new booking)');
      return false;
    }
    
    try {
      ioInstance.to('admins').emit('new_booking', {
        ...bookingData,
        timestamp: new Date().toISOString(),
        type: 'NEW_BOOKING'
      });
      console.log('Socket Helper: New booking notified');
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  },
  
  // Check-in alerts
  notifyCheckIn: (roomId, guestName) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (check-in)');
      return false;
    }
    
    try {
      const payload = { 
        roomId, 
        guestName, 
        timestamp: new Date().toISOString(),
        type: 'CHECK_IN_ALERT' 
      };
      
      ioInstance.to('housekeeping').emit('check_in_alert', payload);
      ioInstance.to(`room_${roomId}`).emit('guest_checked_in', payload);
      console.log('Socket Helper: Check-in alert sent');
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  }
};

module.exports = socketHelper;