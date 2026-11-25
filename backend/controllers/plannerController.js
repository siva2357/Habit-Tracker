const PlannerTask = require('../models/PlannerTask');

// @desc    Get all daily tasks with optional filters
// @route   GET /api/planner
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, category, date } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (date && date !== 'all') {
      query.date = date;
    }

    const tasks = await PlannerTask.find(query).sort({ date: -1, timeSlot: 1, createdAt: -1 });

    // Status counts summary for the requested date (or all)
    const allForDate = await PlannerTask.find(date && date !== 'all' ? { date } : {});
    const summary = {
      total: allForDate.length,
      pending: allForDate.filter((t) => t.status === 'pending').length,
      in_progress: allForDate.filter((t) => t.status === 'in_progress').length,
      completed: allForDate.filter((t) => t.status === 'completed').length,
      not_completed: allForDate.filter((t) => t.status === 'not_completed').length,
      completionRate:
        allForDate.length > 0
          ? Math.round((allForDate.filter((t) => t.status === 'completed').length / allForDate.length) * 100)
          : 0
    };

    res.json({
      success: true,
      count: tasks.length,
      summary,
      data: tasks
    });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/planner
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, timeSlot, category, date, notes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await PlannerTask.create({
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      timeSlot: timeSlot || '09:00 AM - 10:00 AM',
      category: category || 'Work',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing task
// @route   PUT /api/planner/:id
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await PlannerTask.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const fields = ['title', 'description', 'status', 'priority', 'timeSlot', 'category', 'date', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        task[f] = req.body[f];
      }
    });

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/planner/:id
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await PlannerTask.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await PlannerTask.findByIdAndDelete(id);
    res.json({ success: true, message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick toggle task status
// @route   PATCH /api/planner/:id/toggle
exports.toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await PlannerTask.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const statusCycle = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'not_completed',
      not_completed: 'pending'
    };

    task.status = req.body.status || statusCycle[task.status] || 'completed';
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('toggleTaskStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
