import { useState } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  PhoneOff, 
  Users, 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  Plus, 
  MonitorUp, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Radio,
  FileText,
  X,
  LayoutGrid,
  Table as TableIcon,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useJira } from '../context/JiraContext';
import '../components/jira/Jira.css';
import './UserPages.css';

const initialMeetings = [
  // SCHEDULED (UPCOMING)
  {
    id: 'meet-s1',
    title: 'Sprint 14 Retrospective & Demo Showcase',
    space: 'Work-Sphere (WS)',
    spaceKey: 'WS',
    icon: '🩵',
    category: 'scheduled',
    date: 'Tomorrow, Oct 28',
    time: '10:00 AM - 10:45 AM',
    duration: '45 mins',
    host: 'Alex Chen',
    hostRole: 'Tech Lead',
    agenda: 'Demonstration of OAuth 2.0 PKCE flow, Stripe 3DS2 checkout, and Sprint 15 velocity targets.',
    participants: ['Alex Chen', 'Sarah Lin', 'Marcus Brody', 'Elena Rostova', 'Jordan Hayes'],
    link: 'https://meet.workspace.io/ws-sprint-14-retro'
  },
  {
    id: 'meet-s2',
    title: 'PCI-DSS Tokenization & KMS Security Review',
    space: 'Pay-Vaulta (PV)',
    spaceKey: 'PV',
    icon: '💳',
    category: 'scheduled',
    date: 'Tomorrow, Oct 28',
    time: '2:00 PM - 2:30 PM',
    duration: '30 mins',
    host: 'Marcus Brody',
    hostRole: 'FinTech Lead Engineer',
    agenda: 'AWS KMS customer master key rotation audit and zero-downtime payment token re-encryption.',
    participants: ['Marcus Brody', 'Alex Chen', 'Sarah Lin'],
    link: 'https://meet.workspace.io/pv-security-audit'
  },
  {
    id: 'meet-s3',
    title: 'AI Vector Search & Embeddings Workshop',
    space: 'Cogni-Era (CE)',
    spaceKey: 'CE',
    icon: '🌐',
    category: 'scheduled',
    date: 'Thursday, Oct 29',
    time: '11:30 AM - 12:30 PM',
    duration: '60 mins',
    host: 'Jordan Hayes',
    hostRole: 'Head of AI & Design',
    agenda: 'Fine-tuning matrix factorization recommendation model and scaling Pinecone vector database index.',
    participants: ['Jordan Hayes', 'Alex Chen', 'Elena Rostova'],
    link: 'https://meet.workspace.io/ce-vector-workshop'
  },
  {
    id: 'meet-s4',
    title: 'Enterprise Talent Pipeline Architecture Sync',
    space: 'Talent-Hub (TH)',
    spaceKey: 'TH',
    icon: '👥',
    category: 'scheduled',
    date: 'Friday, Oct 30',
    time: '3:00 PM - 3:45 PM',
    duration: '45 mins',
    host: 'Sarah Lin',
    hostRole: 'HR Systems Lead',
    agenda: 'ATS webhook integrations and automated background check workflow with third-party providers.',
    participants: ['Sarah Lin', 'Alex Chen'],
    link: 'https://meet.workspace.io/th-pipeline-sync'
  },
  {
    id: 'meet-s5',
    title: 'Weekly Cross-Platform Engineering All-Hands',
    space: 'Cross-Platform',
    spaceKey: 'ALL',
    icon: '🚀',
    category: 'scheduled',
    date: 'Monday, Nov 2',
    time: '9:30 AM - 10:15 AM',
    duration: '45 mins',
    host: 'Alex Chen',
    hostRole: 'Tech Lead',
    agenda: 'Engineering velocity metrics, release candidate validation, and Q4 infrastructure scaling roadmap.',
    participants: ['Alex Chen', 'Sarah Lin', 'Marcus Brody', 'Elena Rostova', 'Jordan Hayes'],
    link: 'https://meet.workspace.io/all-hands-q4'
  },

  // ONGOING (IN-SESSION)
  {
    id: 'meet-o1',
    title: 'Daily Engineering Standup',
    space: 'Work-Sphere (WS)',
    spaceKey: 'WS',
    icon: '🩵',
    category: 'ongoing',
    date: 'Today',
    time: 'Started 10:00 AM (Ongoing)',
    duration: 'In progress',
    host: 'Alex Chen',
    hostRole: 'Tech Lead',
    agenda: 'Sprint 14 blockers, Redis cluster failover verification, and PR #342 review.',
    participants: ['Alex Chen', 'Sarah Lin', 'Marcus Brody', 'Elena Rostova'],
    link: 'https://meet.workspace.io/ws-daily-standup'
  },
  {
    id: 'meet-o2',
    title: 'WebRTC Mesh RTC Latency Optimization',
    space: 'Meet-Gen (MG)',
    spaceKey: 'MG',
    icon: '🎙️',
    category: 'ongoing',
    date: 'Today',
    time: 'Started 10:15 AM (Ongoing)',
    duration: 'In progress',
    host: 'Elena Rostova',
    hostRole: 'Lead RTC Architect',
    agenda: 'WebRTC mesh video audio ducking and latency optimizations under 120ms benchmark.',
    participants: ['Elena Rostova', 'Jordan Hayes'],
    link: 'https://meet.workspace.io/mg-webrtc-stream'
  },

  // COMPLETED (PAST)
  {
    id: 'meet-c1',
    title: 'Sprint 14 Backlog Grooming & Story Estimation',
    space: 'Work-Sphere (WS)',
    spaceKey: 'WS',
    icon: '🩵',
    category: 'completed',
    date: 'Yesterday, Oct 26',
    time: '2:00 PM - 3:00 PM',
    duration: '60 mins',
    host: 'Alex Chen',
    hostRole: 'Tech Lead',
    agenda: 'Pointed 18 stories, resolved 3 technical debt blockers, and finalized acceptance criteria.',
    participants: ['Alex Chen', 'Sarah Lin', 'Marcus Brody'],
    summaryNotes: '18 stories pointed. Sprint backlog committed with velocity target of 42 points. Key epic EP-103 unblocked.',
    link: 'https://meet.workspace.io/ws-grooming-notes'
  },
  {
    id: 'meet-c2',
    title: 'Database Sharding & Replication Architecture Review',
    space: 'Pay-Vaulta (PV)',
    spaceKey: 'PV',
    icon: '💳',
    category: 'completed',
    date: 'Oct 25, 2026',
    time: '11:00 AM - 11:45 AM',
    duration: '45 mins',
    host: 'Marcus Brody',
    hostRole: 'FinTech Lead Engineer',
    agenda: 'Evaluated AWS Aurora PostgreSQL multi-region read replicas vs Citus distributed tables.',
    participants: ['Marcus Brody', 'Alex Chen'],
    summaryNotes: 'Approved Aurora multi-region read replicas for European payment gateway rollout. Migration scheduled for Sprint 16.',
    link: 'https://meet.workspace.io/pv-sharding-review'
  },
  {
    id: 'meet-c3',
    title: 'Talent-Hub SOC2 & GDPR Candidate Data Audit',
    space: 'Talent-Hub (TH)',
    spaceKey: 'TH',
    icon: '👥',
    category: 'completed',
    date: 'Oct 24, 2026',
    time: '3:30 PM - 4:15 PM',
    duration: '45 mins',
    host: 'Sarah Lin',
    hostRole: 'HR Systems Lead',
    agenda: 'Automated candidate PII data anonymization after 90 days retention period.',
    participants: ['Sarah Lin', 'Elena Rostova'],
    summaryNotes: 'Automated anonymization cron verified in staging. SOC2 compliance criteria met with zero critical findings.',
    link: 'https://meet.workspace.io/th-audit-recap'
  }
];

