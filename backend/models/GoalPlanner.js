const mongoose = require('mongoose');
const goalPlannerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  title: { type: String, required: true },
  target: { type: String, required: true },
  targetDate: { type: String, required: true },
  description: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Completed', 'Not Completed'], default: 'Pending' },
  milestones: [{ name: String, done: Boolean }],
  progressHistory: [{ title: String, description: String, date: String }],
}, { timestamps: true });
module.exports = mongoose.model('GoalPlanner', goalPlannerSchema);