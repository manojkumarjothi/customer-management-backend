/**
 * EmployeeProfile model - extended profile linked to User.
 * Personal info, emergency contacts, documents, skills, qualifications, completion %.
 */

const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String },
  relationship: { type: String },
  phone: { type: String },
});

const documentSchema = new mongoose.Schema({
  type: { type: String },
  url: { type: String },
  name: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const qualificationSchema = new mongoose.Schema({
  institution: { type: String },
  degree: { type: String },
  year: { type: Number },
});

const employeeProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Personal
    dateOfBirth: { type: Date },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },
    bloodGroup: { type: String },
    maritalStatus: { type: String },
    nationality: { type: String },
    // Emergency
    emergencyContacts: [emergencyContactSchema],
    // Documents & skills
    documents: [documentSchema],
    skills: [{ type: String }],
    qualifications: [qualificationSchema],
    // Computed
    profileCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Recompute completion % before save (optional - can be done in service)
const fieldsToCheck = ['dateOfBirth', 'gender', 'phone', 'address', 'emergencyContacts', 'documents', 'skills', 'qualifications'];
employeeProfileSchema.pre('save', function (next) {
  let filled = 0;
  fieldsToCheck.forEach((f) => {
    const v = this.get(f);
    if (Array.isArray(v) ? v.length > 0 : v != null && v !== '') filled++;
  });
  this.profileCompletionPercent = Math.round((filled / fieldsToCheck.length) * 100);
  next();
});

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
