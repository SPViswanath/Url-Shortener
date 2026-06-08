/**
 * routes/redirect.js
 * 
 * Express route for handling URL redirection.
 * Receives the short code and redirects to the original destination.
 */
const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const Url = require('../models/Url');
const Click = require('../models/Click');

/**
 * @route   GET /:shortCode
 * @desc    Redirect to original URL + log click analytics
 * @access  Public
 *
 * This performs a server-side 302 redirect (mandatory requirement).
 * On each visit it:
 *   1. Looks up the short code in the database
 *   2. Checks if the link is active and not expired
 *   3. Logs the click with device/browser info (ua-parser-js)
 *   4. Increments the click counter
 *   5. Redirects the user to the original URL
 */
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the URL by short code
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Check if link is active
    if (!url.isActive) {
      return res.status(410).json({ message: 'This link has been deactivated' });
    }

    // Check if link has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: 'This link has expired' });
    }

    // ─── Log Click Analytics ───────────────────────────────
    // Parse User-Agent for device/browser info
    const parser = new UAParser(req.headers['user-agent']);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    // Get visitor IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.connection?.remoteAddress ||
               req.ip ||
               '';

    // Parse Geolocation
    const geo = geoip.lookup(ip) || {};
    const country = geo.country || 'Unknown';
    const city = geo.city || 'Unknown';

    // Create click record (non-blocking — don't await)
    Click.create({
      urlId: url._id,
      timestamp: new Date(),
      ip: ip,
      userAgent: req.headers['user-agent'] || '',
      browser: browserInfo.name || 'Unknown',
      os: osInfo.name || 'Unknown',
      device: deviceInfo.type || 'desktop',
      referrer: req.headers['referer'] || req.headers['referrer'] || 'Direct',
      country: country,
      city: city
    }).then(() => {
      // Emit socket event to clients viewing this URL's analytics
      const io = req.app.get('io');
      if (io) {
        io.to(url._id.toString()).emit('new_click', { urlId: url._id });
      }
    }).catch((err) => console.error('Click logging error:', err));

    // Increment click count (non-blocking)
    Url.updateOne({ _id: url._id }, { $inc: { clickCount: 1 } })
      .catch((err) => console.error('Click count update error:', err));

    // ─── 302 Redirect ──────────────────────────────────────
    return res.redirect(302, url.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ message: 'Server error during redirect' });
  }
});

module.exports = router;
