const logger = require('../utils/logger');

/**
 * Send an email notification (ready for SendGrid / Nodemailer SMTP)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // In development or if SMTP is not set, log cleanly
    logger.info(`[Email Service] To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: true };
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Weekly Performance Summary to Parents / Teachers
 */
const sendWeeklyReportEmail = async (parentEmail, studentName, reportData) => {
  const subject = `Vidya Setu — Weekly Progress Report for ${studentName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #7c3aed;">📚 Vidya Setu Weekly Progress</h2>
      <p>Here is the weekly learning summary for <strong>${studentName}</strong>:</p>
      <ul>
        <li><strong>Lessons Completed:</strong> ${reportData.lessonsCompleted || 0}</li>
        <li><strong>Quizzes Taken:</strong> ${reportData.quizzesAttempted || 0}</li>
        <li><strong>Average Quiz Score:</strong> ${reportData.averageScore || 0}%</li>
        <li><strong>Doubts Resolved:</strong> ${reportData.doubtsAsked || 0}</li>
        <li><strong>XP Earned this Week:</strong> ${reportData.weeklyXP || 0} XP</li>
      </ul>
      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Keep up the great work! — Team Vidya Setu, Nabha</p>
    </div>
  `;

  return sendEmail({ to: parentEmail, subject, html });
};

module.exports = {
  sendEmail,
  sendWeeklyReportEmail,
};
