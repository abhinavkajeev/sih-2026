const express = require('express');
const router = express.Router();
const {
  getGamificationProfile, getLeaderboard, getDailyChallenges,
  completeDailyChallenge, getRewards, redeemReward, getBadges,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/profile', protect, getGamificationProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/challenges', protect, getDailyChallenges);
router.post('/challenges/:id/complete', protect, roleCheck('student'), completeDailyChallenge);
router.get('/rewards', protect, getRewards);
router.post('/rewards/:id/redeem', protect, roleCheck('student'), redeemReward);
router.get('/badges', protect, getBadges);

module.exports = router;
