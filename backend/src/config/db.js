const mongoose = require('mongoose');

async function connectDB() {
  // CHECK 1: Prevent duplicate connections
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(uri);
    
    console.log('MongoDB connected successfully');
    
    return mongoose.connection;
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;