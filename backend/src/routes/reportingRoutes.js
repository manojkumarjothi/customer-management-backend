const express = require('express');
const { query } = require('express-validator');
const reportingController = require('../controllers/reportingController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.get(
  '/attendance',
  [query('from').optional().isISO8601(), query('to').optional().isISO8601(), query('employeeId').optional().isMongoId()],
  validate,
  reportingController.attendanceReport
);

router.get(
  '/payroll',
  [query('year').optional().isInt(), query('month').optional().isInt({ min: 1, max: 12 }), query('employeeId').optional().isMongoId()],
  validate,
  reportingController.payrollReport
);

router.get(
  '/leave',
  [query('from').optional().isISO8601(), query('to').optional().isISO8601(), query('employeeId').optional().isMongoId(), query('status').optional().isIn(['Pending', 'Approved', 'Rejected'])],
  validate,
  reportingController.leaveReport
);

module.exports = router;
