/**
 * routes/analytics.js
 * 
 * Express routes for URL analytics and click statistics.
 * Maps endpoints to their respective controller functions.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAnalytics,
  getClickHistory,
  getDailyClicks,
} = require('../controllers/analyticsController');

// All analytics routes are protected
router.use(authMiddleware);

// @route   GET /api/analytics/:urlId
// @desc    Get full analytics for a URL
router.get('/:urlId', getAnalytics);

// @route   GET /api/analytics/:urlId/clicks
// @desc    Get paginated click history
router.get('/:urlId/clicks', getClickHistory);

// @route   GET /api/analytics/:urlId/daily
// @desc    Get daily click trends (for charts)
router.get('/:urlId/daily', getDailyClicks);

module.exports = router;
