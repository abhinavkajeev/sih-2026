const twilio = require('../config/twilio');
const CallLog = require('../models/CallLog');
const User = require('../models/User');
const { resolveDoubt } = require('./aiService');
const logger = require('../utils/logger');

/**
 * Handle incoming IVR speech and query Gemini AI
 */
const processSpeechInput = async ({ callSid, from, speechResult, language = 'hi' }) => {
  try {
    logger.info(`IVR Voice Doubt from ${from}: "${speechResult}" [${language}]`);

    // Resolve doubt using Gemini
    const aiResponse = await resolveDoubt({
      question: speechResult,
      subject: 'General Knowledge / Daily Lesson',
      grade: '8',
      language,
    });

    // Update call log
    await CallLog.findOneAndUpdate(
      { callSid },
      {
        transcript: speechResult,
        aiResponseText: aiResponse.answer,
        status: 'completed',
      }
    );

    return aiResponse.answer;
  } catch (error) {
    logger.error(`Error processing IVR speech for call ${callSid}: ${error.message}`);
    return language === 'pa'
      ? 'ਮਾਫ਼ ਕਰਨਾ, ਇਸ ਸਮੇਂ ਕੁਨੈਕਸ਼ਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।'
      : 'क्षमा करें, इस समय आपका उत्तर संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।';
  }
};

/**
 * Make an automated reminder voice call to a student/parent
 */
const makeOutboundCall = async (toPhoneNumber, messageText, language = 'hi') => {
  try {
    if (!twilio) {
      logger.warn('Twilio client not initialized, skipping outbound call');
      return { success: false, message: 'Twilio not configured' };
    }

    const voiceLang = language === 'pa' ? 'pa-IN' : 'hi-IN';
    const twiml = `<Response><Say language="${voiceLang}">${messageText}</Say></Response>`;

    const call = await twilio.calls.create({
      twiml,
      to: toPhoneNumber.startsWith('+') ? toPhoneNumber : `+91${toPhoneNumber}`,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    logger.info(`Outbound reminder call initiated to ${toPhoneNumber}. Call SID: ${call.sid}`);
    return { success: true, callSid: call.sid };
  } catch (error) {
    logger.error(`Outbound call error to ${toPhoneNumber}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  processSpeechInput,
  makeOutboundCall,
};
