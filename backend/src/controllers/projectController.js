const { Project } = require('../models');
const { getPagination, textSearchFilter, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middlewares/errorHandler');

async function create(req, res, next) {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      department: req.body.department,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      dependencies: req.body.dependencies || [],
      ganttMetadata: req.body.ganttMetadata,
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = { isActive: req.query.active !== 'false' };
    Object.assign(filter, textSearchFilter(req.query, 'search', ['name', 'department']));
    const [data, total] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Project.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).populate('dependencies', 'name startDate endDate');
    if (!project) throw new AppError('Project not found', 404);
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);
    const allowed = ['name', 'description', 'department', 'startDate', 'endDate', 'dependencies', 'ganttMetadata', 'isActive'];
    allowed.forEach((k) => {
      if (req.body[k] === undefined) return;
      if (k === 'startDate' || k === 'endDate') project[k] = req.body[k] ? new Date(req.body[k]) : undefined;
      else project[k] = req.body[k];
    });
    await project.save();
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!project) throw new AppError('Project not found', 404);
    res.status(200).json({ success: true, data: { _id: project._id, isActive: false } });
  } catch (err) {
    next(err);
  }
}

async function ganttData(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).select('name startDate endDate ganttMetadata dependencies').populate('dependencies', 'name startDate endDate');
    if (!project) throw new AppError('Project not found', 404);
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, remove, ganttData };
