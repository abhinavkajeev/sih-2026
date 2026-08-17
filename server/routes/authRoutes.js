const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, verifyOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyOTP);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
