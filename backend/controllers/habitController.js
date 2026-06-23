const Habit = require('../models/Habit');

exports.getAll = async (req, res) => {
  try {
    const items = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const newItem = new Habit({ ...req.body, user: req.user._id });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const updated = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};
