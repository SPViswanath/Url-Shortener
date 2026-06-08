/**
 * Click.js
 * 
 * Mongoose model for tracking URL clicks.
 * Stores analytics data such as timestamp, IP, user agent, location, and referrer.
 */
const mongoose = require('mongoose');

/**
 * Schema definition for a Click event.
 */
const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ip: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  city: {
    type: String,
    default: 'Unknown',
  },
});

module.exports = mongoose.model('Click', clickSchema);
