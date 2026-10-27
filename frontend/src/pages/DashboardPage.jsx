import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  ListTodo, 
  Users2, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  FolderKanban,
  GitCommit,
  GitPullRequest,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import { IssueTypeIcon, PriorityIcon, StatusBadge } from '../components/jira/IssueBadge';
import '../components/jira/Jira.css';
import './UserPages.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    projects, 
    setCurrentProjectKey, 
    issues, 
    sprints, 
    epics, 
    team,
    openCreateModal,
    setSelectedIssueId
  } = useJira();

  const [filterAssignee, setFilterAssignee] = useState('all');

  // Stats across all 5 interconnected spaces
  const totalPlatformIssues = issues.length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress' || i.status === 'review' || i.status === 'qa');
  const doneIssues = issues.filter(i => i.status === 'done');
  const totalPoints = issues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const donePoints = doneIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const platformCompletionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Filtered issues for the dashboard table
  const displayedIssues = issues.filter(i => {
    if (filterAssignee === 'me') return i.assignee === 'Alex Chen';
    if (filterAssignee === 'urgent') return i.priority === 'highest';
    return true;
  });

  const handleOpenSpace = (projectKey, tab = 'board') => {
    setCurrentProjectKey(projectKey);
    navigate(`/board?tab=${tab}`);
  };

  return (
    <div className="internal-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <LayoutDashboard size={24} color="#2563eb" />
            <h1 className="page-headline m-0">Cross-Platform Dashboard</h1>
          </div>
          <p className="page-subheadline">
            Centralized engineering operations and sprint velocity across all 5 interconnected eCommerce platform spaces.
          </p>
        </div>
      </div>

      {/* Cross-Platform High Level Metrics */}
      <div className="metrics-grid">
        <div className="metric-glass-card">
          <div className="metric-icon-box blue">
            <FolderKanban size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Interconnected Spaces</span>
            <span className="metric-value">{projects.length} Active</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box purple">
            <Kanban size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Platform Sprint Velocity</span>
            <span className="metric-value">{donePoints} / {totalPoints} pts</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box green">
            <CheckCircle2 size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Tickets In Progress</span>
            <span className="metric-value">{inProgressIssues.length}</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box amber">
            <AlertCircle size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Total Tracked Issues</span>
            <span className="metric-value">{totalPlatformIssues}</span>
          </div>
        </div>
      </div>

      {/* 5 Interconnected Platform Spaces Overview Grid */}
      <div className="content-section-card mb-4">
        <div className="section-card-title-row mb-3">
          <h3 className="section-card-title">
            <Sparkles size={18} color="#2563eb" />
            <span>Interconnected Commerce Platform Spaces</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Click any space to switch active board & backlog
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects.map((project) => {
            const projectIssues = issues.filter(i => i.projectKey === project.key || i.id.startsWith(`${project.key}-`));
            const projectDone = projectIssues.filter(i => i.status === 'done');
            const percent = projectIssues.length > 0 ? Math.round((projectDone.length / projectIssues.length) * 100) : 0;

            return (
              <div 
                key={project.key} 
                className="p-3" 
                style={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.4rem' }}>{project.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem' }}>{project.name}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Key: {project.key} • {project.category}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                      {project.type}
                    </span>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.8rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      <span>Active Sprint Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#2563eb', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Lead: <strong>{project.lead}</strong>
                  </span>
                  <div className="d-flex gap-1">
                    <button 
                      type="button" 
                      className="jira-fast-create-btn"
                      onClick={() => handleOpenSpace(project.key, 'board')}
                      title="Open Board"
                    >
                      <Kanban size={13} />
                      <span>Board</span>
                    </button>
                    <button 
                      type="button" 
                      className="jira-fast-create-btn"
                      style={{ background: '#e0edff', color: '#0c66e4', borderColor: '#bfdbfe' }}
                      onClick={() => handleOpenSpace(project.key, 'backlog')}
                      title="Open Backlog"
                    >
                      <ListTodo size={13} />
                      <span>Backlog</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Platform Insights: Left = Platform Tickets, Right = Epics & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Left Column: Cross-Platform Tickets */}
        <div className="content-section-card">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h3 className="section-card-title m-0">
              <Kanban size={18} color="#2563eb" />
              <span>Cross-Platform Tickets</span>
            </h3>

            {/* Quick Filter Buttons */}
            <div className="d-flex align-items-center gap-1">
              <button 
                type="button"
                className={`jira-filter-btn ${filterAssignee === 'all' ? 'active' : ''}`}
                style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                onClick={() => setFilterAssignee('all')}
              >
                All ({issues.length})
              </button>
              <button 
                type="button"
                className={`jira-filter-btn ${filterAssignee === 'me' ? 'active' : ''}`}
                style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                onClick={() => setFilterAssignee('me')}
              >
                Assigned to Me
              </button>
              <button 
                type="button"
                className={`jira-filter-btn ${filterAssignee === 'urgent' ? 'active' : ''}`}
                style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                onClick={() => setFilterAssignee('urgent')}
              >
                Urgent Only
              </button>
            </div>
          </div>

          <div className="jira-sprint-issues-list" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {displayedIssues.slice(0, 8).map((issue) => (
              <div 
                key={issue.id}
                className="jira-backlog-item"
                onClick={() => setSelectedIssueId(issue.id)}
              >
                <div className="jira-backlog-left">
                  <IssueTypeIcon type={issue.type} size={15} />
                  <span className="jira-backlog-key">{issue.id}</span>
                  <span className="jira-backlog-title">{issue.title}</span>
                </div>

                <div className="jira-backlog-right" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={issue.status} />
                  <PriorityIcon priority={issue.priority} size={14} />
                  <span className="jira-card-points">{issue.storyPoints} pts</span>
                  <div className="jira-card-avatar" title={`Assigned to ${issue.assignee}`}>
                    {issue.assignee.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Epics Roadmap & Activity */}
        <div className="d-flex flex-column gap-3">
          {/* Epics Progress Card */}
          <div className="content-section-card">
            <div className="section-card-title-row mb-2">
              <h3 className="section-card-title">
                <Zap size={18} color="#7c3aed" />
                <span>Epics Roadmap</span>
              </h3>
              <span 
                style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/roadmap')}
              >
                View Timeline →
              </span>
            </div>

            <div className="d-flex flex-column gap-3">
              {epics.map((epic) => (
                <div key={epic.id} className="jira-epic-badge-card" style={{ borderLeftColor: epic.color }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="jira-epic-title">{epic.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{epic.progress}%</span>
                  </div>
                  <div className="jira-epic-progress-bar">
                    <div className="jira-epic-progress-fill" style={{ width: `${epic.progress}%`, backgroundColor: epic.color }} />
                  </div>
                  <span className="jira-epic-target">{epic.completedIssues}/{epic.totalIssues} completed • Target: {epic.target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Platform Engineering Activity */}
          <div className="content-section-card">
            <h3 className="section-card-title mb-2">
              <GitCommit size={18} color="#2563eb" />
              <span>Platform Commit & PR Activity</span>
            </h3>

            <div className="timetable-list">
              <div className="timetable-item">
                <span className="timetable-time">10:45 AM</span>
                <span className="timetable-text">Elena added assertions to WS-101 Cypress suite</span>
              </div>
              <div className="timetable-item">
                <span className="timetable-time">09:15 AM</span>
                <span className="timetable-text">Sarah Lin opened PR #342 for WS-102 (Fix race condition)</span>
              </div>
              <div className="timetable-item">
                <span className="timetable-time">Yesterday</span>
                <span className="timetable-text">Marcus deployed PV-203 KMS encryption rotation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
