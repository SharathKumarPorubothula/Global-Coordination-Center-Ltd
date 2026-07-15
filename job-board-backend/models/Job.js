const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 150,
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    company: {
      name: { type: String, required: true, trim: true },
      logoUrl: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true },
      remote: { type: Boolean, default: false },
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      isDisclosed: { type: Boolean, default: true },
    },
    skills: [{ type: String, trim: true }],
    category: { type: String, trim: true },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
    views: { type: Number, default: 0 },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

// Auto-generate a unique slug before saving
jobSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  const JobModel = this.constructor;
  while (await JobModel.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }

  this.slug = slug;
  next();
});

module.exports = mongoose.model('Job', jobSchema);
