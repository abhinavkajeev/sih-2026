const twilio = require('../config/twilio');
const logger = require('../utils/logger');

/**
 * Send an SMS via Twilio
 */
const sendSMS = async (toPhone, message) => {
  try {
    const formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;

    if (!twilio || !process.env.TWILIO_PHONE_NUMBER) {
      logger.info(`[SMS Simulated] To: ${formattedPhone} | Message: "${message}"`);
      return { success: true, simulated: true };
    }

    const res = await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logger.info(`SMS sent successfully to ${formattedPhone}. Message SID: ${res.sid}`);
    return { success: true, messageSid: res.sid };
  } catch (error) {
    logger.error(`Failed to send SMS to ${toPhone}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Daily Progress SMS to Parents (Punjabi / Hindi / English)
 */
const sendParentDailyUpdate = async ({ parentPhone, studentName, lessonsCompleted, quizScore, language = 'pa' }) => {
  let message;
  if (language === 'pa') {
    message = `ਵਿਦਿਆ ਸੇਤੂ ਰਿਪੋਰਟ: ${studentName} ਨੇ ਅੱਜ ${lessonsCompleted} ਪਾਠ ਪੂਰੇ ਕੀਤੇ ਅਤੇ ਕਵਿਜ਼ ਵਿੱਚ ${quizScore}% ਅੰਕ ਪ੍ਰਾਪਤ ਕੀਤੇ! 🌟`;
  } else if (language === 'hi') {
    message = `विद्या सेतु रिपोर्ट: ${studentName} ने आज ${lessonsCompleted} पाठ पूरे किए और प्रश्नोत्तरी में ${quizScore}% अंक प्राप्त किए! 🌟`;
  } else {
    message = `Vidya Setu Daily: ${studentName} completed ${lessonsCompleted} lessons and scored ${quizScore}% on quizzes today! 🌟`;
  }

  return sendSMS(parentPhone, message);
};

/**
 * Send OTP SMS
 */
const sendOTP = async (phone, otp) => {
  const message = `Your Vidya Setu login OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendParentDailyUpdate,
  sendOTP,
};
