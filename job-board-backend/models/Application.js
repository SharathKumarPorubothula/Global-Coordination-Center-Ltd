const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, trim: true },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired'],
      default: 'submitted',
    },
    notes: { type: String, trim: true }, // internal recruiter notes
  },
  { timestamps: true }
);

// Prevent a user from applying to the same job twice
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
