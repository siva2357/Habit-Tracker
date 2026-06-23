const fs = require('fs');
const path = require('path');

const controllers = [
  { file: 'habitController.js', model: 'Habit' },
  { file: 'taskController.js', model: 'Task' },
  { file: 'projectController.js', model: 'Project' },
  { file: 'exerciseController.js', model: 'Exercise' },
  { file: 'transactionController.js', model: 'Transaction' },
  { file: 'goalController.js', model: 'Goal' },
];

controllers.forEach(({ file, model }) => {
  const content = `const ${model} = require('../models/${model}');

exports.getAll = async (req, res) => {
  try {
    const items = await ${model}.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const newItem = new ${model}({ ...req.body, user: req.user._id });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const updated = await ${model}.findOneAndUpdate(
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
    const deleted = await ${model}.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(401).json({ message: 'Not authorized or not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
};
`;
  fs.writeFileSync(path.join(__dirname, 'controllers', file), content);
  console.log(`Updated ${file}`);
});
