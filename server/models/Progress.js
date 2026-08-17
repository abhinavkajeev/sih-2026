const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    lessonsCompleted: [{
      lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
      completedAt: Date,
      timeSpent: Number, // in minutes
    }],
    quizScores: [{
      quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      score: Number,
      percentage: Number,
      attemptedAt: Date,
    }],
    doubtsAsked: {
      type: Number,
      default: 0,
    },
    doubtsResolved: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // total minutes
    },
    averageQuizScore: {
      type: Number,
      default: 0,
    },
    strengths: [String],
    weaknesses: [String],
    weeklyActivity: [{
      week: String,
      lessonsCount: Number,
      quizzesCount: Number,
      doubtsCount: Number,
      timeSpent: Number,
    }],
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
