/**
 * validators.js
 * 
 * Express-validator middleware chains for route input validation.
 * Ensures data integrity and security before reaching the controllers.
 */
const { body } = require('express-validator');

/**
 * Validation chains for different routes
 * Using express-validator for backend validation (mandatory requirement)
 */

// Signup validation
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// URL creation validation
const urlValidation = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),

  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Custom alias must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),

  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
];

// URL update validation
const urlUpdateValidation = [
  body('originalUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),

  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

module.exports = {
  signupValidation,
  loginValidation,
  urlValidation,
  urlUpdateValidation,
};
