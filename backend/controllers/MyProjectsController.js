const MyProjects = require('../models/MyProjects');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user._id; 
    const items = await MyProjects.find({ user: userId }).sort({ createdAt: -1 });
    
    const stats = {
      pendingCount: items.filter(p => p.status === 'Pending').length,
      inProgressCount: items.filter(p => p.status === 'In Progress').length,
      completedCount: items.filter(p => p.status === 'Completed' || p.status === 'Done').length
    };
    
    res.json({ items, stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user._id;
    const newItem = new MyProjects({ ...req.body, user: userId });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user._id;
    const updated = await MyProjects.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.user._id;
    const deleted = await MyProjects.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};