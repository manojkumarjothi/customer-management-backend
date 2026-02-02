const { Leave } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { dateRangesOverlap } = require('../utils/dateHelpers');
const { AppError } = require('../middlewares/errorHandler');

async function detectConflict(employeeId, fromDate, toDate, excludeId) {
  const filter = { employee: employeeId, status: 'Approved' };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Leave.find(filter).lean();
  for (const l of existing) {
    if (dateRangesOverlap(fromDate, toDate, l.fromDate, l.toDate)) return true;
  }
  return false;
}

async function apply(req, res, next) {
  try {
    const employeeId = (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') && req.body.employeeId ? req.body.employeeId : req.user._id;
    const fromDate = new Date(req.body.fromDate);
    const toDate = new Date(req.body.toDate);
    if (toDate < fromDate) throw new AppError('toDate must be after fromDate', 400);
    const conflict = await detectConflict(employeeId, fromDate, toDate, null);
    const leave = await Leave.create({
      employee: employeeId,
      leaveType: req.body.leaveType,
      fromDate,
      toDate,
      reason: req.body.reason,
      status: 'Pending',
      conflictDetected: conflict,
    });
    const populated = await Leave.findById(leave._id).populate('employee', 'name email employeeId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const [data, total] = await Promise.all([
      Leave.find(filter).populate('employee', 'name email employeeId').populate('approvedBy', 'name email').sort(sort).skip(skip).limit(limit).lean(),
      Leave.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'name email employeeId').populate('approvedBy', 'name email');
    if (!leave) throw new AppError('Leave not found', 404);
    if (req.user.role === 'EMPLOYEE' && leave.employee._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
}

async function approveOrReject(req, res, next) {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) throw new AppError('Leave not found', 404);
    if (leave.status !== 'Pending') throw new AppError('Leave already processed', 400);
    const action = req.body.action;
    if (action === 'approve') {
      const conflict = await detectConflict(leave.employee.toString(), leave.fromDate, leave.toDate, leave._id);
      leave.status = 'Approved';
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      leave.conflictDetected = conflict;
    } else if (action === 'reject') {
      leave.status = 'Rejected';
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      leave.rejectionReason = req.body.rejectionReason;
    } else {
      throw new AppError('action must be approve or reject', 400);
    }
    await leave.save();
    const populated = await Leave.findById(leave._id).populate('employee', 'name email employeeId').populate('approvedBy', 'name email');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function leaveBalance(req, res, next) {
  try {
    const userId = req.params.userId || req.user._id.toString();
    if (req.user.role === 'EMPLOYEE' && userId !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const approved = await Leave.find({
      employee: userId,
      status: 'Approved',
      fromDate: { $gte: new Date(year, 0, 1) },
      toDate: { $lte: new Date(year, 11, 31, 23, 59, 59) },
    }).lean();
    let totalDays = 0;
    approved.forEach((l) => {
      const from = new Date(l.fromDate);
      const to = new Date(l.toDate);
      totalDays += Math.ceil((to - from) / (24 * 60 * 60 * 1000)) + 1;
    });
    res.status(200).json({
      success: true,
      data: { year, totalDaysUsed: totalDays, casualRemaining: Math.max(0, 12 - totalDays), earnedRemaining: Math.max(0, 24 - totalDays) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { apply, list, getOne, approveOrReject, leaveBalance };
