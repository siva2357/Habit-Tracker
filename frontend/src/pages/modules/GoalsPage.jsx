import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  AlertTriangle,
  Layers,
  Edit2,
  Trash2,
  X,
  Target,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function GoalsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fromPath = location.state?.from || '/';
  const fromName = location.state?.fromName || (fromPath === '/dashboard' ? 'Dashboard' : 'Control Panel');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Goals Data State
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State: Title, Description (textarea), Start Date, End Date, Status, Priority
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '2026-11-01',
    endDate: '2027-05-01',
    status: 'pending',
    priority: 'medium'
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch Goals from Backend
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setGoals(json.data);
        }
      }
    } catch {
      // Local fallback active
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Format date helper: "Nov 01, 2026"
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

  // Status Badge Metadata
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: PlayCircle,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'not_completed':
        return {
          label: 'Not Completed',
          icon: AlertTriangle,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  // Priority Badge Metadata
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return {
          label: 'HIGH',
          color: 'text-rose-700 bg-rose-50 border-rose-200 font-extrabold'
        };
      case 'medium':
        return {
          label: 'MEDIUM',
          color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold'
        };
      case 'low':
        return {
          label: 'LOW',
          color: 'text-slate-600 bg-slate-50 border-slate-200 font-medium'
        };
      default:
        return {
          label: priority,
          color: 'text-slate-600 bg-slate-50 border-slate-200'
        };
    }
  };

  // Summary Metrics for StatCards
  const summary = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'completed').length;
    const inProgress = goals.filter((g) => g.status === 'in_progress').length;
    const pending = goals.filter((g) => g.status === 'pending').length;
    const notCompleted = goals.filter((g) => g.status === 'not_completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      notCompleted,
      completionRate
    };
  }, [goals]);

  // Filtered Goals list
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      // Status filter
      if (filterStatus !== 'all' && goal.status !== filterStatus) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && goal.priority !== filterPriority) {
        return false;
      }

      // Search query (title or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (goal.title || '').toLowerCase().includes(q);
        const matchDesc = (goal.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [goals, filterStatus, filterPriority, searchQuery]);

  // Quick Status Cycle Handler (Pending -> In Progress -> Completed -> Not Completed)
  const handleToggleStatus = async (goal) => {
    const id = goal._id || goal.id;
    const order = ['pending', 'in_progress', 'completed', 'not_completed'];
    const currentIndex = order.indexOf(goal.status);
    const nextStatus = order[(currentIndex + 1) % order.length];

    setGoals((prev) =>
      prev.map((g) => ((g._id || g.id) === id ? { ...g, status: nextStatus } : g))
    );

    try {
      const res = await fetch(`/api/goals/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const readableStatus = {
          pending: 'Pending',
          in_progress: 'In Progress',
          completed: 'Completed',
          not_completed: 'Not Completed'
        }[nextStatus];
        addToast(`Goal marked as ${readableStatus}`, 'info');
      } else {
        addToast('Failed to update goal status in database', 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to update goal status (${err.message})`, 'error');
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingGoal(null);
    const todayStr = new Date().toISOString().split('T')[0];
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const endStr = sixMonthsLater.toISOString().split('T')[0];

    setFormData({
      title: '',
      description: '',
      startDate: todayStr,
      endDate: endStr,
      status: 'pending',
      priority: 'medium'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      startDate: goal.startDate || new Date().toISOString().split('T')[0],
      endDate: goal.endDate || new Date().toISOString().split('T')[0],
      status: goal.status || 'pending',
      priority: goal.priority || 'medium'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Goal title is required';
    }
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'End date cannot be earlier than start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      priority: formData.priority
    };

    if (editingGoal) {
      // EDIT MODE
      const targetId = editingGoal._id || editingGoal.id;
      try {
        const res = await fetch(`/api/goals/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setGoals((prev) =>
            prev.map((g) => ((g._id || g.id) === targetId ? json.data : g))
          );
          addToast(`Updated goal: ${payload.title}`, 'success');
          setIsModalOpen(false);
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status}`;
          addToast(`Failed to update goal: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database error: Unable to update goal (${err.message})`, 'error');
      }
    } else {
      // ADD MODE
      try {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setGoals((prev) => [json.data, ...prev]);
          addToast(`Created goal: ${payload.title}`, 'success');
          setIsModalOpen(false);
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status}`;
          addToast(`Failed to save goal to database: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database error: Unable to save goal (${err.message})`, 'error');
      }
    }
  };

  // Delete Goal Handler
  const handleDeleteGoal = async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
        addToast('Goal removed from tracker', 'info');
      } else {
        addToast('Failed to delete goal from database', 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to delete goal (${err.message})`, 'error');
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Edge-to-Edge LiquidHeader */}
      <LiquidHeader
        title="Goal Planner"
        subtitle="Strategic Vision & Long-Term Objectives"
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24 space-y-5 sm:space-y-6">

        {/* Top Module Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-100 text-pink-700 text-xs font-black tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>GOAL PLANNER</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • Tracking Long-Term Strategic Horizons
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO SECTION: 4 Status StatCards for Goals                */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">

          {/* Top Hero Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-50 border border-pink-100 text-pink-700 shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Long-Term Strategic Goals
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Consolidated view of goals, execution timelines, and status distribution
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Rate Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Completion Rate:
              </span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {summary.completionRate}% Done ({summary.completed} of {summary.total})
              </span>
            </div>
          </div>

          {/* 4 Status StatCards using Reusable StatCard */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
            <StatCard
              title="Pending"
              value={<>{summary.pending} <span className="text-xs font-semibold text-amber-600">goals</span></>}
              badge="Awaiting"
              icon={Clock}
              variant="amber"
              footerLeft="Queued Goals"
              footerRight={`${summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="In Progress"
              value={<>{summary.inProgress} <span className="text-xs font-semibold text-blue-600">goals</span></>}
              badge="Active"
              icon={PlayCircle}
              variant="blue"
              footerLeft="In Execution"
              footerRight={`${summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="Completed"
              value={<>{summary.completed} <span className="text-xs font-semibold text-emerald-600">goals</span></>}
              badge="Achieved"
              icon={CheckCircle2}
              variant="emerald"
              footerLeft="Successfully Done"
              footerRight={`${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="Not Completed"
              value={<>{summary.notCompleted} <span className="text-xs font-semibold text-rose-600">goals</span></>}
              badge="Missed / At Risk"
              icon={AlertTriangle}
              variant="rose"
              footerLeft="Needs Focus"
              footerRight={`${summary.total > 0 ? Math.round((summary.notCompleted / summary.total) * 100) : 0}%`}
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* GOALS TABLE SECTION: Table, Search, Filters & Row Actions */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">

          {/* Table Header & Controls Toolbar */}
          <div className="flex flex-col gap-3.5 pb-3 sm:pb-4 border-b border-slate-100">
            
            {/* Top Row: Title & Total Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                  <span>Strategic Goals Overview</span>
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {filteredGoals.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Manage goals from start date to end date with status cycling and in-row editing
                </p>
              </div>
            </div>

            {/* Filter Toolbar Controls: Full width with Add Goal strictly at the far right end at last */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                
                {/* Search Box */}
                <div className="w-full sm:w-48 md:w-56 relative">
                  <input
                    type="text"
                    placeholder="Search goals or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                {/* Status Filter Toggle Pills */}
                <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === 'pending'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-amber-700'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus('in_progress')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === 'in_progress'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-blue-700'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === 'completed'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setFilterStatus('not_completed')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === 'not_completed'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-rose-700'
                    }`}
                  >
                    Not Completed
                  </button>
                </div>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Add Goal Button: Strictly at the Far Right End at Last */}
              <div className="shrink-0 ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenAddModal}
                  className="text-xs py-1.5 px-3.5 shadow-sm font-bold shrink-0 whitespace-nowrap"
                >
                  Add Goal
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Table View (>= md screens) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Goal & Description</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Start Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">End Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Execution Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredGoals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No goals found matching your active filters.
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Plus}
                          onClick={handleOpenAddModal}
                          className="text-xs"
                        >
                          Add a goal
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGoals.map((goal) => {
                    const id = goal._id || goal.id;
                    const statusMeta = getStatusBadge(goal.status);
                    const StatusIcon = statusMeta.icon;
                    const priorityMeta = getPriorityBadge(goal.priority);

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Status Checkbox / Quick Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(goal)}
                            title={`Status: ${statusMeta.label}. Click to cycle.`}
                            className="p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            <StatusIcon className={`w-5 h-5 ${
                              goal.status === 'completed'
                                ? 'text-emerald-600'
                                : goal.status === 'in_progress'
                                ? 'text-blue-600'
                                : goal.status === 'not_completed'
                                ? 'text-rose-600'
                                : 'text-amber-500'
                            }`} />
                          </button>
                        </td>

                        {/* Goal Title & Text Area Description */}
                        <td className="py-3.5 px-4 max-w-lg">
                          <div className={`font-bold text-slate-900 group-hover:text-indigo-600 transition-colors ${
                            goal.status === 'completed' ? 'line-through text-slate-400' : ''
                          }`}>
                            {goal.title}
                          </div>
                          {goal.description && (
                            <div className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                              {goal.description}
                            </div>
                          )}
                        </td>

                        {/* Start Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDateDisplay(goal.startDate)}</span>
                          </div>
                        </td>

                        {/* End Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100">
                            <Target className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{formatDateDisplay(goal.endDate)}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </td>

                        {/* Execution Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusMeta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(goal)}
                              title="Edit Goal"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(id)}
                              title="Delete Goal"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< md screens) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredGoals.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                No goals found matching your filters.
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Plus}
                    onClick={handleOpenAddModal}
                  >
                    Add a goal
                  </Button>
                </div>
              </div>
            ) : (
              filteredGoals.map((goal) => {
                const id = goal._id || goal.id;
                const statusMeta = getStatusBadge(goal.status);
                const priorityMeta = getPriorityBadge(goal.priority);

                return (
                  <div
                    key={id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-md space-y-3"
                  >
                    {/* Header Row: Start & End Date + Priority */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateDisplay(goal.startDate)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-indigo-700">{formatDateDisplay(goal.endDate)}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityMeta.color}`}>
                        {priorityMeta.label}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className={`text-sm font-bold text-slate-900 ${
                        goal.status === 'completed' ? 'line-through text-slate-400' : ''
                      }`}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Status Pill & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleToggleStatus(goal)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${statusMeta.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(goal)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>

      {/* ========================================================= */}
      {/* ADD / EDIT GOAL MODAL                                     */}
      {/* Fields: Title, Start Date & End Date, Description (textarea)*/}
      {/* Last Row: Execution Status & Priority side by side        */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-5 sm:p-6 my-8 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-50 border border-pink-100 text-pink-700">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {editingGoal ? 'Edit Strategic Goal' : 'Add Strategic Goal'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Specify title, timeline, description, execution status, and priority
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              {/* Goal Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Launch Full-Stack Habit & Productivity OS"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border ${
                    formErrors.title ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500'
                  } outline-none focus:ring-1 focus:ring-indigo-100 transition-all`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.title}</p>
                )}
              </div>

              {/* Start Date & End Date side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 cursor-pointer"
                  />
                  {formErrors.startDate && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    End Date (Target) *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 cursor-pointer"
                  />
                  {formErrors.endDate && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Description TextArea */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Action Plan
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed strategy, milestones, or execution context for this long-term goal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 leading-relaxed"
                />
              </div>

              {/* ========================================================= */}
              {/* LAST ROW AFTER DESCRIPTION: EXECUTION STATUS & PRIORITY   */}
              {/* DROPDOWNS SIDE BY SIDE                                    */}
              {/* ========================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Execution Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 cursor-pointer shadow-2xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="not_completed">Not Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 cursor-pointer shadow-2xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Delete Goal?</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Are you sure you want to permanently delete this goal?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={() => handleDeleteGoal(deleteConfirmId)}
                className="text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
