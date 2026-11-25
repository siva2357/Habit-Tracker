const mongoose = require('mongoose');

const fitnessSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    waterIntakeMl: {
      type: Number,
      default: 2000
    },
    waterGoalMl: {
      type: Number,
      default: 2500
    },
    sleepHours: {
      type: Number,
      default: 7.5
    },
    sleepGoalHours: {
      type: Number,
      default: 8.0
    },
    workoutCompleted: {
      type: Boolean,
      default: true
    },
    workoutType: {
      type: String,
      default: 'Daily Walking'
    },
    workoutCategory: {
      type: String,
      enum: ['walking', 'finger_gripper', 'chest_expansion', 'resistance_band', 'other'],
      default: 'walking'
    },
    distanceMeters: {
      type: Number,
      default: 0
    },
    durationMinutes: {
      type: Number,
      default: 30
    },
    startTime: {
      type: String,
      default: '06:30'
    },
    endTime: {
      type: String,
      default: '07:15'
    },
    sets: {
      type: Number,
      default: 0
    },
    reps: {
      type: Number,
      default: 0
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    caloriesBurned: {
      type: Number,
      default: 450
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Fitness', fitnessSchema);
