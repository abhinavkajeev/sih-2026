const DailyChallenge = require('../models/DailyChallenge');
const { awardXP } = require('./xpService');
const logger = require('../utils/logger');

const CHALLENGE_POOL = [
  { title: 'Lesson Explorer', description: 'Complete 2 lessons today', type: 'complete_lesson', criteria: { target: 2 }, xpReward: 50, coinReward: 10, difficulty: 'easy' },
  { title: 'Curious Mind', description: 'Ask 3 doubts today in any subject', type: 'ask_doubts', criteria: { target: 3 }, xpReward: 45, coinReward: 9, difficulty: 'easy' },
  { title: 'Quiz Master', description: 'Score 80%+ on any quiz', type: 'score_percentage', criteria: { target: 1, minScore: 80 }, xpReward: 60, coinReward: 15, difficulty: 'medium' },
  { title: 'Science Explorer', description: 'Complete 1 Science lesson and take its quiz', type: 'complete_lesson', criteria: { target: 1 }, xpReward: 55, coinReward: 12, difficulty: 'medium' },
  { title: 'Math Genius', description: 'Solve a Mathematics quiz with full marks', type: 'score_percentage', criteria: { target: 1, minScore: 100 }, xpReward: 80, coinReward: 20, difficulty: 'hard' },
];

/**
 * Ensure daily challenges exist for today
 */
const getOrCreateTodayChallenges = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenges = await DailyChallenge.find({
      activeDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      isActive: true,
    });

    if (challenges.length === 0) {
      // Pick 3 random from pool
      const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      for (const item of selected) {
        await DailyChallenge.create({ ...item, activeDate: today });
      }
      challenges = await DailyChallenge.find({
        activeDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
        isActive: true,
      });
    }

    return challenges.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      type: c.type,
      xpReward: c.xpReward,
      coinReward: c.coinReward,
      difficulty: c.difficulty,
      isCompleted: c.completedBy.some((entry) => entry.user.toString() === userId.toString()),
    }));
  } catch (error) {
    logger.error(`Error getting daily challenges: ${error.message}`);
    throw error;
  }
};

/**
 * Mark a challenge as completed by user
 */
const completeChallenge = async (userId, challengeId) => {
  try {
    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    const alreadyDone = challenge.completedBy.some((entry) => entry.user.toString() === userId.toString());
    if (alreadyDone) {
      return { success: false, message: 'Challenge already completed today' };
    }

    challenge.completedBy.push({ user: userId, completedAt: new Date() });
    await challenge.save();

    // Award XP and coins
    await awardXP(userId, challenge.xpReward, `Completed: ${challenge.title}`, 'challenge');

    return {
      success: true,
      xpEarned: challenge.xpReward,
      coinsEarned: challenge.coinReward,
    };
  } catch (error) {
    logger.error(`Error completing challenge ${challengeId} for user ${userId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getOrCreateTodayChallenges,
  completeChallenge,
};
