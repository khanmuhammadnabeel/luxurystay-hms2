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
  },

  // Housekeeping task created notification
  emitTaskCreated: (taskData) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (task created)');
      return false;
    }

    try {
      const payload = {
        ...taskData,
        timestamp: new Date().toISOString(),
        type: 'TASK_CREATED'
      };

      // Emit to housekeeping staff and admins
      ioInstance.to('housekeeping').emit('task_created', payload);
      ioInstance.to('admins').emit('task_created', payload);
      console.log('Socket Helper: Task created event emitted', { taskId: taskData.taskId });
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  },

  // Housekeeping task updated notification
  emitTaskUpdated: (taskData) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (task updated)');
      return false;
    }

    try {
      const payload = {
        ...taskData,
        timestamp: new Date().toISOString(),
        type: 'TASK_UPDATED'
      };

      // Emit to housekeeping staff, admins, and room-specific channel
      ioInstance.to('housekeeping').emit('task_updated', payload);
      ioInstance.to('admins').emit('task_updated', payload);
      ioInstance.to(`room_${taskData.roomId}`).emit('task_updated', payload);
      console.log('Socket Helper: Task updated event emitted', { taskId: taskData.taskId });
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  },

  // Maintenance request created notification
  emitMaintenanceCreated: (maintenanceData) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (maintenance created)');
      return false;
    }

    try {
      const payload = {
        ...maintenanceData,
        timestamp: new Date().toISOString(),
        type: 'MAINTENANCE_CREATED'
      };

      // Emit to admins (managers are included in admins group for notifications)
      ioInstance.to('admins').emit('maintenance_created', payload);
      ioInstance.to(`room_${maintenanceData.roomId}`).emit('maintenance_created', payload);
      console.log('Socket Helper: Maintenance created event emitted', { requestId: maintenanceData.requestId });
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  },

  // Maintenance request updated notification
  emitMaintenanceUpdated: (maintenanceData) => {
    if (!ioInstance) {
      console.warn('Socket Helper: IO not initialized yet (maintenance updated)');
      return false;
    }

    try {
      const payload = {
        ...maintenanceData,
        timestamp: new Date().toISOString(),
        type: 'MAINTENANCE_UPDATED'
      };

      // Emit to admins (managers are included in admins group) and staff
      ioInstance.to('admins').emit('maintenance_updated', payload);
      ioInstance.to(`room_${maintenanceData.roomId}`).emit('maintenance_updated', payload);
      console.log('Socket Helper: Maintenance updated event emitted', { requestId: maintenanceData.requestId });
      return true;
    } catch (error) {
      console.error('Socket Helper Error:', error.message);
      return false;
    }
  }
};

module.exports = socketHelper;