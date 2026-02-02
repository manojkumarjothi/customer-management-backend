/**
 * Audit logger middleware - logs sensitive actions to AuditLog collection.
 */

const { AuditLog } = require('../models');

async function auditLog(action, req, target = null, targetId = null, details = null) {
  try {
    if (!req.user) return;
    await AuditLog.create({
      action,
      performedBy: req.user._id,
      target: target || undefined,
      targetId: targetId || undefined,
      details: details || undefined,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    // Don't fail request if audit write fails
    require('../utils/logger').error('Audit log write error:', err);
  }
}

/**
 * Middleware factory: logs when route succeeds (res.json called).
 * Usage: auditOnSuccess('USER_CREATE', 'User')(req, res, next)
 */
function auditOnSuccess(actionName, targetLabel) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (body && (body.success !== false) && body.data) {
        const targetId = body.data._id || body.data.id;
        auditLog(actionName, req, targetLabel, targetId, body.data).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditLog, auditOnSuccess };
