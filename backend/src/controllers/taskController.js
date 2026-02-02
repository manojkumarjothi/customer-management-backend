/**
 * Task controller - CRUD, bulk, status update, comments, attachments.
 */

const { Task } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middlewares/errorHandler');
const { getFileUrl } = require('../middlewares/upload');

async function createTask(req, res, next) {
  try {
    const { title, description, assignedTo, priority, deadline, project } = req.body;
    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || undefined,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : undefined,
      project: project || undefined,
    });
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function listTasks(req, res, next) {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.user.role === 'EMPLOYEE') filter.assignedTo = req.user._id;
    const [data, total] = await Promise.all([
      Task.find(filter).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'name').sort(sort).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'name').populate('comments.user', 'name email');
    if (!task) throw new AppError('Task not found', 404);
    if (req.user.role === 'EMPLOYEE' && task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new AppError('Insufficient permissions', 403);
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const { title, description, assignedTo, priority, status, deadline, project, progressPercent } = req.body;
    if (title != null) task.title = title;
    if (description != null) task.description = description;
    if (assignedTo != null) task.assignedTo = assignedTo;
    if (priority != null) task.priority = priority;
    if (status != null) task.status = status;
    if (deadline != null) task.deadline = new Date(deadline);
    if (project != null) task.project = project;
    if (progressPercent != null) task.progressPercent = Math.min(100, Math.max(0, progressPercent));
    await task.save();
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'name');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const { status } = req.body;
    if (!['ToDo', 'InProgress', 'Done'].includes(status)) throw new AppError('Invalid status', 400);
    task.status = status;
    await task.save();
    res.status(200).json({ success: true, data: { _id: task._id, status: task.status } });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    res.status(200).json({ success: true, data: { _id: task._id, deleted: true } });
  } catch (err) {
    next(err);
  }
}

async function bulkUpdateStatus(req, res, next) {
  try {
    const { taskIds, status } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0 || !['ToDo', 'InProgress', 'Done'].includes(status)) {
      throw new AppError('taskIds array and valid status required', 400);
    }
    const result = await Task.updateMany({ _id: { $in: taskIds } }, { $set: { status } });
    res.status(200).json({ success: true, data: { modified: result.modifiedCount, status } });
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const { text } = req.body;
    if (!text || !String(text).trim()) throw new AppError('Comment text required', 400);
    task.comments.push({ user: req.user._id, text: String(text).trim() });
    await task.save();
    const populated = await Task.findById(task._id).populate('comments.user', 'name email');
    res.status(201).json({ success: true, data: populated.comments });
  } catch (err) {
    next(err);
  }
}

async function addAttachment(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    if (!req.files || req.files.length === 0) throw new AppError('No files uploaded', 400);
    req.files.forEach((f) => {
      task.attachments.push({ name: f.originalname, url: getFileUrl(f.filename, 'attachments') });
    });
    await task.save();
    res.status(201).json({ success: true, data: task.attachments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  bulkUpdateStatus,
  addComment,
  addAttachment,
};
