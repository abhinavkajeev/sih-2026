const express = require('express');
const router = express.Router();
const { handleIncomingCall, handleCallStatus, getCallLogs } = require('../controllers/callController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Twilio webhook endpoints (no auth - verified by Twilio signature)
router.post('/incoming', handleIncomingCall);
router.post('/status', handleCallStatus);

// Admin endpoint
router.get('/logs', protect, roleCheck('admin'), getCallLogs);

module.exports = router;
