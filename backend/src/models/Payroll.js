/**
 * Payroll model - salary records with PDF path.
 */

const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: mongoose.Schema.Types.Mixed, default: {} },
    deductions: { type: mongoose.Schema.Types.Mixed, default: {} },
    grossSalary: { type: Number },
    netSalary: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    pdfPath: { type: String },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
