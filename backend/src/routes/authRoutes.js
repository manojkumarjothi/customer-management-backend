/**
 * Auth routes - login, refresh, forgot/reset password.
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, validate } = require('../middlewares');

const router = express.Router();

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  authController.login
);

// POST /auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').optional(), body('refresh_token').optional()],
  validate,
  authController.refresh
);

// POST /auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  validate,
  authController.forgotPassword
);

// POST /auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.resetPassword
);

// POST /auth/logout (optional - revoke refresh token)
router.post('/logout', authController.logout);

module.exports = router;
