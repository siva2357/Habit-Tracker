import { createContext, useContext, useState, useMemo } from 'react';

const JiraContext = createContext(null);

const INITIAL_PROJECTS = [
  {
    id: 'WS',
    name: 'Work-Sphere',
    key: 'WS',
    lead: 'Alex Chen',
    leadRole: 'Principal Architect & Tech Lead',
    icon: '🩵',
    category: 'Core Commerce Platform & Workspace',
    type: 'Scrum',
    description: 'Central interconnected workspace for enterprise eCommerce platform, order orchestration, product catalog indexing, cart sessions, customer SSO authentication, and high-throughput Redis caching.',
    repo: 'https://github.com/trackit/work-sphere-core',
    activeSprint: 'WS Sprint 1',
    components: ['Catalog API', 'Cart & Sessions', 'Customer Auth', 'Redis Cache'],
    membersCount: 23,
    createdDate: 'Jan 15, 2026',
    defaultAssignee: 'Alex Chen',
    url: 'https://worksphere.internal.workspace.io'
  },
  {
    id: 'PV',
    name: 'Pay-Vaulta',
    key: 'PV',
    lead: 'Marcus Brody',
    leadRole: 'FinTech Lead Engineer',
    icon: '💳',
    category: 'Payments & Financial Vault',
    type: 'Kanban',
    description: 'PCI-DSS Level 1 compliant checkout processing Stripe payments, Apple Pay, multi-currency conversion, automatic VAT/tax calculations, and automated PDF receipts.',
    repo: 'https://github.com/trackit/pay-vaulta',
    activeSprint: 'PV Sprint 1',
    components: ['Stripe Gateway', 'Tax Calculator', 'PDF Invoicing', 'Fraud Detection'],
    membersCount: 14,
    createdDate: 'Mar 10, 2026',
    defaultAssignee: 'Marcus Brody',
    url: 'https://payvaulta.internal.workspace.io'
  },
  {
    id: 'TH',
    name: 'Talent-Hub',
    key: 'TH',
    lead: 'Sarah Lin',
    leadRole: 'Staff Mobile Engineer',
    icon: '📱',
    category: 'Talent & Mobile Ops',
    type: 'Scrum',
    description: 'Cross-platform iOS and Android mobile shopping app with instant 1-click checkout, offline cart persistence, push deal alerts, and live order tracking.',
    repo: 'https://github.com/trackit/talent-hub-mobile',
    activeSprint: 'TH Sprint 1',
    components: ['Shopping UI', 'Offline Sync', 'Apple/Google Pay', 'Push Deals'],
    membersCount: 18,
    createdDate: 'Feb 20, 2026',
    defaultAssignee: 'Sarah Lin',
    url: 'https://talenthub.internal.workspace.io'
  },
  {
    id: 'CE',
    name: 'Cogni-Era',
    key: 'CE',
    lead: 'Jordan Hayes',
    leadRole: 'Head of AI & Intelligence Systems',
    icon: '🌐',
    category: 'AI & Data Intelligence',
    type: 'Scrum',
    description: 'Next-gen AI recommendation engine, customer vector embeddings, predictive cart analytics, dynamic pricing algorithms, and automated search re-ranking.',
    repo: 'https://github.com/trackit/cogni-era-ai',
    activeSprint: 'CE Sprint 1',
    components: ['Vector DB', 'Recommendation ML', 'Semantic Search', 'Dynamic Pricing'],
    membersCount: 12,
    createdDate: 'Apr 05, 2026',
    defaultAssignee: 'Jordan Hayes',
    url: 'https://cogniera.internal.workspace.io'
  },
  {
    id: 'MG',
    name: 'Meet-Gen',
    key: 'MG',
    lead: 'Elena Rostova',
    leadRole: 'Lead RTC & Video Architect',
    icon: '🎙️',
    category: 'Live Collab & Commerce',
    type: 'Scrum',
    description: 'Live interactive shopping streams, WebRTC real-time sync, team standup huddles, sprint retrospective rooms, and collaborative whiteboard canvas.',
    repo: 'https://github.com/trackit/meet-gen-streams',
    activeSprint: 'MG Sprint 1',
    components: ['WebRTC Media Mesh', 'Live Chat Polling', 'Video Standups', 'Interactive Canvas'],
    membersCount: 9,
    createdDate: 'May 12, 2026',
    defaultAssignee: 'Elena Rostova',
    url: 'https://meetgen.internal.workspace.io'
  }
];

