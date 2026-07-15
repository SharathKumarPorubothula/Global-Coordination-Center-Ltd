const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (jobseeker)
const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resumeUrl, coverLetter } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status !== 'published') {
    res.status(400);
    throw new Error('This job is not currently accepting applications');
  }

  if (!resumeUrl) {
    res.status(400);
    throw new Error('A resume URL is required to apply');
  }

  const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl,
    coverLetter,
  });

  job.applicantCount += 1;
  await job.save();

  res.status(201).json({ success: true, application });
});

// @desc    Get applications submitted by the logged-in job seeker
// @route   GET /api/applications/my
// @access  Private (jobseeker)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location jobType status')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: applications.length, applications });
});

// @desc    Get all applicants for a specific job (employer view)
// @route   GET /api/applications/job/:jobId
// @access  Private (owner employer, admin)
const getApplicantsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view applicants for this job');
  }

  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email profile')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: applications.length, applications });
});

// @desc    Update application status (shortlist, reject, hire, etc.)
// @route   PATCH /api/applications/:id/status
// @access  Private (owner employer, admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (
    application.job.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this application');
  }

  application.status = status;
  if (notes !== undefined) application.notes = notes;
  await application.save();

  res.status(200).json({ success: true, application });
});

// @desc    Withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private (applicant who applied)
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to withdraw this application');
  }

  await application.deleteOne();
  await Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } });

  res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  withdrawApplication,
};
