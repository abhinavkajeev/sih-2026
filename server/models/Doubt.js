const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    subject: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Please add your doubt/question'],
    },
    questionType: {
      type: String,
      enum: ['text', 'voice', 'call'],
      default: 'text',
    },
    voiceUrl: String, // URL to recorded voice doubt
    aiResponse: {
      answer: String,
      confidence: Number,
      sources: [String], // lesson IDs used to generate answer
      generatedAt: Date,
    },
    teacherResponse: {
      answer: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      respondedAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'ai_answered', 'teacher_answered', 'resolved'],
      default: 'pending',
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'hi',
    },
    isHelpful: {
      type: Boolean,
      default: null, // student feedback on AI response
    },
    tags: [String],
    xpAwarded: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

doubtSchema.index({ student: 1, createdAt: -1 });
doubtSchema.index({ status: 1 });

module.exports = mongoose.model('Doubt', doubtSchema);
