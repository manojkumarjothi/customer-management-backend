const { Attendance, User } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { diffMinutes, addMinutes } = require('../utils/dateHelpers');
const { AppError } = require('../middlewares/errorHandler');

const STANDARD_MINUTES = 8 * 60;
const OVERTIME_THRESHOLD = STANDARD_MINUTES;

async function clockIn(req, res, next) {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let att = await Attendance.findOne({ employee: employeeId, date: today });
    if (att && att.clockIn) {
      throw new AppError('Already clocked in today', 400);
    }
    if (!att) att = await Attendance.create({ employee: employeeId, date: today });
    att.clockIn = new Date();
    att.location = req.body.location;
    att.ip = req.ip || req.connection && req.connection.remoteAddress;
    await att.save();
    const populated = await Attendance.findById(att._id).populate('employee', 'name email employeeId');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function clockOut(req, res, next) {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const att = await Attendance.findOne({ employee: employeeId, date: today });
    if (!att || !att.clockIn) {
      throw new AppError('Clock in first', 400);
    }
    if (att.clockOut) {
      throw new AppError('Already clocked out today', 400);
    }
    att.clockOut = new Date();
    const minutes = diffMinutes(att.clockOut, att.clockIn);
    att.overtimeMinutes = Math.max(0, minutes - OVERTIME_THRESHOLD);
    await att.save();
    const populated = await Attendance.findById(att._id).populate('employee', 'name email employeeId');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.from) filter.date = filter.date || {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date = filter.date || {};
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const [data, total] = await Promise.all([
      Attendance.find(filter).populate('employee', 'name email employeeId').sort(sort).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const att = await Attendance.findById(req.params.id).populate('employee', 'name email employeeId');
    if (!att) throw new AppError('Attendance not found', 404);
    if (req.user.role === 'EMPLOYEE' && att.employee._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    res.status(200).json({ success: true, data: att });
  } catch (err) {
    next(err);
  }
}

async function approveTimesheet(req, res, next) {
  try {
    const att = await Attendance.findById(req.params.id);
    if (!att) throw new AppError('Attendance not found', 404);
    att.approvedBy = req.user._id;
    await att.save();
    const populated = await Attendance.findById(att._id).populate('employee', 'name email employeeId').populate('approvedBy', 'name email');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

module.exports = { clockIn, clockOut, list, getOne, approveTimesheet };
