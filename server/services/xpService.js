const Gamification = require('../models/Gamification');
const { checkAndAwardBadges } = require('./badgeService');
const logger = require('../utils/logger');

// XP Reward Constants
const XP_RULES = {
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 60,
  QUIZ_PERFECT: 120,
  ASK_DOUBT: 20,
  DAILY_STREAK: 15,
  CHALLENGE_COMPLETE: 40,
};

/**
 * Award XP to a user, recalculate level, and check for badge unlocks
 */
const awardXP = async (userId, amount, reason, source = 'general') => {
  try {
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }

    const previousLevel = profile.level;
    profile.addXP(amount, reason, source);
    await profile.save();

    const leveledUp = profile.level > previousLevel;

    // Check level-based badges
    await checkAndAwardBadges(userId, 'reach_level', profile.level);

    logger.info(`Awarded ${amount} XP to ${userId} for "${reason}". Level: ${profile.level}`);

    return {
      xpEarned: amount,
      totalXP: profile.xp,
      level: profile.level,
      levelName: profile.levelName,
      coins: profile.coins,
      leveledUp,
      previousLevel,
    };
  } catch (error) {
    logger.error(`Error awarding XP to user ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Update daily active streak for a student
 */
const updateStreak = async (userId) => {
  try {
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }

    const today = new Date().toDateString();
    const lastActive = profile.streak.lastActiveDate
      ? new Date(profile.streak.lastActiveDate).toDateString()
      : null;

    if (lastActive === today) {
      return { streak: profile.streak.current, updated: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) {
      profile.streak.current += 1;
      if (profile.streak.current > profile.streak.longest) {
        profile.streak.longest = profile.streak.current;
      }
      profile.addXP(XP_RULES.DAILY_STREAK, `Day ${profile.streak.current} Study Streak! 🔥`, 'streak');
    } else {
      profile.streak.current = 1;
    }

    profile.streak.lastActiveDate = new Date();
    await profile.save();

    // Check streak badges
    await checkAndAwardBadges(userId, 'streak_days', profile.streak.current);

    return {
      streak: profile.streak.current,
      longestStreak: profile.streak.longest,
      updated: true,
    };
  } catch (error) {
    logger.error(`Error updating streak for user ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Deduct coins for rewards store redemption
 */
const spendCoins = async (userId, cost) => {
  try {
    const profile = await Gamification.findOne({ user: userId });
    if (!profile || profile.coins < cost) {
      return { success: false, message: 'Not enough coins' };
    }

    profile.coins -= cost;
    await profile.save();

    return { success: true, remainingCoins: profile.coins };
  } catch (error) {
    logger.error(`Error spending coins for user ${userId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  XP_RULES,
  awardXP,
  updateStreak,
  spendCoins,
};
