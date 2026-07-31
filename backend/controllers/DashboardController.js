const HabitTracker = require('../models/HabitTracker');
const DayPlanner = require('../models/DayPlanner');
const GoalPlanner = require('../models/GoalPlanner');
const MyProjects = require('../models/MyProjects');
const MyFitness = require('../models/MyFitness');
const MyFinances = require('../models/MyFinances');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch all required data concurrently
    const [habits, tasks, goals, projects, fitnessLogs, transactions] = await Promise.all([
      HabitTracker.find({ user: userId }),
      DayPlanner.find({ user: userId }),
      GoalPlanner.find({ user: userId }),
      MyProjects.find({ user: userId }),
      MyFitness.find({ user: userId }),
      MyFinances.find({ user: userId })
    ]);

    // Calculate Top Stats
    const totalHabits = habits.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter(t => t.dateKey === today);
    const totalTodaysTasks = todaysTasks.length;
    
    const activeGoals = goals.filter(g => g.status !== 'Completed').length;
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;
    
    // Mocking fitness progress based on logs
    const fitnessProgress = fitnessLogs.length > 0 ? 
      Math.min(100, Math.round((fitnessLogs.length / 30) * 100)) + '%' : '0%';
      
    // Calculate balance
    let balance = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') balance += t.amount;
      else if (t.type === 'Expense') balance -= t.amount;
    });

    // Calculate Pie Chart Percentages
    const calcPct = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);

    // Habits Completion % (mock based on tracking size)
    let totalTracked = 0;
    habits.forEach(h => {
      if (h.tracking && typeof h.tracking.size === 'number') {
        totalTracked += h.tracking.size;
      } else if (h.tracking && typeof h.tracking === 'object') {
        totalTracked += Object.keys(h.tracking).length;
      }
    });
    const habitsPct = calcPct(totalTracked, habits.length * 7); // Assuming 7 days track

    // Tasks Done %
    const completedTasks = tasks.filter(t => t.completed).length;
    const tasksPct = calcPct(completedTasks, tasks.length);

    // Goal Progress %
    const totalGoalProgress = goals.reduce((acc, g) => acc + (g.progress || 0), 0);
    const goalsPct = calcPct(totalGoalProgress, goals.length * 100);

    // Project Progress %
    let totalProjectTasks = 0;
    let completedProjectTasks = 0;
    projects.forEach(p => {
      if (p.tasks) {
        totalProjectTasks += p.tasks.length;
        completedProjectTasks += p.tasks.filter(t => t.status === 'Completed').length;
      }
    });
    const projectsPct = calcPct(completedProjectTasks, totalProjectTasks);

    // Fitness Goals % (mock)
    const fitnessPct = fitnessLogs.length > 0 ? Math.min(100, Math.round((fitnessLogs.length / 30) * 100)) : 0;

    // Budget Used %
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0);
    const budgetPct = calcPct(totalExpense, totalIncome);

    res.json({
      topStats: {
        totalHabits,
        todaysTasks: totalTodaysTasks,
        activeGoals,
        activeProjects,
        fitnessProgress,
        currentBalance: '$' + balance.toLocaleString()
      },
      charts: {
        habitsPct,
        tasksPct,
        goalsPct,
        projectsPct,
        fitnessPct,
        budgetPct
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};