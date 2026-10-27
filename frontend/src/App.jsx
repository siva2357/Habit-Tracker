import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Kanban,
  ListTodo,
  Map,
  BarChart3,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  Rocket,
  Tag
} from 'lucide-react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { UserLayout } from './layouts';
import InternalWorkspace from './pages/InternalWorkspace';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import DashboardPage from './pages/DashboardPage';
import TeamPage from './pages/TeamPage';
import MeetPage from './pages/MeetPage';
import { JiraProvider } from './context/JiraContext';
import './App.css';
import './components/Auth.css';
import './components/jira/Jira.css';

// Animated Jira Loop SVG Logo Component with Framer Motion
export const AnimatedTrackItLoopLogo = ({ size = 104 }) => {
  return (
    <motion.div
      className="logo-presentation"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="logo-glow-ring" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg-box"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
        </defs>

        {/* Squircle Base */}
        <rect width="100" height="100" rx="28" fill="url(#logoGrad)" />

        {/* Clean Inner Border */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="26"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />

        {/* Animated Infinite Agile Loop Track Path */}
        <motion.path
          d="M32 50 C32 38 43 38 50 50 C57 62 68 62 68 50 C68 38 57 38 50 50 C43 62 32 62 32 50 Z"
          stroke="url(#pathGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />

        {/* Agile Velocity Pulse Dot */}
        <motion.circle
          cx="50"
          cy="50"
          r="4.5"
          fill="#60a5fa"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

// Landing Page Component for TrackIt Jira
function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const leftBlobVariants = {
    animate: {
      x: [0, 45, -30, 0],
      y: [0, 55, -45, 0],
      scale: [1, 1.1, 0.95, 1],
      transition: { duration: 18, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const rightBlobVariants = {
    animate: {
      x: [0, -45, 30, 0],
      y: [0, -50, 40, 0],
      scale: [1, 1.12, 0.96, 1],
      transition: { duration: 20, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="landing-viewport">
      {/* Top Header */}
      <header className="app-header">
        <button
          type="button"
          className="brand-nav-link"
          onClick={() => navigate('/')}
          title="Return to TrackIt Jira Home"
        >
          <div className="nav-logo-icon">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path
                d="M32 50 C32 38 43 38 50 50 C57 62 68 62 68 50 C68 38 57 38 50 50 C43 62 32 62 32 50 Z"
                stroke="#ffffff"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="nav-brand-title">
            TrackIt <span className="gradient-text">Jira</span>
          </span>
        </button>

        {/* Top Right Corner Buttons */}
        <div className="nav-auth-buttons">
          <button
            type="button"
            className="btn-nav-login"
            onClick={() => navigate('/login')}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            className="btn-nav-register"
            onClick={() => navigate('/register')}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>

          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.95rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
            onClick={() => navigate('/board')}
          >
            <span>Agile Board</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Blue & Purple Ambient Blobs */}
      <div className="blob-canvas" aria-hidden="true">
        <motion.div
          className="ambient-blob blob-left-top"
          variants={leftBlobVariants}
          animate="animate"
        />
        <motion.div
          className="ambient-blob blob-left-bottom"
          variants={leftBlobVariants}
          animate="animate"
        />
        <motion.div
          className="ambient-blob blob-right-top"
          variants={rightBlobVariants}
          animate="animate"
        />
        <motion.div
          className="ambient-blob blob-right-bottom"
          variants={rightBlobVariants}
          animate="animate"
        />
      </div>

      <div className="pattern-grid" aria-hidden="true" />

      {/* Hero Content */}
      <motion.div
        className="container position-relative z-2 home-landing-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="row justify-content-center w-100">
          <div className="col-12 col-lg-10 col-xl-9 d-flex flex-column align-items-center text-center py-5">

            <motion.div
              className="content-wrapper w-100"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <div className="ecosystem-badge">
                  <span className="live-pulse" />
                  <span>Enterprise Agile & Project Management Suite</span>
                </div>
              </motion.div>

              {/* Animated Title Logo */}
              <motion.div variants={itemVariants}>
                <AnimatedTrackItLoopLogo size={106} />
              </motion.div>

              {/* Brand Title */}
              <motion.h1 className="brand-title" variants={itemVariants}>
                TrackIt <span className="gradient-brand">Jira</span>
              </motion.h1>

              {/* Tagline */}
              <motion.p className="brand-tagline" variants={itemVariants}>
                Next-generation agile project management built for high-velocity software engineering teams.
                Seamlessly coordinate <strong>Scrum & Kanban boards</strong>, manage <strong>sprint backlogs</strong>,
                and ship releases with confidence.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div variants={itemVariants} className="d-flex align-items-center gap-3 justify-content-center flex-wrap mb-4">
                <button
                  type="button"
                  onClick={() => navigate('/board')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.85rem 1.8rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Kanban size={18} />
                  <span>Open Sprint Board</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Sparkles size={18} color="#2563eb" />
                  <span>Project Overview</span>
                </button>
              </motion.div>

              {/* Feature Chips */}
              <motion.div className="hybrid-chips-row" variants={itemVariants}>
                <div
                  className="hybrid-chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/board')}
                >
                  <Kanban size={16} color="#2563eb" />
                  <span>Scrum & Kanban Boards</span>
                </div>
                <div
                  className="hybrid-chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/backlog')}
                >
                  <ListTodo size={16} color="#7c3aed" />
                  <span>Sprint Backlog</span>
                </div>
                <div
                  className="hybrid-chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/roadmap')}
                >
                  <Map size={16} color="#2563eb" />
                  <span>Epics Roadmap</span>
                </div>
                <div
                  className="hybrid-chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/reports')}
                >
                  <BarChart3 size={16} color="#7c3aed" />
                  <span>Velocity Analytics</span>
                </div>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main App Wrapped with JiraProvider and Full Routing
export default function App() {
  const location = useLocation();

  return (
    <JiraProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Jira Project Management Internal Routes */}
          <Route element={<UserLayout />}>
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/project-details" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectKey" element={<ProjectDetailsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/board" element={<InternalWorkspace activeNav="board" />} />
            <Route path="/backlog" element={<InternalWorkspace activeNav="backlog" />} />
            <Route path="/roadmap" element={<InternalWorkspace activeNav="roadmap" />} />
            <Route path="/issues" element={<InternalWorkspace activeNav="issues" />} />
            <Route path="/releases" element={<InternalWorkspace activeNav="releases" />} />
            <Route path="/reports" element={<InternalWorkspace activeNav="reports" />} />
            <Route path="/analytics" element={<InternalWorkspace activeNav="analytics" />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/meet" element={<MeetPage />} />
            <Route path="/settings" element={<InternalWorkspace activeNav="settings" />} />
          </Route>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </JiraProvider>
  );
}
