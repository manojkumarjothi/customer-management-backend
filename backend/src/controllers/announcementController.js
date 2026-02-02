const { Announcement } = require('../models');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middlewares/errorHandler');

function userCanSee(announcement, userRole) {
  if (!announcement.visibleTo || announcement.visibleTo.length === 0) return true;
  return announcement.visibleTo.includes(userRole) || announcement.visibleTo.includes('ALL');
}

async function create(req, res, next) {
  try {
    const announcement = await Announcement.create({
      title: req.body.title,
      message: req.body.message,
      visibleTo: req.body.visibleTo || ['ALL'],
      createdBy: req.user._id,
      isPinned: !!req.body.isPinned,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
    });
    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.pinned !== undefined) filter.isPinned = req.query.pinned === 'true';
    if (req.query.expired === 'false') filter.$or = [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }];
    const [data, total] = await Promise.all([
      Announcement.find(filter).populate('createdBy', 'name email').sort(sort).skip(skip).limit(limit).lean(),
      Announcement.countDocuments(filter),
    ]);
    const filtered = data.filter((a) => userCanSee(a, req.user.role));
    res.status(200).json({ success: true, ...paginatedResponse(filtered, filtered.length, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name email');
    if (!announcement) throw new AppError('Announcement not found', 404);
    if (!userCanSee(announcement, req.user.role)) throw new AppError('Insufficient permissions', 403);
    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new AppError('Announcement not found', 404);
    ['title', 'message', 'visibleTo', 'isPinned', 'expiresAt'].forEach((k) => {
      if (req.body[k] !== undefined) announcement[k] = k === 'expiresAt' && req.body[k] ? new Date(req.body[k]) : req.body[k];
    });
    await announcement.save();
    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new AppError('Announcement not found', 404);
    res.status(200).json({ success: true, data: { _id: announcement._id, deleted: true } });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, remove };
