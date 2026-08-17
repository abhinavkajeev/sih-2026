const cron = require('node-cron');
const Gamification = require('../models/Gamification');
const Leaderboard = require('../models/Leaderboard');
const logger = require('../utils/logger');

// Weekly leaderboard snapshot every Sunday at 11:59 PM IST
cron.schedule('59 23 * * 0', async () => {
  logger.info('Running weekly leaderboard snapshot...');

  try {
    const profiles = await Gamification.find()
      .populate('user', 'name grade school section')
      .sort('-xp');

    const rankings = profiles.map((p, i) => ({
      user: p.user._id,
      xp: p.xp,
      level: p.level,
      rank: i + 1,
      previousRank: p.rank?.school || 0,
      change: (p.rank?.school || i + 1) - (i + 1),
    }));

    await Leaderboard.create({
      type: 'school',
      period: 'weekly',
      rankings,
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(),
    });

    // Update rank in gamification profiles
    for (const ranking of rankings) {
      await Gamification.findOneAndUpdate(
        { user: ranking.user },
        { 'rank.school': ranking.rank }
      );
    }

    logger.info(`Leaderboard snapshot created with ${rankings.length} entries`);
  } catch (error) {
    logger.error(`Leaderboard snapshot error: ${error.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

logger.info('Leaderboard snapshot cron scheduled (Sunday 11:59 PM IST)');
