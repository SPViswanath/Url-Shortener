/**
 * auth.js
 * 
 * Authentication middleware for Express.
 * Verifies JWT tokens from cookies or Authorization headers to protect routes.
 */
const jwt = require('jsonwebtoken');

/**
 * Auth Middleware
 * Reads JWT from:
 *   1. httpOnly cookie (browser) — primary
 *   2. Authorization header (Postman/API) — fallback
 * Sets req.userId for downstream controllers
 */
const authMiddleware = (req, res, next) => {
  try {
    // Try cookie first, then Authorization header
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
