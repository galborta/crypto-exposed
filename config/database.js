const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Log more details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    // Exit with failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error; // Re-throw for development environment
  }
};

module.exports = connectDB; 