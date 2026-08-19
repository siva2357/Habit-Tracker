const mongoose = require('mongoose');
const myFitnessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tracking: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });
module.exports = mongoose.model('MyFitness', myFitnessSchema);