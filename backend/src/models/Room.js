const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  _id: { type: Number },
  name: { type: String, required: true },
  nameUr: { type: String },
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential', 'Villa', 'Classic', 'Bungalow', 'Penthouse', 'Family'],
    default: 'Standard'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Available'
  },
  description: {
    type: String,
    trim: true
  },
  fullDescription: { type: String, trim: true },
  fullDescriptionUr: { type: String, trim: true },
  location: { type: String, default: 'Main Building' },
  locationUr: { type: String, default: 'مین بلڈنگ' },
  sleeps: { type: Number, default: 2 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  amenities: [
    {
      icon: { type: String },
      label: { type: String },
      labelUr: { type: String }
    }
  ],
  reviews: [
    {
      user: { type: String },
      rating: { type: Number },
      comment: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;