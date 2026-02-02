const express = require('express');
const { param, query } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);

router.get(
  '/',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('employee').optional().isMongoId(), query('from').optional().isISO8601(), query('to').optional().isISO8601()],
  validate,
  attendanceController.list
);

router.get('/:id', param('id').isMongoId(), validate, attendanceController.getOne);
router.post('/:id/approve', roleCheck('ADMIN', 'MANAGER'), param('id').isMongoId(), validate, attendanceController.approveTimesheet);

module.exports = router;
