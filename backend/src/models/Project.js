/**
 * Project model - projects for task grouping and Gantt.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    department: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    ganttMetadata: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
