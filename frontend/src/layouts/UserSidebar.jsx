import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users2, 
  ChevronLeft, 
  ChevronRight,
  Video
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import './UserLayout.css';

export default function UserSidebar({
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    projects,
    currentProject, 
    setCurrentProjectKey
  } = useJira();

  const handleSelectSpace = (projectKey) => {
    setCurrentProjectKey(projectKey);
    // When clicking any space, immediately open the space on the Summary tab per user requirement
    navigate('/board?tab=summary');
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <button 
          type="button"
          className="sidebar-mobile-backdrop" 
          onClick={onCloseMobile}
          aria-label="Close sidebar menu"
        />
      )}

      <aside className={`user-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          {!isCollapsed ? (
            <>
              <button 
                type="button" 
                className="sidebar-brand-btn"
                onClick={() => handleNavigate('/board?tab=summary')}
                title="TrackIt Jira Agile Workspace"
              >
                <div className="sidebar-brand-logo">
                  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M32 50 C32 38 43 38 50 50 C57 62 68 62 68 50 C43 62 32 62 32 50 Z"
                      stroke="#ffffff"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="sidebar-brand-text">
                  <span className="sidebar-brand-title">
                    TrackIt <span style={{ color: '#2563eb' }}>Jira</span>
                  </span>
                  <span className="sidebar-brand-badge">Atlassian Cloud</span>
                </div>
              </button>

              {/* Desktop Collapse Toggle */}
              <button 
                type="button" 
                className="sidebar-collapse-toggle d-none d-lg-flex"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <div className="sidebar-header-collapsed">
              <button 
                type="button" 
                className="sidebar-brand-logo-collapsed"
                onClick={() => handleNavigate('/board?tab=summary')}
                title="TrackIt Jira Workspace"
              >
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M32 50 C32 38 43 38 50 50 C57 62 68 62 68 50 C43 62 32 62 32 50 Z"
                    stroke="#ffffff"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button 
                type="button" 
                className="sidebar-collapse-toggle collapsed-toggle"
                onClick={onToggleCollapse}
                title="Expand sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="sidebar-body">
          {/* Dashboards and Teams at the starting */}
          <div className="sidebar-nav-section">
            <button
              type="button"
              className={`sidebar-space-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigate('/dashboard')}
              title={isCollapsed ? 'Dashboards' : undefined}
            >
              <span className="nav-item-icon">
                <LayoutDashboard size={18} />
              </span>
              {!isCollapsed && <span>Dashboards</span>}
            </button>

            <button
              type="button"
              className={`sidebar-space-item ${location.pathname === '/team' ? 'active' : ''}`}
              onClick={() => handleNavigate('/team')}
              title={isCollapsed ? 'Teams' : undefined}
            >
              <span className="nav-item-icon">
                <Users2 size={18} />
              </span>
              {!isCollapsed && <span>Teams</span>}
            </button>
          </div>

          {/* SPACES (PROJECTS LIST) */}
          <div className="sidebar-nav-section mt-2">
            {!isCollapsed && (
              <div className="d-flex justify-content-between align-items-center px-2 mb-1">
                <span className="sidebar-section-title p-0 m-0" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Spaces
                </span>
              </div>
            )}
            {!isCollapsed && (
              <span className="sidebar-section-title px-2 pb-1" style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'none' }}>
                Recent
              </span>
            )}

            {projects.map((project) => {
              const isSpaceActive = ['/board', '/backlog', '/roadmap', '/issues', '/project-details'].includes(location.pathname) && (currentProject?.key === project.key);
              return (
                <button
                  key={project.key}
                  type="button"
                  className={`sidebar-space-item ${isSpaceActive ? 'active' : ''}`}
                  onClick={() => handleSelectSpace(project.key)}
                  title={isCollapsed ? `${project.name} (${project.key})` : undefined}
                >
                  <span className="space-item-icon-box" style={{ fontSize: '1.05rem' }}>
                    {project.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="space-item-label text-truncate" style={{ fontWeight: isSpaceActive ? 700 : 500 }}>
                      {project.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MEET SECTION AFTER SPACES */}
          <div className="sidebar-nav-section mt-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className={`sidebar-space-item ${location.pathname === '/meet' ? 'active' : ''}`}
              onClick={() => handleNavigate('/meet')}
              title={isCollapsed ? 'Meet Page' : undefined}
            >
              <span className="nav-item-icon">
                <Video size={18} />
              </span>
              {!isCollapsed && (
                <span style={{ fontWeight: location.pathname === '/meet' ? 700 : 500 }}>
                  Meet Page
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
