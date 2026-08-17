const Gamification = require('../models/Gamification');
const Badge = require('../models/Badge');
const Leaderboard = require('../models/Leaderboard');
const DailyChallenge = require('../models/DailyChallenge');
const Reward = require('../models/Reward');
const logger = require('../utils/logger');

// @desc    Get gamification profile
const getGamificationProfile = async (req, res, next) => {
  try {
    let profile = await Gamification.findOne({ user: req.user.id })
      .populate('badges.badge');

    if (!profile) {
      profile = await Gamification.create({ user: req.user.id });
    }

    // Check & update streak
    const today = new Date().toDateString();
    const lastActive = profile.streak.lastActiveDate
      ? profile.streak.lastActiveDate.toDateString()
      : null;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastActive === yesterday) {
        profile.streak.current += 1;
        if (profile.streak.current > profile.streak.longest) {
          profile.streak.longest = profile.streak.current;
        }
        // Streak XP
        profile.addXP(10, `Day ${profile.streak.current} streak!`, 'streak');
      } else if (lastActive !== today) {
        profile.streak.current = 1;
      }
      profile.streak.lastActiveDate = new Date();
      await profile.save();
    }

    // Calculate XP needed for next level
    const thresholds = Gamification.LEVEL_THRESHOLDS;
    const currentThreshold = thresholds[profile.level] || thresholds[6];
    const nextLevelXP = currentThreshold.max === Infinity ? null : currentThreshold.max;
    const xpProgress = nextLevelXP
      ? ((profile.xp - currentThreshold.min) / (nextLevelXP - currentThreshold.min)) * 100
      : 100;

    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        xpProgress: Math.round(xpProgress),
        xpToNextLevel: nextLevelXP ? nextLevelXP - profile.xp : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'school', period = 'weekly', limit = 50 } = req.query;

    const gamificationProfiles = await Gamification.find()
      .populate('user', 'name avatar grade school section')
      .sort('-xp')
      .limit(parseInt(limit));

    const rankings = gamificationProfiles.map((profile, index) => ({
      rank: index + 1,
      user: profile.user,
      xp: profile.xp,
      level: profile.level,
      levelName: profile.levelName,
      streak: profile.streak.current,
    }));

    res.status(200).json({ success: true, data: rankings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily challenges
const getDailyChallenges = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenges = await DailyChallenge.find({
      activeDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      isActive: true,
    });

    // Check which ones user has completed
    const enrichedChallenges = challenges.map((challenge) => ({
      ...challenge.toObject(),
      isCompleted: challenge.completedBy.some(
        (c) => c.user.toString() === req.user.id
      ),
    }));

    res.status(200).json({ success: true, data: enrichedChallenges });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete daily challenge
const completeDailyChallenge = async (req, res, next) => {
  try {
    const challenge = await DailyChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const alreadyCompleted = challenge.completedBy.some(
      (c) => c.user.toString() === req.user.id
    );
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Challenge already completed' });
    }

    challenge.completedBy.push({ user: req.user.id });
    await challenge.save();

    // Award XP and coins
    const gamification = await Gamification.findOne({ user: req.user.id });
    if (gamification) {
      gamification.addXP(challenge.xpReward, `Challenge: ${challenge.title}`, 'challenge');
      gamification.coins += challenge.coinReward;
      await gamification.save();
    }

    res.status(200).json({
      success: true,
      xpEarned: challenge.xpReward,
      coinsEarned: challenge.coinReward,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rewards
const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort('coinCost');
    res.status(200).json({ success: true, data: rewards });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem reward
const redeemReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    const gamification = await Gamification.findOne({ user: req.user.id });
    if (gamification.coins < reward.coinCost) {
      return res.status(400).json({ success: false, message: 'Not enough coins' });
    }

    if (reward.stock !== -1 && reward.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Reward out of stock' });
    }

    gamification.coins -= reward.coinCost;
    await gamification.save();

    reward.redeemedBy.push({ user: req.user.id });
    if (reward.stock !== -1) reward.stock -= 1;
    await reward.save();

    res.status(200).json({ success: true, message: 'Reward redeemed!', remainingCoins: gamification.coins });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all badges
const getBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true });
    const gamification = await Gamification.findOne({ user: req.user.id });

    const earnedBadgeIds = gamification
      ? gamification.badges.map((b) => b.badge.toString())
      : [];

    const enrichedBadges = badges.map((badge) => ({
      ...badge.toObject(),
      isEarned: earnedBadgeIds.includes(badge._id.toString()),
    }));

    res.status(200).json({ success: true, data: enrichedBadges });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGamificationProfile, getLeaderboard, getDailyChallenges,
  completeDailyChallenge, getRewards, redeemReward, getBadges,
};
