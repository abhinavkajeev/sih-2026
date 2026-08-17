const cron = require('node-cron');
const DailyChallenge = require('../models/DailyChallenge');
const logger = require('../utils/logger');

// Generate new daily challenges at midnight IST
cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily challenge reset...');

  try {
    // Deactivate old challenges
    await DailyChallenge.updateMany(
      { activeDate: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challengeTemplates = [
      { title: 'Lesson Explorer', description: 'Complete 2 lessons today', type: 'complete_lesson', criteria: { target: 2 }, xpReward: 50, coinReward: 10, difficulty: 'easy' },
      { title: 'Curious Mind', description: 'Ask 3 doubts today', type: 'ask_doubts', criteria: { target: 3 }, xpReward: 40, coinReward: 8, difficulty: 'easy' },
      { title: 'Quiz Master', description: 'Take a quiz and score above 70%', type: 'score_percentage', criteria: { target: 1, minScore: 70 }, xpReward: 60, coinReward: 15, difficulty: 'medium' },
      { title: 'Study Hour', description: 'Study for at least 30 minutes', type: 'study_time', criteria: { target: 30 }, xpReward: 50, coinReward: 10, difficulty: 'medium' },
    ];

    // Pick 3 random challenges for today
    const shuffled = challengeTemplates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    for (const template of selected) {
      await DailyChallenge.create({ ...template, activeDate: today });
    }

    // Weekly boss challenge on Sundays
    if (today.getDay() === 0) {
      await DailyChallenge.create({
        title: 'Weekly Boss Challenge',
        description: 'Complete all daily challenges this week',
        type: 'complete_lesson',
        criteria: { target: 5 },
        xpReward: 200,
        coinReward: 50,
        difficulty: 'hard',
        isWeeklyBoss: true,
        activeDate: today,
      });
    }

    logger.info(`Created ${selected.length} daily challenges`);
  } catch (error) {
    logger.error(`Daily challenge reset error: ${error.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

logger.info('Daily challenge reset cron scheduled (midnight IST)');
