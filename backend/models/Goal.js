const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
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
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    endDate: {
      type: String,
      default: () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().split('T')[0];
      }
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Goal', goalSchema);
