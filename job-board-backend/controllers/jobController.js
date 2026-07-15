const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (employer, admin)
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    postedBy: req.user._id,
    company: {
      name: req.body.company?.name || req.user.company?.name,
      logoUrl: req.body.company?.logoUrl || req.user.company?.logoUrl,
      website: req.body.company?.website || req.user.company?.website,
    },
  });

  res.status(201).json({ success: true, job });
});

// @desc    Get all jobs with search, filters, and pagination
// @route   GET /api/jobs
// @access  Public
// Query params: search, location, jobType, experienceLevel, category, remote,
//               minSalary, maxSalary, page, limit, sort
const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    jobType,
    experienceLevel,
    category,
    remote,
    minSalary,
    maxSalary,
    page = 1,
    limit = 10,
    sort = '-createdAt',
  } = req.query;

  const query = { status: 'published' };

  if (search) {
    query.$text = { $search: search };
  }
  if (location) {
    query['location.city'] = { $regex: location, $options: 'i' };
  }
  if (jobType) query.jobType = jobType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (category) query.category = { $regex: category, $options: 'i' };
  if (remote !== undefined) query['location.remote'] = remote === 'true';
  if (minSalary || maxSalary) {
    query['salary.min'] = {};
    if (minSalary) query['salary.min'].$gte = Number(minSalary);
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(query).sort(sort).skip(skip).limit(limitNum).populate('postedBy', 'name email company'),
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    jobs,
  });
});

// @desc    Get single job by ID or slug
// @route   GET /api/jobs/:idOrSlug
// @access  Public
const getJob = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

  const job = await Job.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }).populate(
    'postedBy',
    'name email company'
  );

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  job.views += 1;
  await job.save();

  res.status(200).json({ success: true, job });
});

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (owner employer, admin)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this job');
  }

  Object.assign(job, req.body);
  await job.save();

  res.status(200).json({ success: true, job });
});

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (owner employer, admin)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this job');
  }

  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  res.status(200).json({ success: true, message: 'Job deleted successfully' });
});

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my/postings
// @access  Private (employer, admin)
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: jobs.length, jobs });
});

// @desc    Save/unsave a job for the logged-in job seeker
// @route   POST /api/jobs/:id/save
// @access  Private (jobseeker)
const toggleSaveJob = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedJobs.some((j) => j.toString() === job._id.toString());

  if (alreadySaved) {
    user.savedJobs = user.savedJobs.filter((j) => j.toString() !== job._id.toString());
  } else {
    user.savedJobs.push(job._id);
  }

  await user.save();

  res.status(200).json({
    success: true,
    saved: !alreadySaved,
    savedJobs: user.savedJobs,
  });
});

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleSaveJob,
};
