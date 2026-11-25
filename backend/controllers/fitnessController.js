const Fitness = require('../models/Fitness');

/**
 * @desc Get all fitness logs
 * @route GET /api/fitness
 */
exports.getFitnessLogs = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { workoutType: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await Fitness.find(filter).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get fitness summary metrics
 * @route GET /api/fitness/summary
 */
exports.getFitnessSummary = async (req, res) => {
  try {
    const logs = await Fitness.find().sort({ date: -1 });

    const todayStr = new Date().toISOString().split('T')[0];
    let latestLog = logs.find((l) => l.date === todayStr) || logs[0];

    const totalDays = logs.length;
    const workoutsDone = logs.filter((l) => l.workoutCompleted).length;
    const avgSleep = totalDays > 0
      ? (logs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / totalDays).toFixed(1)
      : '7.5';
    const totalCalories = logs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);

    const waterToday = latestLog ? latestLog.waterIntakeMl : 2000;
    const waterGoal = latestLog ? latestLog.waterGoalMl : 2500;
    const waterProgress = Math.min(100, Math.round((waterToday / waterGoal) * 100));

    res.json({
      success: true,
      data: {
        waterToday,
        waterGoal,
        waterProgress,
        latestLog,
        workoutsDone,
        totalDays,
        avgSleep,
        totalCalories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Log a new fitness entry
 * @route POST /api/fitness
 */
exports.createFitnessLog = async (req, res) => {
  try {
    const {
      date,
      waterIntakeMl,
      waterGoalMl,
      sleepHours,
      sleepGoalHours,
      workoutCompleted,
      workoutType,
      workoutCategory,
      distanceMeters,
      durationMinutes,
      startTime,
      endTime,
      sets,
      reps,
      intensity,
      caloriesBurned,
      notes
    } = req.body;

    const entry = await Fitness.create({
      date: date || new Date().toISOString().split('T')[0],
      waterIntakeMl: waterIntakeMl !== undefined ? Number(waterIntakeMl) : 2000,
      waterGoalMl: waterGoalMl !== undefined ? Number(waterGoalMl) : 2500,
      sleepHours: sleepHours !== undefined ? Number(sleepHours) : 7.5,
      sleepGoalHours: sleepGoalHours !== undefined ? Number(sleepGoalHours) : 8.0,
      workoutCompleted: workoutCompleted !== undefined ? Boolean(workoutCompleted) : true,
      workoutType: workoutType ? workoutType.trim() : 'Daily Walking',
      workoutCategory: workoutCategory || 'walking',
      distanceMeters: distanceMeters !== undefined ? Number(distanceMeters) : 0,
      durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : 30,
      startTime: startTime || '',
      endTime: endTime || '',
      sets: sets !== undefined ? Number(sets) : 0,
      reps: reps !== undefined ? Number(reps) : 0,
      intensity: intensity || 'medium',
      caloriesBurned: caloriesBurned !== undefined ? Number(caloriesBurned) : 400,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Fitness record logged successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Quick add water (+250ml)
 * @route PATCH /api/fitness/:id/water
 */
exports.addWater = async (req, res) => {
  try {
    const { id } = req.params;
    const delta = req.body.delta !== undefined ? Number(req.body.delta) : 250;
    const log = await Fitness.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    log.waterIntakeMl = Math.max(0, (log.waterIntakeMl || 0) + delta);
    await log.save();

    res.json({
      success: true,
      message: `Hydration updated: ${log.waterIntakeMl} ml`,
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update fitness log
 * @route PUT /api/fitness/:id
 */
exports.updateFitnessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Fitness.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    const updated = await Fitness.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Fitness record updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete fitness log
 * @route DELETE /api/fitness/:id
 */
exports.deleteFitnessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Fitness.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }

    await Fitness.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Fitness log deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
