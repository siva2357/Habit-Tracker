const Project = require('../models/Project');

/**
 * @desc Get all projects with filtering
 * @route GET /api/projects
 */
exports.getProjects = async (req, res) => {
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

    const projects = await Project.find(filter).sort({ deadline: 1, createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get projects summary
 * @route GET /api/projects/summary
 */
exports.getProjectSummary = async (req, res) => {
  try {
    const projects = await Project.find();
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === 'in_progress').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const planning = projects.filter((p) => p.status === 'planning').length;
    const onHold = projects.filter((p) => p.status === 'on_hold').length;

    const totalTasks = projects.reduce((acc, p) => acc + (p.tasksTotal || 0), 0);
    const completedTasks = projects.reduce((acc, p) => acc + (p.tasksCompleted || 0), 0);
    const avgProgress = total > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
      : 0;

    res.json({
      success: true,
      data: {
        total,
        inProgress,
        completed,
        planning,
        onHold,
        totalTasks,
        completedTasks,
        avgProgress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single project by ID
 * @route GET /api/projects/:id
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create a project
 * @route POST /api/projects
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, status, priority, progress, tasksTotal, tasksCompleted, startDate, deadline, steps } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const parsedSteps = Array.isArray(steps) ? steps : [];
    const computedTotal = parsedSteps.length > 0 ? parsedSteps.length : (tasksTotal ? Number(tasksTotal) : 4);
    const computedCompleted = parsedSteps.length > 0
      ? parsedSteps.filter((s) => ['completed', 'testing_completed', 'live'].includes(s.status)).length
      : (tasksCompleted ? Number(tasksCompleted) : 0);

    const computedProgress = computedTotal > 0
      ? Math.round((computedCompleted / computedTotal) * 100)
      : (progress !== undefined ? Number(progress) : 0);

    const project = await Project.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Engineering',
      status: status || (computedProgress === 100 ? 'completed' : 'in_progress'),
      priority: priority || 'medium',
      progress: computedProgress,
      tasksTotal: computedTotal,
      tasksCompleted: computedCompleted,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline: deadline || new Date().toISOString().split('T')[0],
      steps: parsedSteps
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update a project
 * @route PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const payload = { ...req.body };

    if (Array.isArray(payload.steps)) {
      payload.tasksTotal = payload.steps.length;
      payload.tasksCompleted = payload.steps.filter((s) =>
        ['completed', 'testing_completed', 'live'].includes(s.status)
      ).length;

      payload.progress = payload.tasksTotal > 0
        ? Math.round((payload.tasksCompleted / payload.tasksTotal) * 100)
        : 0;

      if (payload.progress === 100) {
        payload.status = 'completed';
      }
    }

    const updated = await Project.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Cycle project status: planning -> in_progress -> completed -> on_hold -> planning
 * @route PATCH /api/projects/:id/toggle
 */
exports.toggleProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let nextStatus = req.body.status;
    if (!nextStatus) {
      const order = ['planning', 'in_progress', 'completed', 'on_hold'];
      const currentIndex = order.indexOf(project.status);
      nextStatus = order[(currentIndex + 1) % order.length];
    }

    if (nextStatus === 'completed') {
      project.progress = 100;
      project.tasksCompleted = project.tasksTotal;
    }

    project.status = nextStatus;
    await project.save();

    res.json({
      success: true,
      message: `Project status updated to ${nextStatus}`,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete a project
 * @route DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
