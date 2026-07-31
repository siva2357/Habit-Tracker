const express = require('express');
const router = express.Router();
const controller = require('../controllers/DashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, controller.getDashboardStats);

module.exports = router;