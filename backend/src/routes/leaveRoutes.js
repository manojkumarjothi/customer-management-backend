const express = require('express');
const { body, param, query } = require('express-validator');
const leaveController = require('../controllers/leaveController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [
    body('leaveType').isIn(['Sick', 'Casual', 'Earned', 'Maternity', 'Paternity', 'Unpaid', 'Other']),
    body('fromDate').isISO8601(),
    body('toDate').isISO8601(),
    body('reason').optional().trim(),
    body('employeeId').optional().isMongoId(),
  ],
  validate,
  leaveController.apply
);

router.get(
  '/',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('status').optional().isIn(['Pending', 'Approved', 'Rejected']), query('employee').optional().isMongoId()],
  validate,
  leaveController.list
);

router.get('/balance', leaveController.leaveBalance);
router.get('/balance/:userId', param('userId').isMongoId(), query('year').optional().isInt(), validate, leaveController.leaveBalance);
// :id routes must come after /balance to avoid "balance" being matched as id
router.get('/:id', param('id').isMongoId(), validate, leaveController.getOne);
router.patch('/:id/approve', roleCheck('ADMIN', 'MANAGER'), param('id').isMongoId(), body('action').isIn(['approve', 'reject']), body('rejectionReason').optional().trim(), validate, leaveController.approveOrReject);

module.exports = router;
