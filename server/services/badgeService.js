const Badge = require('../models/Badge');
const Gamification = require('../models/Gamification');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Default system badges to seed if empty
const DEFAULT_BADGES = [
  {
    name: 'First Steps',
    description: 'Complete your first lesson on Vidya Setu',
    icon: '🌟',
    category: 'learning',
    criteria: { type: 'lessons_completed', threshold: 1 },
    xpBonus: 50,
    rarity: 'common',
  },
  {
    name: 'Curious Mind',
    description: 'Ask doubts to AI or teachers',
    icon: '💡',
    category: 'social',
    criteria: { type: 'doubts_asked', threshold: 3 },
    xpBonus: 75,
    rarity: 'common',
  },
  {
    name: 'Quiz Whiz',
    description: 'Score 100% on any quiz',
    icon: '🎯',
    category: 'quiz',
    criteria: { type: 'quiz_perfect', threshold: 1 },
    xpBonus: 100,
    rarity: 'rare',
  },
  {
    name: 'Streak Master',
    description: 'Maintain a 7-day daily study streak',
    icon: '🔥',
    category: 'streak',
    criteria: { type: 'streak_days', threshold: 7 },
    xpBonus: 150,
    rarity: 'rare',
  },
  {
    name: 'Scholar',
    description: 'Complete 25 lessons across all subjects',
    icon: '📚',
    category: 'learning',
    criteria: { type: 'lessons_completed', threshold: 25 },
    xpBonus: 250,
    rarity: 'epic',
  },
  {
    name: 'Nabha Legend',
    description: 'Master your subjects in school',
    icon: '👑',
    category: 'special',
    criteria: { type: 'lessons_completed', threshold: 50 },
    xpBonus: 500,
    rarity: 'legendary',
  },
  {
    name: 'Comeback Kid',
    description: 'Return after a break and complete a lesson',
    icon: '🌱',
    category: 'improvement',
    criteria: { type: 'comeback', threshold: 1 },
    xpBonus: 100,
    rarity: 'uncommon',
  },
  {
    name: 'Most Improved',
    description: 'Improve your score significantly on a previous quiz',
    icon: '📈',
    category: 'improvement',
    criteria: { type: 'improvement', threshold: 1 },
    xpBonus: 100,
    rarity: 'rare',
  },
  {
    name: 'Weakness Crusher',
    description: 'Complete a personalized AI mission on a weak topic',
    icon: '💪',
    category: 'mastery',
    criteria: { type: 'mission_completed', threshold: 1 },
    xpBonus: 150,
    rarity: 'epic',
  },
];

/**
 * Seed default badges if not already in DB
 */
const seedBadges = async () => {
  try {
    const count = await Badge.countDocuments();
    if (count === 0) {
      await Badge.insertMany(DEFAULT_BADGES);
      logger.info(`Seeded ${DEFAULT_BADGES.length} default gamification badges.`);
    }
  } catch (error) {
    logger.error(`Error seeding badges: ${error.message}`);
  }
};

/**
 * Check and award eligible badges for a student
 */
const checkAndAwardBadges = async (userId, actionType, countValue = 1) => {
  try {
    const gamification = await Gamification.findOne({ user: userId });
    if (!gamification) return [];

    const existingBadgeIds = gamification.badges.map((b) => b.badge.toString());

    // Find active badges matching this criteria that user doesn't already have
    const eligibleBadges = await Badge.find({
      _id: { $nin: existingBadgeIds },
      'criteria.type': actionType,
      'criteria.threshold': { $lte: countValue },
      isActive: true,
    });

    const newUnlocked = [];

    for (const badge of eligibleBadges) {
      gamification.badges.push({
        badge: badge._id,
        unlockedAt: new Date(),
      });

      // Award badge bonus XP
      gamification.addXP(badge.xpBonus, `Unlocked Badge: ${badge.name}`, 'badge');
      newUnlocked.push(badge);

      // Create notification
      await Notification.create({
        user: userId,
        type: 'badge_unlocked',
        title: `🏅 New Badge: ${badge.name}!`,
        message: `${badge.description} (+${badge.xpBonus} XP)`,
      });

      logger.info(`User ${userId} unlocked badge ${badge.name} (+${badge.xpBonus} XP)`);
    }

    if (newUnlocked.length > 0) {
      await gamification.save();
    }

    return newUnlocked;
  } catch (error) {
    logger.error(`Error checking badges for user ${userId}: ${error.message}`);
    return [];
  }
};

/**
 * Get all badges for a user with earned status
 */
const getUserBadges = async (userId) => {
  await seedBadges();
  const allBadges = await Badge.find({ isActive: true }).lean();
  const gamification = await Gamification.findOne({ user: userId }).lean();

  const earnedMap = new Map();
  if (gamification && gamification.badges) {
    gamification.badges.forEach((b) => {
      earnedMap.set(b.badge.toString(), b.unlockedAt);
    });
  }

  return allBadges.map((badge) => ({
    ...badge,
    isEarned: earnedMap.has(badge._id.toString()),
    unlockedAt: earnedMap.get(badge._id.toString()) || null,
  }));
};

module.exports = {
  seedBadges,
  checkAndAwardBadges,
  getUserBadges,
};
