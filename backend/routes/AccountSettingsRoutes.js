const express = require('express');
const router = express.Router();
const controller = require('../controllers/AccountSettingsController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, controller.updateProfile);
router.put('/password', protect, controller.changePassword);
router.delete('/delete', protect, controller.deleteAccount);

module.exports = router;