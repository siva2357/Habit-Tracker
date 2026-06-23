const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, required: true, enum: ['Completed', 'In Progress', 'Pending'], default: 'Pending' },
  diary: [{
    date: String,
    title: String,
    text: String
  }],
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
