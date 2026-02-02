/**
 * Auth service - login, refresh token, forgot/reset password, session.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, RefreshToken, LoginAudit } = require('../models');
const { sendPasswordResetEmail } = require('./emailService');
const { AppError } = require('../middlewares/errorHandler');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const RESET_EXPIRY_MIN = parseInt(process.env.PASSWORD_RESET_EXPIRY || '30', 10);

function generateAccessToken(userId) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

async function login(email, password, meta = {}) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }
  const match = await user.comparePassword(password);
  if (!match) {
    await LoginAudit.create({ user: user._id, success: false, ...meta });
    throw new AppError('Invalid email or password', 401);
  }

  await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
  await LoginAudit.create({ user: user._id, success: true, ...meta });

  const accessToken = generateAccessToken(user._id);
  const refreshTokenValue = generateRefreshToken();
  const decoded = jwt.decode(accessToken);
  const expiresAt = new Date(decoded.exp * 1000);
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    token: refreshTokenValue,
    user: user._id,
    expiresAt: refreshExpiresAt,
    device: meta.device,
    ip: meta.ip,
  });

  const userObj = user.toObject();
  delete userObj.password;
  return {
    user: userObj,
    accessToken,
    refreshToken: refreshTokenValue,
    expiresIn: expiresAt,
  };
}

async function refresh(refreshTokenValue, meta = {}) {
  const stored = await RefreshToken.findOne({
    token: refreshTokenValue,
    isRevoked: false,
  }).populate('user');
  if (!stored || !stored.user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  if (new Date() > stored.expiresAt) {
    await RefreshToken.updateOne({ _id: stored._id }, { isRevoked: true });
    throw new AppError('Refresh token expired', 401);
  }
  const user = stored.user;
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshTokenValue = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.updateOne({ _id: stored._id }, { isRevoked: true });
  await RefreshToken.create({
    token: newRefreshTokenValue,
    user: user._id,
    expiresAt: refreshExpiresAt,
    device: meta.device,
    ip: meta.ip,
  });

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return {
    user: userObj,
    accessToken,
    refreshToken: newRefreshTokenValue,
    expiresIn: new Date(Date.now() + 15 * 60 * 1000),
  };
}

async function forgotPassword(email) {
  const user = await User.findOne({ email }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) {
    return { message: 'If the email exists, a reset link will be sent.' };
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + RESET_EXPIRY_MIN * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetLink);

  return { message: 'If the email exists, a reset link will be sent.' };
}

async function resetPassword(token, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password reset successful.' };
}

async function revokeRefreshToken(token) {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
  return { message: 'Logged out.' };
}

module.exports = {
  login,
  refresh,
  forgotPassword,
  resetPassword,
  revokeRefreshToken,
  generateAccessToken,
};
