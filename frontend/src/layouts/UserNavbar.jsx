import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  GitPullRequest
} from 'lucide-react';
import './UserLayout.css';

export default function UserNavbar({
  onOpenMobile = () => {},
  onLogout,
  user = {
    name: 'Alex Chen',
    email: 'alex.chen@workspace.io',
    role: 'Tech Lead / Scrum Master'
  }
}) {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const sampleNotifications = [
    {
      id: 1,
      icon: GitPullRequest,
      text: 'Sarah Lin requested your review on PR #342 (WS-102)',
      time: '15m ago',
      color: '#7c3aed'
    },
    {
      id: 2,
      icon: CheckCircle2,
      text: 'Marcus Brody marked WS-103 as Done (Redis failover)',
      time: '1h ago',
      color: '#10b981'
    },
    {
      id: 3,
      icon: Clock,
      text: 'WS Sprint 1 retrospective scheduled for Friday at 4:00 PM',
      time: '3h ago',
      color: '#2563eb'
    }
  ];

  return (
    <header className="user-navbar">
      {/* Left: Mobile Toggle ONLY */}
      <div className="navbar-left">
        <button 
          type="button"
          className="navbar-mobile-toggle"
          onClick={onOpenMobile}
          aria-label="Open mobile navigation"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right: Notifications & Profile Avatar ONLY */}
      <div className="navbar-right">
        {/* 1. Notifications Icon with Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            type="button"
            className={`navbar-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="Project Notifications"
          >
            <Bell size={18} />
            <span className="navbar-notification-dot" />
          </button>

          {showNotifications && (
            <div className="navbar-dropdown-panel">
              <div className="dropdown-header">
                <span>Agile Updates</span>
                <span style={{ fontSize: '0.72rem', color: '#2563eb', cursor: 'pointer' }}>
                  Mark all read
                </span>
              </div>
              <div className="dropdown-body py-1">
                {sampleNotifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="dropdown-item-notification">
                      <div className="notif-icon" style={{ color: notif.color }}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="notif-text">{notif.text}</div>
                        <div className="notif-time">{notif.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. User Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button 
            type="button"
            className="navbar-user-trigger"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="navbar-avatar">
              {user.name.charAt(0)}
            </div>
            <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showUserMenu && (
            <div className="navbar-dropdown-panel user-menu">
              <div className="dropdown-user-header">
                <div className="user-header-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="user-header-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-badge mt-1">{user.role}</div>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="py-1">
                <button 
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button 
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                >
                  <Settings size={16} />
                  <span>Workspace Preferences</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              <div className="p-1">
                <button 
                  type="button"
                  className="dropdown-menu-item text-danger"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
