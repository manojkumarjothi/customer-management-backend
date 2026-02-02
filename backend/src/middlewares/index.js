/**
 * Middleware exports.
 */

module.exports = {
  auth: require('./auth').auth,
  optionalAuth: require('./auth').optionalAuth,
  roleCheck: require('./roleCheck'),
  validate: require('./validate'),
  errorHandler: require('./errorHandler').errorHandler,
  notFound: require('./errorHandler').notFound,
  AppError: require('./errorHandler').AppError,
  createUploader: require('./upload').createUploader,
  singleUpload: require('./upload').singleUpload,
  getFileUrl: require('./upload').getFileUrl,
  auditLog: require('./auditLogger').auditLog,
  auditOnSuccess: require('./auditLogger').auditOnSuccess,
  ipRestrict: require('./ipRestrict'),
};
