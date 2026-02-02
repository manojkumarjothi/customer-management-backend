/**
 * Reimbursement model - expense claims with receipts and approval.
 */

const mongoose = require('mongoose');

const REIMB_STATUSES = ['Pending', 'Approved', 'Rejected', 'Paid'];

const receiptSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  amount: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

const reimbursementSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    receipts: [receiptSchema],
    status: { type: String, enum: REIMB_STATUSES, default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
module.exports.REIMB_STATUSES = REIMB_STATUSES;
