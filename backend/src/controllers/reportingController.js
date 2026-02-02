const { Attendance, Payroll, Leave } = require('../models');
const { getMonthBounds } = require('../utils/dateHelpers');
const { AppError } = require('../middlewares/errorHandler');

async function attendanceReport(req, res, next) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const employeeId = req.query.employeeId;
    const filter = { date: { $gte: from, $lte: to } };
    if (employeeId) filter.employee = employeeId;
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const data = await Attendance.find(filter).populate('employee', 'name email employeeId').sort({ date: -1 }).lean();
    const summary = { totalRecords: data.length, present: data.filter((d) => d.clockIn).length, withOvertime: data.filter((d) => (d.overtimeMinutes || 0) > 0).length };
    res.status(200).json({ success: true, data: { summary, records: data } });
  } catch (err) {
    next(err);
  }
}

async function payrollReport(req, res, next) {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const employeeId = req.query.employeeId;
    const filter = { year };
    if (month) filter.month = month;
    if (employeeId) filter.employee = employeeId;
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const data = await Payroll.find(filter).populate('employee', 'name email employeeId').sort({ month: 1 }).lean();
    const totalNet = data.reduce((a, p) => a + (p.netSalary || 0), 0);
    const totalGross = data.reduce((a, p) => a + (p.grossSalary || p.basicSalary || 0), 0);
    res.status(200).json({ success: true, data: { year, month, summary: { totalNet, totalGross, count: data.length }, records: data } });
  } catch (err) {
    next(err);
  }
}

async function leaveReport(req, res, next) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const employeeId = req.query.employeeId;
    const status = req.query.status;
    const filter = { fromDate: { $gte: from }, toDate: { $lte: to } };
    if (employeeId) filter.employee = employeeId;
    if (status) filter.status = status;
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const data = await Leave.find(filter).populate('employee', 'name email employeeId').populate('approvedBy', 'name email').sort({ fromDate: -1 }).lean();
    const byStatus = { Pending: 0, Approved: 0, Rejected: 0 };
    data.forEach((d) => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
    res.status(200).json({ success: true, data: { summary: byStatus, records: data } });
  } catch (err) {
    next(err);
  }
}

module.exports = { attendanceReport, payrollReport, leaveReport };
