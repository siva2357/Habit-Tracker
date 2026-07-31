const express = require('express');
const router = express.Router();
const controller = require('../controllers/LoginController');

router.post('/', controller.handleLogin);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPasswordDirect);

module.exports = router;