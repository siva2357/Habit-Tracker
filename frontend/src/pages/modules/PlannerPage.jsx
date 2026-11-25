import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Flame,
  ArrowLeft,
  Layers,
  ChevronRight,
  ChevronLeft,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  History
} from 'lucide-react';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { Input, Select, Textarea, DateInput } from '../../components/Input';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'Work',
  'Deep Work',
  'Fitness',
  'Health',
  'Personal',
  'Study',
  'Urgent',
  'Other'
];

const TIME_PRESETS = [
  '06:00 AM - 07:00 AM',
  '07:00 AM - 08:30 AM',
  '08:30 AM - 10:30 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:30 PM - 04:00 PM',
  '04:30 PM - 06:00 PM',
  '06:00 PM - 07:15 PM',
  '08:00 PM - 09:30 PM',
  '09:30 PM - 10:30 PM'
];

// Helper to format date strings: YYYY-MM-DD -> Formatted
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function PlannerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fromPath = location.state?.from || '/';
  const fromName = location.state?.fromName || (fromPath === '/dashboard' ? 'Dashboard' : 'Control Panel');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewScope, setViewScope] = useState('date'); // 'date' | 'all'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    timeSlot: '09:00 AM - 10:00 AM',
    category: 'Work',
    date: todayStr,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch tasks from backend API with fallback
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/planner');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setTasks(json.data);
          }
        }
      } catch (err) {
        console.log('Using local tasks fallback:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Generate 10-day calendar strip centered on selected date
  const calendarDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(selectedDate);

    // Show 6 days before and 3 days after
    for (let offset = -6; offset <= 3; offset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + offset);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      // Check tasks on this date for indicator dots
      const dateTasks = tasks.filter((t) => t.date === iso);
      const hasCompleted = dateTasks.some((t) => t.status === 'completed');
      const hasMissed = dateTasks.some((t) => t.status === 'not_completed');
      const hasPending = dateTasks.some((t) => t.status === 'pending' || t.status === 'in_progress');

      days.push({
        iso,
        dayName,
        dayNum,
        isToday: iso === todayStr,
        isSelected: iso === selectedDate,
        taskCount: dateTasks.length,
        hasCompleted,
        hasMissed,
        hasPending
      });
    }
    return days;
  }, [selectedDate, todayStr, tasks]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Date filter (when viewScope is 'date')
      if (viewScope === 'date' && t.date !== selectedDate) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && t.status !== filterStatus) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && t.priority !== filterPriority) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && t.category !== filterCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesCat = t.category?.toLowerCase().includes(q);
        const matchesTime = t.timeSlot?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTime) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedDate, viewScope, filterStatus, filterPriority, filterCategory, searchQuery]);

  // 4 Status Summary Counts for the active view / date
  const summary = useMemo(() => {
    const scopeTasks = viewScope === 'date'
      ? tasks.filter((t) => t.date === selectedDate)
      : tasks;

    const total = scopeTasks.length;
    const pending = scopeTasks.filter((t) => t.status === 'pending').length;
    const inProgress = scopeTasks.filter((t) => t.status === 'in_progress').length;
    const completed = scopeTasks.filter((t) => t.status === 'completed').length;
    const notCompleted = scopeTasks.filter((t) => t.status === 'not_completed').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      notCompleted,
      completionRate
    };
  }, [tasks, selectedDate, viewScope]);

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      timeSlot: '09:00 AM - 10:00 AM',
      category: 'Work',
      date: selectedDate,
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      timeSlot: task.timeSlot || '09:00 AM - 10:00 AM',
      category: task.category || 'Work',
      date: task.date || selectedDate,
      notes: task.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormErrors({});
  };

  // Quick cycle task status
  const handleToggleStatus = async (task) => {
    const statusCycle = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'not_completed',
      not_completed: 'pending'
    };

    const nextStatus = statusCycle[task.status] || 'completed';
    const id = task._id || task.id;

    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/planner/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Local fallback
    }

    const readableStatus = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      not_completed: 'Not Completed'
    }[nextStatus];

    addToast(`Task marked as ${readableStatus}`, 'info');
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      timeSlot: formData.timeSlot,
      category: formData.category,
      date: formData.date,
      notes: formData.notes.trim()
    };

    if (editingTask) {
      // EDIT MODE
      const targetId = editingTask._id || editingTask.id;
      try {
        const res = await fetch(`/api/planner/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setTasks((prev) =>
            prev.map((t) => ((t._id || t.id) === targetId ? json.data : t))
          );
        } else {
          setTasks((prev) =>
            prev.map((t) => ((t._id || t.id) === targetId ? { ...t, ...payload } : t))
          );
        }
      } catch {
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === targetId ? { ...t, ...payload } : t))
        );
      }
      addToast(`Updated task: ${payload.title}`, 'success');
    } else {
      // ADD MODE
      try {
        const res = await fetch('/api/planner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setTasks((prev) => [json.data, ...prev]);
        } else {
          const newTask = {
            ...payload,
            _id: `task-local-${Date.now()}`
          };
          setTasks((prev) => [newTask, ...prev]);
        }
      } catch {
        const newTask = {
          ...payload,
          _id: `task-local-${Date.now()}`
        };
        setTasks((prev) => [newTask, ...prev]);
      }
      addToast(`Added task: ${payload.title}`, 'success');
    }

    handleCloseModal();
  };

  // Delete task
  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await fetch(`/api/planner/${id}`, { method: 'DELETE' });
    } catch {
      // Local fallback
    }

    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    addToast(`Deleted "${title}"`, 'info');
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          color: '#10b981'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: PlayCircle,
          color: '#3b82f6'
        };
      case 'not_completed':
        return {
          label: 'Not Completed',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          color: '#f43f5e'
        };
      case 'pending':
      default:
        return {
          label: 'Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
          color: '#f59e0b'
        };
    }
  };

  // Helper for Priority styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-800">
      {/* Edge-to-Edge Fixed Liquid Header */}
      <LiquidHeader
        title="Day Planner"
        subtitle="Daily Schedule, Time-Blocking & Priority Execution"
      />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-5 sm:space-y-6">

        {/* Module Sub-Bar */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                Planner Hub
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Interactive Daily Execution
              </span>
            </div>
          </div>

          {/* Quick Scope Toggle: Selected Date vs All Dates */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start xs:self-auto">
            <button
              onClick={() => setViewScope('date')}
              className={`px-3 py-1 rounded-lg transition-all ${viewScope === 'date'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Selected Date
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 rounded-lg transition-all ${viewScope === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              All History
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CALENDAR STRIP & DATE CONTROLS               */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-5 border border-slate-200/90 shadow-xl bg-white overflow-hidden space-y-3.5">

          {/* Calendar Header: Date Nav Buttons + Native Date Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{formatDateDisplay(selectedDate)}</span>
                  {selectedDate === todayStr && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Today
                    </span>
                  )}
                  {selectedDate < todayStr && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <History className="w-2.5 h-2.5" />
                      <span>Past Log</span>
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Select any previous or upcoming date to review completed and missed tasks
                </p>
              </div>
            </div>

            {/* Date Stepper Controls & Month Selector */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">

              {/* Month Selector Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Month:
                </span>
                <select
                  value={selectedDate.slice(0, 7)}
                  onChange={(e) => {
                    const newMonth = e.target.value;
                    if (newMonth === todayStr.slice(0, 7)) {
                      setSelectedDate(todayStr);
                    } else {
                      setSelectedDate(`${newMonth}-01`);
                    }
                  }}
                  className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 shadow-2xs cursor-pointer"
                >
                  <option value="2026-11">November 2026</option>
                  <option value="2026-10">October 2026</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-08">August 2026</option>
                  <option value="2026-07">July 2026</option>
                  <option value="2026-06">June 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                  <option value="2026-03">March 2026</option>
                  <option value="2026-02">February 2026</option>
                  <option value="2026-01">January 2026</option>
                </select>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <button
                onClick={handlePrevDay}
                title="Go to Previous Day"
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Prev</span>
              </button>

              <button
                onClick={handleToday}
                title="Jump to Today"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${selectedDate === todayStr
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                Today
              </button>

              <button
                onClick={handleNextDay}
                title="Go to Next Day"
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Jump to Any Date Picker */}
              <div className="relative flex items-center ml-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-9 h-8 opacity-0 absolute inset-0 cursor-pointer z-10"
                  title="Pick Any Date from Calendar"
                />
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors pointer-events-none">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Horizontal 10-Day Calendar Strip */}
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex items-center gap-2 min-w-max">
              {calendarDays.map((day) => {
                const isSelected = day.isSelected;
                return (
                  <button
                    key={day.iso}
                    onClick={() => {
                      setSelectedDate(day.iso);
                      setViewScope('date');
                    }}
                    className={`flex flex-col items-center justify-between py-2 px-3 rounded-2xl border transition-all cursor-pointer min-w-[62px] ${isSelected
                      ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md scale-102 ring-2 ring-indigo-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}>
                      {day.dayName}
                    </span>

                    <span className={`text-base font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-900'
                      }`}>
                      {day.dayNum}
                    </span>

                    {/* Status Dots */}
                    <div className="flex items-center gap-1 h-2">
                      {day.hasCompleted && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`}
                          title="Completed tasks"
                        />
                      )}
                      {day.hasMissed && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`}
                          title="Missed tasks"
                        />
                      )}
                      {day.hasPending && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-400'}`}
                          title="Pending tasks"
                        />
                      )}
                      {!day.hasCompleted && !day.hasMissed && !day.hasPending && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 opacity-60" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ========================================================= */}
        {/* HERO SECTION: 4 Status StatCards for Selected Date        */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">

          {/* Top Hero Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {viewScope === 'all' ? 'All Daily Logs' : `Execution on ${formatDateDisplay(selectedDate)}`}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Tracking task completion, pending goals, and missed items for this day
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
              value={<>{summary.pending} <span className="text-xs font-semibold text-amber-600">tasks</span></>}
              badge="Awaiting"
              icon={Clock}
              variant="amber"
              footerLeft="Queued For Day"
              footerRight={`${summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="In Progress"
              value={<>{summary.inProgress} <span className="text-xs font-semibold text-blue-600">tasks</span></>}
              badge="Active"
              icon={PlayCircle}
              variant="blue"
              footerLeft="In Flight"
              footerRight={`${summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0}%`}
            />

            <StatCard
              title="Completed"
              value={<>{summary.completed} <span className="text-xs font-semibold text-emerald-600">tasks</span></>}
              badge="Done"
              icon={CheckCircle2}
              variant="emerald"
              footerLeft="Accomplished"
              footerRight={`${summary.completionRate}%`}
            />

            <StatCard
              title="Not Completed"
              value={<>{summary.notCompleted} <span className="text-xs font-semibold text-rose-600">tasks</span></>}
              badge="Missed"
              icon={XCircle}
              variant="rose"
              footerLeft="Missed / Deferred"
              footerRight={`${summary.total > 0 ? Math.round((summary.notCompleted / summary.total) * 100) : 0}%`}
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* PLANNER TABLE SECTION: Controls, Table & In-row Actions   */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">

          {/* Header & Controls Toolbar */}
          <div className="flex flex-col gap-3.5 pb-3 sm:pb-4 border-b border-slate-100">
            {/* Top Row: Title, Scope, Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                  <span>
                    {viewScope === 'date'
                      ? `Tasks for ${formatDateDisplay(selectedDate)}`
                      : 'All Recorded Daily Tasks'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {filteredTasks.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Review what was accomplished and what was missed with status cycling and in-row editing
                </p>
              </div>
            </div>

            {/* Filter Toolbar Controls: Full width with Add Task strictly at the far right end at last */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                {/* Search Box */}
                <div className="w-full sm:w-44 md:w-48 relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                {/* Status Filter Toggle */}
                <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'pending'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-amber-700'
                      }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus('in_progress')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'in_progress'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-blue-700'
                      }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'completed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-emerald-700'
                      }`}
                  >
                    Done
                  </button>
                  <button
                    onClick={() => setFilterStatus('not_completed')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'not_completed'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-rose-700'
                      }`}
                  >
                    Missed
                  </button>
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all shadow-2xs shrink-0 max-w-[130px] sm:max-w-none truncate"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Task Button: Strictly at the Far Right End at Last */}
              <div className="shrink-0 ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenAddModal}
                  className="text-xs py-1.5 px-3.5 shadow-sm font-bold shrink-0 whitespace-nowrap"
                >
                  Add Task
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
                  <th className="py-3.5 px-4 whitespace-nowrap">Date / Time Slot</th>
                  <th className="py-3.5 px-4">Task & Notes</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Current State</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No tasks found for {viewScope === 'date' ? formatDateDisplay(selectedDate) : 'the active filters'}.
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Plus}
                          onClick={handleOpenAddModal}
                          className="text-xs"
                        >
                          Add a task for this date
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const id = task._id || task.id;
                    const statusMeta = getStatusBadge(task.status);
                    const StatusIcon = statusMeta.icon;

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Status Checkbox / Quick Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            title="Click to cycle status: Pending -> Active -> Done -> Missed"
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <StatusIcon className="w-5 h-5" style={{ color: statusMeta.color }} />
                          </button>
                        </td>

                        {/* Date & Time Slot */}
                        <td className="py-3.5 px-4 text-slate-600 font-bold whitespace-nowrap text-xs">
                          <div className="inline-flex flex-col gap-0.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{task.timeSlot || 'Anytime'}</span>
                            </div>
                            {viewScope === 'all' && (
                              <span className="text-[10px] text-slate-400 font-medium ml-1">
                                {task.date}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Task Title & Notes */}
                        <td className="py-3.5 px-4">
                          <div className={`font-bold transition-colors ${task.status === 'completed'
                            ? 'line-through text-slate-400'
                            : task.status === 'not_completed'
                              ? 'text-rose-900'
                              : 'text-slate-900 group-hover:text-indigo-600'
                            }`}>
                            {task.title}
                          </div>
                          {(task.description || task.notes) && (
                            <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                              {task.description || task.notes}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{task.category || 'General'}</span>
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase border ${getPriorityBadge(task.priority)}`}>
                            {task.priority === 'high' && <Flame className="w-3 h-3 text-rose-500" />}
                            <span>{task.priority}</span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-transform hover:scale-105 cursor-pointer ${statusMeta.bg}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusMeta.label}</span>
                          </button>
                        </td>

                        {/* In-Row Actions (Edit & Delete) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              title="Edit Task"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(id, task.title)}
                              title="Delete Task"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Mobile Touch Card View (< md screens) */}
          <div className="md:hidden space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium text-xs">
                No daily tasks found for {formatDateDisplay(selectedDate)}.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const id = task._id || task.id;
                const statusMeta = getStatusBadge(task.status);
                const StatusIcon = statusMeta.icon;

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className="mt-0.5 shrink-0"
                        >
                          <StatusIcon className="w-5 h-5" style={{ color: statusMeta.color }} />
                        </button>

                        <div className="min-w-0">
                          <div className={`text-xs font-black truncate ${task.status === 'completed'
                            ? 'line-through text-slate-400'
                            : task.status === 'not_completed'
                              ? 'text-rose-900'
                              : 'text-slate-900'
                            }`}>
                            {task.title}
                          </div>
                          {(task.description || task.notes) && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {task.description || task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Priority Tag */}
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Footer Row: Time, Category, Status badge & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.timeSlot}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.bg}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(id, task.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 bg-slate-50 border border-slate-200"
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
      {/* MODAL FORM: Add & Edit Daily Task                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {editingTask ? (
                      <>
                        <Pencil className="w-5 h-5 text-sky-600" />
                        <span>Edit Daily Task</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-sky-600" />
                        <span>Add Daily Task</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {editingTask
                      ? 'Update timetable slot, priority status, or notes'
                      : 'Schedule a time-blocked task for your daily execution plan'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">

                {/* 1. Title */}
                <div>
                  <Input
                    label="Task Title"
                    placeholder="e.g. Deep Work: Refactor Auth Controller"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={formErrors.title}
                    required
                  />
                </div>

                {/* 2. Time Slot & Category (2 columns side by side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                      Time Slot
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs cursor-pointer"
                    >
                      {TIME_PRESETS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Select
                      label="Category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                      required
                    />
                  </div>
                </div>

                {/* 3. Scheduled Date */}
                <div>
                  <DateInput
                    label="Scheduled Date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                {/* 4. Description / Notes */}
                <div>
                  <Textarea
                    label="Description & Notes (Optional)"
                    placeholder="Key objectives, checklists, sub-tasks or reminders..."
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* 5. Last Row: Execution Status & Priority Level side by side as dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                      Execution Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs cursor-pointer"
                    >
                      <option value="pending">Pending (Awaiting Action)</option>
                      <option value="in_progress">In Progress (Active Focus)</option>
                      <option value="completed">Completed (Done)</option>
                      <option value="not_completed">Not Completed (Missed / Deferred)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                      Priority Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs cursor-pointer"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                  >
                    {editingTask ? 'Save Changes' : 'Schedule Task'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
