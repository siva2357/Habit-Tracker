const mongoose = require('mongoose');
const myFitnessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  type: { type: String, required: true },
  name: { type: String, default: '' },
  duration: { type: String, default: '' },
  calories: { type: Number, required: true },
  steps: { type: Number, default: 0 },
  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  date: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('MyFitness', myFitnessSchema);