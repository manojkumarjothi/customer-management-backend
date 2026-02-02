/**
 * Auth controller - login, refresh, forgot/reset password.
 */

const authService = require('../services/authService');
const { AppError } = require('../middlewares/errorHandler');

function getMeta(req) {
  return {
    ip: req.ip || req.connection?.remoteAddress || req.get('x-forwarded-for')?.split(',')[0]?.trim(),
    device: req.get('user-agent') || req.body?.device,
    userAgent: req.get('user-agent'),
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }
    const meta = getMeta(req);
    const result = await authService.login(email, password, meta);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.body.refreshToken || req.body.refresh_token || req.headers['x-refresh-token'];
    if (!token) {
      throw new AppError('Refresh token required', 400);
    }
    const meta = getMeta(req);
    const result = await authService.refresh(token, meta);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email required', 400);
    }
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      throw new AppError('Token and new password required', 400);
    }
    const result = await authService.resetPassword(token, password);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.body.refreshToken || req.body.refresh_token || req.headers['x-refresh-token'];
    if (token) {
      await authService.revokeRefreshToken(token);
    }
    res.status(200).json({ success: true, message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, forgotPassword, resetPassword, logout };
