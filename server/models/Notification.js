const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lesson', 'quiz', 'doubt', 'achievement', 'reminder', 'announcement', 'xp', 'level_up', 'badge'],
      required: true,
    },
    data: {
      lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      doubtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt' },
      badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
      xpAmount: Number,
      link: String,
    },
    channel: {
      type: String,
      enum: ['push', 'sms', 'in_app', 'all'],
      default: 'in_app',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
