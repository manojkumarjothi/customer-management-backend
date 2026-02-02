/**
 * Role-based access control middleware.
 * Use after auth middleware. Example: roleCheck('ADMIN', 'MANAGER')
 */

const { AppError } = require('./errorHandler');

function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

module.exports = roleCheck;
