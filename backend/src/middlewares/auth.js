/**
 * JWT auth middleware - verifies access token and attaches user to req.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./errorHandler');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      throw new AppError('Access token required', 401);
    }
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      throw new AppError('User not found', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return next(new AppError(err.message, 401));
    }
    next(err);
  }
}

/**
 * Optional auth - sets req.user if valid token present, does not fail if missing.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive) req.user = user;
    next();
  } catch {
    next();
  }
}

module.exports = { auth, optionalAuth };
