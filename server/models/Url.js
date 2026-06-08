/**
 * Url.js
 * 
 * Mongoose model for storing shortened URLs.
 * Tracks the original URL, short code, custom alias, click count, and expiration date.
 */
const mongoose = require('mongoose');

/**
 * Schema definition for a URL document.
 */
const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customAlias: {
      type: String,
      default: null,
      sparse: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if URL has expired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Ensure virtuals are included in JSON output
urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
