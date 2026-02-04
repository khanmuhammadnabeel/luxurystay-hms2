const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Standard', 'Deluxe', 'Suite'],
    default: 'Standard'
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Available'
  },
  description: { 
    type: String, 
    trim: true
  },
  amenities: { 
    type: [String], 
    default: []
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;