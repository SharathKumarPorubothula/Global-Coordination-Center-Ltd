require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await User.deleteMany();
  await Job.deleteMany();

  console.log('Creating sample employer...');
  const employer = await User.create({
    name: 'Acme Recruiting',
    email: 'employer@acme.test',
    password: 'password123',
    role: 'employer',
    company: { name: 'Acme Corp', website: 'https://acme.test' },
  });

  console.log('Creating sample jobseeker...');
  await User.create({
    name: 'Jamie Doe',
    email: 'jobseeker@acme.test',
    password: 'password123',
    role: 'jobseeker',
    profile: { headline: 'Full-Stack Developer', skills: ['React', 'Node.js'] },
  });

  console.log('Creating sample jobs...');
  await Job.create([
    {
      title: 'Backend Engineer (Node.js)',
      description: 'Build and maintain scalable REST APIs using Node.js and MongoDB.',
      company: { name: 'Acme Corp' },
      postedBy: employer._id,
      location: { city: 'Hyderabad', country: 'India', remote: false },
      jobType: 'full-time',
      experienceLevel: 'mid',
      skills: ['Node.js', 'Express', 'MongoDB'],
      category: 'Engineering',
      salary: { min: 800000, max: 1400000, currency: 'INR' },
    },
    {
      title: 'Frontend Engineer (React)',
      description: 'Craft delightful user interfaces for our job board platform.',
      company: { name: 'Acme Corp' },
      postedBy: employer._id,
      location: { city: 'Remote', country: 'India', remote: true },
      jobType: 'full-time',
      experienceLevel: 'entry',
      skills: ['React', 'JavaScript', 'CSS'],
      category: 'Engineering',
      salary: { min: 500000, max: 900000, currency: 'INR' },
    },
  ]);

  console.log('Seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
