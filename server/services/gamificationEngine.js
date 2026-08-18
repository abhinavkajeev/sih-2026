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
    const { userId, activityType, activityId, score, previousScore, metadata, timestamp } = activity;
    const activityDate = timestamp ? new Date(timestamp) : new Date();

    // 1. Fetch or create profile
    let profile = await Gamification.findOne({ user: userId });
    if (!profile) {
      profile = await Gamification.create({ user: userId });
    }

    // 2. Anti-Farming & Rate Limiting Check
    // If the student did the exact same activity within 5 minutes of this activityDate
    const fiveMinsBefore = new Date(activityDate.getTime() - 5 * 60 * 1000);
    const recentDuplicate = profile.activityLog.find(
      h => h.activityId === activityId && h.timestamp > fiveMinsBefore && h.timestamp <= activityDate
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

    // 3. Calculate Base XP & Determine if Valid Activity
    let achievementUnlocked = null;
    let improvementBonus = 0;
    
    // SECURITY CHECK: Daily XP Cap
    const startOfDay = new Date(activityDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(activityDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Sum XP earned today
    const xpEarnedToday = profile.xpHistory
      .filter(h => h.earnedAt >= startOfDay && h.earnedAt <= endOfDay)
      .reduce((sum, h) => sum + h.amount, 0);

    const DAILY_XP_CAP = 2000;
    let xpEarned = 0;

    if (xpEarnedToday >= DAILY_XP_CAP) {
      logger.warn(`User ${userId} hit daily XP cap on ${activityDate.toDateString()}.`);
      // Still process the activity for stats, but yield 0 XP.
      xpEarned = 0;
    } else {
      const config = XP_CONFIG[activityType] || { base: 10, maxBonus: 0 };
      xpEarned = config.base;

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
    }

    // 5. Meaningful Streak Engine
    const actionDay = activityDate.toDateString();
    const lastActive = profile.streak.lastActiveDate ? profile.streak.lastActiveDate.toDateString() : null;
    let streakUpdated = false;

    if (lastActive !== actionDay) {
      // Check if actionDay is exactly 1 day after lastActive
      const previousDayMs = activityDate.getTime() - 86400000;
      const expectedPreviousDay = new Date(previousDayMs).toDateString();

      if (lastActive === expectedPreviousDay) {
        profile.streak.current += 1;
        if (profile.streak.current > profile.streak.longest) {
          profile.streak.longest = profile.streak.current;
        }
        // Milestone bonuses
        if ([3, 7, 14, 30].includes(profile.streak.current)) {
          xpEarned += 50; // Milestone bonus
          achievementUnlocked = { type: 'streak', name: `${profile.streak.current}-Day Knowledge Streak`, icon: '🔥' };
        }
      } else if (new Date(lastActive) < activityDate) {
        // Reset streak but check for comeback mechanic
        if (profile.streak.current > 0) {
          achievementUnlocked = { type: 'badge', name: 'Welcome Back!', icon: '👋' };
          xpEarned += 30; // Comeback bonus
        }
        profile.streak.current = 1;
      }
      
      // Update last active date only if the activity is newer than what we have
      if (!profile.streak.lastActiveDate || activityDate > profile.streak.lastActiveDate) {
        profile.streak.lastActiveDate = activityDate;
      }
      streakUpdated = true;
    }

    // 6. Apply XP and save history
    const oldLevel = profile.level;
    
    // addXP method handles xp, coins, xpHistory push, and level recalculation
    profile.addXP(xpEarned, `Completed ${activityType}`, ['lesson', 'quiz', 'doubt', 'streak', 'challenge', 'bonus'].includes(activityType.split('_')[0]) ? activityType.split('_')[0] : 'bonus');

    // Update new tracking metrics
    if (metadata?.subject) {
      const currentSubXP = profile.subjectXP.get(metadata.subject) || 0;
      profile.subjectXP.set(metadata.subject, currentSubXP + xpEarned);
    }

    if (improvementBonus > 0) {
      profile.improvementScore += improvementBonus;
    }

    // Process active missions
    let missionCompleted = null;
    if (profile.activeMissions && profile.activeMissions.length > 0) {
      for (const mission of profile.activeMissions) {
        if (!mission.isCompleted && (!mission.subject || mission.subject === metadata?.subject)) {
          mission.progress += 1;
          if (mission.progress >= mission.target) {
            mission.isCompleted = true;
            missionCompleted = mission;
            profile.addXP(mission.xpReward, `Mission Completed: ${mission.title}`, 'challenge');
            achievementUnlocked = { type: 'mission', name: mission.title, icon: '🎯' };
          }
        }
      }
    }

    // Activity logging for anti-farming (keep last 50)
    profile.activityLog.push({ activityId, activityType, timestamp: activityDate });
    if (profile.activityLog.length > 50) {
      profile.activityLog.shift();
    }

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
    if (improvementBonus >= 10) { // Improvement metric
      await checkAndAwardBadges(userId, 'improvement', 1);
    }
    if (achievementUnlocked && achievementUnlocked.name === 'Welcome Back!') {
      await checkAndAwardBadges(userId, 'comeback', 1);
    }
    if (missionCompleted) {
      await checkAndAwardBadges(userId, 'mission_completed', 1);
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

/**
 * Processes an AI learning insight and generates a personalized mission for the student.
 * 
 * @param {string} userId 
 * @param {Object} performanceData { weakTopic: 'Fractions', recommendedDifficulty: 'medium', subject: 'Mathematics' }
 */
const generatePersonalizedMissionFromAI = async (userId, performanceData) => {
  try {
    const aiEngine = require('./ai/aiEngine');
    const profile = await Gamification.findOne({ user: userId }).lean();
    if (!profile) return null;

    const board = profile.board || 'CBSE';
    const grade = profile.grade || 8;
    const stream = profile.stream ? `Stream: ${profile.stream}` : '';

    const context = `
      Student Profile:
      - Grade: Class ${grade} (${profile.gradeCategory || 'middle'})
      - Board: ${board}
      - ${stream}
      - Recent Performance: Struggling with ${performanceData.weakTopic || 'recent topics'} in ${performanceData.subject}
      
      Generate a highly specific, curriculum-aligned gamification mission to help them improve.
      Return ONLY a JSON object with 'title' (max 4 words, age-appropriate, e.g. 'Algorithm Arena' for Class 12 or 'Number Explorer' for Class 2), 'description' (short action item), 'target' (integer 1-5), and 'missionType' (practice, comeback, mastery).
    `;

    // Filter out expired or completed missions
    profile.activeMissions = profile.activeMissions.filter(m => !m.isCompleted && new Date() < new Date(m.expiresAt));

    // If they already have 3 active missions, don't overload them
    if (profile.activeMissions.length >= 3) {
      return null;
    }

    let title = `${performanceData.weakTopic || performanceData.subject} Explorer Mission`;
    let desc = `We noticed you've been working hard. Let's master ${performanceData.weakTopic || 'this topic'} together! Complete 3 practices.`;

    if (profile.gradeCategory === 'primary') {
      title = `🌟 ${performanceData.subject} Stars!`;
      desc = `Let's play with ${performanceData.weakTopic || 'this topic'} and collect 3 stars!`;
    } else if (profile.gradeCategory === 'senior') {
      title = `⚡ ${performanceData.weakTopic || 'Concept'} Mastery`;
      desc = `Complete 3 advanced challenges to master this module.`;
    }

    const newMission = {
      title,
      description: desc,
      missionType: 'practice',
      target: 3,
      progress: 0,
      xpReward: 150,
      subject: performanceData.subject || 'General',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    };

    profile.activeMissions.push(newMission);
    await profile.save();
    
    logger.info(`Generated AI personalized mission for user ${userId}: ${newMission.title}`);
    return newMission;
  } catch (error) {
    logger.error(`Error generating AI mission: ${error.message}`);
    // Non-blocking failure
    return null;
  }
};

module.exports = {
  processActivity,
  generatePersonalizedMissionFromAI
};
