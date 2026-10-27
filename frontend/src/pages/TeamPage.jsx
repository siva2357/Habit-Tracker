import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users2, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  FolderKanban,
  ShieldCheck,
  Mail,
  GitPullRequest,
  Check,
  Sparkles,
  Kanban,
  ListTodo
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import { IssueTypeIcon, PriorityIcon, StatusBadge } from '../components/jira/IssueBadge';
import '../components/jira/Jira.css';
import './UserPages.css';

export default function TeamPage() {
  const navigate = useNavigate();
  const { 
    team, 
    issues, 
    projects, 
    setCurrentProjectKey, 
    openCreateModal, 
    setSelectedIssueId 
  } = useJira();

  const [selectedMemberId, setSelectedMemberId] = useState('all');

  const totalCapacity = team.reduce((sum, m) => sum + (m.capacity || 0), 0);
  const totalAssigned = team.reduce((sum, m) => sum + (m.assignedPoints || 0), 0);
  const averageLoad = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  const handleOpenMemberProject = (projectKey) => {
    setCurrentProjectKey(projectKey);
    navigate(`/board`);
  };

  return (
    <div className="internal-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Users2 size={24} color="#2563eb" />
            <h1 className="page-headline m-0">Engineering Teams & Capacity</h1>
          </div>
          <p className="page-subheadline">
            Sprint workload allocation, developer capacity, and microservice ownership across the 5 interconnected commerce platforms.
          </p>
        </div>
      </div>

      {/* Top High-Level Capacity Metrics */}
      <div className="metrics-grid">
        <div className="metric-glass-card">
          <div className="metric-icon-box blue">
            <Users2 size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Engineering Roster</span>
            <span className="metric-value">{team.length} Engineers</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box purple">
            <Zap size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Sprint Story Points</span>
            <span className="metric-value">{totalAssigned} / {totalCapacity} pts</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box green">
            <CheckCircle2 size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Workload Balance</span>
            <span className="metric-value">Healthy</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box amber">
            <FolderKanban size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Spaces Covered</span>
            <span className="metric-value">{projects.length} Platforms</span>
          </div>
        </div>
      </div>

      {/* Team Members Grid with Capacity Bars & Assigned Issues */}
      <div className="content-section-card mb-4">
        <div className="section-card-title-row mb-3">
          <h3 className="section-card-title">
            <Sparkles size={18} color="#2563eb" />
            <span>Sprint Workload & Capacity by Engineer</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Click any ticket to inspect or update status
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {team.map((member) => {
            const memberIssues = issues.filter(i => i.assignee === member.name);
            const loadPercent = Math.round((member.assignedPoints / member.capacity) * 100);
            const isOverloaded = loadPercent > 90;

            return (
              <div 
                key={member.id}
                className="p-3"
                style={{ 
                  borderRadius: '14px', 
                  border: '1px solid #e2e8f0', 
                  background: '#ffffff',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  {/* Member Profile Row */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '11px', 
                          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
                          color: '#ffffff', 
                          fontWeight: 800, 
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                        }}
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{member.role}</div>
                      </div>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        background: isOverloaded ? '#fef2f2' : '#f0fdf4', 
                        color: isOverloaded ? '#b91c1c' : '#15803d',
                        border: `1px solid ${isOverloaded ? '#fecaca' : '#bbf7d0'}`
                      }}
                    >
                      {loadPercent}% Capacity
                    </span>
                  </div>

                  {/* Story Points Capacity Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Assigned Story Points</span>
                      <span><strong>{member.assignedPoints}</strong> / {member.capacity} pts</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, loadPercent)}%`, 
                          height: '100%', 
                          background: isOverloaded ? '#ef4444' : loadPercent > 75 ? '#2563eb' : '#10b981', 
                          borderRadius: '9999px',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Assigned Issues Preview */}
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Active Tickets ({memberIssues.length})
                    </span>
                    <div className="d-flex flex-column gap-1 mt-1">
                      {memberIssues.slice(0, 3).map(issue => (
                        <div 
                          key={issue.id}
                          className="jira-backlog-item"
                          style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}
                          onClick={() => setSelectedIssueId(issue.id)}
                        >
                          <div className="jira-backlog-left">
                            <IssueTypeIcon type={issue.type} size={14} />
                            <span className="jira-backlog-key" style={{ minWidth: '60px', fontSize: '0.75rem' }}>{issue.id}</span>
                            <span className="jira-backlog-title" style={{ fontSize: '0.8rem' }}>{issue.title}</span>
                          </div>
                          <div className="jira-backlog-right" onClick={(e) => e.stopPropagation()}>
                            <StatusBadge status={issue.status} />
                            <span className="jira-card-points" style={{ fontSize: '0.72rem' }}>{issue.storyPoints}p</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2" style={{ borderTop: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    <Mail size={12} style={{ marginRight: '4px' }} />
                    {member.name.toLowerCase().replace(' ', '.')}@workspace.io
                  </span>
                  <button 
                    type="button" 
                    className="jira-fast-create-btn"
                    onClick={() => handleOpenMemberProject('WS')}
                  >
                    View Board
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Spaces Technical Ownership Matrix */}
      <div className="content-section-card">
        <h3 className="section-card-title mb-3">
          <FolderKanban size={18} color="#2563eb" />
          <span>Platform Module Ownership & Responsibility Matrix</span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>Platform Space</th>
                <th style={{ padding: '10px 12px' }}>Key</th>
                <th style={{ padding: '10px 12px' }}>Lead Architect</th>
                <th style={{ padding: '10px 12px' }}>Active Sprint</th>
                <th style={{ padding: '10px 12px' }}>Assigned Members</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                    <span style={{ marginRight: '8px' }}>{proj.icon}</span>
                    {proj.name}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#2563eb' }}>{proj.key}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{proj.lead}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {proj.activeSprint}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{proj.membersCount} Engineers</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      type="button" 
                      className="jira-fast-create-btn"
                      onClick={() => handleOpenMemberProject(proj.key)}
                    >
                      Open Space →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
