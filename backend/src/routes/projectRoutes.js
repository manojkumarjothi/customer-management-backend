const express = require('express');
const { body, param, query } = require('express-validator');
const projectController = require('../controllers/projectController');
const { auth, roleCheck, validate } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.get('/', [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })], validate, projectController.list);

router.post(
  '/',
  roleCheck('ADMIN', 'MANAGER'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('description').optional().trim(),
    body('department').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('dependencies').optional().isArray(),
    body('ganttMetadata').optional(),
  ],
  validate,
  projectController.create
);

router.get('/:id', param('id').isMongoId(), validate, projectController.getOne);
router.get('/:id/gantt', param('id').isMongoId(), validate, projectController.ganttData);

router.patch(
  '/:id',
  param('id').isMongoId(),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('department').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('dependencies').optional().isArray(),
    body('ganttMetadata').optional(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  projectController.update
);

router.delete('/:id', param('id').isMongoId(), validate, projectController.remove);

module.exports = router;
