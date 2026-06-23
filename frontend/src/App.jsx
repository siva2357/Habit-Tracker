import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Calendar, Target, Briefcase, Menu, X, Wallet, User, LogOut, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Planner from './pages/Planner';
import Goals from './pages/Goals';
import Projects from './pages/Projects';
import Fitness from './pages/Fitness';
import Finance from './pages/Finance';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const navigate = useNavigate();
  if (isMobile) return null;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between mb-6" style={{ padding: '0 0.5rem' }}>
          <div className="flex items-center gap-3">
            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setIsOpen(!isOpen)}>
              <Menu size={24} color="var(--primary)" />
            </button>
            <div className="flex items-center gap-2 brand-text">
              <Activity size={24} color="var(--primary)" />
              <h2 style={{ marginBottom: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>TrackIt</h2>
            </div>
          </div>
          {isMobile && (
            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex flex-col gap-2" style={{ flexDirection: 'column', flex: 1 }}>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Home size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Dashboard</span>
            <span className="tooltip-text">Dashboard</span>
          </NavLink>
          <NavLink to="/habits" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <CheckSquare size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Habits</span>
            <span className="tooltip-text">Habits</span>
          </NavLink>
          <NavLink to="/planner" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Calendar size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Daily Planner</span>
            <span className="tooltip-text">Daily Planner</span>
          </NavLink>
          <NavLink to="/goals" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Target size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Goals</span>
            <span className="tooltip-text">Goals</span>
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Briefcase size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Projects</span>
            <span className="tooltip-text">Projects</span>
          </NavLink>
          <NavLink to="/fitness" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Activity size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Fitness</span>
            <span className="tooltip-text">Fitness</span>
          </NavLink>
          <NavLink to="/finance" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Wallet size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Finance</span>
            <span className="tooltip-text">Finance</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <User size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Profile</span>
            <span className="tooltip-text">Profile</span>
          </NavLink>
          <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => navigate('/login')}>
            <LogOut size={20} style={{ minWidth: '20px' }} />
            <span className="nav-text">Logout</span>
            <span className="tooltip-text" style={{ background: 'var(--danger)' }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" style={{ padding: '0 0.25rem' }}>
      <NavLink to="/" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <Home size={22} />
      </NavLink>
      <NavLink to="/habits" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <CheckSquare size={22} />
      </NavLink>
      <NavLink to="/planner" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <Calendar size={22} />
      </NavLink>
      <NavLink to="/projects" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <Briefcase size={22} />
      </NavLink>
      <NavLink to="/fitness" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <Activity size={22} />
      </NavLink>
      <NavLink to="/finance" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <Wallet size={22} />
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => isActive ? "bottom-nav-link active" : "bottom-nav-link"} style={{ padding: '0.5rem 0.25rem' }}>
        <User size={22} />
      </NavLink>
    </nav>
  );
}

function AppContent({ isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="page-layout">
      {!isAuthPage && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />}
      <main className={`main-content ${!isOpen && !isMobile && !isAuthPage ? 'expanded' : ''}`} style={isAuthPage ? { marginLeft: 0, padding: 0 } : {}}>
        {isMobile && !isAuthPage && <BottomNav />}
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/fitness" element={<ProtectedRoute><Fitness /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <AppContent isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
    </Router>
  );
}

export default App;
