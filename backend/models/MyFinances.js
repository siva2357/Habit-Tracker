const mongoose = require('mongoose');
const myFinancesSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('MyFinances', myFinancesSchema);