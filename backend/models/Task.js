const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  time: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  dateKey: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
