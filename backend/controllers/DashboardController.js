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
      balance += t.amount;
    });

    // Calculate Pie Chart Percentages (No longer needed for single % but kept logic for segments)
    const todayStr = new Date().toISOString().split('T')[0];

    // Habits
    let habitsCompletedToday = 0;
    let habitsNotCompletedToday = 0;
    habits.forEach(h => {
      if (h.tracking && h.tracking.get(todayStr) === true) {
        habitsCompletedToday++;
      } else {
        habitsNotCompletedToday++;
      }
    });
    const habitsTotal = habits.length;
    const habitsSegments = [
      { label: 'Done', value: habitsCompletedToday, color: '#6366f1' },
      { label: 'Not Done', value: habitsNotCompletedToday, color: '#4f46e5' } // slightly darker
    ];

    // Tasks (Day Planner)
    const tasksPending = tasks.filter(t => t.status === 'created').length;
    const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
    const tasksNotCompleted = tasks.filter(t => t.status === 'not_completed').length;
    const tasksTotal = tasks.length;
    const tasksSegments = [
      { label: 'Pending', value: tasksPending, color: '#8b5cf6' },
      { label: 'Completed', value: tasksCompleted, color: '#10b981' },
      { label: 'Not Completed', value: tasksNotCompleted, color: '#ef4444' }
    ];

    // Goals
    const goalsPending = goals.filter(g => g.status === 'Pending').length;
    const goalsInProgress = goals.filter(g => g.status === 'In Progress').length;
    const goalsCompleted = goals.filter(g => g.status === 'Completed').length;
    const goalsTotal = goals.length;
    const goalsSegments = [
      { label: 'Pending', value: goalsPending, color: '#ec4899' },
      { label: 'In Progress', value: goalsInProgress, color: '#f59e0b' },
      { label: 'Completed', value: goalsCompleted, color: '#10b981' }
    ];

    // Projects
    let projPending = 0;
    let projInProgress = 0;
    let projCompleted = 0;
    projects.forEach(p => {
      if (p.status === 'Pending') projPending++;
      else if (p.status === 'In Progress') projInProgress++;
      else if (p.status === 'Completed') projCompleted++;
      else projPending++;
    });
    const projectsTotal = projects.length;
    const projectsSegments = [
      { label: 'Pending', value: projPending, color: '#14b8a6' },
      { label: 'In Progress', value: projInProgress, color: '#f59e0b' },
      { label: 'Completed', value: projCompleted, color: '#10b981' }
    ];

    // Fitness
    const walkCount = fitnessLogs.filter(l => l.type === 'Walking').length;
    const weightCount = fitnessLogs.filter(l => l.type === 'Weight Training').length;
    const bodyCount = fitnessLogs.filter(l => l.type === 'Bodyweight').length;
    const fitnessTotal = fitnessLogs.length;
    const fitnessSegments = [
      { label: 'Walking', value: walkCount, color: '#f59e0b' },
      { label: 'Weight Training', value: weightCount, color: '#3b82f6' },
      { label: 'Bodyweight', value: bodyCount, color: '#ec4899' }
    ];

    // Budget
    const incomeAmt = transactions.filter(t => t.type === 'income' && t.category !== 'Balance').reduce((a, b) => a + Math.abs(b.amount), 0);
    const expenseAmt = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Math.abs(b.amount), 0);
    const balanceAmt = balance; // calculated above
    const budgetSegments = [
      { label: 'Income', value: incomeAmt, color: '#10b981' },
      { label: 'Expenses', value: expenseAmt, color: '#ef4444' },
      { label: 'Balance', value: balanceAmt, color: '#3b82f6' }
    ];

    res.json({
      topStats: {
        totalHabits,
        todaysTasks: totalTodaysTasks,
        activeGoals,
        activeProjects,
        fitnessProgress,
        currentBalance: '₹' + balance.toLocaleString()
      },
      charts: {
        habits: { segments: habitsSegments, total: habitsTotal },
        tasks: { segments: tasksSegments, total: tasksTotal },
        goals: { segments: goalsSegments, total: goalsTotal },
        projects: { segments: projectsSegments, total: projectsTotal },
        fitness: { segments: fitnessSegments, total: fitnessTotal },
        budget: { segments: budgetSegments, total: `₹${balanceAmt.toLocaleString()}` }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};