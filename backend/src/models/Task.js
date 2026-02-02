/**
 * Task model - tasks assigned to users, optional project link.
 * Supports comments, attachments, progress, priority, status (drag-drop).
 */

const mongoose = require('mongoose');

const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['ToDo', 'InProgress', 'Done'];

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: STATUSES, default: 'ToDo' },
    deadline: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    comments: [commentSchema],
    attachments: [attachmentSchema],
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
