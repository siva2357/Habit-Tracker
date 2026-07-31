import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Calendar, 
  Target, 
  Briefcase, 
  Dumbbell, 
  Wallet,
  Settings,
  LogOut
} from 'lucide-react';

const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const modules = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={32} strokeWidth={1.5} />, desc: 'Overview of all activities' },
    { path: '/habit-tracker', name: 'Habit Tracker', icon: <CheckCircle size={32} strokeWidth={1.5} />, desc: 'Track daily habits & streaks' },
    { path: '/day-planner', name: 'Day Planner', icon: <Calendar size={32} strokeWidth={1.5} />, desc: 'Structure your daily schedule' },
    { path: '/goal-planner', name: 'Goal Planner', icon: <Target size={32} strokeWidth={1.5} />, desc: 'Monitor your long-term goals' },
    { path: '/my-projects', name: 'My Projects', icon: <Briefcase size={32} strokeWidth={1.5} />, desc: 'Manage tasks and deadlines' },
    { path: '/my-fitness', name: 'My Fitness', icon: <Dumbbell size={32} strokeWidth={1.5} />, desc: 'Track health and workouts' },
    { path: '/my-finances', name: 'My Finances', icon: <Wallet size={32} strokeWidth={1.5} />, desc: 'Manage budgets and expenses' },
    { path: '/account-settings', name: 'Account Settings', icon: <Settings size={32} strokeWidth={1.5} />, desc: 'Manage profile & preferences' },
  ];

  return (
    <div className="page-container relative">
      <button 
        onClick={handleLogout}
        className="absolute top-8 right-8 flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors font-medium"
      >
        <LogOut size={18} /> Logout
      </button>
      
      <header style={{ marginBottom: '3rem', textAlign: 'center', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome to TrackIt</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your Personal Life Management System</p>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {modules.map(mod => (
          <Link key={mod.path} to={mod.path} className="glass-panel" style={{ 
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {mod.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{mod.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>{mod.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
