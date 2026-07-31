const mongoose = require('mongoose');
const myProjectsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountSettings', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  tasks: [{ title: String, description: String, date: String, status: String }],
}, { timestamps: true });
module.exports = mongoose.model('MyProjects', myProjectsSchema);