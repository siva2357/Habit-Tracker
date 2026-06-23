import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, CheckSquare, Calendar, Wallet, Download, Calendar as CalendarIcon, Activity, Briefcase } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const habitsData = [
  { name: 'Completed', value: 85, color: '#10b981' },
  { name: 'Missed/Pending', value: 15, color: '#e2e8f0' },
];

const tasksData = [
  { name: 'Done', value: 70, color: '#6366f1' },
  { name: 'Pending', value: 30, color: '#e2e8f0' },
];

const goalsData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 35, color: '#f59e0b' },
  { name: 'Pending', value: 20, color: '#e2e8f0' },
];

const financeData = [
  { name: 'Income', value: 5000, color: '#10b981' },
  { name: 'Expense', value: 1850, color: '#ef4444' },
  { name: 'Balance', value: 3150, color: '#6366f1' },
];

const fitnessData = [
  { name: 'Active Days', value: 20, color: '#10b981' },
  { name: 'Rest Days', value: 10, color: '#e2e8f0' },
];

const projectsData = [
  { name: 'Completed', value: 3, color: '#6366f1' },
  { name: 'In Progress', value: 5, color: '#f59e0b' },
  { name: 'Planned', value: 2, color: '#e2e8f0' },
];

const renderCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Welcome Back, Alex! 👋</h1>
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
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Habits</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>85%</span>
        </div>
        
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Tasks</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>70%</span>
        </div>

        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Goals</h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>2</span>
          </div>
        </div>

        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={20} color="#ef4444" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Budget</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>60%</span>
        </div>

        {/* Fitness Card */}
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} color="#10b981" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Fitness</h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>20</span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="card glass">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase size={20} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Projects</h3>
          </div>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>3</span>
        </div>
      </div>

      {/* Charts Grid */}
      <h2 className="mb-4">Progress Breakdown</h2>
      <div className="charts-grid">
        
        {/* Habits Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Habits Completion</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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

        {/* Tasks Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Tasks Execution</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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

        {/* Goals Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Goals Progress</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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

        {/* Finance Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Monthly Finance</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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

        {/* Fitness Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Fitness Tracking</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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

        {/* Projects Chart */}
        <div className="card glass flex flex-col items-center">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Project Status</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
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
