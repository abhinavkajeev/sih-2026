const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add school name'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      village: String,
      block: String,
      district: { type: String, default: 'Nabha' },
      state: { type: String, default: 'Punjab' },
      pincode: String,
    },
    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    totalStudents: {
      type: Number,
      default: 0,
    },
    grades: [{
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    }],
    contactPhone: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('School', schoolSchema);
