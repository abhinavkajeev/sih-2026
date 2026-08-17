const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['class', 'school', 'district'],
      required: true,
    },
    scope: {
      school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
      grade: String,
      section: String,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'all_time'],
      required: true,
    },
    rankings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      xp: Number,
      level: Number,
      rank: Number,
      previousRank: Number,
      change: Number, // rank change from last period
    }],
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardSchema.index({ type: 1, period: 1, isActive: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
