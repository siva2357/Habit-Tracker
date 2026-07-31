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
      currentBalance: '₹0'
    },
    charts: {
      habits: { segments: [], total: 0 },
      tasks: { segments: [], total: 0 },
      goals: { segments: [], total: 0 },
      projects: { segments: [], total: 0 },
      fitness: { segments: [], total: 0 },
      budget: { segments: [], total: 0 }
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
          { title: "Habits Completion", data: charts.habits, icon: <CheckCircle size={18} className="text-[#6366f1]" /> },
          { title: "Tasks Done", data: charts.tasks, icon: <Calendar size={18} className="text-[#8b5cf6]" /> },
          { title: "Goal Progress", data: charts.goals, icon: <Target size={18} className="text-[#ec4899]" /> },
          { title: "Project Progress", data: charts.projects, icon: <Briefcase size={18} className="text-[#14b8a6]" /> },
          { title: "Fitness Goals", data: charts.fitness, icon: <Dumbbell size={18} className="text-[#f59e0b]" /> },
          { title: "Budget Used", data: charts.budget, icon: <Wallet size={18} className="text-[#3b82f6]" /> }
        ].map((mod, i) => {
          const segments = mod.data?.segments || [];
          const totalValue = segments.reduce((sum, s) => sum + s.value, 0);
          
          let currentOffset = 0;
          const C = 2 * Math.PI * 40; // Circumference for r=40

          return (
            <div key={i} className="glass-panel p-6 flex flex-col items-center justify-center relative">
              <h3 className="text-lg font-semibold mb-6 w-full border-b border-white/10 pb-3 flex items-center gap-2">
                {mod.icon}
                {mod.title}
              </h3>
              
              {/* SVG Doughnut Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center shadow-lg rounded-full">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl overflow-visible">
                  {/* Dark Center Background */}
                  <circle cx="50" cy="50" r="32" fill="#0f172a" className="drop-shadow-sm" />
                  
                  {totalValue === 0 ? (
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" 
                    />
                  ) : (
                    segments.map((seg, idx) => {
                      if (seg.value === 0) return null;
                      const dash = (seg.value / totalValue) * C;
                      const offset = currentOffset;
                      currentOffset -= dash;
                      
                      const valStr = mod.title === "Budget Used" ? `₹${seg.value.toLocaleString()}` : seg.value;
                      
                      return (
                        <circle 
                          key={idx}
                          cx="50" cy="50" r="40"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="16"
                          strokeDasharray={`${dash} ${C}`}
                          strokeDashoffset={offset}
                          className="transition-all duration-300 hover:stroke-opacity-80 cursor-pointer"
                          strokeLinecap="butt"
                        >
                          <title>{seg.label}: {valStr}</title>
                        </circle>
                      );
                    })
                  )}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-xl font-bold">{mod.data?.total || 0}</span>
                </div>
              </div>
              
              {/* Static Legend with Values */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm w-full">
                {segments.map((seg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                    <span className="text-slate-300 font-medium">
                      {seg.label} <span className="text-white font-bold ml-1">{mod.title === "Budget Used" ? `₹${seg.value.toLocaleString()}` : seg.value}</span>
                    </span>
                  </div>
                ))}
              </div>
              
            </div>
          );
        })}

      </div>

    </ModuleLayout>
  );
};

export default Dashboard;
