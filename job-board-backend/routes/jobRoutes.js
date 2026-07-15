const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleSaveJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getJobs);

// Private routes (must come before /:idOrSlug to avoid route collision)
router.get('/my/postings', protect, authorize('employer', 'admin'), getMyJobs);
router.post('/:id/save', protect, authorize('jobseeker'), toggleSaveJob);

router.get('/:idOrSlug', getJob);

router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
