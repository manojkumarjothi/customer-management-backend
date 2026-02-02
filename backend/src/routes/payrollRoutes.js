const express = require('express');
const { body, param, query } = require('express-validator');
const payrollController = require('../controllers/payrollController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('employee').optional().isMongoId(),
    query('month').optional().isInt({ min: 1, max: 12 }),
    query('year').optional().isInt(),
  ],
  validate,
  payrollController.list
);

router.post(
  '/generate',
  roleCheck('ADMIN', 'MANAGER'),
  [
    body('employeeId').isMongoId(),
    body('month').isInt({ min: 1, max: 12 }),
    body('year').isInt(),
    body('basicSalary').isFloat({ min: 0 }),
    body('allowances').optional().isObject(),
    body('deductions').optional().isObject(),
  ],
  validate,
  payrollController.generate
);

router.get('/ytd', payrollController.ytdSummary);
router.get('/ytd/:employeeId', param('employeeId').isMongoId(), query('year').optional().isInt(), validate, payrollController.ytdSummary);

router.get('/:id', param('id').isMongoId(), validate, payrollController.getOne);
router.get('/:id/download', param('id').isMongoId(), validate, payrollController.downloadPdf);

module.exports = router;
