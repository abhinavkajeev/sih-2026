const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // SVG path or emoji
      required: true,
    },
    category: {
      type: String,
      enum: ['learning', 'social', 'streak', 'quiz', 'special'],
      required: true,
    },
    criteria: {
      type: { type: String, enum: ['lessons_completed', 'doubts_asked', 'quiz_perfect', 'streak_days', 'quizzes_taken', 'calls_made', 'peer_help', 'time_based'] },
      threshold: Number,
      subject: String, // optional: for subject-specific badges
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    xpBonus: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Badge', badgeSchema);
