const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  getProjectSummary,
  createProject,
  updateProject,
  toggleProjectStatus,
  deleteProject
} = require('../controllers/projectController');

router.get('/', getProjects);
router.get('/summary', getProjectSummary);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.patch('/:id/toggle', toggleProjectStatus);
router.delete('/:id', deleteProject);

module.exports = router;
