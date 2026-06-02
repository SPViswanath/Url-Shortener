const { nanoid } = require('nanoid');

/**
 * Generates a unique short code for URL shortening
 * Uses nanoid to create a URL-safe, unique 7-character string
 * 
 * @param {number} length - Length of the short code (default: 7)
 * @returns {string} A unique short code
 */
const generateCode = (length = 7) => {
  return nanoid(length);
};

module.exports = generateCode;
