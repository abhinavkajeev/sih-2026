const Gamification = require('../models/Gamification');
const logger = require('../utils/logger');

// Central configuration for gamification rewards to ensure consistency
const XP_CONFIG = {
  lesson_completed: { base: 20, maxBonus: 10 },
  quiz_completed: { base: 15, maxBonus: 35 },
  doubt_resolved: { base: 25, maxBonus: 5 },
  challenge_completed: { base: 50, maxBonus: 50 },
  daily_discovery: { base: 30, maxBonus: 0 }
};

/**
 * Core engine to process any student learning activity and calculate adaptive rewards.
 * 
 * @param {Object} activity 
 * @param {string} activity.userId
 * @param {string} activity.activityType ('lesson_completed', 'quiz_completed', etc.)
 * @param {string} activity.activityId
 * @param {number} activity.score (0-100)
 * @param {number} activity.previousScore (0-100)
 * @param {Object} activity.metadata
 */
const processActivity = async (activity) => {
  try {
    const { userId, activityType, activityId, score, previousScore, metadata } = activity;

    // 1. Fetch or create profile
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }

    // 2. Anti-Farming & Rate Limiting Check
    // If the student did the exact same activity in the last 5 minutes, yield no XP.
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = profile.xpHistory.find(
      h => h.metadata?.activityId === activityId && h.earnedAt > fiveMinsAgo
    );

    if (recentDuplicate) {
      logger.warn(`Anti-farming triggered for user ${userId} on activity ${activityId}`);
      return { 
        success: true, 
        xpEarned: 0, 
        message: "Take a break! You just completed this recently.",
        isDuplicate: true 
      };
    }

    // 3. Calculate Base XP
    const config = XP_CONFIG[activityType] || { base: 10, maxBonus: 0 };
    let xpEarned = config.base;
    let improvementBonus = 0;
    let achievementUnlocked = null;

    // 4. Adaptive Improvement Calculation (Crucial UX Principle)
    if (typeof score === 'number' && typeof previousScore === 'number') {
      const improvement = score - previousScore;
      if (improvement > 0) {
        // Reward improvement, not just raw high scores
        improvementBonus = Math.min(Math.floor(improvement * 0.5), config.maxBonus);
        xpEarned += improvementBonus;
        
        if (improvement >= 20) {
          achievementUnlocked = { type: 'badge', name: 'Comeback Kid', icon: '🌱' };
        }
      }
    }

    // High score bonus
    if (score >= 90) {
      xpEarned += 10; // Mastery bonus
    }

    // 5. Meaningful Streak Engine
    // Streak only increments on meaningful activities, not just logging in.
    const today = new Date().toDateString();
    const lastActive = profile.streak.lastActiveDate ? profile.streak.lastActiveDate.toDateString() : null;
    let streakUpdated = false;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastActive === yesterday) {
        profile.streak.current += 1;
        if (profile.streak.current > profile.streak.longest) {
          profile.streak.longest = profile.streak.current;
        }
        // Milestone bonuses
        if ([3, 7, 14, 30].includes(profile.streak.current)) {
          xpEarned += 50; // Milestone bonus
          achievementUnlocked = { type: 'streak', name: `${profile.streak.current}-Day Knowledge Streak`, icon: '🔥' };
        }
      } else {
        // Reset streak but check for comeback mechanic
        if (profile.streak.current > 0) {
          achievementUnlocked = { type: 'badge', name: 'Welcome Back!', icon: '👋' };
          xpEarned += 30; // Comeback bonus
        }
        profile.streak.current = 1;
      }
      profile.streak.lastActiveDate = new Date();
      streakUpdated = true;
    }

    // 6. Apply XP and save history
    const oldLevel = profile.level;
    
    // addXP method handles xp, coins, xpHistory push, and level recalculation
    profile.addXP(xpEarned, `Completed ${activityType}`, ['lesson', 'quiz', 'doubt', 'streak', 'challenge', 'bonus'].includes(activityType.split('_')[0]) ? activityType.split('_')[0] : 'bonus');

    await profile.save();

    // 7. Badge & Level Unlocks
    const { checkAndAwardBadges } = require('./badgeService');
    const leveledUp = profile.level > oldLevel;
    if (leveledUp) {
      await checkAndAwardBadges(userId, 'reach_level', profile.level);
    }
    if (streakUpdated) {
      await checkAndAwardBadges(userId, 'streak_days', profile.streak.current);
    }
    
    return {
      success: true,
      xpEarned,
      improvementBonus,
      newTotalXP: profile.xp,
      coinsEarned: Math.floor(xpEarned / 5),
      streakUpdated,
      currentStreak: profile.streak.current,
      leveledUp,
      newLevel: profile.level,
      newLevelName: profile.levelName,
      achievementUnlocked
    };

  } catch (error) {
    logger.error(`Gamification Engine Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  processActivity
};
