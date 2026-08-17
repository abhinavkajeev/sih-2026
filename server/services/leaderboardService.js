const Gamification = require('../models/Gamification');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get real-time leaderboard rankings (School, Class, District)
 */
const getLeaderboard = async ({ type = 'school', schoolId = null, grade = null, limit = 50 }) => {
  try {
    const userMatch = { role: 'student', isActive: true };
    if (schoolId) userMatch.school = schoolId;
    if (grade) userMatch.grade = grade;

    const matchingUsers = await User.find(userMatch).select('_id name avatar grade section school');
    const userIds = matchingUsers.map((u) => u._id);

    const profiles = await Gamification.find({ user: { $in: userIds } })
      .populate('user', 'name avatar grade section school')
      .sort('-xp')
      .limit(parseInt(limit))
      .lean();

    const rankings = profiles.map((p, index) => ({
      rank: index + 1,
      userId: p.user?._id,
      name: p.user?.name || 'Student',
      avatar: p.user?.avatar,
      grade: p.user?.grade,
      section: p.user?.section,
      xp: p.xp,
      level: p.level,
      levelName: p.levelName,
      streak: p.streak?.current || 0,
      coins: p.coins || 0,
      badgesCount: p.badges?.length || 0,
    }));

    return {
      type,
      totalParticipants: rankings.length,
      rankings,
    };
  } catch (error) {
    logger.error(`Error fetching leaderboard: ${error.message}`);
    throw error;
  }
};

/**
 * Get a specific user's ranking position
 */
const getUserRank = async (userId, schoolId = null) => {
  try {
    const userProfile = await Gamification.findOne({ user: userId });
    if (!userProfile) return { rank: 0, xp: 0 };

    const higherCount = await Gamification.countDocuments({
      xp: { $gt: userProfile.xp },
    });

    return {
      rank: higherCount + 1,
      xp: userProfile.xp,
      level: userProfile.level,
      levelName: userProfile.levelName,
    };
  } catch (error) {
    logger.error(`Error fetching rank for user ${userId}: ${error.message}`);
    return { rank: 0, xp: 0 };
  }
};

module.exports = {
  getLeaderboard,
  getUserRank,
};
