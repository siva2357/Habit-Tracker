import { useState, useEffect } from 'react';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useJira } from '../../context/JiraContext';
import { IssueTypeIcon } from './IssueBadge';

export default function CreateIssueModal() {
  const { 
    isCreateModalOpen, 
    closeCreateModal, 
    createIssue, 
    createModalDefaultStatus, 
    currentProjectKey,
    sprints,
    epics,
    team,
    setSelectedIssueId
  } = useJira();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('story');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [storyPoints, setStoryPoints] = useState(3);
  const [assignee, setAssignee] = useState('Alex Chen');
  const [epic, setEpic] = useState('AUTH');
  const [sprint, setSprint] = useState('sprint-14');
  const [status, setStatus] = useState(createModalDefaultStatus || 'todo');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (createModalDefaultStatus) {
      setStatus(createModalDefaultStatus);
    }
  }, [createModalDefaultStatus]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIssue = createIssue({
      title,
      type,
      description,
      priority,
      storyPoints,
      assignee,
      epic,
      sprint: status === 'backlog' ? null : sprint,
      status
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      closeCreateModal();
      setTitle('');
      setDescription('');
      if (newIssue) {
        setSelectedIssueId(newIssue.id);
      }
    }, 700);
  };

  return (
    <div className="jira-modal-overlay" onClick={closeCreateModal}>
      <div 
        className="jira-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="jira-modal-header">
          <div className="d-flex align-items-center gap-2">
            <div className="jira-create-badge-icon">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="jira-modal-title">Create Issue</h2>
              <span className="jira-modal-subtitle">Project: <strong>{currentProjectKey}</strong></span>
            </div>
          </div>
          <button 
            type="button" 
            className="jira-modal-close-btn"
            onClick={closeCreateModal}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="jira-modal-form">
          {/* Issue Type & Status Row */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="jira-field-label">Issue Type</label>
              <div className="jira-select-wrapper">
                <select 
                  className="jira-input-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="story">📗 Story</option>
                  <option value="bug">🐞 Bug</option>
                  <option value="task">📘 Task</option>
                  <option value="epic">🟪 Epic</option>
                </select>
              </div>
            </div>

            <div className="col-6">
              <label className="jira-field-label">Initial Status</label>
              <select 
                className="jira-input-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="review">IN REVIEW</option>
                <option value="qa">IN QA</option>
                <option value="done">DONE</option>
                <option value="backlog">BACKLOG</option>
              </select>
            </div>
          </div>

          {/* Summary / Title */}
          <div className="mb-3">
            <label className="jira-field-label">
              Summary <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text"
              className="jira-text-input"
              placeholder="e.g. Implement OAuth2 PKCE flow for desktop and CLI clients"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="jira-field-label">Description / Acceptance Criteria</label>
            <textarea 
              className="jira-textarea"
              rows={3}
              placeholder="Provide technical context, steps to reproduce, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority, Story Points, Assignee Row */}
          <div className="row g-3 mb-3">
            <div className="col-4">
              <label className="jira-field-label">Priority</label>
              <select 
                className="jira-input-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="highest">🔴 Highest</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>

            <div className="col-4">
              <label className="jira-field-label">Story Points</label>
              <select 
                className="jira-input-select"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              >
                <option value={1}>1 pt</option>
                <option value={2}>2 pts</option>
                <option value={3}>3 pts</option>
                <option value={5}>5 pts</option>
                <option value={8}>8 pts</option>
                <option value={13}>13 pts</option>
              </select>
            </div>

            <div className="col-4">
              <label className="jira-field-label">Assignee</label>
              <select 
                className="jira-input-select"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                {team.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Epic & Sprint Row */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="jira-field-label">Epic Link</label>
              <select 
                className="jira-input-select"
                value={epic}
                onChange={(e) => setEpic(e.target.value)}
              >
                {epics.map(ep => (
                  <option key={ep.id} value={ep.id}>
                    {ep.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6">
              <label className="jira-field-label">Sprint Target</label>
              <select 
                className="jira-input-select"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
              >
                {sprints.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} {sp.status === 'active' ? '(Active)' : ''}
                  </option>
                ))}
                <option value="backlog">None (Move to Backlog)</option>
              </select>
            </div>
          </div>

          {isSuccess && (
            <div className="jira-success-alert mb-3">
              <CheckCircle2 size={16} />
              <span>Issue created and linked to sprint board!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="d-flex justify-content-end align-items-center gap-2 pt-2 border-top">
            <button 
              type="button"
              className="jira-btn-secondary"
              onClick={closeCreateModal}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="jira-btn-primary"
              disabled={!title.trim() || isSuccess}
            >
              <Sparkles size={16} />
              <span>Create Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
