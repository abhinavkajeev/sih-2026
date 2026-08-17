const CallLog = require('../models/CallLog');
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const axios = require('axios');
const logger = require('../utils/logger');

// @desc    Handle incoming IVR call from Twilio
// @route   POST /api/calls/incoming
const handleIncomingCall = async (req, res, next) => {
  try {
    const { CallSid, From, CallStatus } = req.body;

    // Find user by phone number
    const phone = From.replace('+91', '');
    const user = await User.findOne({ phone });

    // Create call log
    const callLog = await CallLog.create({
      student: user?._id,
      phoneNumber: phone,
      callSid: CallSid,
      direction: 'inbound',
      status: CallStatus,
      language: user?.language || 'hi',
    });

    // Generate TwiML response for IVR
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="${user?.language === 'pa' ? 'pa-IN' : 'hi-IN'}" action="/api/calls/process-speech" method="POST" timeout="5">
    <Say language="${user?.language === 'pa' ? 'pa-IN' : 'hi-IN'}">
      ${user?.language === 'pa'
        ? 'ਜੀ ਆਇਆ ਨੂੰ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ।'
        : 'स्वागत है। कृपया अपना सवाल पूछें।'}
    </Say>
  </Gather>
  <Say language="hi-IN">कोई इनपुट नहीं मिला। कृपया दोबारा कॉल करें।</Say>
</Response>`;

    res.type('text/xml').send(twiml);
  } catch (error) {
    next(error);
  }
};

// @desc    Handle call status updates
// @route   POST /api/calls/status
const handleCallStatus = async (req, res, next) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    await CallLog.findOneAndUpdate(
      { callSid: CallSid },
      { status: CallStatus, duration: parseInt(CallDuration) || 0 }
    );
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

// @desc    Get call logs (admin)
// @route   GET /api/calls/logs
const getCallLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await CallLog.find()
      .populate('student', 'name grade school')
      .populate('doubt', 'question status')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await CallLog.countDocuments();
    res.status(200).json({ success: true, count: logs.length, total, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleIncomingCall, handleCallStatus, getCallLogs };
