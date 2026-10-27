import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserNavbar from './UserNavbar';
import CreateIssueModal from '../components/jira/CreateIssueModal';
import IssueDetailModal from '../components/jira/IssueDetailModal';
import './UserLayout.css';
import '../components/jira/Jira.css';

export default function UserLayout({
  children,
  onLogout,
  user = {
    name: 'Alex Chen',
    email: 'alex.chen@workspace.io',
    role: 'Tech Lead / Scrum Master'
  }
}) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`user-layout-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Background Engineering Dots */}
      <div className="user-layout-grid-bg" aria-hidden="true" />

      {/* Internal Sidebar */}
      <UserSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Column: User Navbar & Content Area */}
      <div className="user-layout-main">
        {/* Top Navbar */}
        <UserNavbar 
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
          user={user}
        />

        {/* Scrollable Main Content: Renders Child Routes via Outlet */}
        <main className="user-main-content">
          {children || <Outlet />}
        </main>
      </div>

      {/* Jira Modals */}
      <CreateIssueModal />
      <IssueDetailModal />
    </div>
  );
}