const INITIAL_EPICS = [
  { id: 'AUTH', name: 'OAuth 2.0 & Enterprise SSO', color: '#7c3aed', progress: 75, target: 'Q4 2026', totalIssues: 5, completedIssues: 4 },
  { id: 'PERF', name: 'Database Query Optimization & Redis Caching', color: '#2563eb', progress: 60, target: 'Q4 2026', totalIssues: 4, completedIssues: 2 },
  { id: 'PAY', name: 'Stripe Billing & Invoicing Engine v2', color: '#059669', progress: 45, target: 'Q1 2027', totalIssues: 6, completedIssues: 3 },
  { id: 'UI', name: 'Design System & Component Library 2.0', color: '#d97706', progress: 90, target: 'Q4 2026', totalIssues: 4, completedIssues: 4 },
];

const INITIAL_SPRINTS = [
  {
    id: 'ws-sprint-1',
    projectKey: 'WS',
    name: 'WS Sprint 1',
    status: 'active',
    startDate: '2026-10-20',
    endDate: '2026-11-03',
    goal: 'Deliver OAuth2 authorization, optimize Redis caching layer, and finalize webhook signature idempotency.',
    totalPoints: 26,
    completedPoints: 13,
  },
  {
    id: 'pv-sprint-1',
    projectKey: 'PV',
    name: 'PV Sprint 1',
    status: 'active',
    startDate: '2026-10-22',
    endDate: '2026-11-05',
    goal: 'PCI-DSS tokenized card storage encryption rotation and Stripe 3D Secure 2 checkout flow.',
    totalPoints: 16,
    completedPoints: 8,
  },
  {
    id: 'th-sprint-1',
    projectKey: 'TH',
    name: 'TH Sprint 1',
    status: 'active',
    startDate: '2026-10-18',
    endDate: '2026-11-01',
    goal: 'iOS 18 shopping app swipe gesture support and offline cart reconciliation.',
    totalPoints: 10,
    completedPoints: 5,
  },
  {
    id: 'ce-sprint-1',
    projectKey: 'CE',
    name: 'CE Sprint 1',
    status: 'active',
    startDate: '2026-10-25',
    endDate: '2026-11-08',
    goal: 'Pinecone vector database index for product embeddings and dynamic pricing model fine-tuning.',
    totalPoints: 13,
    completedPoints: 0,
  },
  {
    id: 'mg-sprint-1',
    projectKey: 'MG',
    name: 'MG Sprint 1',
    status: 'active',
    startDate: '2026-10-24',
    endDate: '2026-11-07',
    goal: 'WebRTC multi-peer mesh video stream audio ducking and real-time screen sharing sync.',
    totalPoints: 8,
    completedPoints: 0,
  }
];

const INITIAL_RELEASES = [
  {
    id: 'rel-1',
    version: 'v1.2.0-GA',
    name: 'Platform Security & Resilience Release',
    releaseDate: 'Nov 05, 2026',
    status: 'In Progress',
    progress: 72,
    description: 'Enterprise SSO, Redis Caching, and Webhook Reliability.',
    totalIssues: 12,
    completedIssues: 9,
  },
  {
    id: 'rel-2',
    version: 'v1.3.0-Beta',
    name: 'Automated Billing & Invoicing Suite',
    releaseDate: 'Dec 15, 2026',
    status: 'Unreleased',
    progress: 35,
    description: 'Stripe integration v2, tax calculation, and automated invoice PDF generation.',
    totalIssues: 8,
    completedIssues: 3,
  },
  {
    id: 'rel-3',
    version: 'v1.1.0',
    name: 'Core Database Performance Patch',
    releaseDate: 'Oct 01, 2026',
    status: 'Released',
    progress: 100,
    description: 'Database indexing, latency reduction, and connection pooling.',
    totalIssues: 14,
    completedIssues: 14,
  }
];

