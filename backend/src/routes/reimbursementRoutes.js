const express = require('express');
const { body, param, query } = require('express-validator');
const reimbursementController = require('../controllers/reimbursementController');
const { auth, roleCheck, validate, createUploader } = require('../middlewares');

const router = express.Router();

router.use(auth);

const receiptsUpload = createUploader({ subdir: 'receipts', fieldName: 'receipts', maxCount: 5 });
router.post(
  '/',
  receiptsUpload,
  [body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'), body('description').optional().trim()],
  validate,
  reimbursementController.submit
);

router.get(
  '/',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Paid']), query('employee').optional().isMongoId()],
  validate,
  reimbursementController.list
);

router.get('/:id', param('id').isMongoId(), validate, reimbursementController.getOne);
router.patch(
  '/:id/action',
  roleCheck('ADMIN', 'MANAGER'),
  param('id').isMongoId(),
  body('action').isIn(['approve', 'reject', 'paid']),
  body('rejectionReason').optional().trim(),
  validate,
  reimbursementController.approveOrReject
);

module.exports = router;
