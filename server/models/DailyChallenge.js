const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['complete_lesson', 'ask_doubts', 'take_quiz', 'score_percentage', 'study_time', 'help_peer'],
      required: true,
    },
    criteria: {
      target: { type: Number, required: true }, // e.g., complete 2 lessons
      subject: String,
      minScore: Number,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    coinReward: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isWeeklyBoss: {
      type: Boolean,
      default: false,
    },
    activeDate: {
      type: Date,
      required: true,
    },
    grade: String,
    completedBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      completedAt: { type: Date, default: Date.now },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

dailyChallengeSchema.index({ activeDate: 1, isActive: 1 });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
