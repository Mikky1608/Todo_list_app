// This file handles connecting to our MongoDB database using Mongoose.
// Mongoose is a library that makes it easier to work with MongoDB from Node.js.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try to connect using the URI stored in our .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // If connection fails, log the error and stop the app
    // (there's no point running a to-do app that can't reach its database)
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
