const Goal = require('../models/Goal');

/**
 * @desc Get all goals with filtering
 * @route GET /api/goals
 */
exports.getGoals = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const goals = await Goal.find(filter).sort({ endDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get aggregated stats for goals
 * @route GET /api/goals/summary
 */
exports.getGoalSummary = async (req, res) => {
  try {
    const goals = await Goal.find();

    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'completed').length;
    const inProgress = goals.filter((g) => g.status === 'in_progress').length;
    const pending = goals.filter((g) => g.status === 'pending').length;
    const notCompleted = goals.filter((g) => g.status === 'not_completed').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        notCompleted,
        completionRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create a new goal
 * @route POST /api/goals
 */
exports.createGoal = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, endDate, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required' });
    }

    const newGoal = await Goal.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      priority: priority || 'medium',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      category: category || 'Career'
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: newGoal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update a goal
 * @route PUT /api/goals/:id
 */
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updated = await Goal.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Cycle goal status: pending -> in_progress -> completed -> not_completed -> pending
 * @route PATCH /api/goals/:id/toggle
 */
exports.toggleGoalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    let nextStatus = req.body.status;
    if (!nextStatus) {
      const order = ['pending', 'in_progress', 'completed', 'not_completed'];
      const currentIndex = order.indexOf(goal.status);
      nextStatus = order[(currentIndex + 1) % order.length];
    }

    goal.status = nextStatus;
    await goal.save();

    res.json({
      success: true,
      message: `Goal status updated to ${nextStatus}`,
      data: goal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete a goal
 * @route DELETE /api/goals/:id
 */
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await Goal.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Goal deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
