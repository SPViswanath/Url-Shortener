/**
 * User.js
 * 
 * Mongoose model for user accounts.
 * Stores user details and authentication credentials (password or Google ID).
 */
const mongoose = require('mongoose');

/**
 * Schema definition for a User document.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if googleId is not present
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
