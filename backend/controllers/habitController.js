const Habit = require('../models/Habit');

/**
 * @desc Get all habits with optional filters
 * @route GET /api/habits
 */
exports.getHabits = async (req, res) => {
  try {
    const { category, frequency, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (frequency && frequency !== 'all') {
      filter.frequency = frequency;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const habits = await Habit.find(filter).sort({ streak: -1, createdAt: -1 });

    res.json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get habit summary statistics
 * @route GET /api/habits/summary
 */
exports.getHabitSummary = async (req, res) => {
  try {
    const habits = await Habit.find();
    const total = habits.length;
    const completedToday = habits.filter((h) => h.completedToday).length;
    const pendingToday = total - completedToday;
    const completionRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const avgStreak = total > 0 ? Math.round(habits.reduce((acc, h) => acc + (h.streak || 0), 0) / total) : 0;

    res.json({
      success: true,
      data: {
        total,
        completedToday,
        pendingToday,
        completionRate,
        maxStreak,
        avgStreak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create a new habit
 * @route POST /api/habits
 */
exports.createHabit = async (req, res) => {
  try {
    const { title, category, frequency, streak } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      title: title.trim(),
      category: category || 'Health',
      frequency: frequency || 'daily',
      streak: streak ? Number(streak) : 0,
      completedToday: false,
      bestStreak: streak ? Number(streak) : 0
    });

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: habit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update a habit
 * @route PUT /api/habits/:id
 */
exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const updated = await Habit.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Habit updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Toggle habit completion for a specific date (defaults to today)
 * @route PATCH /api/habits/:id/toggle
 */
exports.toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const targetDate = req.body?.date || req.query?.date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    if (!Array.isArray(habit.completedDates)) {
      habit.completedDates = habit.completedToday ? [todayStr] : [];
    }

    const dateIdx = habit.completedDates.indexOf(targetDate);
    const wasCompleted = dateIdx !== -1;

    if (wasCompleted) {
      habit.completedDates.splice(dateIdx, 1);
    } else {
      habit.completedDates.push(targetDate);
    }

    // Always sort completedDates
    habit.completedDates.sort();

    // Sync completedToday if target is today
    if (targetDate === todayStr) {
      habit.completedToday = !wasCompleted;
      if (habit.completedToday) {
        habit.streak = (habit.streak || 0) + 1;
        if (habit.streak > (habit.bestStreak || 0)) {
          habit.bestStreak = habit.streak;
        }
      } else {
        habit.streak = Math.max(0, (habit.streak || 0) - 1);
      }
    }

    await habit.save();

    res.json({
      success: true,
      message: !wasCompleted ? `Habit completed for ${targetDate}` : `Habit pending for ${targetDate}`,
      data: habit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete a habit
 * @route DELETE /api/habits/:id
 */
exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    await Habit.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Habit deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
