const express = require('express');
const { body, query, param } = require('express-validator');
const announcementController = require('../controllers/announcementController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

// All announcement endpoints require auth
router.use(auth);

// List announcements (role-filtered in controller)
router.get(
  '/',
  [
    query('pinned').optional().isBoolean().withMessage('pinned must be boolean'),
    query('expired').optional().isBoolean().withMessage('expired must be boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive int'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit must be between 1 and 200'),
    query('sort').optional().isString(),
  ],
  validate,
  announcementController.list
);

// Create announcement (Admin/Manager)
router.post(
  '/',
  roleCheck(['ADMIN', 'MANAGER']),
  [
    body('title').notEmpty().isString().withMessage('title is required'),
    body('message').notEmpty().isString().withMessage('message is required'),
    body('visibleTo').optional().isArray().withMessage('visibleTo must be an array'),
    body('visibleTo.*').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE', 'ALL']),
    body('isPinned').optional().isBoolean(),
    body('expiresAt').optional().isISO8601().withMessage('expiresAt must be ISO8601 date'),
  ],
  validate,
  announcementController.create
);

// Get one announcement
router.get('/:id', [param('id').isMongoId()], validate, announcementController.getOne);

// Update announcement (Admin/Manager)
router.patch(
  '/:id',
  roleCheck(['ADMIN', 'MANAGER']),
  [
    param('id').isMongoId(),
    body('title').optional().isString(),
    body('message').optional().isString(),
    body('visibleTo').optional().isArray(),
    body('visibleTo.*').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE', 'ALL']),
    body('isPinned').optional().isBoolean(),
    body('expiresAt').optional().isISO8601(),
  ],
  validate,
  announcementController.update
);

// Delete announcement (Admin/Manager)
router.delete('/:id', roleCheck(['ADMIN', 'MANAGER']), [param('id').isMongoId()], validate, announcementController.remove);

module.exports = router;

