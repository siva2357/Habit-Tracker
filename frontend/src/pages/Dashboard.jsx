import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, CheckSquare, Calendar, Wallet, Download, Calendar as CalendarIcon, Activity, Briefcase } from 'lucide-react';
import client from '../api/client';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const renderCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length && payload[0].name !== 'No Data') {
    const val = payload[0].value;
    const name = payload[0].name;
    const isFinance = ['Income', 'Expense', 'Balance'].includes(name);
    return (
      <div className="glass p-2" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>
          {name}: {isFinance ? `₹${val.toFixed(2)}` : val}
        </p>
      </div>
    );
  }
  return null;
};

const EmptyPieData = [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [projects, setProjects] = useState([]);
  const [budget, setBudget] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userName = userInfo.name ? userInfo.name.split(' ')[0] : 'User';

  useEffect(() => {
    client.get('/habits').then(res => setHabits(res.data)).catch(console.error);
    client.get('/tasks').then(res => setTasks(res.data)).catch(console.error);
    client.get('/goals').then(res => setGoals(res.data)).catch(console.error);
    client.get('/transactions').then(res => setTransactions(res.data)).catch(console.error);
    client.get('/exercises').then(res => setExercises(res.data)).catch(console.error);
    client.get('/projects').then(res => setProjects(res.data)).catch(console.error);
    client.get('/budget').then(res => setBudget(res.data)).catch(console.error);
  }, []);

  // Filter helpers
  const isCurrentMonthYearDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  // 1. Habits
  const habitsData = useMemo(() => {
    let completed = 0;
    let missed = 0;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      habits.forEach(h => {
        if (h.tracking && h.tracking[dateKey] === true) completed++;
        else if (new Date(dateKey) <= new Date()) missed++; 
      });
    }
    if (completed === 0 && missed === 0) return EmptyPieData;
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Missed', value: missed, color: '#ef4444' },
    ];
  }, [habits, currentMonth, currentYear]);
  const habitScore = habitsData === EmptyPieData ? 0 : (habitsData[0].value / (habitsData[0].value + habitsData[1].value) * 100);

  // 2. Tasks
  const tasksData = useMemo(() => {
    const monthTasks = tasks.filter(t => isCurrentMonthYearDate(t.date));
    const done = monthTasks.filter(t => t.completed).length;
    const pending = monthTasks.length - done;
    if (done === 0 && pending === 0) return EmptyPieData;
    return [
      { name: 'Done', value: done, color: '#6366f1' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
    ];
  }, [tasks, currentMonth, currentYear]);
  const taskScore = tasksData === EmptyPieData ? 0 : (tasksData[0].value / (tasksData[0].value + tasksData[1].value) * 100);

  // 3. Goals
  const goalsData = useMemo(() => {
    let completed = 0, inProgress = 0, pending = 0;
    goals.forEach(g => {
      if (g.status === 'Completed') completed++;
      else if (g.status === 'In Progress') inProgress++;
      else pending++;
    });
    if (completed === 0 && inProgress === 0 && pending === 0) return EmptyPieData;
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Pending', value: pending, color: '#e2e8f0' },
    ];
  }, [goals]);
  const activeGoals = goals.filter(g => g.status === 'In Progress').length;

  // 4. Finance
  const financeData = useMemo(() => {
    const monthTx = transactions.filter(t => isCurrentMonthYearDate(t.date));
    let income = 0, expense = 0;
    monthTx.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() < currentYear || (tDate.getFullYear() === currentYear && tDate.getMonth() <= currentMonth)) {
        if (t.type === 'income') cumulativeIncome += Number(t.amount);
        if (t.type === 'expense') cumulativeExpense += Number(t.amount);
      }
    });

    const startingBalance = budget ? budget.startingBalance : 0;
    const balance = startingBalance + cumulativeIncome - cumulativeExpense;

    // Show empty only if there is truly nothing to display
    if (income === 0 && expense === 0 && balance === 0) return EmptyPieData;

    const allSlices = [
      { name: 'Income', value: income, color: '#10b981' },
      { name: 'Expense', value: expense, color: '#ef4444' },
      { name: 'Balance', value: balance > 0 ? balance : 0, color: '#6366f1' },
    ];
    // Filter out zero-value slices — Recharts can't render them cleanly
    const filtered = allSlices.filter(s => s.value > 0);
    return filtered.length > 0 ? filtered : EmptyPieData;
  }, [transactions, currentMonth, currentYear, budget]);
  
  const budgetHealth = useMemo(() => {
    if (financeData === EmptyPieData) return 0;
    const incomeSlice = financeData.find(s => s.name === 'Income');
    const expenseSlice = financeData.find(s => s.name === 'Expense');
    const income = incomeSlice ? incomeSlice.value : 0;
    const expense = expenseSlice ? expenseSlice.value : 0;
    if (income === 0) return 0;
    const health = ((income - expense) / income) * 100;
    return health < 0 ? 0 : Math.round(health);
  }, [financeData]);

  // 5. Fitness
  const fitnessData = useMemo(() => {
    const monthEx = exercises.filter(e => isCurrentMonthYearDate(e.date));
    const activeDays = new Set(monthEx.map(e => e.date)).size;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (activeDays === 0) return EmptyPieData;
    return [
      { name: 'Active Days', value: activeDays, color: '#10b981' },
      { name: 'Rest Days', value: daysInMonth - activeDays, color: '#e2e8f0' },
    ];
  }, [exercises, currentMonth, currentYear]);
  const activeFitnessDays = fitnessData === EmptyPieData ? 0 : fitnessData[0].value;

  // 6. Projects
  const projectsData = useMemo(() => {
    let completed = 0, inProgress = 0, planned = 0;
    projects.forEach(p => {
      if (p.status === 'Completed') completed++;
      else if (p.status === 'In Progress') inProgress++;
      else planned++;
    });
    if (completed === 0 && inProgress === 0 && planned === 0) return EmptyPieData;
    return [
      { name: 'Completed', value: completed, color: '#6366f1' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Planned', value: planned, color: '#e2e8f0' },
    ];
  }, [projects]);
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Welcome Back, {userName}! 👋</h1>
          <p>Here's a summary of your overall progress for {months[currentMonth]} {currentYear}.</p>
        </div>
      </div>

      {/* Month/Year Selector and Actions */}
      <div className="flex items-center justify-between p-3 glass" style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarIcon size={20} color="var(--primary)" />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2rem 0.4rem 1rem' }}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2rem 0.4rem 1rem' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }} onClick={() => alert('Downloading report...')}>
          <Download size={16} /> Download Report
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-grid">
        
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Habit Score</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{Math.round(habitScore)}%</span>
        </div>
        
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Task Score</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>{Math.round(taskScore)}%</span>
        </div>

        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Active Goals</h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{activeGoals}</span>
          </div>
        </div>

        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={20} color="#ef4444" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Budget Health</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: budgetHealth >= 50 ? '#10b981' : '#ef4444', lineHeight: 1 }}>
            {budgetHealth > 0 ? Math.round(budgetHealth) : 0}%
          </span>
          {financeData !== EmptyPieData && (() => {
            const inc = financeData.find(s => s.name === 'Income');
            const exp = financeData.find(s => s.name === 'Expense');
            return (inc || exp) ? (
              <div className="flex gap-3 mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {inc && <span style={{ color: '#10b981' }}>₹{inc.value.toFixed(0)} in</span>}
                {exp && <span style={{ color: '#ef4444' }}>₹{exp.value.toFixed(0)} out</span>}
              </div>
            ) : null;
          })()}
        </div>

        {/* Fitness Card */}
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Active Days</h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{activeFitnessDays}</span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Active Projects</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>{activeProjects}</span>
        </div>

      </div>

      {/* Charts Grid */}
      <h2 className="mb-4 mt-8">Progress Breakdown</h2>
      <div className="charts-grid">
        
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Habits Completion</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={habitsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {habitsData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Tasks Execution</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tasksData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {tasksData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Goals Progress</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {goalsData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Monthly Finance</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={financeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {financeData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Fitness Tracking</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fitnessData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {fitnessData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Project Status</h3>
          <div style={{ width: '100%', height: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {projectsData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} stroke="none" /> ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
