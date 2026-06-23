const express = require('express');
const router = express.Router();
const controller = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, controller.getAll);
router.post('/', protect, controller.create);
router.put('/:id', protect, controller.update);
router.delete('/:id', protect, controller.delete);

module.exports = router;
