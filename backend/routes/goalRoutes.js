const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalSummary,
  createGoal,
  updateGoal,
  toggleGoalStatus,
  deleteGoal
} = require('../controllers/goalController');

router.get('/', getGoals);
router.get('/summary', getGoalSummary);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.patch('/:id/toggle', toggleGoalStatus);
router.delete('/:id', deleteGoal);

module.exports = router;
