const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, required: true, enum: ['Completed', 'In Progress', 'Pending'], default: 'Pending' },
  updates: [{
    date: String,
    title: String,
    text: String
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
