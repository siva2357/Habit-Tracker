const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const PlannerTask = require('../models/PlannerTask');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Project = require('../models/Project');
const Fitness = require('../models/Fitness');

/**
 * @desc Get real-time aggregated metrics for all 6 core modules
 * @route GET /api/dashboard/summary
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. FINANCES: Realtime from MongoDB Transactions
    const transactions = await Transaction.find();
    let totalCredit = 0;
    let totalDebit = 0;
    transactions.forEach((t) => {
      if (t.type === 'credit') totalCredit += t.amount;
      else if (t.type === 'debit') totalDebit += t.amount;
    });
    const baseBalance = req.query.baseBalance ? Number(req.query.baseBalance) : 0;
    const netBalance = baseBalance + totalCredit - totalDebit;
    const financeSurplus = totalCredit - totalDebit;
    const financeProgress = totalCredit > 0
      ? Math.min(100, Math.max(0, Math.round(((totalCredit - totalDebit) / totalCredit) * 100)))
      : 0;

    // 2. DAY PLANNER: Realtime from MongoDB Tasks (today or latest)
    let plannerTasks = await PlannerTask.find({ date: todayStr });
    if (plannerTasks.length === 0) {
      plannerTasks = await PlannerTask.find().sort({ date: -1 }).limit(10);
    }
    const plannerTotal = plannerTasks.length;
    const plannerCompleted = plannerTasks.filter((t) => t.status === 'completed').length;
    const plannerProgress = plannerTotal > 0 ? Math.round((plannerCompleted / plannerTotal) * 100) : 0;

    // 3. GOAL PLANNER: Realtime from MongoDB Goals
    const goals = await Goal.find();
    const goalsTotal = goals.length;
    const goalsCompleted = goals.filter((g) => g.status === 'completed').length;
    const goalsInProgress = goals.filter((g) => g.status === 'in_progress').length;
    const goalsProgress = goalsTotal > 0 ? Math.round((goalsCompleted / goalsTotal) * 100) : 0;

    // 4. HABIT TRACKER: Realtime from MongoDB Habits
    const habits = await Habit.find();
    const habitsTotal = habits.length;
    const habitsDoneToday = habits.filter((h) => h.completedToday).length;
    const habitsProgress = habitsTotal > 0 ? Math.round((habitsDoneToday / habitsTotal) * 100) : 0;

    // 5. MY PROJECTS: Realtime from MongoDB Projects
    const projects = await Project.find();
    const projectsTotal = projects.length;
    const projectsAvgProgress = projectsTotal > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projectsTotal)
      : 0;
    const totalProjectTasks = projects.reduce((acc, p) => acc + (p.tasksTotal || 0), 0);
    const completedProjectTasks = projects.reduce((acc, p) => acc + (p.tasksCompleted || 0), 0);

    // 6. MY FITNESS: Realtime from MongoDB Fitness
    let fitnessRecord = await Fitness.findOne({ date: todayStr });
    if (!fitnessRecord) {
      fitnessRecord = await Fitness.findOne().sort({ createdAt: -1 });
    }
    const waterProgress = fitnessRecord && fitnessRecord.waterGoalMl > 0
      ? Math.min(100, Math.round((fitnessRecord.waterIntakeMl / fitnessRecord.waterGoalMl) * 100))
      : 0;
    const fitnessProgress = fitnessRecord && fitnessRecord.workoutCompleted ? Math.min(100, waterProgress + 10) : waterProgress;

    // Formatted Rupee display
    const formatINR = (val) =>
      `₹${Math.abs(val).toLocaleString('en-IN')}`;

    // Aggregated Module Data Array matching DashboardPage expectations
    const modules = [
      {
        id: 'habits',
        name: 'Habit Tracker',
        category: 'Consistency & Routine',
        path: '/habits',
        progress: habitsProgress,
        metric: `${habitsDoneToday} of ${habitsTotal} habits completed for today`,
        status: habitsTotal === 0 ? 'Not Started' : habitsProgress >= 80 ? 'On Track' : 'In Progress',
        statusColor: 'bg-violet-50 text-violet-700 border-violet-200',
        color: '#8b5cf6',
        lastUpdated: 'Live MongoDB'
      },
      {
        id: 'planner',
        name: 'Day Planner',
        category: 'Time Blocking',
        path: '/planner',
        progress: plannerProgress,
        metric: `${plannerCompleted} of ${plannerTotal} daily blocks completed`,
        status: plannerTotal === 0 ? 'Not Started' : plannerCompleted === plannerTotal ? 'Completed' : 'In Progress',
        statusColor: 'bg-sky-50 text-sky-700 border-sky-200',
        color: '#0284c7',
        lastUpdated: 'Live MongoDB'
      },
      {
        id: 'goals',
        name: 'Goal Planner',
        category: 'Strategic Milestones',
        path: '/goals',
        progress: goalsProgress,
        metric: `${goalsInProgress} active goals • ${goalsCompleted} of ${goalsTotal} completed`,
        status: goalsTotal === 0 ? 'Not Started' : goalsProgress >= 50 ? 'Advancing' : 'In Progress',
        statusColor: 'bg-pink-50 text-pink-700 border-pink-200',
        color: '#ec4899',
        lastUpdated: 'Live MongoDB'
      },
      {
        id: 'projects',
        name: 'My Projects',
        category: 'Personal & Work',
        path: '/projects',
        progress: projectsAvgProgress,
        metric: `${projectsTotal} active projects • ${completedProjectTasks}/${totalProjectTasks} deliverables done`,
        status: projectsTotal === 0 ? 'Not Started' : projectsAvgProgress === 100 ? 'Completed' : 'In Progress',
        statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
        color: '#f59e0b',
        lastUpdated: 'Live MongoDB'
      },
      {
        id: 'fitness',
        name: 'My Fitness',
        category: 'Health & Biometrics',
        path: '/fitness',
        progress: fitnessProgress,
        metric: `${fitnessRecord ? fitnessRecord.waterIntakeMl : 0}ml / ${fitnessRecord ? fitnessRecord.waterGoalMl : 0}ml • ${fitnessRecord ? fitnessRecord.sleepHours : 0}h sleep`,
        status: !fitnessRecord ? 'Not Started' : 'Active',
        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        color: '#10b981',
        lastUpdated: 'Live MongoDB'
      },
      {
        id: 'finances',
        name: 'My Finances',
        category: 'Cashflow & Budget (₹)',
        path: '/finances',
        progress: financeProgress,
        metric: `${financeSurplus >= 0 ? '+' : '-'}${formatINR(financeSurplus)} net surplus • ${transactions.length} transactions`,
        status: transactions.length === 0 ? 'Not Started' : financeSurplus >= 0 ? 'Surplus' : 'Deficit',
        statusColor: 'bg-teal-50 text-teal-700 border-teal-200',
        color: '#0d9488',
        lastUpdated: 'Live MongoDB'
      }
    ];

    // Compute Overall Average Progress
    const averageProgress = Math.round(
      modules.reduce((acc, m) => acc + m.progress, 0) / modules.length
    );

    // Stat Cards Metrics
    const statCards = {
      habits: {
        value: `${habitsDoneToday} / ${habitsTotal} Done`,
        subtitle: `${habitsTotal} Habits Monitored`,
        trend: `${habitsProgress}% Done`
      },
      planner: {
        value: `${plannerCompleted} / ${plannerTotal} Done`,
        subtitle: `${plannerTotal - plannerCompleted} blocks left`,
        trend: `${plannerProgress}% Completed`
      },
      goals: {
        value: `${goalsInProgress} Active`,
        subtitle: `${goalsCompleted} of ${goalsTotal} Completed`,
        trend: `${goalsProgress}% Achieved`
      },
      projects: {
        value: `${projectsTotal} Projects`,
        subtitle: `${completedProjectTasks} / ${totalProjectTasks} Tasks Done`,
        trend: `${projectsAvgProgress}% Deliverables`
      },
      fitness: {
        value: `${fitnessRecord ? fitnessRecord.waterIntakeMl : 0} ml`,
        subtitle: `Hydration • ${fitnessRecord ? fitnessRecord.sleepHours : 0}h Sleep`,
        trend: `${waterProgress}% Water Goal`
      },
      finances: {
        value: `${formatINR(netBalance)}`,
        subtitle: `Surplus: ${financeSurplus >= 0 ? '+' : '-'}${formatINR(financeSurplus)}`,
        trend: `${financeSurplus >= 0 ? '+' : '-'}${formatINR(financeSurplus)} (₹)`
      }
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: mongoose.connection.host
        ? `MongoDB Atlas (${mongoose.connection.host}/${mongoose.connection.name})`
        : 'MongoDB Atlas Live (TrackIt)',
      averageProgress,
      modules,
      statCards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
