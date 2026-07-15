const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:jobId', protect, authorize('jobseeker'), applyToJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicantsForJob);
router.patch('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);

module.exports = router;
