const mongoose = require('mongoose');
const dashboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  layout: { type: Map, of: String, default: {} }
}, { timestamps: true });
module.exports = mongoose.model('Dashboard', dashboardSchema);