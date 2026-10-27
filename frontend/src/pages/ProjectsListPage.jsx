import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  ExternalLink, 
  Kanban, 
  Eye, 
  Users, 
  Zap, 
  GitBranch, 
  Layers, 
  Filter, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import '../components/jira/Jira.css';
import './UserPages.css';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { 
    projects, 
    setCurrentProjectKey, 
    setSelectedProjectForDetail,
    issues,
    sprints,
    epics
  } = useJira();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodologyFilter, setMethodologyFilter] = useState('all');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase()) ||
        p.lead.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesMethodology = methodologyFilter === 'all' || p.type === methodologyFilter;

      return matchesSearch && matchesCategory && matchesMethodology;
    });
  }, [projects, search, categoryFilter, methodologyFilter]);

  const handleViewDetails = (projectKey) => {
    setSelectedProjectForDetail(projectKey);
    navigate(`/project-details?key=${projectKey}`);
  };

  const handleOpenBoard = (projectKey) => {
    setCurrentProjectKey(projectKey);
    navigate('/board');
  };

  const categories = useMemo(() => {
    const set = new Set(projects.map(p => p.category));
    return ['all', ...Array.from(set)];
  }, [projects]);

  return (
    <div className="internal-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <FolderKanban size={24} color="#2563eb" />
            <h1 className="page-headline m-0">eCommerce Platform Projects</h1>
          </div>
          <p className="page-subheadline">
            Interconnected engineering modules and microservices powering the unified eCommerce platform.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box blue">
              <FolderKanban size={20} />
            </div>
            <span className="metric-tag positive">Active</span>
          </div>
          <div className="metric-value">{projects.length}</div>
          <div className="metric-label">Total Engineering Projects</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box purple">
              <Kanban size={20} />
            </div>
            <span className="metric-tag">{sprints.length} Sprints</span>
          </div>
          <div className="metric-value">{issues.length}</div>
          <div className="metric-label">Tracked Tickets & Issues</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box emerald">
              <Zap size={20} />
            </div>
            <span className="metric-tag positive">High Delivery</span>
          </div>
          <div className="metric-value">{epics.length} Epics</div>
          <div className="metric-label">Strategic Roadmap Epics</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box amber">
              <Users size={20} />
            </div>
            <span className="metric-tag">Global</span>
          </div>
          <div className="metric-value">28 Engineers</div>
          <div className="metric-label">Active Team Contributors</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="jira-board-filter-bar mb-3">
        <div className="d-flex align-items-center gap-2 flex-1" style={{ minWidth: '220px', maxWidth: '380px' }}>
          <div className="navbar-search-wrapper" style={{ width: '100%' }}>
            <Search size={16} className="navbar-search-icon" />
            <input 
              type="text"
              className="navbar-search-input"
              placeholder="Search projects by name, key, lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="jira-filter-group">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Filter:
          </span>

          <select 
            className="jira-attr-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Category: All ({projects.length})</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            className="jira-attr-select"
            value={methodologyFilter}
            onChange={(e) => setMethodologyFilter(e.target.value)}
          >
            <option value="all">Methodology: All</option>
            <option value="Scrum">Scrum</option>
            <option value="Kanban">Kanban</option>
          </select>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="jira-table-card">
        <table className="jira-issues-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}></th>
              <th>Project Name</th>
              <th style={{ width: '100px' }}>Key</th>
              <th style={{ width: '110px' }}>Type</th>
              <th style={{ width: '180px' }}>Project Lead</th>
              <th style={{ width: '170px' }}>Active Sprint</th>
              <th style={{ width: '140px' }}>Team & Health</th>
              <th style={{ width: '190px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const projectIssues = issues.filter(i => i.id.startsWith(project.key) || project.key === 'CORE');
                const doneIssues = projectIssues.filter(i => i.status === 'done').length;
                const progressPercent = projectIssues.length > 0 
                  ? Math.round((doneIssues / projectIssues.length) * 100) 
                  : 50;

                return (
                  <tr 
                    key={project.key}
                    className="jira-table-row"
                  >
                    {/* Icon */}
                    <td style={{ textAlign: 'center', fontSize: '1.4rem' }}>
                      {project.icon}
                    </td>

                    {/* Project Name & Category */}
                    <td>
                      <div 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewDetails(project.key)}
                      >
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                          {project.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            background: '#f1f5f9', 
                            fontWeight: 600, 
                            marginRight: '6px' 
                          }}>
                            {project.category}
                          </span>
                          <span>{project.description?.substring(0, 75)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Key Badge */}
                    <td>
                      <span style={{
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe'
                      }}>
                        {project.key}
                      </span>
                    </td>

                    {/* Methodology */}
                    <td>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: project.type === 'Scrum' ? '#ecfdf5' : '#fdf4ff',
                        color: project.type === 'Scrum' ? '#047857' : '#86198f',
                        border: `1px solid ${project.type === 'Scrum' ? '#a7f3d0' : '#f5d0fe'}`
                      }}>
                        {project.type}
                      </span>
                    </td>

                    {/* Project Lead */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="jira-card-avatar" style={{ width: '26px', height: '26px', fontSize: '0.72rem' }}>
                          {project.lead.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{project.lead}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{project.leadRole?.split('&')[0]}</div>
                        </div>
                      </div>
                    </td>

                    {/* Active Sprint */}
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#334155'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        {project.activeSprint || 'Sprint 1'}
                      </span>
                    </td>

                    {/* Team & Health */}
                    <td>
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.72rem' }}>
                          <span style={{ color: '#64748b' }}>{project.membersCount || 6} members</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{progressPercent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', borderRadius: '9999px' }} />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <button 
                          type="button"
                          className="jira-filter-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px' }}
                          onClick={() => handleViewDetails(project.key)}
                          title="View dedicated project details"
                        >
                          <Eye size={13} color="#2563eb" />
                          <span>Details</span>
                        </button>

                        <button 
                          type="button"
                          className="jira-btn-comment"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          onClick={() => handleOpenBoard(project.key)}
                          title="Open Scrum/Kanban board for this project"
                        >
                          <Kanban size={13} />
                          <span>Board</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No projects matching "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
