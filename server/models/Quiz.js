const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  }],
  explanation: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  marks: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
    },
    description: String,
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    questions: [questionSchema],
    totalMarks: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      default: 15,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduledFor: Date,
    attempts: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: Number,
      totalMarks: Number,
      percentage: Number,
      answers: [{
        questionIndex: Number,
        selectedOption: Number,
        isCorrect: Boolean,
      }],
      timeTaken: Number, // in seconds
      attemptedAt: { type: Date, default: Date.now },
    }],
    xpReward: {
      type: Number,
      default: 30,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'hi',
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.pre('save', function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
