const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
} = require('../controllers/urlController');

// All URL routes are protected
router.use(authMiddleware);

// @route   POST /api/urls
// @desc    Create a new short URL
router.post('/', createUrl);

// @route   GET /api/urls
// @desc    Get all URLs for logged-in user
router.get('/', getUserUrls);

// @route   GET /api/urls/:id
// @desc    Get single URL by ID
router.get('/:id', getUrlById);

// @route   PUT /api/urls/:id
// @desc    Update destination URL or expiry (Bonus)
router.put('/:id', updateUrl);

// @route   DELETE /api/urls/:id
// @desc    Delete a short URL
router.delete('/:id', deleteUrl);

module.exports = router;
