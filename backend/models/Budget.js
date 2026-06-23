const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  startingBalance: { type: Number, default: 0 },
  expectedMonthlyIncome: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
