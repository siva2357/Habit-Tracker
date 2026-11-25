const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabitSummary,
  createHabit,
  updateHabit,
  toggleHabit,
  deleteHabit
} = require('../controllers/habitController');

router.get('/', getHabits);
router.get('/summary', getHabitSummary);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.patch('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
