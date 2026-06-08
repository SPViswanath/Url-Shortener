/**
 * Database configuration file.
 * Handles the connection to the MongoDB database using Mongoose.
 */
const mongoose = require('mongoose');

/**
 * Establishes an asynchronous connection to the MongoDB database.
 * Uses the MONGO_URI environment variable.
 * If the connection fails, the process exits with status code 1.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
