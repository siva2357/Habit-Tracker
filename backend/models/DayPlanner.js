const mongoose = require('mongoose');
const dayPlannerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  dateKey: { type: String, required: true },
  completed: { type: Boolean, default: false }, // Keeping for backwards compat
  status: { type: String, enum: ['created', 'not_completed', 'completed'], default: 'created' }
}, { timestamps: true });
module.exports = mongoose.model('DayPlanner', dayPlannerSchema);