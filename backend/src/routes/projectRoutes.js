
const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  getAllProjects,
  getArchivedProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  hardDeleteProject,
  restoreProject,
  getSuggestedEmployees,
  getProjectTeam
} = require('../controllers/projectController');

router.use(protect);

router.get('/', getAllProjects);

router.get('/archived', getArchivedProjects);

router.get('/:id/suggested-employees', getSuggestedEmployees);

router.get('/:id/team', getProjectTeam);

router.get('/:id', getProjectById);

router.post(
  '/',
  allowRoles('admin', 'manager'),
  createProject
);

router.put(
  '/:id',
  allowRoles('admin', 'manager'),
  updateProject
);

router.delete(
  '/:id/permanent',
  allowRoles('admin'),
  hardDeleteProject
);

router.delete(
  '/:id',
  allowRoles('admin'),
  deleteProject
);

router.put(
  '/:id/restore',
  allowRoles('admin', 'manager'),
  restoreProject
);

module.exports = router;

