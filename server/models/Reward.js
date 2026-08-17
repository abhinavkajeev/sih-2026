const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['virtual', 'real'],
      required: true,
    },
    category: {
      type: String,
      enum: ['avatar_frame', 'profile_theme', 'certificate', 'school_supply', 'special'],
    },
    coinCost: {
      type: Number,
      required: true,
    },
    image: String,
    stock: {
      type: Number,
      default: -1, // -1 = unlimited
    },
    redeemedBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      redeemedAt: { type: Date, default: Date.now },
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

module.exports = mongoose.model('Reward', rewardSchema);
