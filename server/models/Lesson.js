const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    subject: {
      type: String,
      required: true,
      enum: ['mathematics', 'science', 'english', 'hindi', 'punjabi', 'social_studies', 'computer_science', 'other'],
    },
    grade: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    chapter: {
      type: String,
    },
    topic: {
      type: String,
    },
    content: {
      type: { type: String, enum: ['video', 'pdf', 'text', 'audio', 'mixed'], default: 'text' },
      textContent: String,
      videoUrl: String,
      pdfUrl: String,
      audioUrl: String,
      thumbnailUrl: String,
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
    }],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    duration: {
      type: Number, // in minutes
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [String],
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'hi',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    completedBy: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      completedAt: { type: Date, default: Date.now },
    }],
    xpReward: {
      type: Number,
      default: 50,
    },
    // For AI RAG - embeddings reference
    embeddingId: String,
    isEmbedded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
lessonSchema.index({ subject: 1, grade: 1, school: 1 });
lessonSchema.index({ teacher: 1, createdAt: -1 });

module.exports = mongoose.model('Lesson', lessonSchema);