const INITIAL_TEAM = [
  { id: 'alex', name: 'Alex Chen', role: 'Tech Lead / Full Stack', avatar: 'AC', capacity: 15, assignedPoints: 13, activeIssues: 3 },
  { id: 'sarah', name: 'Sarah Lin', role: 'Senior Backend Engineer', avatar: 'SL', capacity: 13, assignedPoints: 11, activeIssues: 2 },
  { id: 'marcus', name: 'Marcus Brody', role: 'DevOps & Cloud Architect', avatar: 'MB', capacity: 12, assignedPoints: 8, activeIssues: 2 },
  { id: 'elena', name: 'Elena Rostova', role: 'Senior QA & Automation', avatar: 'ER', capacity: 10, assignedPoints: 8, activeIssues: 2 },
  { id: 'jordan', name: 'Jordan Hayes', role: 'Senior Frontend & UI Designer', avatar: 'JH', capacity: 12, assignedPoints: 7, activeIssues: 2 },
];

const INITIAL_ISSUES = [
  // Work-Sphere (WS) Issues
  {
    id: 'WS-101',
    projectKey: 'WS',
    title: 'Implement OAuth 2.0 PKCE flow for web and CLI authentication',
    type: 'story',
    status: 'in_progress',
    priority: 'highest',
    storyPoints: 5,
    assignee: 'Alex Chen',
    epic: 'AUTH',
    sprint: 'ws-sprint-1',
    description: 'Implement secure authorization code flow with PKCE proof key to eliminate client secrets for single-page applications and CLI tools.',
    createdAt: '2026-10-21',
    comments: [
      { id: 1, author: 'Alex Chen', text: 'Auth server endpoints verified against RFC 7636.', time: 'Yesterday 3:15 PM' },
      { id: 2, author: 'Elena Rostova', text: 'Adding automated token expiry assertions in Cypress.', time: 'Today 10:45 AM' }
    ]
  },
  {
    id: 'WS-102',
    projectKey: 'WS',
    title: 'Fix race condition during concurrent workspace invitation accepts',
    type: 'bug',
    status: 'review',
    priority: 'highest',
    storyPoints: 3,
    assignee: 'Sarah Lin',
    epic: 'AUTH',
    sprint: 'ws-sprint-1',
    description: 'When two users accept team invite simultaneously, Postgres triggers unique constraint violation on workspace_members.',
    createdAt: '2026-10-22',
    comments: [
      { id: 1, author: 'Sarah Lin', text: 'Added SELECT FOR UPDATE row-level locking. PR #342 open for review.', time: '2 hours ago' }
    ]
  },
  {
    id: 'WS-103',
    projectKey: 'WS',
    title: 'Configure Redis cluster failover and eviction policies in production',
    type: 'task',
    status: 'todo',
    priority: 'high',
    storyPoints: 5,
    assignee: 'Marcus Brody',
    epic: 'PERF',
    sprint: 'ws-sprint-1',
    description: 'Provision Redis Sentinel failover across 3 availability zones and configure volatile-lru eviction policy.',
    createdAt: '2026-10-23',
    comments: []
  },
  {
    id: 'WS-104',
    projectKey: 'WS',
    title: 'Implement webhook signature verification and idempotency keys',
    type: 'story',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 8,
    assignee: 'Alex Chen',
    epic: 'PAY',
    sprint: 'ws-sprint-1',
    description: 'Guarantee exactly-once delivery for Stripe checkout events using SHA-256 HMAC signature verification and Redis idempotency locks.',
    createdAt: '2026-10-20',
    comments: [
      { id: 1, author: 'Alex Chen', text: 'HMAC signature verification middleware implemented with timing-safe comparison.', time: 'Yesterday' }
    ]
  },
  {
    id: 'WS-105',
    projectKey: 'WS',
    title: 'Resolve memory leak in WebSocket notification dispatcher',
    type: 'bug',
    status: 'qa',
    priority: 'highest',
    storyPoints: 5,
    assignee: 'Elena Rostova',
    epic: 'PERF',
    sprint: 'ws-sprint-1',
    description: 'Clients disconnecting without TCP FIN keep channel buffer listener active in memory, accumulating heap allocation.',
    createdAt: '2026-10-21',
    comments: [
      { id: 1, author: 'Elena Rostova', text: 'Load test verified memory remains constant under 5,000 disconnects.', time: 'Today 11:30 AM' }
    ]
  },
  {
    id: 'WS-106',
    projectKey: 'WS',
    title: 'Add PostgreSQL connection pooling with PgBouncer',
    type: 'task',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Marcus Brody',
    epic: 'PERF',
    sprint: null,
    description: 'Evaluate transaction vs session pooling mode and measure latency drop under simulated peak traffic.',
    createdAt: '2026-10-24',
    comments: []
  },
  {
    id: 'WS-107',
    projectKey: 'WS',
    title: 'Tooltip positioning clipping on viewport edge in Safari',
    type: 'bug',
    status: 'backlog',
    priority: 'low',
    storyPoints: 2,
    assignee: 'Jordan Hayes',
    epic: 'UI',
    sprint: null,
    description: 'Floating-ui popper calculation does not flip placement when scroll container overflow is hidden on WebKit.',
    createdAt: '2026-10-25',
    comments: []
  },
  {
    id: 'WS-108',
    projectKey: 'WS',
    title: 'Implement automated PDF invoice generation with tax calculations',
    type: 'story',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 8,
    assignee: 'Sarah Lin',
    epic: 'PAY',
    sprint: null,
    description: 'Generate branded PDF receipts with itemized VAT/GST calculations and send via SendGrid transactional email API.',
    createdAt: '2026-10-25',
    comments: []
  },

  // Pay-Vaulta (PV) Issues
  {
    id: 'PV-201',
    projectKey: 'PV',
    title: 'Stripe 3D Secure 2 authentication and biometric confirmation modal',
    type: 'story',
    status: 'in_progress',
    priority: 'highest',
    storyPoints: 5,
    assignee: 'Marcus Brody',
    epic: 'PAY',
    sprint: 'pv-sprint-1',
    description: 'Integrate Stripe PaymentIntents API with frictionless 3DS2 challenge flow and biometric confirmation prompts.',
    createdAt: '2026-10-22',
    comments: []
  },
  {
    id: 'PV-202',
    projectKey: 'PV',
    title: 'Multi-currency exchange rate caching via Forex API with 5m TTL',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    storyPoints: 3,
    assignee: 'Alex Chen',
    epic: 'PAY',
    sprint: 'pv-sprint-1',
    description: 'Fetch real-time currency conversion rates and cache with Redis TTL to avoid external rate limits.',
    createdAt: '2026-10-23',
    comments: []
  },
  {
    id: 'PV-203',
    projectKey: 'PV',
    title: 'PCI-DSS tokenized card storage encryption rotation',
    type: 'task',
    status: 'review',
    priority: 'highest',
    storyPoints: 8,
    assignee: 'Marcus Brody',
    epic: 'PAY',
    sprint: 'pv-sprint-1',
    description: 'Rotate AWS KMS customer master key and re-encrypt stored payment tokens with zero downtime.',
    createdAt: '2026-10-20',
    comments: []
  },
  {
    id: 'PV-204',
    projectKey: 'PV',
    title: 'Apple Pay merchant validation certificate renewal workflow',
    type: 'task',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 3,
    assignee: 'Sarah Lin',
    epic: 'PAY',
    sprint: null,
    description: 'Automate Let’s Encrypt / Apple Pay domain verification file rotation before certificate expiry.',
    createdAt: '2026-10-26',
    comments: []
  },

  // Talent-Hub (TH) Issues
  {
    id: 'TH-301',
    projectKey: 'TH',
    title: 'iOS 18 swipe gestures and native haptic feedback for cart item removals',
    type: 'story',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 5,
    assignee: 'Sarah Lin',
    epic: 'UI',
    sprint: 'th-sprint-1',
    description: 'Implement UIImpactFeedbackGenerator triggers when users swipe to archive or remove items in cart.',
    createdAt: '2026-10-21',
    comments: []
  },
  {
    id: 'TH-302',
    projectKey: 'TH',
    title: 'Offline cart local storage sync on network reconnect',
    type: 'bug',
    status: 'todo',
    priority: 'highest',
    storyPoints: 5,
    assignee: 'Sarah Lin',
    epic: 'PERF',
    sprint: 'th-sprint-1',
    description: 'Items added while offline must merge with server cart sessions without overwriting concurrent items.',
    createdAt: '2026-10-22',
    comments: []
  },
  {
    id: 'TH-303',
    projectKey: 'TH',
    title: 'Push deal notifications background worker via APNs & FCM',
    type: 'story',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Sarah Lin',
    epic: 'UI',
    sprint: null,
    description: 'Send personalized flash sale push notifications based on wishlist products.',
    createdAt: '2026-10-25',
    comments: []
  },

  // Cogni-Era (CE) Issues
  {
    id: 'CE-401',
    projectKey: 'CE',
    title: 'Pinecone vector database index for real-time product embeddings',
    type: 'story',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 8,
    assignee: 'Jordan Hayes',
    epic: 'PERF',
    sprint: 'ce-sprint-1',
    description: 'Index 500,000 eCommerce catalog items using text-embedding-3-small and query cosine similarity under 45ms.',
    createdAt: '2026-10-24',
    comments: []
  },
  {
    id: 'CE-402',
    projectKey: 'CE',
    title: 'Collaborative filtering ML model fine-tuning for cart cross-sells',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Jordan Hayes',
    epic: 'PERF',
    sprint: 'ce-sprint-1',
    description: 'Retrain matrix factorization model on recent 90-day checkout sessions.',
    createdAt: '2026-10-25',
    comments: []
  },

  // Meet-Gen (MG) Issues
  {
    id: 'MG-501',
    projectKey: 'MG',
    title: 'WebRTC multi-peer mesh video room audio ducking during speaker transitions',
    type: 'story',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 5,
    assignee: 'Elena Rostova',
    epic: 'PERF',
    sprint: 'mg-sprint-1',
    description: 'Automatically lower background audio when the primary presenter begins speaking in live shopping sessions.',
    createdAt: '2026-10-23',
    comments: []
  },
  {
    id: 'MG-502',
    projectKey: 'MG',
    title: 'Screen sharing latency optimization under 120ms with VP9 simulcast',
    type: 'bug',
    status: 'todo',
    priority: 'highest',
    storyPoints: 3,
    assignee: 'Elena Rostova',
    epic: 'PERF',
    sprint: 'mg-sprint-1',
    description: 'High packet loss on mobile causes video stutter during live demo product showcases.',
    createdAt: '2026-10-24',
    comments: []
  }
];

