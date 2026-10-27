import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Kanban, 
  ListTodo, 
  Map, 
  Tag, 
  Rocket, 
  BarChart3, 
  Users2, 
  Settings as SettingsIcon,
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  Layers,
  Sparkles,
  GitCommit,
  GitPullRequest,
  Search,
  Share2,
  Maximize2,
  FileText,
  FileQuestion,
  MoreHorizontal,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  FolderKanban
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import { IssueTypeIcon, IssueTypeBadge, PriorityIcon, PriorityBadge, StatusBadge } from '../components/jira/IssueBadge';
import '../components/jira/Jira.css';
import './UserPages.css';

export default function InternalWorkspace({ activeNav = 'backlog' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    currentProject, 
    activeSprint, 
    issues, 
    currentProjectIssues,
    sprintIssues, 
    backlogIssues,
    epics, 
    releases, 
    team, 
    totalSprintPoints, 
    completedPoints, 
    sprintProgressPercent,
    openCreateModal,
    setSelectedIssueId,
    updateIssueStatus,
    updateIssue,
    moveIssueToSprint,
    moveIssueToBacklog,
    createIssue
  } = useJira();

  // Map route nav to active tab
  const getTabFromNav = (nav) => {
    switch (nav) {
      case 'dashboard': return 'summary';
      case 'board': return 'board';
      case 'backlog': return 'backlog';
      case 'roadmap': return 'timeline';
      case 'issues': return 'list';
      case 'releases': return 'development';
      case 'reports':
      case 'analytics': return 'reports';
      case 'team': return 'summary';
      case 'settings': return 'settings';
      default: return 'summary';
    }
  };

  const initialTab = searchParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('summary');
    }
  }, [currentProject?.key, activeNav, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Fast inline issue creation state for sprint
  const [sprintInlineTitle, setSprintInlineTitle] = useState('');
  const [sprintInlineType, setSprintInlineType] = useState('story');
  const [isSprintOpen, setIsSprintOpen] = useState(true);
  const [isBacklogOpen, setIsBacklogOpen] = useState(true);

  // Fast inline issue creation state for backlog
  const [backlogInlineTitle, setBacklogInlineTitle] = useState('');

  // Search filter for backlog
  const [backlogSearch, setBacklogSearch] = useState('');
  const [userFilterActive, setUserFilterActive] = useState(false);

  // Filter states for Board
  const [boardTypeFilter, setBoardTypeFilter] = useState('all');
  const [boardPriorityFilter, setBoardPriorityFilter] = useState('all');
  const [boardAssigneeFilter, setBoardAssigneeFilter] = useState('all');

  const handleCreateSprintInline = (e) => {
    if (e) e.preventDefault();
    if (!sprintInlineTitle.trim()) return;

    createIssue({
      title: sprintInlineTitle.trim(),
      type: sprintInlineType,
      status: 'todo',
      sprint: activeSprint?.id,
      storyPoints: 3,
      assignee: 'Alex Chen'
    });

    setSprintInlineTitle('');
  };

  const handleCreateBacklogInline = (e) => {
    if (e) e.preventDefault();
    if (!backlogInlineTitle.trim()) return;

    createIssue({
      title: backlogInlineTitle.trim(),
      type: 'story',
      status: 'backlog',
      sprint: null,
      storyPoints: 3,
      assignee: 'Alex Chen'
    });

    setBacklogInlineTitle('');
  };

  // Filtered sprint & backlog issues
  const filteredSprintIssues = sprintIssues.filter(issue => {
    if (backlogSearch && !issue.title.toLowerCase().includes(backlogSearch.toLowerCase()) && !issue.id.toLowerCase().includes(backlogSearch.toLowerCase())) {
      return false;
    }
    if (userFilterActive && issue.assignee !== 'Alex Chen') {
      return false;
    }
    return true;
  });

  const filteredBacklogIssues = backlogIssues.filter(issue => {
    if (backlogSearch && !issue.title.toLowerCase().includes(backlogSearch.toLowerCase()) && !issue.id.toLowerCase().includes(backlogSearch.toLowerCase())) {
      return false;
    }
    if (userFilterActive && issue.assignee !== 'Alex Chen') {
      return false;
    }
    return true;
  });

  return (
    <div className="internal-page-container">
      {/* ======================================================================
          ATLASSIAN JIRA PROJECT HEADER
          ====================================================================== */}
      <div className="jira-project-header-container">
        {/* Breadcrumb Row */}
        <div className="jira-breadcrumb-row">
          <span 
            className="jira-breadcrumb-link"
            onClick={() => navigate('/projects')}
          >
            Spaces
          </span>
          <span>/</span>
          <span style={{ color: '#172b4d', fontWeight: 600 }}>{currentProject.name}</span>
        </div>

        {/* Project Title & Global Project Actions */}
        <div className="jira-project-title-row">
          <div className="jira-project-title-left">
            <div className="jira-project-icon-box">
              {currentProject.icon}
            </div>
            <h1 className="jira-project-heading">{currentProject.name}</h1>
            <div className="jira-team-members-pill" title={`${currentProject.membersCount} team members assigned to this space`}>
              <Users2 size={14} color="#64748b" />
              <span>{currentProject.membersCount}</span>
            </div>
            <button 
              type="button" 
              className="jira-header-action-btn"
              onClick={() => handleTabChange('settings')}
              title="Space options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button 
              type="button" 
              className="jira-header-action-btn"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Space link copied to clipboard!');
                }
              }}
              title="Share this project space"
            >
              <Share2 size={16} />
            </button>
            <button 
              type="button" 
              className="jira-header-action-btn"
              onClick={() => alert(`Automation rules active for ${currentProject.name}: 4 rules running (auto-move to review, Slack notification on high priority)`)}
              title="Project Automations"
            >
              <Zap size={16} color="#7c3aed" />
            </button>
            <button 
              type="button" 
              className="jira-header-action-btn"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              title="Toggle Fullscreen"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* ======================================================================
            HORIZONTAL PROJECT NAVIGATION TABS BAR
            Summary | List | Board | Backlog | Development | Forms | Timeline | Docs | Reports
            ====================================================================== */}
        <div className="jira-project-tabs-bar">
          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => handleTabChange('summary')}
          >
            <Sparkles size={16} />
            <span>Summary</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => handleTabChange('list')}
          >
            <Tag size={16} />
            <span>List</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'board' ? 'active' : ''}`}
            onClick={() => handleTabChange('board')}
          >
            <Kanban size={16} />
            <span>Board</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
            onClick={() => handleTabChange('backlog')}
          >
            <ListTodo size={16} />
            <span>Backlog</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'development' ? 'active' : ''}`}
            onClick={() => handleTabChange('development')}
          >
            <Rocket size={16} />
            <span>Development</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
            onClick={() => handleTabChange('forms')}
          >
            <FileQuestion size={16} />
            <span>Forms</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => handleTabChange('timeline')}
          >
            <Map size={16} />
            <span>Timeline</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => handleTabChange('docs')}
          >
            <FileText size={16} />
            <span>Docs</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleTabChange('reports')}
          >
            <BarChart3 size={16} />
            <span>Reports</span>
          </button>

          <button 
            type="button" 
            className={`jira-project-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <SettingsIcon size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ======================================================================
          TAB 1: BACKLOG VIEW (EXACT JIRA CLOUD REPLICA)
          ====================================================================== */}
      {activeTab === 'backlog' && (
        <div className="jira-backlog-container">
          {/* Top Filter Toolbar */}
          <div className="jira-backlog-toolbar">
            <div className="d-flex align-items-center gap-2">
              <div className="jira-search-input-wrap">
                <Search size={15} className="jira-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search backlog"
                  value={backlogSearch}
                  onChange={(e) => setBacklogSearch(e.target.value)}
                />
              </div>

              {/* SK / User Filter Avatar */}
              <button 
                type="button" 
                className={`jira-avatar-filter-btn ${userFilterActive ? 'active' : ''}`}
                onClick={() => setUserFilterActive(!userFilterActive)}
                title={userFilterActive ? 'Clear assignee filter' : 'Filter by Alex Chen (AC)'}
              >
                AC
              </button>

              <button 
                type="button" 
                className="jira-filter-dropdown-btn"
                onClick={() => {
                  setBacklogSearch('');
                  setUserFilterActive(false);
                }}
              >
                <Filter size={14} />
                <span>Filter</span>
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className="jira-header-action-btn"
                onClick={() => handleTabChange('reports')}
                title="Sprint Insights"
              >
                <TrendingUp size={15} color="#2563eb" />
              </button>
              <button 
                type="button" 
                className="jira-header-action-btn"
                onClick={() => handleTabChange('settings')}
                title="Board Configuration"
              >
                <SlidersHorizontal size={15} />
              </button>
              <button 
                type="button" 
                className="jira-header-action-btn"
                onClick={() => openCreateModal('todo')}
                title="Create Jira Issue Ticket"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* ACTIVE SPRINT CARD (WS Sprint 1) */}
          <div className="jira-sprint-container-card">
            {/* Sprint Header */}
            <div className="jira-sprint-header">
              <div className="jira-sprint-header-left">
                <button 
                  type="button" 
                  className="jira-header-action-btn"
                  style={{ width: '24px', height: '24px', border: 'none' }}
                  onClick={() => setIsSprintOpen(!isSprintOpen)}
                >
                  <ChevronDown size={16} style={{ transform: isSprintOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                </button>
                <span className="jira-sprint-name">{activeSprint?.name || `${currentProject.key} Sprint 1`}</span>
                <button 
                  type="button" 
                  className="jira-sprint-dates-btn"
                  onClick={() => alert(`Active Sprint Dates: ${activeSprint?.startDate || '2026-10-20'} to ${activeSprint?.endDate || '2026-11-03'}`)}
                >
                  <Calendar size={13} />
                  <span>{activeSprint?.startDate ? `${activeSprint.startDate} - ${activeSprint.endDate}` : 'Add dates'}</span>
                </button>
                <span className="jira-sprint-count-text">({filteredSprintIssues.length} work items)</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="jira-pts-badge-group">
                  <span className="jira-pts-pill-round todo" title="To Do points">
                    {filteredSprintIssues.filter(i => i.status === 'todo').reduce((s, i) => s + (i.storyPoints || 0), 0)}
                  </span>
                  <span className="jira-pts-pill-round progress" title="In Progress points">
                    {filteredSprintIssues.filter(i => i.status === 'in_progress' || i.status === 'review' || i.status === 'qa').reduce((s, i) => s + (i.storyPoints || 0), 0)}
                  </span>
                  <span className="jira-pts-pill-round done" title="Done points">
                    {filteredSprintIssues.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0)}
                  </span>
                </div>

                <button 
                  type="button" 
                  className="jira-start-sprint-btn primary"
                  onClick={() => handleTabChange('board')}
                >
                  Go to Board
                </button>

                <button 
                  type="button" 
                  className="jira-header-action-btn"
                  style={{ width: '28px', height: '28px' }}
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Sprint Body */}
            {isSprintOpen && (
              <>
                {filteredSprintIssues.length === 0 ? (
                  /* Plan your sprint empty banner (matching exact Jira Cloud screenshot) */
                  <div className="jira-sprint-plan-banner">
                    <div className="jira-plan-shapes">
                      <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
                        {/* Purple Triangle */}
                        <polygon points="12,4 26,30 2,30" fill="#7c3aed" opacity="0.9" />
                        {/* Orange Circle */}
                        <circle cx="34" cy="24" r="14" fill="#f59e0b" opacity="0.95" />
                        {/* Green Square */}
                        <rect x="22" y="18" width="22" height="22" rx="4" fill="#10b981" opacity="0.85" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="jira-plan-title">Plan your sprint</h4>
                      <p className="jira-plan-desc">
                        Drag work items from the <strong>Backlog</strong> section below or create new ones to plan the work for this sprint. Select <strong>Start sprint</strong> when you're ready.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="jira-sprint-issues-list">
                    {filteredSprintIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="jira-backlog-item"
                        onClick={() => setSelectedIssueId(issue.id)}
                      >
                        <div className="jira-backlog-left">
                          <input 
                            type="checkbox" 
                            checked={issue.status === 'done'}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateIssueStatus(issue.id, issue.status === 'done' ? 'todo' : 'done');
                            }}
                            style={{ cursor: 'pointer', borderRadius: '3px' }}
                          />
                          <IssueTypeIcon type={issue.type} size={16} />
                          <span className="jira-backlog-key">{issue.id}</span>
                          <span className="jira-backlog-title">{issue.title}</span>
                        </div>

                        <div className="jira-backlog-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            className="jira-fast-create-btn"
                            style={{ fontSize: '0.72rem', height: '24px' }}
                            onClick={() => moveIssueToBacklog(issue.id)}
                            title="Move ticket to Backlog"
                          >
                            <ArrowDown size={12} />
                            <span>To Backlog</span>
                          </button>

                          <StatusBadge status={issue.status} />
                          <PriorityIcon priority={issue.priority} size={15} />
                          <span className="jira-card-points">{issue.storyPoints} pts</span>
                          <div className="jira-card-avatar" title={`Assigned to ${issue.assignee}`}>
                            {issue.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Create in Sprint */}
                <form className="jira-fast-create-box" onSubmit={handleCreateSprintInline}>
                  <select 
                    value={sprintInlineType}
                    onChange={(e) => setSprintInlineType(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: 600, color: '#44546f', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="story">Story</option>
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                  </select>

                  <input 
                    type="text" 
                    className="jira-fast-create-input"
                    placeholder="Describe what needs to be done."
                    value={sprintInlineTitle}
                    onChange={(e) => setSprintInlineTitle(e.target.value)}
                  />

                  <div className="d-flex align-items-center gap-1">
                    <button 
                      type="button" 
                      className="jira-header-action-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="Sprint Due Date"
                    >
                      <Calendar size={14} color="#64748b" />
                    </button>
                    <button 
                      type="button" 
                      className="jira-header-action-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="Assignee: Alex Chen"
                    >
                      <Users2 size={14} color="#64748b" />
                    </button>
                    <button 
                      type="submit" 
                      className="jira-fast-create-btn"
                      disabled={!sprintInlineTitle.trim()}
                    >
                      Create ↵
                    </button>
                  </div>
                </form>

                {/* Sprint Estimate Summary */}
                <div className="jira-sprint-footer-estimate">
                  <span>
                    {filteredSprintIssues.length} of {filteredSprintIssues.length + filteredBacklogIssues.length} work items visible | Estimate: <strong>{completedPoints}</strong> of {totalSprintPoints}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* BACKLOG SECTION CARD */}
          <div className="jira-sprint-container-card">
            {/* Backlog Header */}
            <div className="jira-sprint-header">
              <div className="jira-sprint-header-left">
                <button 
                  type="button" 
                  className="jira-header-action-btn"
                  style={{ width: '24px', height: '24px', border: 'none' }}
                  onClick={() => setIsBacklogOpen(!isBacklogOpen)}
                >
                  <ChevronDown size={16} style={{ transform: isBacklogOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                </button>
                <span className="jira-sprint-name">Backlog ({filteredBacklogIssues.length} work items)</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="jira-pts-badge-group">
                  <span className="jira-pts-pill-round todo" title="Backlog points">
                    {filteredBacklogIssues.reduce((s, i) => s + (i.storyPoints || 0), 0)}
                  </span>
                </div>

                <button 
                  type="button" 
                  className="jira-start-sprint-btn"
                  onClick={() => openCreateModal('todo')}
                >
                  + Add Issue
                </button>
              </div>
            </div>

            {/* Backlog Body */}
            {isBacklogOpen && (
              <>
                {filteredBacklogIssues.length === 0 ? (
                  <div className="p-4 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    Your backlog is empty. Use the quick create bar below to add items to the backlog.
                  </div>
                ) : (
                  <div className="jira-sprint-issues-list">
                    {filteredBacklogIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="jira-backlog-item"
                        onClick={() => setSelectedIssueId(issue.id)}
                      >
                        <div className="jira-backlog-left">
                          <input 
                            type="checkbox" 
                            checked={issue.status === 'done'}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateIssueStatus(issue.id, issue.status === 'done' ? 'todo' : 'done');
                            }}
                            style={{ cursor: 'pointer', borderRadius: '3px' }}
                          />
                          <IssueTypeIcon type={issue.type} size={16} />
                          <span className="jira-backlog-key">{issue.id}</span>
                          <span className="jira-backlog-title">{issue.title}</span>
                        </div>

                        <div className="jira-backlog-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            className="jira-fast-create-btn"
                            style={{ fontSize: '0.72rem', height: '24px', background: '#e0edff', color: '#0c66e4', borderColor: '#bfdbfe' }}
                            onClick={() => moveIssueToSprint(issue.id, activeSprint?.id)}
                            title="Move ticket to Active Sprint"
                          >
                            <ArrowUp size={12} />
                            <span>To Sprint</span>
                          </button>

                          <StatusBadge status={issue.status} />
                          <PriorityIcon priority={issue.priority} size={15} />
                          <span className="jira-card-points">{issue.storyPoints} pts</span>
                          <div className="jira-card-avatar" title={`Assigned to ${issue.assignee}`}>
                            {issue.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Quick Create in Backlog */}
                <form className="jira-fast-create-box" onSubmit={handleCreateBacklogInline}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>☑</span>
                  <input 
                    type="text" 
                    className="jira-fast-create-input"
                    placeholder="Describe what needs to be done in backlog."
                    value={backlogInlineTitle}
                    onChange={(e) => setBacklogInlineTitle(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="jira-fast-create-btn"
                    disabled={!backlogInlineTitle.trim()}
                  >
                    Create ↵
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 2: AGILE BOARD VIEW (5 Workflow Columns)
          ====================================================================== */}
      {activeTab === 'board' && (
        <div className="jira-board-view-container">
          {/* Filter Bar */}
          <div className="jira-board-filter-bar">
            <div className="jira-filter-group">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Filter:
              </span>

              <button 
                type="button" 
                className={`jira-filter-btn ${boardTypeFilter === 'all' && boardPriorityFilter === 'all' && boardAssigneeFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setBoardTypeFilter('all');
                  setBoardPriorityFilter('all');
                  setBoardAssigneeFilter('all');
                }}
              >
                All Issues ({sprintIssues.length})
              </button>

              <button 
                type="button" 
                className={`jira-filter-btn ${boardAssigneeFilter === 'Alex Chen' ? 'active' : ''}`}
                onClick={() => setBoardAssigneeFilter(boardAssigneeFilter === 'Alex Chen' ? 'all' : 'Alex Chen')}
              >
                Only My Issues
              </button>

              <button 
                type="button" 
                className={`jira-filter-btn ${boardPriorityFilter === 'highest' ? 'active' : ''}`}
                onClick={() => setBoardPriorityFilter(boardPriorityFilter === 'highest' ? 'all' : 'highest')}
              >
                Highest Priority
              </button>

              <button 
                type="button" 
                className={`jira-filter-btn ${boardTypeFilter === 'bug' ? 'active' : ''}`}
                onClick={() => setBoardTypeFilter(boardTypeFilter === 'bug' ? 'all' : 'bug')}
              >
                Bugs Only
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className="page-action-btn-primary"
                onClick={() => openCreateModal('todo')}
              >
                <Plus size={16} />
                <span>Create Issue</span>
              </button>
            </div>
          </div>

          {/* 5 Jira Kanban Columns */}
          <div className="jira-board-columns-grid">
            {[
              { id: 'todo', title: 'To Do', colorClass: 'todo' },
              { id: 'in_progress', title: 'In Progress', colorClass: 'in_progress' },
              { id: 'review', title: 'In Review', colorClass: 'review' },
              { id: 'qa', title: 'In QA', colorClass: 'qa' },
              { id: 'done', title: 'Done', colorClass: 'done' },
            ].map((col) => {
              const colIssues = sprintIssues.filter(i => {
                if (i.status !== col.id) return false;
                if (boardTypeFilter !== 'all' && i.type !== boardTypeFilter) return false;
                if (boardPriorityFilter !== 'all' && i.priority !== boardPriorityFilter) return false;
                if (boardAssigneeFilter !== 'all' && i.assignee !== boardAssigneeFilter) return false;
                return true;
              });

              return (
                <div key={col.id} className="jira-column">
                  {/* Column Header */}
                  <div className="jira-column-header">
                    <div className="jira-column-title-box">
                      <span className={`jira-column-indicator ${col.colorClass}`} />
                      <span className="jira-column-title">{col.title}</span>
                    </div>
                    <span className="jira-column-badge">{colIssues.length}</span>
                  </div>

                  {/* Cards Container */}
                  <div className="jira-column-cards">
                    {colIssues.map((issue) => (
                      <div 
                        key={issue.id}
                        className="jira-card"
                        onClick={() => setSelectedIssueId(issue.id)}
                      >
                        <div className="jira-card-header">
                          <div className="d-flex align-items-center gap-2">
                            <IssueTypeIcon type={issue.type} size={15} />
                            <span className="jira-card-key">{issue.id}</span>
                          </div>
                          <PriorityIcon priority={issue.priority} size={14} />
                        </div>

                        <h4 className="jira-card-title">{issue.title}</h4>

                        {issue.epic && (
                          <div className="mb-2">
                            <span className="jira-epic-tag" style={{ borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}>
                              ⚡ {issue.epic}
                            </span>
                          </div>
                        )}

                        <div className="jira-card-footer" onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="jira-card-avatar" title={`Assigned to ${issue.assignee}`}>
                              {issue.assignee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="jira-card-points">{issue.storyPoints} pts</span>
                          </div>

                          {/* Quick Workflow Move Controls */}
                          <div className="d-flex align-items-center gap-1">
                            {col.id !== 'todo' && (
                              <button
                                type="button"
                                className="jira-card-quick-move"
                                title="Move left"
                                onClick={() => {
                                  const steps = ['todo', 'in_progress', 'review', 'qa', 'done'];
                                  const idx = steps.indexOf(col.id);
                                  if (idx > 0) updateIssueStatus(issue.id, steps[idx - 1]);
                                }}
                              >
                                <ChevronLeft size={13} />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                type="button"
                                className="jira-card-quick-move"
                                title="Move right"
                                onClick={() => {
                                  const steps = ['todo', 'in_progress', 'review', 'qa', 'done'];
                                  const idx = steps.indexOf(col.id);
                                  if (idx < steps.length - 1) updateIssueStatus(issue.id, steps[idx + 1]);
                                }}
                              >
                                <ChevronRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    className="jira-column-add-btn"
                    onClick={() => openCreateModal(col.id)}
                  >
                    <Plus size={14} />
                    <span>Create Issue</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 3: SUMMARY & DASHBOARD VIEW
          ====================================================================== */}
      {activeTab === 'summary' && (
        <div className="jira-summary-view-container">
          {/* Metrics Row */}
          <div className="metrics-grid mb-4">
            <div className="metric-glass-card">
              <div className="metric-icon-box blue">
                <Kanban size={18} />
              </div>
              <div className="metric-content">
                <span className="metric-caption">Sprint Story Points</span>
                <span className="metric-value">{completedPoints} / {totalSprintPoints}</span>
              </div>
            </div>

            <div className="metric-glass-card">
              <div className="metric-icon-box purple">
                <ListTodo size={18} />
              </div>
              <div className="metric-content">
                <span className="metric-caption">Active Sprint Tickets</span>
                <span className="metric-value">{sprintIssues.length}</span>
              </div>
            </div>

            <div className="metric-glass-card">
              <div className="metric-icon-box green">
                <CheckCircle2 size={18} />
              </div>
              <div className="metric-content">
                <span className="metric-caption">Sprint Goal Progress</span>
                <span className="metric-value">{sprintProgressPercent}%</span>
              </div>
            </div>

            <div className="metric-glass-card">
              <div className="metric-icon-box amber">
                <AlertCircle size={18} />
              </div>
              <div className="metric-content">
                <span className="metric-caption">Total Backlog Items</span>
                <span className="metric-value">{backlogIssues.length}</span>
              </div>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="content-section-card mb-4">
            <h3 className="section-card-title mb-2">
              <Sparkles size={18} color="#2563eb" />
              <span>Project Scope & Architecture</span>
            </h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {currentProject.description}
            </p>

            <div className="d-flex flex-wrap gap-2 mt-3">
              {currentProject.components?.map(comp => (
                <span key={comp} style={{ background: '#f1f5f9', color: '#1e293b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  🧩 {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Epics Progress & Team */}
          <div className="content-section-card mb-4">
            <h3 className="section-card-title mb-3">
              <Zap size={18} color="#7c3aed" />
              <span>Epics Roadmap Progress</span>
            </h3>
            <div className="d-flex flex-column gap-3">
              {epics.map(epic => (
                <div key={epic.id} className="jira-epic-badge-card" style={{ borderLeftColor: epic.color }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="jira-epic-title">{epic.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{epic.progress}%</span>
                  </div>
                  <div className="jira-epic-progress-bar">
                    <div className="jira-epic-progress-fill" style={{ width: `${epic.progress}%`, backgroundColor: epic.color }} />
                  </div>
                  <span className="jira-epic-target">{epic.completedIssues} of {epic.totalIssues} tickets completed • Target: {epic.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 4: LIST VIEW (Data Table of All Project Issues)
          ====================================================================== */}
      {activeTab === 'list' && (
        <div className="content-section-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="section-card-title m-0">
              <Tag size={18} color="#2563eb" />
              <span>All Tickets ({currentProjectIssues.length})</span>
            </h3>
            <button 
              type="button" 
              className="page-action-btn-primary"
              onClick={() => openCreateModal('todo')}
            >
              <Plus size={16} />
              <span>Create Ticket</span>
            </button>
          </div>

          <div className="jira-sprint-issues-list" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            {currentProjectIssues.map(issue => (
              <div 
                key={issue.id} 
                className="jira-backlog-item"
                onClick={() => setSelectedIssueId(issue.id)}
              >
                <div className="jira-backlog-left">
                  <IssueTypeIcon type={issue.type} size={16} />
                  <span className="jira-backlog-key">{issue.id}</span>
                  <span className="jira-backlog-title">{issue.title}</span>
                </div>
                <div className="jira-backlog-right" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={issue.status} />
                  <PriorityIcon priority={issue.priority} size={15} />
                  <span className="jira-card-points">{issue.storyPoints} pts</span>
                  <div className="jira-card-avatar">{issue.assignee.split(' ').map(n => n[0]).join('')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 5: TIMELINE / ROADMAP VIEW
          ====================================================================== */}
      {activeTab === 'timeline' && (
        <div className="jira-roadmap-timeline-card">
          <div className="jira-roadmap-header">
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Epics & Milestones</span>
            <div className="jira-timeline-quarters">
              <span>Q3 2026</span>
              <span>Q4 2026 (Active)</span>
              <span>Q1 2027</span>
              <span>Q2 2027</span>
            </div>
          </div>

          {epics.map(epic => (
            <div key={epic.id} className="jira-roadmap-epic-row">
              <div className="jira-epic-meta-col">
                <span className="jira-epic-row-title">{epic.name}</span>
                <span className="jira-epic-row-sub">{epic.completedIssues}/{epic.totalIssues} issues • {epic.progress}%</span>
              </div>
              <div className="jira-timeline-bar-container">
                <div 
                  className="jira-timeline-bar-pill" 
                  style={{ 
                    width: `${Math.max(30, epic.progress)}%`, 
                    background: epic.color, 
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {epic.name} ({epic.target})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================================
          TAB 6: DEVELOPMENT VIEW (Git, Branches & Releases)
          ====================================================================== */}
      {activeTab === 'development' && (
        <div className="d-flex flex-column gap-4">
          <div className="content-section-card">
            <h3 className="section-card-title mb-2">
              <GitCommit size={18} color="#2563eb" />
              <span>Git Source Control & Repository</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Connected enterprise GitHub repository for {currentProject.name}.
            </p>
            <div className="d-flex align-items-center gap-2 p-2" style={{ background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <code style={{ fontSize: '0.85rem', color: '#0f172a', flex: 1 }}>{currentProject.repo}</code>
              <button 
                type="button" 
                className="jira-fast-create-btn"
                onClick={() => {
                  navigator.clipboard.writeText(currentProject.repo);
                  alert('Repo URL copied!');
                }}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="content-section-card">
            <h3 className="section-card-title mb-3">
              <Rocket size={18} color="#7c3aed" />
              <span>Releases & Deployments</span>
            </h3>
            <div className="d-flex flex-column gap-3">
              {releases.map(rel => (
                <div key={rel.id} className="p-3" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{rel.version} — {rel.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: rel.status === 'Released' ? '#dcfce7' : '#e0edff', color: rel.status === 'Released' ? '#166534' : '#0c66e4' }}>
                      {rel.status}
                    </span>
                  </div>
                  <p className="text-muted m-0" style={{ fontSize: '0.82rem' }}>{rel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 7: REPORTS VIEW
          ====================================================================== */}
      {activeTab === 'reports' && (
        <div className="content-section-card">
          <h3 className="section-card-title mb-3">
            <BarChart3 size={18} color="#2563eb" />
            <span>Sprint Velocity & Burndown</span>
          </h3>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            Current sprint velocity is tracking at <strong>{completedPoints} Story Points completed</strong> against a target commitment of <strong>{totalSprintPoints} Story Points</strong>.
          </p>

          <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', margin: '1.5rem 0 1rem' }}>
            <div style={{ width: `${sprintProgressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>

          <div className="d-flex justify-content-between" style={{ fontSize: '0.82rem', color: '#64748b' }}>
            <span>0 Points</span>
            <span>Sprint Target ({totalSprintPoints} pts)</span>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 8: DOCS VIEW
          ====================================================================== */}
      {activeTab === 'docs' && (
        <div className="content-section-card">
          <h3 className="section-card-title mb-2">
            <FileText size={18} color="#2563eb" />
            <span>Architecture & Specifications</span>
          </h3>
          <div className="p-3 mb-2" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px 0' }}>1. System Architecture Overview</h4>
            <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
              Microservices mesh built with Node.js, Express, Redis Sentinel, and PostgreSQL. Handles authentication with OAuth 2.0 PKCE.
            </p>
          </div>
          <div className="p-3" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px 0' }}>2. API Specifications & Contracts</h4>
            <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
              REST API specifications defined with OpenAPI 3.1. Rate limiting applied at Cloudflare edge.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 9: FORMS VIEW
          ====================================================================== */}
      {activeTab === 'forms' && (
        <div className="content-section-card" style={{ maxWidth: '650px' }}>
          <h3 className="section-card-title mb-2">
            <FileQuestion size={18} color="#2563eb" />
            <span>Submit Issue or Work Item</span>
          </h3>
          <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
            Direct issue intake portal for {currentProject.name}.
          </p>
          <button 
            type="button" 
            className="page-action-btn-primary"
            onClick={() => openCreateModal('todo')}
          >
            <Plus size={16} />
            <span>Open Issue Creation Form</span>
          </button>
        </div>
      )}

      {/* ======================================================================
          TAB 10: SETTINGS VIEW
          ====================================================================== */}
      {activeTab === 'settings' && (
        <div className="content-section-card" style={{ maxWidth: '650px' }}>
          <h3 className="section-card-title mb-3">
            <SettingsIcon size={18} color="#2563eb" />
            <span>Space Settings: {currentProject.name}</span>
          </h3>
          <div className="d-flex flex-column gap-3">
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Project Key</label>
              <input type="text" readOnly value={currentProject.key} className="jira-text-input" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Project Lead</label>
              <input type="text" readOnly value={currentProject.lead} className="jira-text-input" style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Category</label>
              <input type="text" readOnly value={currentProject.category} className="jira-text-input" style={{ background: '#f8fafc' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