export default function MeetPage() {
  const { projects } = useJira();

  // State
  const [meetings, setMeetings] = useState(initialMeetings);
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' by default per user request
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState('ALL');

  // Modals & Interactive Call
  const [activeCallModal, setActiveCallModal] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showInCallChat, setShowInCallChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Elena Rostova', text: 'Audio and screen latency looking sub-80ms on WebRTC mesh.', time: '10:04 AM' },
    { sender: 'Sarah Lin', text: 'Reviewing PR #342 right now, approvals look clean.', time: '10:08 AM' }
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Schedule Meeting Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    spaceKey: 'WS',
    category: 'scheduled',
    date: 'Tomorrow, Oct 28',
    time: '11:00 AM - 11:30 AM',
    duration: '30 mins',
    host: 'Alex Chen',
    hostRole: 'Tech Lead',
    agenda: ''
  });

  // Notes Modal State
  const [viewNotesMeeting, setViewNotesMeeting] = useState(null);
  const [copiedLinkMeetingId, setCopiedLinkMeetingId] = useState(null);

  const handleCopyLink = (id, link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLinkMeetingId(id);
      setTimeout(() => setCopiedLinkMeetingId(null), 2000);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: 'Alex Chen',
        text: newChatText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewChatText('');
  };

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return;

    const matchedProject = projects.find(p => p.key === scheduleForm.spaceKey) || {
      name: 'Work-Sphere',
      key: 'WS',
      icon: '🩵'
    };

    const newMeeting = {
      id: `meet-user-${Date.now()}`,
      title: scheduleForm.title.trim(),
      space: `${matchedProject.name} (${matchedProject.key})`,
      spaceKey: matchedProject.key,
      icon: matchedProject.icon || '🚀',
      category: scheduleForm.category,
      date: scheduleForm.date || 'Scheduled Soon',
      time: scheduleForm.time || '10:00 AM - 10:30 AM',
      duration: scheduleForm.duration || '30 mins',
      host: scheduleForm.host || 'Alex Chen',
      hostRole: scheduleForm.hostRole || 'Tech Lead',
      agenda: scheduleForm.agenda.trim() || 'Sprint coordination and agile alignment.',
      participants: ['Alex Chen', 'Sarah Lin'],
      link: `https://meet.workspace.io/${matchedProject.key.toLowerCase()}-${Date.now().toString().slice(-4)}`
    };

    setMeetings([newMeeting, ...meetings]);
    setActiveTab(scheduleForm.category);
    setIsScheduleModalOpen(false);
    setScheduleForm({
      title: '',
      spaceKey: 'WS',
      category: 'scheduled',
      date: 'Tomorrow, Oct 28',
      time: '11:00 AM - 11:30 AM',
      duration: '30 mins',
      host: 'Alex Chen',
      hostRole: 'Tech Lead',
      agenda: ''
    });
  };

  // Counts
  const scheduledCount = meetings.filter(m => m.category === 'scheduled').length;
  const ongoingCount = meetings.filter(m => m.category === 'ongoing').length;
  const completedCount = meetings.filter(m => m.category === 'completed').length;

  // Filtered Meetings
  const currentTabMeetings = meetings.filter(m => {
    const matchesCategory = m.category === activeTab;
    const matchesSpace = selectedSpaceFilter === 'ALL' || m.spaceKey === selectedSpaceFilter;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSpace && matchesSearch;
  });

  return (
    <div className="internal-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Video size={24} color="#2563eb" />
            <h1 className="page-headline m-0">Meet & Team Huddles</h1>
          </div>
          <p className="page-subheadline">
            Agile sprint ceremonies, daily standups, retrospectives, and architecture reviews across your workspace.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            type="button" 
            className="page-action-btn-primary"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <Plus size={16} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (16px, non-bold values, no badges) */}
      <div className="metrics-grid mb-4">
        <div className="metric-glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('scheduled')}>
          <div className="metric-icon-box blue">
            <Calendar size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Scheduled Meetings</span>
            <span className="metric-value">{scheduledCount} Upcoming</span>
          </div>
        </div>

        <div className="metric-glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('ongoing')}>
          <div className="metric-icon-box green">
            <Radio size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Ongoing Huddles</span>
            <span className="metric-value">{ongoingCount} Active Now</span>
          </div>
        </div>

        <div className="metric-glass-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('completed')}>
          <div className="metric-icon-box purple">
            <CheckCircle2 size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Completed Ceremonies</span>
            <span className="metric-value">{completedCount} Concluded</span>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-box amber">
            <ShieldCheck size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-caption">Team Attendance</span>
            <span className="metric-value">98% Recorded</span>
          </div>
        </div>
      </div>

      {/* Tabs & View Controls */}
      <div className="meet-navigation-bar">
        {/* Navigation Tabs: Scheduled (default), Ongoing, Completed */}
        <div className="meet-tabs-group">
          <button
            type="button"
            className={`meet-tab-pill ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <Calendar size={15} />
            <span>Scheduled</span>
            <span className="meet-tab-count">{scheduledCount}</span>
          </button>

          <button
            type="button"
            className={`meet-tab-pill ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            <Radio size={15} color={activeTab === 'ongoing' ? '#16a34a' : 'currentColor'} />
            <span>Ongoing</span>
            <span className="meet-tab-count">{ongoingCount}</span>
          </button>

          <button
            type="button"
            className={`meet-tab-pill ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <CheckCircle2 size={15} />
            <span>Completed</span>
            <span className="meet-tab-count">{completedCount}</span>
          </button>
        </div>

        {/* Search, Space Filter, and View Switcher (Cards vs Table) */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Space Filter Pill */}
          <select
            className="jira-filter-select"
            value={selectedSpaceFilter}
            onChange={(e) => setSelectedSpaceFilter(e.target.value)}
            style={{ padding: '0.42rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Spaces</option>
            <option value="WS">Work-Sphere (WS)</option>
            <option value="PV">Pay-Vaulta (PV)</option>
            <option value="TH">Talent-Hub (TH)</option>
            <option value="CE">Cogni-Era (CE)</option>
            <option value="MG">Meet-Gen (MG)</option>
          </select>

          {/* Cards vs Table View Toggle */}
          <div className="meet-view-toggle">
            <button
              type="button"
              className={`meet-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards View"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`meet-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Meet Cards OR Meet Table */}
      {currentTabMeetings.length === 0 ? (
        <div className="content-section-card text-center py-5">
          <Calendar size={36} color="#94a3b8" className="mb-2" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>No {activeTab} meetings found</h4>
          <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
            There are currently no {activeTab} meetings matching your active filters.
          </p>
          <button
            type="button"
            className="jira-fast-create-btn"
            style={{ margin: '0 auto' }}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <Plus size={14} />
            <span>Schedule a Meeting</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="meet-cards-grid">
          {currentTabMeetings.map((meeting) => (
            <div key={meeting.id} className="meet-ceremony-card">
              <div>
                {/* Space and Status Row */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-1">
                    <span style={{ fontSize: '1.15rem' }}>{meeting.icon}</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {meeting.space}
                    </span>
                  </div>

                  {meeting.category === 'scheduled' && (
                    <span className="meet-status-badge scheduled">
                      <Clock size={11} />
                      <span>{meeting.date}</span>
                    </span>
                  )}

                  {meeting.category === 'ongoing' && (
                    <span className="meet-status-badge ongoing">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                      <span>IN SESSION</span>
                    </span>
                  )}

                  {meeting.category === 'completed' && (
                    <span className="meet-status-badge completed">
                      <CheckCircle2 size={11} color="#64748b" />
                      <span>CONCLUDED</span>
                    </span>
                  )}
                </div>

                {/* Meeting Title */}
                <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {meeting.title}
                </h4>

                {/* Agenda */}
                <p className="text-muted mb-3" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                  {meeting.agenda}
                </p>

                {/* Time & Host Information Bar */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 10px', marginBottom: '12px' }}>
                  <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.76rem', color: '#475569' }}>
                    <span>
                      <Clock size={12} style={{ marginRight: '5px', verticalAlign: '-1px' }} />
                      <strong>{meeting.time}</strong>
                    </span>
                    <span style={{ color: '#64748b' }}>{meeting.duration}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-1" style={{ borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <span style={{ color: '#64748b' }}>
                      Host: <strong style={{ color: '#1e293b' }}>{meeting.host}</strong> ({meeting.hostRole})
                    </span>
                  </div>
                </div>

                {/* Participants Stack */}
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center gap-1">
                    {meeting.participants.slice(0, 4).map((name) => (
                      <div
                        key={name}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '7px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #ffffff'
                        }}
                        title={name}
                      >
                        {name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    ))}
                    {meeting.participants.length > 4 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>
                        +{meeting.participants.length - 4} more
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {meeting.participants.length} Attendees
                  </span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="d-flex align-items-center justify-content-between pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className="jira-fast-create-btn"
                  onClick={() => handleCopyLink(meeting.id, meeting.link)}
                  title="Copy Invite Link"
                >
                  {copiedLinkMeetingId === meeting.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copiedLinkMeetingId === meeting.id ? 'Copied' : 'Invite'}</span>
                </button>

                <div className="d-flex gap-2">
                  {meeting.category === 'completed' ? (
                    <button
                      type="button"
                      className="jira-fast-create-btn"
                      onClick={() => setViewNotesMeeting(meeting)}
                    >
                      <FileText size={13} color="#2563eb" />
                      <span>Summary</span>
                    </button>
                  ) : meeting.category === 'ongoing' ? (
                    <button
                      type="button"
                      className="page-action-btn-primary"
                      style={{ padding: '0.42rem 0.95rem', fontSize: '0.8rem', borderRadius: '8px' }}
                      onClick={() => setActiveCallModal(meeting)}
                    >
                      <Video size={13} />
                      <span>Join Call</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="jira-fast-create-btn"
                      onClick={() => setViewNotesMeeting(meeting)}
                    >
                      <FileText size={13} color="#64748b" />
                      <span>Details</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="meet-table-wrapper mb-4">
          <table className="meet-data-table">
            <thead>
              <tr>
                <th>Ceremony & Space</th>
                <th>Status</th>
                <th>Scheduled Date & Time</th>
                <th>Duration</th>
                <th>Host / Lead</th>
                <th>Attendees</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTabMeetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>{meeting.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{meeting.title}</div>
                        <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>{meeting.space}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {meeting.category === 'scheduled' && (
                      <span className="meet-status-badge scheduled">
                        <Clock size={11} />
                        <span>Scheduled</span>
                      </span>
                    )}
                    {meeting.category === 'ongoing' && (
                      <span className="meet-status-badge ongoing">
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                        <span>Ongoing</span>
                      </span>
                    )}
                    {meeting.category === 'completed' && (
                      <span className="meet-status-badge completed">
                        <CheckCircle2 size={11} color="#64748b" />
                        <span>Concluded</span>
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ color: '#1e293b', fontWeight: 600 }}>{meeting.date}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{meeting.time}</div>
                  </td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '0.82rem' }}>{meeting.duration}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{meeting.host}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{meeting.hostRole}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      {meeting.participants.slice(0, 3).map((name) => (
                        <div
                          key={name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={name}
                        >
                          {name.split(' ').map((n) => n[0]).join('')}
                        </div>
                      ))}
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>
                        {meeting.participants.length}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <button
                        type="button"
                        className="jira-fast-create-btn"
                        onClick={() => handleCopyLink(meeting.id, meeting.link)}
                        title="Copy Invite Link"
                      >
                        {copiedLinkMeetingId === meeting.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        <span>{copiedLinkMeetingId === meeting.id ? 'Copied' : 'Invite'}</span>
                      </button>

                      {meeting.category === 'completed' ? (
                        <button
                          type="button"
                          className="jira-fast-create-btn"
                          onClick={() => setViewNotesMeeting(meeting)}
                        >
                          <FileText size={12} color="#2563eb" />
                          <span>Notes</span>
                        </button>
                      ) : meeting.category === 'ongoing' ? (
                        <button
                          type="button"
                          className="page-action-btn-primary"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', borderRadius: '6px' }}
                          onClick={() => setActiveCallModal(meeting)}
                        >
                          <Video size={12} />
                          <span>Join</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="jira-fast-create-btn"
                          onClick={() => setViewNotesMeeting(meeting)}
                        >
                          <FileText size={12} color="#64748b" />
                          <span>Details</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isScheduleModalOpen && (
        <div className="jira-modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="p-4"
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="d-flex align-items-center gap-2">
                <Calendar size={20} color="#2563eb" />
                <h3 className="m-0" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Schedule Agile Meeting
                </h3>
              </div>
              <button
                type="button"
                className="jira-modal-close-btn"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div className="mb-3">
                <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Meeting / Ceremony Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 15 Planning & Capacity Review"
                  className="jira-form-input w-100"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Project Space
                  </label>
                  <select
                    className="jira-form-input w-100"
                    value={scheduleForm.spaceKey}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, spaceKey: e.target.value })}
                  >
                    <option value="WS">🩵 Work-Sphere (WS)</option>
                    <option value="PV">💳 Pay-Vaulta (PV)</option>
                    <option value="TH">👥 Talent-Hub (TH)</option>
                    <option value="CE">🌐 Cogni-Era (CE)</option>
                    <option value="MG">🎙️ Meet-Gen (MG)</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Meeting Status
                  </label>
                  <select
                    className="jira-form-input w-100"
                    value={scheduleForm.category}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                  >
                    <option value="scheduled">Scheduled (Upcoming)</option>
                    <option value="ongoing">Ongoing (Active Now)</option>
                    <option value="completed">Completed (Concluded)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow, Oct 28"
                    className="jira-form-input w-100"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Time & Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 10:45 AM"
                    className="jira-form-input w-100"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="jira-form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Agenda & Discussion Points
                </label>
                <textarea
                  rows="3"
                  placeholder="Outline the sprint goals, blockers, or discussion points..."
                  className="jira-form-input w-100"
                  value={scheduleForm.agenda}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, agenda: e.target.value })}
                />
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className="jira-form-cancel-btn"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="page-action-btn-primary"
                >
                  <Check size={14} />
                  <span>Create Meeting Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED MEETING SUMMARY MODAL */}
      {viewNotesMeeting && (
        <div className="jira-modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="p-4"
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={20} color="#16a34a" />
                <h3 className="m-0" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Ceremony Recap & Summary
                </h3>
              </div>
              <button
                type="button"
                className="jira-modal-close-btn"
                onClick={() => setViewNotesMeeting(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-3">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {viewNotesMeeting.title}
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                {viewNotesMeeting.space} • Concluded {viewNotesMeeting.date} ({viewNotesMeeting.duration})
              </span>
            </div>

            <div className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Key Takeaways & Action Items
              </span>
              <p style={{ fontSize: '0.86rem', color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                {viewNotesMeeting.summaryNotes || viewNotesMeeting.agenda}
              </p>
            </div>

            <div className="mb-3">
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Meeting Attendees ({viewNotesMeeting.participants.length}):
              </span>
              <div className="d-flex flex-wrap gap-2">
                {viewNotesMeeting.participants.map((person) => (
                  <span
                    key={person}
                    style={{
                      fontSize: '0.75rem',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-end pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="page-action-btn-primary"
                onClick={() => setViewNotesMeeting(null)}
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE WEBRTC VIDEO CALL ROOM MODAL */}
      {activeCallModal && (
        <div className="jira-modal-overlay" style={{ zIndex: 1200 }}>
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              background: '#0b0f19',
              borderRadius: '20px',
              border: '1px solid #1e293b',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div className="d-flex align-items-center justify-content-between p-3" style={{ borderBottom: '1px solid #1e293b' }}>
              <div className="d-flex align-items-center gap-2">
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 10px #22c55e' }} />
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>{activeCallModal.title}</span>
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>• {activeCallModal.space}</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span style={{ color: '#22c55e', fontSize: '0.78rem', background: '#052e16', padding: '2px 8px', borderRadius: '4px', border: '1px solid #14532d' }}>
                  HD 1080p WebRTC
                </span>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  onClick={() => setActiveCallModal(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Tile Grid & Chat Layout */}
            <div style={{ display: 'flex', flex: 1, minHeight: '380px' }}>
              {/* Left: Video Tile Grid (2x2) */}
              <div
                style={{
                  flex: 1,
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}
              >
                {activeCallModal.participants.map((person, idx) => (
                  <div
                    key={person}
                    style={{
                      background: idx === 0 && isScreenSharing ? '#0284c7' : '#1e293b',
                      borderRadius: '14px',
                      border: idx === 0 ? '2px solid #2563eb' : '1px solid #334155',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      minHeight: '170px'
                    }}
                  >
                    {idx === 0 && isScreenSharing ? (
                      <div className="text-center p-3">
                        <MonitorUp size={36} color="#ffffff" className="mb-2" />
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>Screen Share Active</div>
                        <div style={{ color: '#bae6fd', fontSize: '0.75rem' }}>Alex Chen's IDE Workspace</div>
                      </div>
                    ) : idx === 0 && isVideoOff ? (
                      <div className="text-center">
                        <CameraOff size={32} color="#64748b" className="mb-2" />
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Camera Off</div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {person.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 600 }}>{person}</span>
                      {idx === 0 && (
                        <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px' }}>
                          You
                        </span>
                      )}
                    </div>

                    <div style={{ position: 'absolute', top: '10px', right: '12px' }}>
                      {idx === 0 && isMuted ? (
                        <MicOff size={14} color="#ef4444" />
                      ) : (
                        <Mic size={14} color="#22c55e" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: In-Call Chat Drawer (Toggleable) */}
              {showInCallChat && (
                <div
                  style={{
                    width: '280px',
                    borderLeft: '1px solid #1e293b',
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div className="p-3" style={{ borderBottom: '1px solid #1e293b', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>
                    In-Call Chat
                  </div>
                  <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ background: '#1e293b', borderRadius: '8px', padding: '8px' }}>
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          <strong style={{ color: '#38bdf8' }}>{msg.sender}</strong>
                          <span>{msg.time}</span>
                        </div>
                        <div style={{ color: '#f1f5f9', fontSize: '0.78rem', lineHeight: 1.35 }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChatMessage} className="p-2" style={{ borderTop: '1px solid #1e293b' }}>
                    <input
                      type="text"
                      placeholder="Type message..."
                      style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#ffffff',
                        padding: '6px 10px',
                        fontSize: '0.78rem'
                      }}
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="d-flex align-items-center justify-content-between p-3" style={{ borderTop: '1px solid #1e293b', background: '#070a12' }}>
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Connected: {activeCallModal.participants.length} team members
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isMuted ? '#ef4444' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  type="button"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isVideoOff ? '#ef4444' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoOff ? <CameraOff size={18} /> : <Camera size={18} />}
                </button>

                <button
                  type="button"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: isScreenSharing ? '#2563eb' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
                >
                  <MonitorUp size={18} />
                </button>

                <button
                  type="button"
                  style={{
                    padding: '0.55rem 1.35rem',
                    borderRadius: '9999px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: '8px'
                  }}
                  onClick={() => setActiveCallModal(null)}
                >
                  <PhoneOff size={16} />
                  <span>Leave Huddle</span>
                </button>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  style={{
                    background: showInCallChat ? '#2563eb' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem'
                  }}
                  onClick={() => setShowInCallChat(!showInCallChat)}
                  title="Toggle in-call chat"
                >
                  <MessageSquare size={16} />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
