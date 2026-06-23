const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tracking: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
