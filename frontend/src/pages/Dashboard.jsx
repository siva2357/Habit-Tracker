import React, { useEffect, useState } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { CheckCircle, Calendar, Target, Briefcase, Dumbbell, Wallet } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon }) => (
  <div className="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-accent">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400 m-0">{title}</p>
      <h3 className="text-2xl font-bold m-0">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    topStats: {
      totalHabits: 0,
      todaysTasks: 0,
      activeGoals: 0,
      activeProjects: 0,
      fitnessProgress: '0%',
      currentBalance: '$0'
    },
    charts: {
      habitsPct: 0,
      tasksPct: 0,
      goalsPct: 0,
      projectsPct: 0,
      fitnessPct: 0,
      budgetPct: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <ModuleLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-accent">Loading your dashboard...</div>
        </div>
      </ModuleLayout>
    );
  }

  const { topStats, charts } = stats;

  return (
    <ModuleLayout title="Dashboard">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Habits" value={topStats.totalHabits} icon={<CheckCircle size={24} />} />
        <StatCard title="Today's Tasks" value={topStats.todaysTasks} icon={<Calendar size={24} />} />
        <StatCard title="Active Goals" value={topStats.activeGoals} icon={<Target size={24} />} />
        <StatCard title="Active Projects" value={topStats.activeProjects} icon={<Briefcase size={24} />} />
        <StatCard title="Fitness Progress" value={topStats.fitnessProgress} icon={<Dumbbell size={24} />} />
        <StatCard title="Current Balance" value={topStats.currentBalance} icon={<Wallet size={24} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module Pie Charts */}
        {[
          { title: "Habits Completion", pct: charts.habitsPct, color: "#6366f1", icon: <CheckCircle size={18} className="text-[#6366f1]" /> },
          { title: "Tasks Done", pct: charts.tasksPct, color: "#8b5cf6", icon: <Calendar size={18} className="text-[#8b5cf6]" /> },
          { title: "Goal Progress", pct: charts.goalsPct, color: "#ec4899", icon: <Target size={18} className="text-[#ec4899]" /> },
          { title: "Project Progress", pct: charts.projectsPct, color: "#14b8a6", icon: <Briefcase size={18} className="text-[#14b8a6]" /> },
          { title: "Fitness Goals", pct: charts.fitnessPct, color: "#f59e0b", icon: <Dumbbell size={18} className="text-[#f59e0b]" /> },
          { title: "Budget Used", pct: charts.budgetPct, color: "#3b82f6", icon: <Wallet size={18} className="text-[#3b82f6]" /> }
        ].map((mod, i) => (
          <div key={i} className="glass-panel p-6 flex flex-col items-center justify-center relative">
            <h3 className="text-lg font-semibold mb-6 w-full border-b border-white/10 pb-3 flex items-center gap-2">
              {mod.icon}
              {mod.title}
            </h3>
            <div className="relative w-40 h-40 rounded-full border-4 border-white/5 flex items-center justify-center shadow-lg">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${mod.color} 0% ${mod.pct}%, rgba(255,255,255,0.05) ${mod.pct}% 100%)`,
                  opacity: 0.9
                }}
              />
              <div className="absolute inset-2 rounded-full bg-[#0f172a] flex items-center justify-center z-10 shadow-inner">
                <span className="text-2xl font-bold">{mod.pct}%</span>
              </div>
            </div>
          </div>
        ))}

      </div>

    </ModuleLayout>
  );
};

export default Dashboard;
