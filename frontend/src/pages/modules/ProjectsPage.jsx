import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertTriangle,
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
  X,
  Compass,
  Calendar as CalendarIcon,
  Target,
  ArrowRight,
  ListChecks,
  Send,
  Check,
  Sparkles,
  Rocket,
  ShieldCheck,
  FileText,
  ChevronRight,
  MoreVertical,
  Eye
} from 'lucide-react';

const CATEGORIES = ['Engineering', 'DevOps', 'Design', 'Product', 'Research', 'Personal'];
const STATUSES = ['in_progress', 'completed', 'planning', 'on_hold'];

// The 7 step lifecycle stages requested by user
const STEP_LIFECYCLE_STAGES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { value: 'testing', label: 'Testing', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'testing_completed', label: 'Testing Completed', color: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  { value: 'production_in_progress', label: 'Production In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { value: 'live', label: 'Live', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold', dot: 'bg-emerald-500' }
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Open dropdown with exact viewport coordinates so it never touches table layout
  const handleOpenDropdown = (e, id) => {
    e.stopPropagation();
    if (activeDropdownId === id) {
      setActiveDropdownId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownWidth = 192; // 12rem = 192px
    let left = rect.right - dropdownWidth;
    if (left < 10) left = 10;
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }
    let top = rect.bottom + 6;
    if (top + 200 > window.innerHeight) {
      top = Math.max(10, rect.top - 180);
    }
    setDropdownPos({ top, left });
    setActiveDropdownId(id);
  };

  // Close dropdown on outside click or scroll so it never hangs out
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.project-portal-dropdown') && !e.target.closest('.project-action-trigger')) {
        setActiveDropdownId(null);
      }
    };
    const handleScroll = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // FORM 1: Project Profile / Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    status: 'in_progress',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    steps: [
      {
        title: 'Architecture & Initial Setup',
        description: 'Establish foundational requirements and design',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'in_progress',
        notes: ''
      }
    ]
  });
  const [formErrors, setFormErrors] = useState({});

  // FORM 2: Project Submission & Progress Update Modal State
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(null);
  const [submissionSteps, setSubmissionSteps] = useState([]);

  // Fetch Projects from MongoDB
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setProjects(json.data);
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Format date helper: "Nov 30, 2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
      case 'in_progress':
        return { label: 'In Progress', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-500' };
      case 'planning':
        return { label: 'Planning', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' };
      case 'on_hold':
        return { label: 'On Hold', color: 'text-slate-700 bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
      default:
        return { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
    }
  };

  // Priority Badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'HIGH', color: 'text-rose-700 bg-rose-50 border-rose-200 font-extrabold' };
      case 'medium':
        return { label: 'MEDIUM', color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
      case 'low':
        return { label: 'LOW', color: 'text-slate-600 bg-slate-50 border-slate-200 font-medium' };
      default:
        return { label: 'MEDIUM', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  // Step Status Helper
  const getStepStatusObj = (status) => {
    return STEP_LIFECYCLE_STAGES.find((s) => s.value === status) || STEP_LIFECYCLE_STAGES[0];
  };

  // Summary Metrics
  const summary = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === 'in_progress').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const planning = projects.filter((p) => p.status === 'planning').length;
    const onHold = projects.filter((p) => p.status === 'on_hold').length;

    const totalTasks = projects.reduce((acc, p) => acc + (p.tasksTotal || (p.steps ? p.steps.length : 0)), 0);
    const completedTasks = projects.reduce((acc, p) => acc + (p.tasksCompleted || 0), 0);
    const avgProgress = total > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
      : 0;

    return {
      total,
      inProgress,
      completed,
      planning,
      onHold,
      totalTasks,
      completedTasks,
      avgProgress
    };
  }, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inCategory = (p.category || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCategory) return false;
      }
      return true;
    });
  }, [projects, filterStatus, filterCategory, searchQuery]);

  // =========================================================
  // FORM 1: OPEN PROJECT PROFILE CREATION / EDIT MODAL
  // =========================================================
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      category: 'Engineering',
      status: 'in_progress',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      steps: [
        {
          title: 'Planning & Requirements',
          description: 'Define scope, milestones, and deliverables',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'in_progress',
          notes: ''
        },
        {
          title: 'Development & Implementation',
          description: 'Core execution and milestone builds',
          startDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
          status: 'pending',
          notes: ''
        }
      ]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Engineering',
      status: project.status || 'in_progress',
      priority: project.priority || 'medium',
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      deadline: project.deadline || new Date().toISOString().split('T')[0],
      steps: project.steps && project.steps.length > 0
        ? project.steps.map((s) => ({ ...s }))
        : [
          {
            title: 'Phase 1 Delivery',
            description: 'Initial project deliverable',
            startDate: project.startDate || '',
            endDate: project.deadline || '',
            status: 'in_progress',
            notes: ''
          }
        ]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Add a Step in Form 1
  const handleAddStepToForm = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: `Step ${prev.steps.length + 1}`,
          description: '',
          startDate: prev.startDate,
          endDate: prev.deadline,
          status: 'pending',
          notes: ''
        }
      ]
    }));
  };

  // Remove a Step in Form 1
  const handleRemoveStepFromForm = (idx) => {
    if (formData.steps.length <= 1) {
      addToast('Project must have at least one step', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  // Update a Step in Form 1
  const handleUpdateStepField = (idx, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.steps];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, steps: updated };
    });
  };

  // Validate Form 1
  const validateForm1 = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required';
    if (!formData.steps || formData.steps.length === 0) {
      errors.steps = 'At least one project step is required';
    } else {
      const emptyStep = formData.steps.some((s) => !s.title || !s.title.trim());
      if (emptyStep) errors.steps = 'All steps must have a title';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form 1: Save Project Profile
  const handleForm1Submit = async (e) => {
    e.preventDefault();
    if (!validateForm1()) return;

    const completedSteps = formData.steps.filter((s) =>
      ['completed', 'testing_completed', 'live'].includes(s.status)
    ).length;
    const computedProgress = formData.steps.length > 0
      ? Math.round((completedSteps / formData.steps.length) * 100)
      : 0;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      status: computedProgress === 100 ? 'completed' : formData.status,
      priority: formData.priority,
      progress: computedProgress,
      tasksTotal: formData.steps.length,
      tasksCompleted: completedSteps,
      startDate: formData.startDate,
      deadline: formData.deadline,
      steps: formData.steps
    };

    if (editingProject) {
      const targetId = editingProject._id || editingProject.id;
      try {
        const res = await fetch(`/api/projects/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setProjects((prev) => prev.map((p) => ((p._id || p.id) === targetId ? json.data : p)));
        } else {
          setProjects((prev) => prev.map((p) => ((p._id || p.id) === targetId ? { ...p, ...payload } : p)));
        }
      } catch {
        setProjects((prev) => prev.map((p) => ((p._id || p.id) === targetId ? { ...p, ...payload } : p)));
      }
      addToast(`Updated project: ${payload.title}`, 'success');
    } else {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setProjects((prev) => [json.data, ...prev]);
        } else {
          const temp = { _id: `proj-${Date.now()}`, ...payload };
          setProjects((prev) => [temp, ...prev]);
        }
      } catch {
        const temp = { _id: `proj-${Date.now()}`, ...payload };
        setProjects((prev) => [temp, ...prev]);
      }
      addToast(`Created project: ${payload.title}`, 'success');
    }

    setIsModalOpen(false);
  };

  // =========================================================
  // FORM 2: OPEN PROJECT SUBMISSION & STEP PROGRESS UPDATE
  // =========================================================
  const handleOpenSubmissionModal = (project) => {
    setSubmittingProject(project);
    const existingSteps = project.steps && project.steps.length > 0
      ? project.steps.map((s) => ({ ...s }))
      : [
        {
          title: 'Initial Milestone',
          description: project.description || '',
          startDate: project.startDate || '',
          endDate: project.deadline || '',
          status: 'in_progress',
          notes: ''
        }
      ];
    setSubmissionSteps(existingSteps);
    setIsSubmissionModalOpen(true);
  };

  // Update step field in Form 2
  const handleSubmissionStepChange = (idx, field, val) => {
    setSubmissionSteps((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Add new step directly in submission form
  const handleAddSubmissionStep = () => {
    setSubmissionSteps((prev) => [
      ...prev,
      {
        title: `Deliverable Step ${prev.length + 1}`,
        description: '',
        startDate: submittingProject?.startDate || '',
        endDate: submittingProject?.deadline || '',
        status: 'pending',
        notes: ''
      }
    ]);
  };

  // Submit Form 2: Save Step Progress & Notes
  const handleForm2Submit = async (e) => {
    e.preventDefault();
    if (!submittingProject) return;

    const targetId = submittingProject._id || submittingProject.id;
    const completedCount = submissionSteps.filter((s) =>
      ['completed', 'testing_completed', 'live'].includes(s.status)
    ).length;

    const totalSteps = submissionSteps.length;
    const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const nextProjectStatus = progress === 100 ? 'completed' : submittingProject.status;

    const payload = {
      steps: submissionSteps,
      tasksTotal: totalSteps,
      tasksCompleted: completedCount,
      progress,
      status: nextProjectStatus
    };

    // Optimistic Update
    setProjects((prev) =>
      prev.map((p) =>
        (p._id || p.id) === targetId ? { ...p, ...payload } : p
      )
    );

    try {
      await fetch(`/api/projects/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Offline fallback
    }

    addToast(`Step updates submitted for "${submittingProject.title}"! 🚀`, 'success');
    setIsSubmissionModalOpen(false);
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }
    setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
    setDeleteConfirmId(null);
    addToast('Project removed from tracker', 'info');
  };

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Edge-to-Edge LiquidHeader */}
      <LiquidHeader
        title="My Projects"
        subtitle="Workspaces, Step Milestones, Testing & Production Progress"
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24 space-y-5 sm:space-y-6">

        {/* Top Module Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-black tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>PROJECT PLANNER</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • Engineering, Testing, Production & Live Tracking
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>2 Dedicated Project Forms Active</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO SECTION: 4 Status StatCards for Projects             */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">

          {/* Top Hero Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 shrink-0">
                  <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Project Workspaces & Step Milestones
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Create project profiles and submit progress through testing, production, and live release
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Rate Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Avg Deliverables:
              </span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {summary.avgProgress}% Overall Progress ({summary.completedTasks} of {summary.totalTasks} Steps Done)
              </span>
            </div>
          </div>

          {/* 4 Status StatCards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
            <StatCard
              title="Total Workspaces"
              value={<>{summary.total} <span className="text-xs font-semibold text-indigo-600">projects</span></>}
              badge="Active Initiatives"
              icon={FolderGit2}
              variant="indigo"
              footerLeft="Defined Profiles"
              footerRight="100% Monitored"
            />

            <StatCard
              title="In Progress"
              value={<>{summary.inProgress} <span className="text-xs font-semibold text-blue-600">active</span></>}
              badge="Active Sprints"
              icon={PlayCircle}
              variant="blue"
              footerLeft="Live Development"
              footerRight={`${summary.completedTasks}/${summary.totalTasks} Steps Done`}
            />

            <StatCard
              title="Completed Projects"
              value={<>{summary.completed} <span className="text-xs font-semibold text-emerald-600">delivered</span></>}
              badge="Production Live"
              icon={CheckCircle2}
              variant="emerald"
              footerLeft="Shipped Targets"
              footerRight={`${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="Pipeline Queued"
              value={<>{summary.planning + summary.onHold} <span className="text-xs font-semibold text-amber-600">queued</span></>}
              badge="Next Horizon"
              icon={Clock}
              variant="amber"
              footerLeft="Backlog Sprints"
              footerRight={`${summary.planning} Plan • ${summary.onHold} Hold`}
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* PROJECTS TABLE SECTION                                    */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">

          {/* Table Header & Controls Toolbar */}
          <div className="flex flex-col gap-3.5 pb-3 sm:pb-4 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <span>Configured Projects & Step Lifecycles</span>
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {filteredProjects.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Click "Submit Step Updates" to advance deliverables through testing, production, and live status
                </p>
              </div>
            </div>

            {/* Filter Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full">

              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search project title or scope..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="planning">Planning</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* FORM 1 BUTTON: + Add Project Profile - strictly right-aligned */}
              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate('/projects/new')}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20"
                >
                  + Add Project
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">Project Type</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderGit2 className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-semibold text-slate-600">No projects match your filter criteria</p>
                        <p className="text-xs text-slate-400">Click "+ Add Project" above to create a new workspace</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const id = project._id || project.id;
                    const statusObj = getStatusBadge(project.status);
                    const priorityObj = getPriorityBadge(project.priority);
                    const stepsList = project.steps || [];

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Project Title (Priority removed) */}
                        <td className="py-3 px-4 max-w-[280px]">
                          <button
                            onClick={() => navigate(`/projects/${id}`)}
                            className="text-left group/title focus:outline-none cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 group-hover/title:text-amber-700 transition-colors">
                                {project.title}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-xs text-slate-500 font-normal truncate mt-0.5 max-w-[260px]" title={project.description}>
                                {project.description}
                              </p>
                            )}
                          </button>
                        </td>

                        {/* Project Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {project.category}
                          </span>
                        </td>

                        {/* Start Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-700">
                            {formatDateDisplay(project.startDate)}
                          </span>
                        </td>

                        {/* End Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-700">
                            {formatDateDisplay(project.deadline)}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="w-28">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                              <span>{project.progress}%</span>
                              <span className="text-slate-400 font-semibold">
                                {project.tasksCompleted}/{project.tasksTotal || stepsList.length}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusObj.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                            <span>{statusObj.label}</span>
                          </span>
                        </td>

                        {/* Actions - Vertical Three-Dot Icon (Portal Trigger) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => handleOpenDropdown(e, id)}
                            className="project-action-trigger p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 shadow-2xs"
                            title="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredProjects.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No projects found</p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const id = project._id || project.id;
                const statusObj = getStatusBadge(project.status);
                const priorityObj = getPriorityBadge(project.priority);
                const stepsList = project.steps || [];

                return (
                  <div
                    key={id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusObj.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                            {project.category}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/projects/${id}`)}
                          className="text-left font-black text-sm text-slate-900 mt-1 hover:text-amber-700 transition-colors cursor-pointer"
                        >
                          {project.title}
                        </button>
                      </div>

                      {/* Mobile Three-Dot Trigger (Portal) */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenDropdown(e, id)}
                        className="project-action-trigger p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {project.description}
                      </p>
                    )}

                    {/* Progress Bar & Deliverables */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Milestone Progress</span>
                        <span>{project.progress}% ({project.tasksCompleted}/{stepsList.length} steps)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action: Navigate to Update Steps Page */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Deadline: {formatDateDisplay(project.deadline)}
                      </span>

                      <button
                        onClick={() => navigate(`/projects/${id}/steps`)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-600" />
                        <span>Update Steps ({stepsList.length})</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>

      {/* ========================================================= */}
      {/* FORM 1: PROJECT PROFILE & STEPS CREATION / EDIT MODAL      */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full p-5 sm:p-7 my-8 space-y-4 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
                  <FolderGit2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {editingProject ? 'Edit Project Profile & Steps' : 'Create New Project Workspace'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Form 1: Define project title, timeline, deliverables, and execution steps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form 1 */}
            <form onSubmit={handleForm1Submit} className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Microservices Architecture & Index Tuning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.title}</p>
                )}
              </div>

              {/* Category, Priority & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description & Core Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key project deliverables, architecture, and goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>

              {/* STEP BUILDER SECTION */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-amber-600" />
                      <span>Project Steps & Milestones ({formData.steps.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Define the sequential stages to execute this project</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStepToForm}
                    className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                {formErrors.steps && (
                  <p className="text-[11px] text-rose-500 mb-2 font-semibold">{formErrors.steps}</p>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {formData.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          Step {idx + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <select
                            value={step.status}
                            onChange={(e) => handleUpdateStepField(idx, 'status', e.target.value)}
                            className="px-2 py-0.5 text-[11px] font-bold rounded-md border border-slate-200 bg-white text-slate-700"
                          >
                            {STEP_LIFECYCLE_STAGES.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveStepFromForm(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Step Title *"
                          value={step.title}
                          onChange={(e) => handleUpdateStepField(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Step Description (optional)"
                          value={step.description}
                          onChange={(e) => handleUpdateStepField(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Start Date</label>
                          <input
                            type="date"
                            value={step.startDate}
                            onChange={(e) => handleUpdateStepField(idx, 'startDate', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-0.5">End Date</label>
                          <input
                            type="date"
                            value={step.endDate}
                            onChange={(e) => handleUpdateStepField(idx, 'endDate', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form 1 Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {editingProject ? 'Save Project Profile' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORM 2: PROJECT SUBMISSION & STEP PROGRESS UPDATE MODAL    */}
      {/* ========================================================= */}
      {isSubmissionModalOpen && submittingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full p-5 sm:p-7 my-8 space-y-4 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Submit Step Progress: {submittingProject.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Form 2: Update lifecycle status (Pending → Live) and write notes of what was done
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmissionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form 2 Body */}
            <form onSubmit={handleForm2Submit} className="space-y-4">

              {/* Summary Status Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Execution Progress
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {submissionSteps.filter((s) => ['completed', 'testing_completed', 'live'].includes(s.status)).length} of {submissionSteps.length} Steps Delivered
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddSubmissionStep}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Deliverable Step</span>
                </button>
              </div>

              {/* Steps List with Granular Status Selector & Execution Notes */}
              <div className="space-y-3.5">
                {submissionSteps.map((step, idx) => {
                  const currentStatusObj = getStepStatusObj(step.status);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Step {idx + 1}
                            </span>
                            <h4 className="text-sm font-black text-slate-900">
                              {step.title}
                            </h4>
                          </div>
                          {step.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {step.description}
                            </p>
                          )}
                        </div>

                        {/* Lifecycle Status Dropdown */}
                        <div className="shrink-0">
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5 sm:text-right">
                            Execution Stage
                          </label>
                          <select
                            value={step.status}
                            onChange={(e) => handleSubmissionStepChange(idx, 'status', e.target.value)}
                            className={`px-3 py-1.5 text-xs font-black rounded-xl border cursor-pointer ${currentStatusObj.color}`}
                          >
                            {STEP_LIFECYCLE_STAGES.map((stage) => (
                              <option key={stage.value} value={stage.value}>
                                {stage.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Start Date:</span>
                          <input
                            type="date"
                            value={step.startDate || ''}
                            onChange={(e) => handleSubmissionStepChange(idx, 'startDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">End Date:</span>
                          <input
                            type="date"
                            value={step.endDate || ''}
                            onChange={(e) => handleSubmissionStepChange(idx, 'endDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      {/* What did we do / Step Execution Notes */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>What did we do? / Step Notes <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400 font-normal">Progress record</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Write notes of what was accomplished in this step..."
                          value={step.notes || ''}
                          onChange={(e) => handleSubmissionStepChange(idx, 'notes', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form 2 Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSubmissionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Send}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Submit & Save Step Updates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL                                 */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Delete Project Workspace?</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This will delete the project, all its defined steps, and recorded milestones.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteProject(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* PORTAL DROPDOWN: Rendered at document.body level so it    */}
      {/* NEVER affects table dimensions, scrollbars, or z-index    */}
      {/* ========================================================= */}
      {activeDropdownId && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            zIndex: 99999
          }}
          className="project-portal-dropdown w-48 bg-white rounded-2xl border border-slate-200/90 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const targetId = activeDropdownId;
              setActiveDropdownId(null);
              navigate(`/projects/${targetId}`);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const targetId = activeDropdownId;
              setActiveDropdownId(null);
              navigate(`/projects/${targetId}/edit`);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Project</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const targetId = activeDropdownId;
              setActiveDropdownId(null);
              navigate(`/projects/${targetId}/steps`);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>Update Steps</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              const targetId = activeDropdownId;
              setActiveDropdownId(null);
              setDeleteConfirmId(targetId);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete Project</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
