const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      default: 'Engineering'
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'on_hold'],
      default: 'in_progress'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tasksTotal: {
      type: Number,
      default: 10
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    deadline: {
      type: String,
      default: () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 2);
        return d.toISOString().split('T')[0];
      }
    },
    steps: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          default: ''
        },
        startDate: {
          type: String,
          default: ''
        },
        endDate: {
          type: String,
          default: ''
        },
        status: {
          type: String,
          enum: [
            'pending',
            'in_progress',
            'completed',
            'testing',
            'testing_completed',
            'production_in_progress',
            'live'
          ],
          default: 'pending'
        },
        notes: {
          type: String,
          default: ''
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Project', projectSchema);
