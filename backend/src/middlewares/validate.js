/**
 * Request validation middleware using express-validator.
 * Runs validation and returns 400 with errors if invalid.
 */

const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => (e.path ? `${e.path}: ${e.msg}` : e.msg));
    return next(new AppError(messages.join('; '), 400));
  }
  next();
}

module.exports = validate;
