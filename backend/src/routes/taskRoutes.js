/**
 * Task routes - CRUD, bulk status, comments, attachments.
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const taskController = require('../controllers/taskController');
const { auth, roleCheck, validate, createUploader } = require('../middlewares');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['ToDo', 'InProgress', 'Done']),
    query('priority').optional().isIn(['High', 'Medium', 'Low']),
  ],
  validate,
  taskController.listTasks
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').optional().trim(),
    body('assignedTo').optional().isMongoId(),
    body('priority').optional().isIn(['High', 'Medium', 'Low']),
    body('deadline').optional().isISO8601(),
    body('project').optional().isMongoId(),
  ],
  validate,
  taskController.createTask
);

router.get('/:id', param('id').isMongoId(), validate, taskController.getTask);
router.patch(
  '/:id',
  param('id').isMongoId(),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('assignedTo').optional().isMongoId(),
    body('priority').optional().isIn(['High', 'Medium', 'Low']),
    body('status').optional().isIn(['ToDo', 'InProgress', 'Done']),
    body('deadline').optional().isISO8601(),
    body('project').optional().isMongoId(),
    body('progressPercent').optional().isInt({ min: 0, max: 100 }),
  ],
  validate,
  taskController.updateTask
);

router.patch('/:id/status', param('id').isMongoId(), body('status').isIn(['ToDo', 'InProgress', 'Done']), validate, taskController.updateTaskStatus);

router.delete('/:id', param('id').isMongoId(), validate, taskController.deleteTask);

router.post('/bulk/status', body('taskIds').isArray(), body('status').isIn(['ToDo', 'InProgress', 'Done']), validate, taskController.bulkUpdateStatus);

router.post('/:id/comments', param('id').isMongoId(), body('text').trim().notEmpty(), validate, taskController.addComment);

const uploadAttachments = createUploader({ subdir: 'attachments', fieldName: 'files', maxCount: 5 });
router.post('/:id/attachments', param('id').isMongoId(), uploadAttachments, taskController.addAttachment);

module.exports = router;
