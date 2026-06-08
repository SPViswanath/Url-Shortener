/**
 * routes/urls.js
 * 
 * Express routes for managing shortened URLs.
 * Maps endpoints to their respective controller functions.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/auth');
const {
  createUrl,
  bulkCreateUrls,
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

// @route   POST /api/urls/bulk
// @desc    Bulk create URLs from CSV
router.post('/bulk', upload.single('file'), bulkCreateUrls);

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
