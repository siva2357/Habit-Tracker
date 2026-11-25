const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Health & Routine'
    },
    streak: {
      type: Number,
      default: 0
    },
    completedToday: {
      type: Boolean,
      default: false
    },
    completedDates: {
      type: [String],
      default: []
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekly'],
      default: 'daily'
    },
    bestStreak: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Habit', habitSchema);
