import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Calendar, Target, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Planner from './pages/Planner';
import Goals from './pages/Goals';
import './index.css';

function Sidebar({ isOpen, setIsOpen, isMobile }) {
  // Close sidebar on mobile when navigating
  const location = useLocation();
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location, isMobile, setIsOpen]);

  return (
    <>
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="flex items-center justify-between mb-6" style={{ padding: '0 0.5rem' }}>
          <div className="flex items-center gap-3">
            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setIsOpen(!isOpen)}>
              <Menu size={24} color="var(--primary)" />
            </button>
            <h2 className="brand-text" style={{ marginBottom: 0, fontSize: '1.25rem' }}>TrackIt</h2>
          </div>
          {isMobile && (
            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex flex-col gap-2" style={{ flexDirection: 'column' }}>
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
        </nav>
      </aside>
    </>
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
      <div className="page-layout">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
        <main className={`main-content ${!isOpen && !isMobile ? 'expanded' : ''}`}>
          {isMobile && (
            <div className="mb-4">
              <button className="btn btn-outline" style={{ padding: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }} onClick={() => setIsOpen(true)}>
                <Menu size={20} />
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
