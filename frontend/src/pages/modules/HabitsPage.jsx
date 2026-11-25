import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  Flame,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
  X,
  Compass,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Sparkles,
  LayoutGrid,
  ListTodo
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = ['Health', 'Work', 'Fitness', 'Learning', 'Mindfulness', 'Routine'];
const FREQUENCIES = ['daily', 'weekdays', 'weekly'];

export default function HabitsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'matrix'

  // Date and Month Filtering State
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed (0=Jan, 10=Nov)
  const [selectedDate, setSelectedDate] = useState(todayStr); // 'YYYY-MM-DD'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Health',
    frequency: 'daily'
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch Habits from MongoDB
  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setHabits(json.data);
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Calendar Calculation for Selected Month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const days = [];

    // Blank cells before month starts
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ blank: true, key: `blank-${i}` });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dayStr === todayStr;
      const isSelected = dayStr === selectedDate;

      // Count habits completed on this specific day
      const completedCount = habits.filter((h) => {
        if (h.completedDates && Array.isArray(h.completedDates)) {
          return h.completedDates.includes(dayStr);
        }
        return isToday && h.completedToday;
      }).length;

      const totalCount = habits.length;
      const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      days.push({
        blank: false,
        key: dayStr,
        dayNumber: d,
        dateStr: dayStr,
        isToday,
        isSelected,
        completedCount,
        totalCount,
        rate
      });
    }

    return days;
  }, [selectedYear, selectedMonth, selectedDate, todayStr, habits]);

  // Monthly Aggregate Metrics
  const monthSummary = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    let totalPossible = 0;
    let totalCompleted = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = dayStr > todayStr;
      if (!isFuture) {
        totalPossible += habits.length;
        habits.forEach((h) => {
          if (h.completedDates && h.completedDates.includes(dayStr)) {
            totalCompleted += 1;
          } else if (dayStr === todayStr && h.completedToday) {
            totalCompleted += 1;
          }
        });
      }
    }

    const monthRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Selected Day Metrics
    const selectedDayDone = habits.filter((h) => {
      if (h.completedDates && Array.isArray(h.completedDates)) {
        return h.completedDates.includes(selectedDate);
      }
      return selectedDate === todayStr && h.completedToday;
    }).length;

    const selectedDayRate = habits.length > 0 ? Math.round((selectedDayDone / habits.length) * 100) : 0;

    return {
      monthRate,
      totalCompleted,
      totalPossible,
      totalHabits: habits.length,
      selectedDayDone,
      selectedDayRate
    };
  }, [habits, selectedYear, selectedMonth, selectedDate, todayStr]);

  // Formatted display of selected date: e.g. "Tuesday, November 24, 2026"
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return selectedDate;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Filtered Habits based on search
  const displayedHabits = useMemo(() => {
    return habits.filter((h) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return h.title.toLowerCase().includes(q) || (h.category || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [habits, searchQuery]);

  // Toggle Habit Status for the Whole Day (selectedDate)
  const handleToggleHabitForDay = async (habit) => {
    const habitId = habit._id || habit.id;
    const isCurrentlyDone = habit.completedDates
      ? habit.completedDates.includes(selectedDate)
      : selectedDate === todayStr && habit.completedToday;

    const nextDone = !isCurrentlyDone;

    // Optimistic Update
    setHabits((prev) =>
      prev.map((h) => {
        if ((h._id || h.id) !== habitId) return h;

        let newDates = Array.isArray(h.completedDates) ? [...h.completedDates] : [];
        if (nextDone) {
          if (!newDates.includes(selectedDate)) newDates.push(selectedDate);
        } else {
          newDates = newDates.filter((d) => d !== selectedDate);
        }

        const updates = {
          ...h,
          completedDates: newDates
        };

        if (selectedDate === todayStr) {
          updates.completedToday = nextDone;
        }

        return updates;
      })
    );

    try {
      await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });
    } catch {
      // Offline fallback
    }

    addToast(
      nextDone
        ? `"${habit.title}" completed for whole day! ✓`
        : `"${habit.title}" marked pending`,
      nextDone ? 'success' : 'info'
    );
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setFormData({
      title: '',
      category: 'Health',
      frequency: 'daily'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title || '',
      category: habit.category || 'Health',
      frequency: habit.frequency || 'daily'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Habit title is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit (Create / Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      frequency: formData.frequency
    };

    if (editingHabit) {
      const targetId = editingHabit._id || editingHabit.id;
      try {
        const res = await fetch(`/api/habits/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setHabits((prev) => prev.map((h) => ((h._id || h.id) === targetId ? json.data : h)));
        } else {
          setHabits((prev) => prev.map((h) => ((h._id || h.id) === targetId ? { ...h, ...payload } : h)));
        }
      } catch {
        setHabits((prev) => prev.map((h) => ((h._id || h.id) === targetId ? { ...h, ...payload } : h)));
      }
      addToast(`Updated habit: ${payload.title}`, 'success');
    } else {
      try {
        const res = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setHabits((prev) => [json.data, ...prev]);
        } else {
          const temp = {
            _id: `habit-${Date.now()}`,
            ...payload,
            completedToday: false,
            completedDates: []
          };
          setHabits((prev) => [temp, ...prev]);
        }
      } catch {
        const temp = {
          _id: `habit-${Date.now()}`,
          ...payload,
          completedToday: false,
          completedDates: [],
          bestStreak: payload.streak
        };
        setHabits((prev) => [temp, ...prev]);
      }
      addToast(`Created habit: ${payload.title}`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete Habit
  const handleDeleteHabit = async (id) => {
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }
    setHabits((prev) => prev.filter((h) => (h._id || h.id) !== id));
    setDeleteConfirmId(null);
    addToast('Habit removed', 'info');
  };

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Edge-to-Edge LiquidHeader */}
      <LiquidHeader
        title="Habit Tracker"
        subtitle="Monthly Calendar Scheduling, Day Logs & Habit Consistency"
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24 space-y-5 sm:space-y-6">

        {/* Top Module Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 text-xs font-black tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>HABIT TRACKER</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • Monthly Calendar Tracking & Daily Status
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar & Day List</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Monthly Matrix</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO SECTION: Month Selector & StatCards                  */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">

          {/* Top Month Filter & Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 shrink-0">
                <CalendarIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Select a month to inspect consistency or click any calendar day below
                </p>
              </div>
            </div>

            {/* Month and Year Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors border-r border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Month Dropdown */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2 py-1.5 text-xs font-bold text-slate-800 bg-transparent border-l border-slate-200 focus:outline-none cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors border-l border-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleJumpToToday}
                className="text-xs font-bold"
              >
                Today
              </Button>
            </div>
          </div>

          {/* 4 StatCards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
            <StatCard
              title="Selected Day Done"
              value={<>{monthSummary.selectedDayDone} <span className="text-xs font-semibold text-emerald-600">/ {monthSummary.totalHabits} habits</span></>}
              badge="Daily Status"
              icon={CheckCircle2}
              variant="emerald"
              footerLeft={formattedSelectedDate.split(',')[0]}
              footerRight={`${monthSummary.selectedDayRate}% Whole Day`}
            />

            <StatCard
              title="Monthly Adherence"
              value={<>{monthSummary.monthRate}% <span className="text-xs font-semibold text-violet-600">rate</span></>}
              badge="Month Overall"
              icon={CalendarIcon}
              variant="indigo"
              footerLeft={`${MONTH_NAMES[selectedMonth]} Progress`}
              footerRight="Cumulative Logs"
            />

            <StatCard
              title="Month Completed"
              value={<>{monthSummary.totalCompleted} <span className="text-xs font-semibold text-emerald-600">done</span></>}
              badge="Whole Month"
              icon={CheckCircle2}
              variant="emerald"
              footerLeft={`${MONTH_NAMES[selectedMonth]} Executions`}
              footerRight="Habits Logged"
            />

            <StatCard
              title="Monitored Habits"
              value={<>{monthSummary.totalHabits} <span className="text-xs font-semibold text-slate-600">active</span></>}
              badge="Routine Catalog"
              icon={Layers}
              variant="slate"
              footerLeft="Active Tracking"
              footerRight="Whole Day Scope"
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* CALENDAR & DAY LIST VIEW (DEFAULT)                         */}
        {/* ========================================================= */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

            {/* LEFT / TOP: CALENDAR DISPLAY (5 cols on large screens) */}
            <Card variant="glass" className="lg:col-span-5 p-4 sm:p-5 border border-slate-200/90 shadow-xl bg-white space-y-3.5">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-violet-600" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {MONTH_NAMES[selectedMonth]} {selectedYear} Calendar
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Click day to inspect
                </span>
              </div>

              {/* Calendar Grid */}
              <div className="w-full">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {WEEKDAY_NAMES.map((w) => (
                    <div key={w} className="text-[11px] font-black uppercase text-slate-600 py-1">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Month Days */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((cell) => {
                    if (cell.blank) {
                      return <div key={cell.key} className="h-14 sm:h-16 rounded-xl bg-slate-50/40" />;
                    }

                    const isAllDone = cell.totalCount > 0 && cell.completedCount === cell.totalCount;
                    const isPartialDone = cell.completedCount > 0 && cell.completedCount < cell.totalCount;

                    return (
                      <button
                        key={cell.key}
                        onClick={() => setSelectedDate(cell.dateStr)}
                        className={`h-14 sm:h-16 rounded-xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative text-left border ${
                          cell.isSelected
                            ? 'bg-violet-600 text-white border-violet-700 shadow-md scale-102 z-10'
                            : cell.isToday
                            ? 'bg-violet-50 text-slate-900 border-violet-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {/* Top: Day Number & Today indicator */}
                        <div className="w-full flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              cell.isSelected
                                ? 'text-white'
                                : cell.isToday
                                ? 'text-violet-700'
                                : 'text-slate-800'
                            }`}
                          >
                            {cell.dayNumber}
                          </span>

                          {cell.isToday && !cell.isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-600" title="Today" />
                          )}
                        </div>

                        {/* Bottom: Completion status indicator */}
                        <div className="w-full text-center">
                          {cell.completedCount > 0 ? (
                            <span
                              className={`block text-[10px] font-black rounded-md px-1 py-0.5 leading-none ${
                                cell.isSelected
                                  ? 'bg-white/20 text-white'
                                  : isAllDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {cell.completedCount}/{cell.totalCount}
                            </span>
                          ) : (
                            <span
                              className={`block text-[9px] font-semibold leading-none ${
                                cell.isSelected ? 'text-white/70' : 'text-slate-300'
                              }`}
                            >
                              0/{cell.totalCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>All Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Partially Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                  <span>Selected</span>
                </div>
              </div>
            </Card>

            {/* RIGHT: THE DAY'S HABITS LIST (7 cols on large screens) */}
            {/* USER REQUIREMENT: "w ened to sete lsis only name and sttus for whol day" */}
            <Card variant="glass" className="lg:col-span-7 p-4 sm:p-6 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">
              
              {/* Day Header with Right-Aligned + Add Habit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                      Whole Day Schedule
                    </span>
                    {selectedDate === todayStr && (
                      <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Today
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                    {formattedSelectedDate}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {monthSummary.selectedDayDone} of {habits.length} habits completed for this day ({monthSummary.selectedDayRate}%)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto sm:ml-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenAddModal}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
                  >
                    + Add Habit
                  </Button>
                </div>
              </div>

              {/* Day Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${monthSummary.selectedDayRate}%` }}
                />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter habits by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-slate-800"
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

              {/* ========================================================= */}
              {/* THE CLEAN LIST: ONLY NAME AND STATUS FOR THE WHOLE DAY     */}
              {/* ========================================================= */}
              <div className="space-y-2.5">
                {displayedHabits.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No habits found</p>
                    <p className="text-xs text-slate-400">Click "+ Add Habit" to add your first routine</p>
                  </div>
                ) : (
                  displayedHabits.map((habit) => {
                    const habitId = habit._id || habit.id;
                    const isDoneForDay = habit.completedDates
                      ? habit.completedDates.includes(selectedDate)
                      : selectedDate === todayStr && habit.completedToday;

                    return (
                      <div
                        key={habitId}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                          isDoneForDay
                            ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* LEFT: ONLY NAME (with category badge) */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm sm:text-base font-extrabold truncate ${
                              isDoneForDay ? 'text-emerald-950' : 'text-slate-900'
                            }`}>
                              {habit.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                              {habit.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                            <span className="capitalize">{habit.frequency} Routine</span>
                          </div>
                        </div>

                        {/* RIGHT: STATUS FOR WHOLE DAY (Interactive Toggle Button) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleHabitForDay(habit)}
                            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                              isDoneForDay
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
                            }`}
                            title={`Click to mark ${isDoneForDay ? 'Pending' : 'Completed'} for whole day`}
                          >
                            {isDoneForDay ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Completed</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 text-slate-400" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>

                          {/* Quick Edit & Delete icons */}
                          <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(habit)}
                              title="Edit Habit"
                              className="p-1.5 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(habitId)}
                              title="Delete Habit"
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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
          </div>
        )}

        {/* ========================================================= */}
        {/* MONTHLY MATRIX VIEW (GRID OVERVIEW FOR ENTIRE MONTH)       */}
        {/* ========================================================= */}
        {viewMode === 'matrix' && (
          <Card variant="glass" className="p-4 sm:p-6 border border-slate-200/90 shadow-xl bg-white space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-violet-600" />
                  <span>Monthly Habit Matrix — {MONTH_NAMES[selectedMonth]} {selectedYear}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Complete day-by-day record of habit executions across all days of the month
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddModal}
                className="bg-violet-600 hover:bg-violet-700 text-white sm:ml-auto"
              >
                + Add Habit
              </Button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-black">
                    <th className="py-2.5 px-3 whitespace-nowrap sticky left-0 bg-slate-50 z-20 min-w-[200px]">
                      Habit Name
                    </th>
                    {calendarDays.filter((c) => !c.blank).map((d) => (
                      <th
                        key={d.key}
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setViewMode('calendar');
                        }}
                        className={`py-2 px-1 text-center font-bold cursor-pointer transition-colors ${
                          d.isToday ? 'bg-violet-100 text-violet-900' : 'hover:bg-slate-100'
                        }`}
                        title={d.dateStr}
                      >
                        <span className="block text-[10px] text-slate-600">{WEEKDAY_NAMES[new Date(d.dateStr).getDay()].slice(0, 1)}</span>
                        <span>{d.dayNumber}</span>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Month Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {habits.map((h) => {
                    const hId = h._id || h.id;
                    const monthCompletions = h.completedDates
                      ? h.completedDates.filter((d) => d.startsWith(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`)).length
                      : 0;

                    return (
                      <tr key={hId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 sticky left-0 bg-white z-10 whitespace-nowrap border-r border-slate-100">
                          {h.title}
                        </td>
                        {calendarDays.filter((c) => !c.blank).map((d) => {
                          const isDone = h.completedDates
                            ? h.completedDates.includes(d.dateStr)
                            : d.dateStr === todayStr && h.completedToday;

                          return (
                            <td
                              key={d.key}
                              onClick={async () => {
                                setSelectedDate(d.dateStr);
                                await handleToggleHabitForDay(h);
                              }}
                              className="py-2 px-1 text-center cursor-pointer hover:bg-violet-50 transition-colors"
                              title={`Click to toggle for ${d.dateStr}`}
                            >
                              {isDone ? (
                                <div className="w-5 h-5 mx-auto rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 mx-auto rounded-md bg-slate-100 border border-slate-200" />
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-black text-emerald-700 whitespace-nowrap">
                          ✓ {monthCompletions} days
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* ========================================================= */}
      {/* ADD / EDIT HABIT MODAL                                    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-7 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-700">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Habit Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Read 20 pages, Morning Hydration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
                {formErrors.title && (
                  <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                    {formErrors.title}
                  </span>
                )}
              </div>

              {/* Side-by-Side: Category & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
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
              <h4 className="text-base font-black text-slate-900">Delete Habit?</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This will delete the habit and its tracking history for the month.
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
                onClick={() => handleDeleteHabit(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
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
