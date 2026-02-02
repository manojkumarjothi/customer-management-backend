/**
 * RefreshToken model - stores refresh tokens for JWT rotation.
 * Used for session management and token revocation.
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    device: { type: String },
    ip: { type: String },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL optional; we also check on use

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
