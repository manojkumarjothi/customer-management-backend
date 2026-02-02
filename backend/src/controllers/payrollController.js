const { Payroll, User } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { getMonthBounds } = require('../utils/dateHelpers');
const { generateSalarySlipPDF, getAbsolutePdfPath } = require('../services/pdfService');
const { AppError } = require('../middlewares/errorHandler');
const path = require('path');
const fs = require('fs');

async function generate(req, res, next) {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;
    const employee = await User.findById(employeeId).select('name employeeId');
    if (!employee) throw new AppError('Employee not found', 404);
    const gross = (basicSalary || 0) + Object.values(allowances || {}).reduce((a, b) => a + Number(b), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((a, b) => a + Number(b), 0);
    const netSalary = gross - totalDeductions;
    let payroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (payroll) throw new AppError('Payroll already exists for this month/year', 409);
    payroll = await Payroll.create({
      employee: employeeId,
      basicSalary: basicSalary || 0,
      allowances: allowances || {},
      deductions: deductions || {},
      grossSalary: gross,
      netSalary,
      month,
      year,
    });
    try {
      const pdfPath = await generateSalarySlipPDF(payroll, employee);
      payroll.pdfPath = pdfPath;
      await payroll.save();
    } catch (e) {
      // PDF optional
    }
    const populated = await Payroll.findById(payroll._id).populate('employee', 'name email employeeId');
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
    if (req.query.month) filter.month = parseInt(req.query.month, 10);
    if (req.query.year) filter.year = parseInt(req.query.year, 10);
    if (req.user.role === 'EMPLOYEE') filter.employee = req.user._id;
    const [data, total] = await Promise.all([
      Payroll.find(filter).populate('employee', 'name email employeeId').sort(sort).skip(skip).limit(limit).lean(),
      Payroll.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee', 'name email employeeId department designation');
    if (!payroll) throw new AppError('Payroll not found', 404);
    if (req.user.role === 'EMPLOYEE' && payroll.employee._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    res.status(200).json({ success: true, data: payroll });
  } catch (err) {
    next(err);
  }
}

async function downloadPdf(req, res, next) {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee', 'name employeeId');
    if (!payroll) throw new AppError('Payroll not found', 404);
    if (req.user.role === 'EMPLOYEE' && payroll.employee._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    const absolutePath = getAbsolutePdfPath(payroll.pdfPath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      throw new AppError('PDF not found', 404);
    }
    const filename = `salary-${payroll.employee.employeeId || payroll.employee._id}-${payroll.year}-${String(payroll.month).padStart(2, '0')}.pdf`;
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(absolutePath);
  } catch (err) {
    next(err);
  }
}

async function ytdSummary(req, res, next) {
  try {
    const employeeId = req.params.employeeId || req.user._id.toString();
    if (req.user.role === 'EMPLOYEE' && employeeId !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const payrolls = await Payroll.find({ employee: employeeId, year }).lean();
    const totalNet = payrolls.reduce((a, p) => a + (p.netSalary || 0), 0);
    const totalGross = payrolls.reduce((a, p) => a + (p.grossSalary || p.basicSalary || 0), 0);
    res.status(200).json({
      success: true,
      data: { year, totalNet, totalGross, monthsCount: payrolls.length },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, list, getOne, downloadPdf, ytdSummary };
