import { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  MessageSquare, 
  Send, 
  Check, 
  Calendar, 
  User, 
  Layers, 
  Zap, 
  ExternalLink 
} from 'lucide-react';
import { useJira } from '../../context/JiraContext';
import { IssueTypeBadge, PriorityIcon, StatusBadge } from './IssueBadge';

export default function IssueDetailModal() {
  const { 
    selectedIssue, 
    setSelectedIssueId, 
    updateIssue, 
    updateIssueStatus, 
    deleteIssue, 
    addComment,
    team,
    epics,
    sprints
  } = useJira();

  const [commentText, setCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (selectedIssue) {
      setEditedTitle(selectedIssue.title);
      setIsEditingTitle(false);
    }
  }, [selectedIssue]);

  if (!selectedIssue) return null;

  const handleClose = () => {
    setSelectedIssueId(null);
  };

  const handleStatusChange = (newStatus) => {
    updateIssueStatus(selectedIssue.id, newStatus);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updateIssue(selectedIssue.id, { title: editedTitle.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedIssue.id, commentText, 'Alex Chen');
    setCommentText('');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIssue.id}?`)) {
      deleteIssue(selectedIssue.id);
    }
  };

  const currentEpic = epics.find(e => e.id === selectedIssue.epic);

  return (
    <div className="jira-modal-overlay" onClick={handleClose}>
      <div 
        className="jira-modal-card jira-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Bar with Issue Key, Breadcrumb and Action Buttons */}
        <div className="jira-modal-header border-bottom pb-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <IssueTypeBadge type={selectedIssue.type} />
            <span className="jira-issue-key-large">{selectedIssue.id}</span>
            <span className="jira-separator">/</span>
            <span className="jira-sprint-tag">
              {selectedIssue.sprint ? selectedIssue.sprint.toUpperCase() : 'BACKLOG'}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button 
              type="button"
              className="jira-icon-action-btn danger"
              onClick={handleDelete}
              title="Delete Issue"
            >
              <Trash2 size={16} />
            </button>
            <button 
              type="button" 
              className="jira-modal-close-btn"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2-Column Body: Main Details + Sidebar Info */}
        <div className="jira-detail-grid">
          {/* Left Column: Title, Description, Activity Feed */}
          <div className="jira-detail-main">
            {/* Title Section */}
            <div className="mb-4">
              {isEditingTitle ? (
                <div className="d-flex gap-2">
                  <input 
                    type="text" 
                    className="jira-text-input"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="button"
                    className="jira-btn-primary"
                    onClick={handleSaveTitle}
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <h1 
                  className="jira-detail-title"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit issue title"
                >
                  {selectedIssue.title}
                </h1>
              )}
            </div>

            {/* Description Block */}
            <div className="jira-detail-section mb-4">
              <h3 className="jira-section-heading">Description</h3>
              <div className="jira-description-box">
                {selectedIssue.description || 'No description provided. Click to add acceptance criteria, technical details, or notes.'}
              </div>
            </div>

            {/* Activity & Comments Thread */}
            <div className="jira-detail-section">
              <div className="d-flex align-items-center gap-2 mb-3">
                <MessageSquare size={17} color="#2563eb" />
                <h3 className="jira-section-heading m-0">Activity & Comments</h3>
                <span className="jira-comment-count">
                  {selectedIssue.comments?.length || 0}
                </span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="jira-comment-box mb-3">
                <textarea 
                  rows={2}
                  className="jira-comment-input"
                  placeholder="Add a comment or technical note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="d-flex justify-content-end mt-2">
                  <button 
                    type="submit" 
                    className="jira-btn-comment"
                    disabled={!commentText.trim()}
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="jira-comments-feed">
                {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
                  selectedIssue.comments.map((c) => (
                    <div key={c.id} className="jira-comment-item">
                      <div className="jira-comment-avatar">
                        {c.author.charAt(0)}
                      </div>
                      <div className="jira-comment-content">
                        <div className="jira-comment-meta">
                          <span className="jira-comment-author">{c.author}</span>
                          <span className="jira-comment-time">{c.time}</span>
                        </div>
                        <p className="jira-comment-text">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="jira-empty-state-sm">
                    No comments yet. Start the discussion!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Issue Attributes & Status Transitions */}
          <div className="jira-detail-sidebar">
            {/* Status Selector Box */}
            <div className="jira-sidebar-card mb-3">
              <label className="jira-sidebar-label">Workflow Status</label>
              <select 
                className="jira-status-selector-large"
                value={selectedIssue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="backlog">BACKLOG</option>
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="review">IN REVIEW</option>
                <option value="qa">IN QA</option>
                <option value="done">DONE</option>
              </select>
            </div>

            {/* Details Table */}
            <div className="jira-sidebar-card">
              <h4 className="jira-sidebar-header">Attributes</h4>
              
              <div className="jira-attr-row">
                <span className="jira-attr-name">Assignee</span>
                <select 
                  className="jira-attr-select"
                  value={selectedIssue.assignee}
                  onChange={(e) => updateIssue(selectedIssue.id, { assignee: e.target.value })}
                >
                  {team.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="jira-attr-row">
                <span className="jira-attr-name">Priority</span>
                <select 
                  className="jira-attr-select"
                  value={selectedIssue.priority}
                  onChange={(e) => updateIssue(selectedIssue.id, { priority: e.target.value })}
                >
                  <option value="highest">🔴 Highest</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              <div className="jira-attr-row">
                <span className="jira-attr-name">Story Points</span>
                <select 
                  className="jira-attr-select"
                  value={selectedIssue.storyPoints || 3}
                  onChange={(e) => updateIssue(selectedIssue.id, { storyPoints: Number(e.target.value) })}
                >
                  <option value={1}>1 pt</option>
                  <option value={2}>2 pts</option>
                  <option value={3}>3 pts</option>
                  <option value={5}>5 pts</option>
                  <option value={8}>8 pts</option>
                  <option value={13}>13 pts</option>
                </select>
              </div>

              <div className="jira-attr-row">
                <span className="jira-attr-name">Epic Link</span>
                <select 
                  className="jira-attr-select"
                  value={selectedIssue.epic || 'AUTH'}
                  onChange={(e) => updateIssue(selectedIssue.id, { epic: e.target.value })}
                >
                  {epics.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.name}</option>
                  ))}
                </select>
              </div>

              <div className="jira-attr-row">
                <span className="jira-attr-name">Sprint</span>
                <select 
                  className="jira-attr-select"
                  value={selectedIssue.sprint || 'sprint-14'}
                  onChange={(e) => updateIssue(selectedIssue.id, { sprint: e.target.value === 'none' ? null : e.target.value })}
                >
                  {sprints.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                  <option value="none">Backlog (No Sprint)</option>
                </select>
              </div>

              <div className="jira-attr-row">
                <span className="jira-attr-name">Created</span>
                <span className="jira-attr-val">{selectedIssue.createdAt || 'Recent'}</span>
              </div>
            </div>

            {currentEpic && (
              <div 
                className="jira-epic-badge-card mt-3"
                style={{ borderLeftColor: currentEpic.color }}
              >
                <div className="d-flex align-items-center gap-1">
                  <Zap size={14} color={currentEpic.color} />
                  <span className="jira-epic-title">{currentEpic.name}</span>
                </div>
                <div className="jira-epic-progress-bar mt-2">
                  <div 
                    className="jira-epic-progress-fill"
                    style={{ width: `${currentEpic.progress}%`, backgroundColor: currentEpic.color }}
                  />
                </div>
                <span className="jira-epic-target">{currentEpic.progress}% completed • Target: {currentEpic.target}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
