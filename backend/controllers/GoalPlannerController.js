const GoalPlanner = require('../models/GoalPlanner');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user._id; 
    const items = await GoalPlanner.find({ user: userId }).sort({ createdAt: -1 });
    
    const stats = {
      pendingGoalsCount: items.filter(g => g.status === 'Pending').length,
      completedGoalsCount: items.filter(g => g.status === 'Completed').length,
      notCompletedGoalsCount: items.filter(g => g.status === 'Not Completed').length,
    };
    
    res.json({ items, stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user._id;
    const newItem = new GoalPlanner({ ...req.body, user: userId });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user._id;
    const updated = await GoalPlanner.findOneAndUpdate(
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
    const deleted = await GoalPlanner.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};