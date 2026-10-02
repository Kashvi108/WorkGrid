const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getUtilization,
  getProjectStats,
  getAllocationStats,
  getSkillDistribution,
  getDepartmentStats
} = require('../controllers/analyticsController');

// ✅ All routes require authentication
router.use(protect);

// ============================================
// ANALYTICS ROUTES
// ============================================

// Get utilization data
router.get('/utilization', getUtilization);

// Get project stats
router.get('/project-stats', getProjectStats);

// Get allocation stats
router.get('/allocation-stats', getAllocationStats);

// Get skill distribution
router.get('/skill-distribution', getSkillDistribution);

// Get department stats
router.get('/department-stats', getDepartmentStats);

module.exports = router;