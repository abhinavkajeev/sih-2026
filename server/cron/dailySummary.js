const cron = require('node-cron');
const User = require('../models/User');
const Progress = require('../models/Progress');
const logger = require('../utils/logger');

// Send daily progress summary to parents via SMS at 8 PM IST
cron.schedule('0 20 * * *', async () => {
  logger.info('Running daily summary cron job...');

  try {
    const parents = await User.find({ role: 'parent', isActive: true }).populate('parentOf');

    for (const parent of parents) {
      for (const child of parent.parentOf) {
        const progress = await Progress.find({ student: child._id });
        // TODO: Send SMS via MSG91/Twilio with child's daily activity summary
        logger.info(`Sent daily summary for ${child.name} to parent ${parent.name}`);
      }
    }
  } catch (error) {
    logger.error(`Daily summary cron error: ${error.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

logger.info('Daily summary cron job scheduled (8 PM IST)');
