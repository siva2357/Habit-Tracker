const express = require('express');
const router = express.Router();
const {
  getFitnessLogs,
  getFitnessSummary,
  createFitnessLog,
  addWater,
  updateFitnessLog,
  deleteFitnessLog
} = require('../controllers/fitnessController');

router.get('/', getFitnessLogs);
router.get('/summary', getFitnessSummary);
router.post('/', createFitnessLog);
router.patch('/:id/water', addWater);
router.put('/:id', updateFitnessLog);
router.delete('/:id', deleteFitnessLog);

module.exports = router;
