/**
 * urlController.js
 * 
 * Manages URL shortening operations.
 * Includes creating short URLs, bulk imports, retrieving user URLs, and deletion.
 */
const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const Click = require('../models/Click');
const generateCode = require('../utils/generateCode');
const csv = require('csv-parser');
const stream = require('stream');

/**
 * Creates a new shortened URL.
 * Generates a unique short code and links it to the authenticated user.
 * 
 * @param {Object} req - Express request object containing originalUrl, title, expiresAt.
 * @param {Object} res - Express response object.
 */
const createUrl = async (req, res) => { 
  try {
    const { originalUrl, title, expiresAt } = req.body;
    if (!originalUrl || !originalUrl.trim()) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Basic URL validation
    try {
      const urlObj = new URL(originalUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return res.status(400).json({ message: 'URL must start with http:// or https://' });
      }
    } catch {
      return res.status(400).json({ message: 'Please provide a valid URL' });
    }

    // Validate expiry date if provided
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    // Validate that the user hasn't already shortened this URL
    const existingUrl = await Url.findOne({ userId: req.userId, originalUrl: originalUrl.trim() });
    if (existingUrl) {
      return res.status(400).json({ message: 'You have already shortened this destination URL' });
    }

    // Validate that the title is unique for this user (if provided)
    if (title && title.trim()) {
      const existingTitle = await Url.findOne({ userId: req.userId, title: title.trim() });
      if (existingTitle) {
        return res.status(400).json({ message: 'You already have a link with this title' });
      }
    }

    // Generate unique short code
    let shortCode = generateCode();
    // Ensure uniqueness (very unlikely collision with nanoid, but safe)
    while (await Url.findOne({ shortCode })) {
      shortCode = generateCode();
    }

    const url = await Url.create({
      userId: req.userId,
      title: title?.trim() || '',
      originalUrl: originalUrl.trim(),
      shortCode,
      expiresAt: expiresAt || null,
    });

    // Build the full short URL
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    res.status(201).json({
      message: 'Short URL created successfully',
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        clickCount: url.clickCount,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      },
    });
  } catch (err) {
    console.error('Create URL error:', err);
    res.status(500).json({ message: 'Failed to create short URL', error: err.message });
  }
};

/**
 * Processes a CSV file upload to bulk create shortened URLs.
 * Skips invalid or duplicate URLs and creates short codes for valid ones.
 * 
 * @param {Object} req - Express request object containing the CSV file.
 * @param {Object} res - Express response object.
 */
const bulkCreateUrls = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let successCount = 0;
        let skipCount = 0;

        for (const row of results) {
          const originalUrl = row.originalUrl || row.url || row.URL;
          let title = row.title || row.Title || '';

          if (!originalUrl || !originalUrl.trim()) {
            skipCount++;
            continue;
          }

          let formattedUrl = originalUrl.trim();
          
          try {
             if (!/^https?:\/\//i.test(formattedUrl)) {
                 formattedUrl = 'https://' + formattedUrl;
             }
             new URL(formattedUrl);
          } catch {
             skipCount++;
             continue;
          }

          const existingUrl = await Url.findOne({ userId: req.userId, originalUrl: formattedUrl });
          if (existingUrl) {
            skipCount++;
            continue;
          }

          let shortCode = generateCode();
          while (await Url.findOne({ shortCode })) {
            shortCode = generateCode();
          }

          await Url.create({
            userId: req.userId,
            title: title.trim(),
            originalUrl: formattedUrl,
            shortCode,
            expiresAt: null
          });
          
          successCount++;
        }

        res.status(201).json({
          message: 'Bulk import complete',
          data: {
            successCount,
            skipCount,
            totalProcessed: results.length
          }
        });
      })
      .on('error', (error) => {
        return res.status(500).json({ message: 'Failed to parse CSV', error: error.message });
      });
  } catch (err) {
    console.error('Bulk create error:', err);
    res.status(500).json({ message: 'Failed to process bulk upload', error: err.message });
  }
};

/**
 * Retrieves all shortened URLs belonging to the authenticated user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    const baseUrl = process.env.BASE_URL;

    const urlsWithShortUrl = urls.map((url) => ({
      id: url._id,
      title: url.title,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      clickCount: url.clickCount,
      expiresAt: url.expiresAt,
      isExpired: url.isExpired,
      isActive: url.isActive,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));

    res.status(200).json({
      message: 'URLs fetched successfully',
      count: urlsWithShortUrl.length,
      data: urlsWithShortUrl,
    });
  } catch (err) {
    console.error('Get URLs error:', err);
    res.status(500).json({ message: 'Failed to fetch URLs', error: err.message });
  }
};

/**
 * Retrieves a specific URL by its ID, ensuring the user owns it.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getUrlById = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const shortUrl = `${process.env.BASE_URL}/${url.shortCode}`;

    res.status(200).json({
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        clickCount: url.clickCount,
        expiresAt: url.expiresAt,
        isExpired: url.isExpired,
        isActive: url.isActive,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      },
    });
  } catch (err) {
    console.error('Get URL error:', err);
    res.status(500).json({ message: 'Failed to fetch URL', error: err.message });
  }
};

/**
 * Updates a URL's destination, title, or expiry date.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateUrl = async (req, res) => {
  try {
    const { originalUrl, title, expiresAt } = req.body;

    // Find URL owned by user
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Update original URL if provided
    if (originalUrl) {
      try {
        const urlObj = new URL(originalUrl);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          return res.status(400).json({ message: 'URL must start with http:// or https://' });
        }
      } catch {
        return res.status(400).json({ message: 'Please provide a valid URL' });
      }
      url.originalUrl = originalUrl.trim();
    }

    // Update title if provided (allow empty string)
    if (title !== undefined) {
      url.title = title.trim();
    }

    // Update expiry if provided (send null to remove expiry)
    if (expiresAt !== undefined) {
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
      url.expiresAt = expiresAt || null;
    }

    await url.save();

    const shortUrl = `${process.env.BASE_URL}/${url.shortCode}`;

    res.status(200).json({
      message: 'URL updated successfully',
      data: {
        id: url._id,
        title: url.title,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        clickCount: url.clickCount,
        expiresAt: url.expiresAt,
        isExpired: url.isExpired,
        isActive: url.isActive,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update URL error:', err);
    res.status(500).json({ message: 'Failed to update URL', error: err.message });
  }
};

/**
 * Deletes a URL and all its associated click analytics.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Also delete all associated click analytics
    await Click.deleteMany({ urlId: url._id });

    res.status(200).json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('Delete URL error:', err);
    res.status(500).json({ message: 'Failed to delete URL', error: err.message });
  }
};

module.exports = { createUrl, bulkCreateUrls, getUserUrls, getUrlById, updateUrl, deleteUrl };
