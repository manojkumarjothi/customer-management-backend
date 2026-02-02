/**
 * User & Employee routes - CRUD, directory, profile.
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  ],
  validate,
  userController.listUsers
);

router.post(
  '/',
  roleCheck('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
    body('employeeId').optional().trim(),
    body('department').optional().trim(),
    body('designation').optional().trim(),
    body('sendEmail').optional().isBoolean(),
  ],
  validate,
  userController.createUser
);

router.get('/:id', param('id').isMongoId(), validate, userController.getUser);

router.patch(
  '/:id',
  param('id').isMongoId(),
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
    body('employeeId').optional().trim(),
    body('department').optional().trim(),
    body('designation').optional().trim(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  userController.updateUser
);

router.post('/:id/deactivate', roleCheck('ADMIN', 'MANAGER'), param('id').isMongoId(), validate, userController.deactivateUser);

router.get('/:userId/profile', param('userId').isMongoId(), validate, userController.getProfile);
router.patch('/:userId/profile', param('userId').isMongoId(), validate, userController.updateProfile);

module.exports = router;
