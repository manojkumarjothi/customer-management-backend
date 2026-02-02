const { Reimbursement } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middlewares/errorHandler');
const { getFileUrl } = require('../middlewares/upload');

async function submit(req, res, next) {
  try {
    const employeeId = req.user._id;
    const amount = Number(req.body.amount);
    const description = req.body.description;
    const data = { employee: employeeId, amount, description, status: 'Pending' };
    if (req.files && req.files.length) {
      data.receipts = req.files.map((f) => ({ name: f.originalname, url: getFileUrl(f.filename, 'receipts') }));
    } else if (req.body.receipts && Array.isArray(req.body.receipts)) {
      data.receipts = req.body.receipts;
    }
    const reimb = await Reimbursement.create(data);
    const populated = await Reimbursement.findById(reimb._id).populate('employee', 'name email employeeId');
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
      Reimbursement.find(filter).populate('employee', 'name email employeeId').populate('approvedBy', 'name email').sort(sort).skip(skip).limit(limit).lean(),
      Reimbursement.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const reimb = await Reimbursement.findById(req.params.id).populate('employee', 'name email employeeId').populate('approvedBy', 'name email');
    if (!reimb) throw new AppError('Reimbursement not found', 404);
    if (req.user.role === 'EMPLOYEE' && reimb.employee._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    res.status(200).json({ success: true, data: reimb });
  } catch (err) {
    next(err);
  }
}

async function approveOrReject(req, res, next) {
  try {
    const reimb = await Reimbursement.findById(req.params.id);
    if (!reimb) throw new AppError('Reimbursement not found', 404);
    if (reimb.status !== 'Pending') throw new AppError('Already processed', 400);
    const action = req.body.action;
    if (action === 'approve') {
      reimb.status = 'Approved';
      reimb.approvedBy = req.user._id;
      reimb.approvedAt = new Date();
    } else if (action === 'reject') {
      reimb.status = 'Rejected';
      reimb.approvedBy = req.user._id;
      reimb.approvedAt = new Date();
      reimb.rejectionReason = req.body.rejectionReason;
    } else if (action === 'paid') {
      reimb.status = 'Paid';
      reimb.paidAt = new Date();
    } else {
      throw new AppError('action must be approve, reject, or paid', 400);
    }
    await reimb.save();
    const populated = await Reimbursement.findById(reimb._id).populate('employee', 'name email employeeId').populate('approvedBy', 'name email');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, list, getOne, approveOrReject };
