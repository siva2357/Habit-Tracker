import { 
  Bookmark, 
  Bug, 
  CheckSquare, 
  Zap, 
  ChevronsUp, 
  ChevronUp, 
  Minus, 
  ChevronDown 
} from 'lucide-react';

export function IssueTypeIcon({ type = 'story', size = 15 }) {
  switch (type.toLowerCase()) {
    case 'bug':
      return <Bug size={size} color="#ef4444" />;
    case 'task':
      return <CheckSquare size={size} color="#3b82f6" />;
    case 'epic':
      return <Zap size={size} color="#8b5cf6" />;
    case 'story':
    default:
      return <Bookmark size={size} color="#10b981" />;
  }
}

export function IssueTypeBadge({ type = 'story' }) {
  const configs = {
    story: { label: 'Story', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    bug: { label: 'Bug', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    task: { label: 'Task', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    epic: { label: 'Epic', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  };

  const config = configs[type.toLowerCase()] || configs.story;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 7px',
        borderRadius: '5px',
        fontSize: '0.72rem',
        fontWeight: 700,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`
      }}
    >
      <IssueTypeIcon type={type} size={12} />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityIcon({ priority = 'medium', size = 15 }) {
  switch (priority.toLowerCase()) {
    case 'highest':
      return <ChevronsUp size={size} color="#dc2626" />;
    case 'high':
      return <ChevronUp size={size} color="#ea580c" />;
    case 'low':
      return <ChevronDown size={size} color="#2563eb" />;
    case 'medium':
    default:
      return <Minus size={size} color="#d97706" />;
  }
}

export function PriorityBadge({ priority = 'medium' }) {
  const configs = {
    highest: { label: 'Highest', color: '#dc2626', bg: '#fee2e2' },
    high: { label: 'High', color: '#ea580c', bg: '#ffedd5' },
    medium: { label: 'Medium', color: '#b45309', bg: '#fef3c7' },
    low: { label: 'Low', color: '#2563eb', bg: '#dbeafe' },
  };

  const config = configs[priority.toLowerCase()] || configs.medium;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 7px',
        borderRadius: '5px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: config.color,
        backgroundColor: config.bg
      }}
    >
      <PriorityIcon priority={priority} size={13} />
      <span>{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status = 'todo' }) {
  const configs = {
    backlog: { label: 'BACKLOG', bg: '#f1f5f9', color: '#475569' },
    todo: { label: 'TO DO', bg: '#e0f2fe', color: '#0369a1' },
    in_progress: { label: 'IN PROGRESS', bg: '#e0e7ff', color: '#4338ca' },
    review: { label: 'IN REVIEW', bg: '#fef3c7', color: '#b45309' },
    qa: { label: 'IN QA', bg: '#fce7f3', color: '#be185d' },
    done: { label: 'DONE', bg: '#dcfce7', color: '#15803d' },
  };

  const config = configs[status] || configs.todo;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        backgroundColor: config.bg,
        color: config.color
      }}
    >
      {config.label}
    </span>
  );
}
