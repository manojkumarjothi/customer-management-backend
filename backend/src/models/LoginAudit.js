/**
 * LoginAudit model - logs login attempts (IP, device, time) for security.
 */

const mongoose = require('mongoose');

const loginAuditSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: { type: String },
    device: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginAudit', loginAuditSchema);
