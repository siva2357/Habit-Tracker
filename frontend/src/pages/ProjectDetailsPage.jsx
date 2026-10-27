import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Kanban, 
  ListTodo, 
  Plus, 
  ExternalLink, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Users, 
  Layers, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderKanban,
  Tag
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import { IssueTypeIcon, IssueTypeBadge, PriorityIcon, PriorityBadge, StatusBadge } from '../components/jira/IssueBadge';
import '../components/jira/Jira.css';
import './UserPages.css';

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    projects, 
    currentProjectKey, 
    setCurrentProjectKey, 
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    issues,
    sprints,
    epics,
    team,
    openCreateModal,
    setSelectedIssueId
  } = useJira();

  const [copiedRepo, setCopiedRepo] = useState(false);
  const [issueFilter, setIssueFilter] = useState('all');

  // Determine active project to show
  const projectKey = searchParams.get('key') || selectedProjectForDetail || currentProjectKey || 'CORE';

  const project = useMemo(() => {
    return projects.find(p => p.key === projectKey) || projects[0];
  }, [projects, projectKey]);

  // Project issues
  const projectIssues = useMemo(() => {
    return issues.filter(i => i.id.startsWith(project.key) || project.key === 'CORE');
  }, [issues, project.key]);

  const doneCount = projectIssues.filter(i => i.status === 'done').length;
  const inProgressCount = projectIssues.filter(i => i.status === 'in_progress' || i.status === 'review' || i.status === 'qa').length;
  const todoCount = projectIssues.filter(i => i.status === 'todo' || i.status === 'backlog').length;
  const totalPoints = projectIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = projectIssues.filter(i => i.status === 'done').reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 55;

  // Filtered issues
  const filteredIssues = useMemo(() => {
    if (issueFilter === 'all') return projectIssues;
    if (issueFilter === 'done') return projectIssues.filter(i => i.status === 'done');
    if (issueFilter === 'active') return projectIssues.filter(i => i.status !== 'done');
    return projectIssues;
  }, [projectIssues, issueFilter]);

  const handleCopyRepo = () => {
    if (project.repo) {
      navigator.clipboard.writeText(project.repo);
      setCopiedRepo(true);
      setTimeout(() => setCopiedRepo(false), 1500);
    }
  };

  const handleOpenBoard = () => {
    setCurrentProjectKey(project.key);
    navigate('/board');
  };

  const handleOpenBacklog = () => {
    setCurrentProjectKey(project.key);
    navigate('/backlog');
  };

  return (
    <div className="internal-page-container">
      {/* Breadcrumb Row */}
      <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.84rem' }}>
        <button 
          type="button" 
          className="jira-filter-btn" 
          style={{ padding: '3px 8px' }}
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft size={13} />
          <span>Projects Directory</span>
        </button>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{project.name}</span>
        <span style={{ color: '#64748b' }}>({project.key})</span>
      </div>

      {/* Hero Project Header Card */}
      <div className="content-section-card mb-4" style={{ padding: '1.75rem 2rem' }}>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
            }}>
              {project.icon}
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="page-headline m-0" style={{ fontSize: '1.75rem' }}>
                  {project.name}
                </h1>
                <span style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe'
                }}>
                  {project.key}
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: project.type === 'Scrum' ? '#ecfdf5' : '#fdf4ff',
                  color: project.type === 'Scrum' ? '#047857' : '#86198f',
                  border: `1px solid ${project.type === 'Scrum' ? '#a7f3d0' : '#f5d0fe'}`
                }}>
                  {project.type} Project
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  {project.category}
                </span>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
                Lead: <strong>{project.lead}</strong> ({project.leadRole || 'Project Lead'}) • Active Sprint: <strong>{project.activeSprint || 'Sprint 14'}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button 
              type="button" 
              className="jira-btn-secondary"
              onClick={handleOpenBoard}
            >
              <Kanban size={15} />
              <span>Open Scrum Board</span>
            </button>

            <button 
              type="button" 
              className="jira-btn-secondary"
              onClick={handleOpenBacklog}
            >
              <ListTodo size={15} />
              <span>View Backlog</span>
            </button>

            <button 
              type="button" 
              className="page-action-btn-primary"
              onClick={() => openCreateModal('todo')}
            >
              <Plus size={16} />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards for This Project */}
      <div className="metrics-grid mb-4">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box blue">
              <CheckCircle2 size={20} />
            </div>
            <span className="metric-tag positive">{progressPercent}% Delivered</span>
          </div>
          <div className="metric-value">{donePoints} / {totalPoints || 37} SP</div>
          <div className="metric-label">Delivered Story Points</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box purple">
              <Kanban size={20} />
            </div>
            <span className="metric-tag">{inProgressCount} Active</span>
          </div>
          <div className="metric-value">{projectIssues.length} Tickets</div>
          <div className="metric-label">Total Tracked Issues</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box emerald">
              <Users size={20} />
            </div>
            <span className="metric-tag positive">Optimal</span>
          </div>
          <div className="metric-value">{project.membersCount || 8} Members</div>
          <div className="metric-label">Engineering Capacity</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box amber">
              <Clock size={20} />
            </div>
            <span className="metric-tag">Next Rel: Nov 05</span>
          </div>
          <div className="metric-value">v1.2.0-GA</div>
          <div className="metric-label">Target Release Version</div>
        </div>
      </div>

      {/* 2-Column Content Grid: Details & Delivery */}
      <div className="dashboard-content-grid mb-4">
        {/* Left Column: Technical Overview & Attributes */}
        <div className="content-section-card">
          <h2 className="section-card-title mb-3">
            <ShieldCheck size={19} color="#2563eb" />
            <span>Project Mission & Technical Scope</span>
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {project.description}
          </p>

          <h3 className="jira-sidebar-header">System Attributes</h3>

          <div className="jira-sidebar-card">
            <div className="jira-attr-row">
              <span className="jira-attr-name">Project Key</span>
              <span className="jira-attr-val" style={{ color: '#2563eb', fontFamily: 'Outfit' }}>
                {project.key}
              </span>
            </div>

            <div className="jira-attr-row">
              <span className="jira-attr-name">Project Lead</span>
              <span className="jira-attr-val">{project.lead}</span>
            </div>

            <div className="jira-attr-row">
              <span className="jira-attr-name">Methodology</span>
              <span className="jira-attr-val">{project.type} Framework</span>
            </div>

            <div className="jira-attr-row">
              <span className="jira-attr-name">Category</span>
              <span className="jira-attr-val">{project.category}</span>
            </div>

            <div className="jira-attr-row">
              <span className="jira-attr-name">Created Date</span>
              <span className="jira-attr-val">{project.createdDate || 'Jan 15, 2026'}</span>
            </div>

            <div className="jira-attr-row">
              <span className="jira-attr-name">Default Assignee</span>
              <span className="jira-attr-val">{project.defaultAssignee || project.lead}</span>
            </div>

            {project.repo && (
              <div className="jira-attr-row">
                <span className="jira-attr-name">Git Repository</span>
                <div className="d-flex align-items-center gap-2">
                  <a 
                    href={project.repo} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    {project.repo.replace('https://', '')}
                  </a>
                  <button 
                    type="button" 
                    className="jira-filter-btn" 
                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={handleCopyRepo}
                    title="Copy Git URL"
                  >
                    {copiedRepo ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Components & Epics */}
        <div>
          {/* Architectural Components */}
          <div className="content-section-card mb-4">
            <div className="section-card-title-row">
              <h3 className="section-card-title" style={{ fontSize: '1.05rem' }}>
                <Layers size={18} color="#7c3aed" />
                <span>Components & Subsystems</span>
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {project.components?.length || 4} modules
              </span>
            </div>

            <div className="d-flex flex-column gap-2">
              {(project.components || ['Core API', 'Database', 'Cache', 'UI Frontend']).map((comp, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.84rem'
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{comp}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    Active Module
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Epics Tracker */}
          <div className="content-section-card">
            <div className="section-card-title-row">
              <h3 className="section-card-title" style={{ fontSize: '1.05rem' }}>
                <Zap size={18} color="#d97706" />
                <span>Strategic Epics Linked</span>
              </h3>
              <span 
                style={{ fontSize: '0.78rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/roadmap')}
              >
                Roadmap →
              </span>
            </div>

            <div className="d-flex flex-column gap-2">
              {epics.slice(0, 3).map((epic) => (
                <div key={epic.id} className="jira-epic-badge-card" style={{ borderLeftColor: epic.color, padding: '0.65rem' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{epic.name}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{epic.progress}%</span>
                  </div>
                  <div className="jira-epic-progress-bar" style={{ height: '5px' }}>
                    <div 
                      className="jira-epic-progress-fill" 
                      style={{ width: `${epic.progress}%`, backgroundColor: epic.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Issues Table */}
      <div className="content-section-card">
        <div className="section-card-title-row">
          <div className="d-flex align-items-center gap-2">
            <Tag size={19} color="#2563eb" />
            <h2 className="section-card-title m-0">Tickets in {project.name}</h2>
            <span className="jira-sprint-badge-active" style={{ fontSize: '0.7rem' }}>
              {filteredIssues.length} Tickets
            </span>
          </div>

          <div className="jira-filter-group">
            <button 
              type="button" 
              className={`jira-filter-btn ${issueFilter === 'all' ? 'active' : ''}`}
              onClick={() => setIssueFilter('all')}
            >
              All ({projectIssues.length})
            </button>
            <button 
              type="button" 
              className={`jira-filter-btn ${issueFilter === 'active' ? 'active' : ''}`}
              onClick={() => setIssueFilter('active')}
            >
              Active ({inProgressCount + todoCount})
            </button>
            <button 
              type="button" 
              className={`jira-filter-btn ${issueFilter === 'done' ? 'active' : ''}`}
              onClick={() => setIssueFilter('done')}
            >
              Done ({doneCount})
            </button>
          </div>
        </div>

        <div className="jira-table-card" style={{ boxShadow: 'none' }}>
          <table className="jira-issues-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Key</th>
                <th style={{ width: '90px' }}>Type</th>
                <th>Summary</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '110px' }}>Priority</th>
                <th style={{ width: '150px' }}>Assignee</th>
                <th style={{ width: '90px' }}>Story Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <tr 
                    key={issue.id} 
                    className="jira-table-row"
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    <td style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'Outfit' }}>
                      {issue.id}
                    </td>
                    <td>
                      <IssueTypeBadge type={issue.type} />
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {issue.title}
                    </td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="jira-card-avatar" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                          {issue.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontSize: '0.82rem' }}>{issue.assignee}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {issue.storyPoints} SP
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No tickets matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
