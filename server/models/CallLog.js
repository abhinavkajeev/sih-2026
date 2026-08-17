const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    callSid: String, // Twilio call SID
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      default: 'inbound',
    },
    duration: Number, // in seconds
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer'],
      default: 'initiated',
    },
    speechInput: String, // transcribed speech
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'hi',
    },
    aiResponse: {
      text: String,
      audioUrl: String,
    },
    doubt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doubt',
    },
    recording: {
      url: String,
      duration: Number,
    },
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ phoneNumber: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
