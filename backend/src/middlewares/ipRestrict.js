/**
 * Optional IP whitelist middleware for admin routes.
 * Set IP_WHITELIST in .env (comma-separated). Empty = allow all.
 */

const { AppError } = require('./errorHandler');

function ipRestrict(req, res, next) {
  const list = process.env.IP_WHITELIST;
  if (!list || list.trim() === '') return next();
  const allowed = list.split(',').map((s) => s.trim()).filter(Boolean);
  const ip = req.ip || req.connection?.remoteAddress || req.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (allowed.length && ip && !allowed.includes(ip)) {
    return next(new AppError('Access denied from this IP', 403));
  }
  next();
}

module.exports = ipRestrict;
