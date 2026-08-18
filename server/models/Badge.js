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
      enum: ['learning', 'social', 'streak', 'quiz', 'special', 'improvement', 'mastery'],
      required: true,
    },
    allowedGrades: {
      type: [String], // e.g. ['primary', 'middle', 'secondary', 'senior']
      default: ['primary', 'middle', 'secondary', 'senior'], // Default to all
    },
    criteria: {
      type: { type: String, enum: ['lessons_completed', 'doubts_asked', 'quiz_perfect', 'streak_days', 'quizzes_taken', 'calls_made', 'peer_help', 'time_based', 'improvement', 'comeback', 'mission_completed'] },
      threshold: Number,
      subject: String, // optional: for subject-specific badges
      stream: String, // optional: 'Computer Science'
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
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
