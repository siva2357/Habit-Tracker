const mongoose = require('mongoose');

const plannerTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'not_completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    timeSlot: {
      type: String,
      trim: true,
      default: '09:00 AM - 10:00 AM'
    },
    category: {
      type: String,
      trim: true,
      default: 'Work'
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
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

module.exports = mongoose.model('PlannerTask', plannerTaskSchema);