export function JiraProvider({ children }) {
  const [projects] = useState(INITIAL_PROJECTS);
  const [currentProjectKey, setCurrentProjectKey] = useState('WS');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState('WS');
  const [sprints, setSprints] = useState(INITIAL_SPRINTS);
  const [epics] = useState(INITIAL_EPICS);
  const [releases] = useState(INITIAL_RELEASES);
  const [team] = useState(INITIAL_TEAM);
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  // Modals & UI Selection State
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const currentProject = useMemo(() => {
    return projects.find(p => p.key === currentProjectKey) || projects[0];
  }, [projects, currentProjectKey]);

  const activeSprint = useMemo(() => {
    return sprints.find(s => s.projectKey === currentProjectKey && s.status === 'active') || 
           sprints.find(s => s.projectKey === currentProjectKey) || 
           sprints[0];
  }, [sprints, currentProjectKey]);

  // Project-specific scoped issues
  const currentProjectIssues = useMemo(() => {
    return issues.filter(i => i.projectKey === currentProjectKey || i.id.startsWith(`${currentProjectKey}-`));
  }, [issues, currentProjectKey]);

  const sprintIssues = useMemo(() => {
    return currentProjectIssues.filter(i => i.sprint === activeSprint?.id && i.status !== 'backlog');
  }, [currentProjectIssues, activeSprint]);

  const backlogIssues = useMemo(() => {
    return currentProjectIssues.filter(i => i.sprint !== activeSprint?.id || i.status === 'backlog');
  }, [currentProjectIssues, activeSprint]);

  const selectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  // Actions
  const createIssue = (issueData) => {
    const targetProjectKey = issueData.projectKey || currentProjectKey;
    const projectIssuesCount = issues.filter(i => i.projectKey === targetProjectKey || i.id.startsWith(`${targetProjectKey}-`)).length;
    const nextNum = projectIssuesCount + 101;
    
    const newIssue = {
      id: `${targetProjectKey}-${nextNum}`,
      projectKey: targetProjectKey,
      title: (issueData.title || 'Untitled task').trim(),
      type: issueData.type || 'story',
      status: issueData.status || 'todo',
      priority: issueData.priority || 'medium',
      storyPoints: Number(issueData.storyPoints) || 3,
      assignee: issueData.assignee || 'Alex Chen',
      epic: issueData.epic || 'AUTH',
      sprint: issueData.sprint !== undefined ? issueData.sprint : activeSprint?.id,
      description: issueData.description || '',
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };

    setIssues(prev => [newIssue, ...prev]);
    return newIssue;
  };

  const updateIssueStatus = (issueId, newStatus) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, status: newStatus };
      }
      return issue;
    }));
  };

  const moveIssueToSprint = (issueId, sprintId) => {
    setIssues(prev => prev.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          sprint: sprintId || activeSprint?.id,
          status: i.status === 'backlog' ? 'todo' : i.status
        };
      }
      return i;
    }));
  };

  const moveIssueToBacklog = (issueId) => {
    setIssues(prev => prev.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          sprint: null,
          status: 'backlog'
        };
      }
      return i;
    }));
  };

  const updateIssue = (issueId, fields) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, ...fields };
      }
      return issue;
    }));
  };

  const deleteIssue = (issueId) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    if (selectedIssueId === issueId) {
      setSelectedIssueId(null);
    }
  };

  const addComment = (issueId, text, author = 'Alex Chen') => {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(),
      author,
      text: text.trim(),
      time: 'Just now'
    };

    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          comments: [...(issue.comments || []), newComment]
        };
      }
      return issue;
    }));
  };

  const openCreateModal = (defaultStatus = 'todo') => {
    setCreateModalDefaultStatus(defaultStatus);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Stats calculation for the active project
  const completedPoints = useMemo(() => {
    return sprintIssues
      .filter(i => i.status === 'done')
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  }, [sprintIssues]);

  const totalSprintPoints = useMemo(() => {
    return sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  }, [sprintIssues]);

  const sprintProgressPercent = totalSprintPoints > 0 
    ? Math.round((completedPoints / totalSprintPoints) * 100) 
    : 0;

  const value = {
    projects,
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    currentProject,
    currentProjectKey,
    setCurrentProjectKey,
    sprints,
    setSprints,
    activeSprint,
    epics,
    releases,
    team,
    issues,
    currentProjectIssues,
    sprintIssues,
    backlogIssues,
    totalSprintPoints,
    completedPoints,
    sprintProgressPercent,
    selectedIssue,
    selectedIssueId,
    setSelectedIssueId,
    isCreateModalOpen,
    createModalDefaultStatus,
    openCreateModal,
    closeCreateModal,
    createIssue,
    updateIssueStatus,
    updateIssue,
    deleteIssue,
    moveIssueToSprint,
    moveIssueToBacklog,
    addComment,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterPriority,
    setFilterPriority,
    filterAssignee,
    setFilterAssignee,
  };

  return (
    <JiraContext.Provider value={value}>
      {children}
    </JiraContext.Provider>
  );
}

export function useJira() {
  const context = useContext(JiraContext);
  if (!context) {
    throw new Error('useJira must be used within a JiraProvider');
  }
  return context;
}
