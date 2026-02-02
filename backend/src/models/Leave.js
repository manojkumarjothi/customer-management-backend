/**
 * Leave model - leave applications with approval workflow.
 */

const mongoose = require('mongoose');

const LEAVE_TYPES = ['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid', 'Other'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: LEAVE_STATUSES, default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    conflictDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
module.exports.LEAVE_TYPES = LEAVE_TYPES;
module.exports.LEAVE_STATUSES = LEAVE_STATUSES;
