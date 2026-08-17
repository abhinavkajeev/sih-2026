const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    levelName: {
      type: String,
      default: 'Beginner',
      enum: ['Beginner', 'Scholar', 'Expert', 'Master', 'Guru', 'Legend'],
    },
    coins: {
      type: Number,
      default: 0,
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: Date,
      freezesAvailable: { type: Number, default: 1 },
    },
    badges: [{
      badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
      earnedAt: { type: Date, default: Date.now },
    }],
    xpHistory: [{
      amount: Number,
      reason: String,
      source: { type: String, enum: ['lesson', 'quiz', 'doubt', 'streak', 'challenge', 'bonus'] },
      earnedAt: { type: Date, default: Date.now },
    }],
    rank: {
      class: { type: Number, default: 0 },
      school: { type: Number, default: 0 },
      district: { type: Number, default: 0 },
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    completedChallenges: [{
      challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge' },
      completedAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// XP thresholds for levels
gamificationSchema.statics.LEVEL_THRESHOLDS = {
  1: { min: 0, max: 100, name: 'Beginner' },
  2: { min: 100, max: 300, name: 'Scholar' },
  3: { min: 300, max: 600, name: 'Expert' },
  4: { min: 600, max: 1000, name: 'Master' },
  5: { min: 1000, max: 2000, name: 'Guru' },
  6: { min: 2000, max: Infinity, name: 'Legend' },
};

// Calculate level from XP
gamificationSchema.methods.calculateLevel = function () {
  const thresholds = this.constructor.LEVEL_THRESHOLDS;
  for (const [level, { min, max, name }] of Object.entries(thresholds)) {
    if (this.xp >= min && this.xp < max) {
      this.level = parseInt(level);
      this.levelName = name;
      return;
    }
  }
};

// Add XP
gamificationSchema.methods.addXP = function (amount, reason, source) {
  this.xp += amount;
  this.coins += Math.floor(amount / 5); // 1 coin per 5 XP
  this.xpHistory.push({ amount, reason, source });
  this.calculateLevel();
};

gamificationSchema.index({ xp: -1 }); // For leaderboard sorting
gamificationSchema.index({ 'rank.class': 1 });

module.exports = mongoose.model('Gamification', gamificationSchema);
