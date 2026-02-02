/**
 * Attendance model - clock-in/clock-out with location and overtime.
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    clockIn: { type: Date },
    clockOut: { type: Date },
    location: { type: String },
    ip: { type: String },
    overtimeMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ['Present', 'HalfDay', 'Absent', 'Leave', 'Holiday', 'WeekOff'], default: 'Present' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
