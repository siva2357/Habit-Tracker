import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  Activity,
  Droplets,
  Moon,
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
  Sparkles,
  Zap,
  Dumbbell,
  HeartPulse,
  TrendingUp,
  Award,
  Footprints,
  Hand,
  Timer,
  ArrowRight
} from 'lucide-react';

// Predefined workout categories requested by user
const PREDEFINED_WORKOUTS = [
  {
    id: 'walking',
    name: 'Walking',
    defaultTitle: 'Morning Brisk Walking',
    icon: Footprints,
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    type: 'distance',
    defaultMeters: 4000,
    defaultMinutes: 45,
    defaultCalories: 280,
    defaultStartTime: '06:30',
    defaultEndTime: '07:15',
    description: 'Distance (meters), duration, start/end time & calories'
  },
  {
    id: 'finger_gripper',
    name: 'Finger Gripper',
    defaultTitle: 'Forearm Finger Gripper Routine',
    icon: Hand,
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    type: 'reps',
    defaultSets: 5,
    defaultReps: 25,
    defaultMinutes: 20,
    defaultCalories: 120,
    defaultStartTime: '08:00',
    defaultEndTime: '08:20',
    description: 'Sets, reps, grip duration, start/end time'
  },
  {
    id: 'chest_expansion',
    name: 'Chest Expansion',
    defaultTitle: 'Chest Expansion Spring Pulls',
    icon: Dumbbell,
    color: 'violet',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    type: 'reps',
    defaultSets: 4,
    defaultReps: 15,
    defaultMinutes: 25,
    defaultCalories: 185,
    defaultStartTime: '17:30',
    defaultEndTime: '17:55',
    description: 'Sets, reps, upper pectoral tension & time'
  },
  {
    id: 'resistance_band',
    name: 'Resistance Band',
    defaultTitle: 'Full Body Resistance Band Routine',
    icon: Activity,
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    type: 'reps',
    defaultSets: 4,
    defaultReps: 20,
    defaultMinutes: 30,
    defaultCalories: 240,
    defaultStartTime: '18:00',
    defaultEndTime: '18:30',
    description: 'Sets, reps, elastic tension & execution time'
  },
  {
    id: 'other',
    name: 'Other Workout',
    defaultTitle: 'General Workout',
    icon: HeartPulse,
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    type: 'reps',
    defaultSets: 3,
    defaultReps: 12,
    defaultMinutes: 30,
    defaultCalories: 220,
    defaultStartTime: '07:00',
    defaultEndTime: '07:30',
    description: 'Custom exercise tracking'
  }
];

const INTENSITIES = [
  { value: 'high', label: 'High Intensity', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'medium', label: 'Medium Intensity', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'low', label: 'Low Intensity', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

export default function FitnessPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterIntensity, setFilterIntensity] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workoutCategory: 'walking',
    workoutType: 'Morning Brisk Walking',
    distanceMeters: 4000,
    durationMinutes: 45,
    startTime: '06:30',
    endTime: '07:15',
    sets: 4,
    reps: 20,
    caloriesBurned: 280,
    intensity: 'medium',
    workoutCompleted: true,
    waterIntakeMl: 2000,
    waterGoalMl: 2500,
    sleepHours: 7.5,
    sleepGoalHours: 8.0,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Helper: Calculate minutes between "HH:MM" start and end
  const calculateDuration = (start, end) => {
    if (!start || !end) return null;
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // crossed midnight
      return diff;
    } catch {
      return null;
    }
  };

  // When start or end time changes, auto-update durationMinutes
  const handleTimeChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    const s = field === 'startTime' ? val : formData.startTime;
    const e = field === 'endTime' ? val : formData.endTime;
    const computed = calculateDuration(s, e);
    if (computed !== null && computed > 0) {
      updated.durationMinutes = computed;
    }
    setFormData(updated);
  };

  // Helper: switch predefined workout type
  const handleSelectWorkoutCategory = (catId) => {
    const predefined = PREDEFINED_WORKOUTS.find((p) => p.id === catId);
    if (!predefined) return;

    setFormData((prev) => ({
      ...prev,
      workoutCategory: predefined.id,
      workoutType: predefined.defaultTitle,
      distanceMeters: predefined.defaultMeters || 0,
      sets: predefined.defaultSets || 0,
      reps: predefined.defaultReps || 0,
      durationMinutes: predefined.defaultMinutes || 30,
      caloriesBurned: predefined.defaultCalories || 200,
      startTime: predefined.defaultStartTime || prev.startTime,
      endTime: predefined.defaultEndTime || prev.endTime
    }));
  };

  // Fetch Logs from MongoDB
  const fetchFitnessLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fitness');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setLogs(json.data);
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFitnessLogs();
  }, [fetchFitnessLogs]);

  // Format date helper: "Nov 24, 2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Summary Metrics
  const summary = useMemo(() => {
    const totalDays = logs.length;
    const workoutsDone = logs.filter((l) => l.workoutCompleted).length;
    const workoutConsistency = totalDays > 0 ? Math.round((workoutsDone / totalDays) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find((l) => l.date === todayStr) || logs[0] || {};

    const waterToday = todayLog.waterIntakeMl || 2000;
    const waterGoal = todayLog.waterGoalMl || 2500;
    const waterProgress = Math.min(100, Math.round((waterToday / waterGoal) * 100));

    const avgSleep = totalDays > 0
      ? (logs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / totalDays).toFixed(1)
      : '7.5';

    const totalCalories = logs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);
    const totalWalkingMeters = logs
      .filter((l) => l.workoutCategory === 'walking' || (l.distanceMeters && l.distanceMeters > 0))
      .reduce((acc, l) => acc + (l.distanceMeters || 0), 0);

    return {
      totalDays,
      workoutsDone,
      workoutConsistency,
      waterToday,
      waterGoal,
      waterProgress,
      avgSleep,
      totalCalories,
      totalWalkingMeters,
      todayLog
    };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterCategory !== 'all' && log.workoutCategory !== filterCategory) return false;
      if (filterIntensity !== 'all' && log.intensity !== filterIntensity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchType = (log.workoutType || '').toLowerCase().includes(q);
        const matchNotes = (log.notes || '').toLowerCase().includes(q);
        if (!matchType && !matchNotes) return false;
      }
      return true;
    });
  }, [logs, filterCategory, filterIntensity, searchQuery]);

  // Quick Add Water (+250ml)
  const handleQuickAddWater = async (logId, delta = 250) => {
    const target = logs.find((l) => (l._id || l.id) === logId);
    if (!target) return;

    const newWater = Math.max(0, (target.waterIntakeMl || 0) + delta);

    // Optimistic update
    setLogs((prev) =>
      prev.map((l) =>
        (l._id || l.id) === logId ? { ...l, waterIntakeMl: newWater } : l
      )
    );

    try {
      const res = await fetch(`/api/fitness/${logId}/water`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        addToast(`Hydration logged: ${newWater} ml (+${delta}ml) 💧`, 'success');
      } else {
        addToast('Failed to sync hydration to database', 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to log hydration (${err.message})`, 'error');
    }
  };

  // Open Modal Add
  const handleOpenAddModal = (presetCategory = 'walking') => {
    setEditingLog(null);
    const predefined = PREDEFINED_WORKOUTS.find((p) => p.id === presetCategory) || PREDEFINED_WORKOUTS[0];

    setFormData({
      date: new Date().toISOString().split('T')[0],
      workoutCategory: predefined.id,
      workoutType: predefined.defaultTitle,
      distanceMeters: predefined.defaultMeters || 0,
      durationMinutes: predefined.defaultMinutes || 30,
      startTime: predefined.defaultStartTime || '06:30',
      endTime: predefined.defaultEndTime || '07:15',
      sets: predefined.defaultSets || 0,
      reps: predefined.defaultReps || 0,
      caloriesBurned: predefined.defaultCalories || 250,
      intensity: 'medium',
      workoutCompleted: true,
      waterIntakeMl: 2000,
      waterGoalMl: 2500,
      sleepHours: 7.5,
      sleepGoalHours: 8.0,
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEditModal = (log) => {
    setEditingLog(log);
    const matchedCategory = log.workoutCategory || (
      log.workoutType?.toLowerCase().includes('walk') ? 'walking' :
      log.workoutType?.toLowerCase().includes('grip') ? 'finger_gripper' :
      log.workoutType?.toLowerCase().includes('chest') ? 'chest_expansion' :
      log.workoutType?.toLowerCase().includes('band') ? 'resistance_band' : 'other'
    );

    setFormData({
      date: log.date || new Date().toISOString().split('T')[0],
      workoutCategory: matchedCategory,
      workoutType: log.workoutType || 'Workout Routine',
      distanceMeters: log.distanceMeters || 0,
      durationMinutes: log.durationMinutes || 30,
      startTime: log.startTime || '06:30',
      endTime: log.endTime || '07:15',
      sets: log.sets || 0,
      reps: log.reps || 0,
      caloriesBurned: log.caloriesBurned !== undefined ? log.caloriesBurned : 250,
      intensity: log.intensity || 'medium',
      workoutCompleted: log.workoutCompleted !== undefined ? Boolean(log.workoutCompleted) : true,
      waterIntakeMl: log.waterIntakeMl !== undefined ? log.waterIntakeMl : 2000,
      waterGoalMl: log.waterGoalMl !== undefined ? log.waterGoalMl : 2500,
      sleepHours: log.sleepHours !== undefined ? log.sleepHours : 7.5,
      sleepGoalHours: log.sleepGoalHours !== undefined ? log.sleepGoalHours : 8.0,
      notes: log.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.workoutType.trim()) errors.workoutType = 'Workout routine title is required';
    if (!formData.date) errors.date = 'Date is required';

    if (formData.workoutCategory === 'walking') {
      if (Number(formData.distanceMeters) <= 0) {
        errors.distanceMeters = 'Please enter distance in meters';
      }
    } else {
      if (Number(formData.sets) <= 0 && formData.workoutCompleted) {
        errors.sets = 'Please enter number of sets';
      }
      if (Number(formData.reps) <= 0 && formData.workoutCompleted) {
        errors.reps = 'Please enter reps per set';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      date: formData.date,
      workoutCategory: formData.workoutCategory,
      workoutType: formData.workoutType.trim(),
      distanceMeters: Number(formData.distanceMeters || 0),
      durationMinutes: Number(formData.durationMinutes || 30),
      startTime: formData.startTime || '',
      endTime: formData.endTime || '',
      sets: Number(formData.sets || 0),
      reps: Number(formData.reps || 0),
      caloriesBurned: Number(formData.caloriesBurned || 0),
      intensity: formData.intensity,
      workoutCompleted: Boolean(formData.workoutCompleted),
      waterIntakeMl: Number(formData.waterIntakeMl || 2000),
      waterGoalMl: Number(formData.waterGoalMl || 2500),
      sleepHours: Number(formData.sleepHours || 7.5),
      sleepGoalHours: Number(formData.sleepGoalHours || 8.0),
      notes: formData.notes.trim()
    };

    if (editingLog) {
      const targetId = editingLog._id || editingLog.id;
      try {
        const res = await fetch(`/api/fitness/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setLogs((prev) => prev.map((l) => ((l._id || l.id) === targetId ? json.data : l)));
          addToast(`Updated fitness log: ${payload.workoutType}`, 'success');
          setIsModalOpen(false);
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status}`;
          addToast(`Failed to update fitness log: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database error: Unable to update fitness log (${err.message})`, 'error');
      }
    } else {
      try {
        const res = await fetch('/api/fitness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setLogs((prev) => [json.data, ...prev]);
          addToast(`Logged workout: ${payload.workoutType} 🏋️`, 'success');
          setIsModalOpen(false);
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status}`;
          addToast(`Failed to save workout to database: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database error: Unable to save workout (${err.message})`, 'error');
      }
    }
  };

  // Delete Log
  const handleDeleteLog = async (id) => {
    try {
      const res = await fetch(`/api/fitness/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => (l._id || l.id) !== id));
        addToast('Fitness record removed', 'info');
      } else {
        addToast('Failed to delete fitness record from database', 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to delete (${err.message})`, 'error');
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Edge-to-Edge LiquidHeader */}
      <LiquidHeader
        title="My Fitness"
        subtitle="Workouts, Walking, Grippers, Resistance Bands & Health Biometrics"
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24 space-y-5 sm:space-y-6">

        {/* Top Module Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black tracking-wide">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>FITNESS & HEALTH</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • Predefined Routines: Walking, Finger Gripper, Chest Expansion & Resistance Bands
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Kinetic Biometrics Engine Active</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO SECTION: 4 Status StatCards for Fitness              */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">

          {/* Top Hero Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Biometrics & Daily Performance
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Monitor walking distance, strength reps, hydration, and active burn
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Rate Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Workout Adherence:
              </span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {summary.workoutConsistency}% Consistency ({summary.workoutsDone} of {summary.totalDays} Days)
              </span>
            </div>
          </div>

          {/* 4 Status StatCards using Reusable StatCard */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
            <StatCard
              title="Daily Hydration"
              value={<>{summary.waterToday.toLocaleString()} <span className="text-xs font-semibold text-sky-600">/ {summary.waterGoal.toLocaleString()} ml</span></>}
              badge="Fluid Balance"
              icon={Droplets}
              variant="sky"
              footerLeft={`${summary.waterProgress}% of Target`}
              footerRight="Goal: 2.5 L"
            />

            <StatCard
              title="Total Walking"
              value={<>{(summary.totalWalkingMeters / 1000).toFixed(1)} <span className="text-xs font-semibold text-emerald-600">km ({summary.totalWalkingMeters.toLocaleString()}m)</span></>}
              badge="Aerobic Footwork"
              icon={Footprints}
              variant="emerald"
              footerLeft="Outdoor & Treadmill"
              footerRight="Walking Cadence"
            />

            <StatCard
              title="Average Sleep"
              value={<>{summary.avgSleep} <span className="text-xs font-semibold text-indigo-600">hours</span></>}
              badge="Recovery"
              icon={Moon}
              variant="indigo"
              footerLeft="Optimal 8.0h"
              footerRight="Sleep Hygiene"
            />

            <StatCard
              title="Active Calorie Burn"
              value={<>{summary.totalCalories.toLocaleString()} <span className="text-xs font-semibold text-amber-600">kcal</span></>}
              badge="Metabolic Burn"
              icon={Flame}
              variant="amber"
              footerLeft="Energy Burned"
              footerRight="Cumulative"
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* FITNESS LOGS TABLE SECTION: Table, Search, Filters & Actions */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">

          {/* Table Header & Controls Toolbar */}
          <div className="flex flex-col gap-3.5 pb-3 sm:pb-4 border-b border-slate-100">
            
            {/* Top Row: Title & Total Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <span>Fitness & Exercise Logs</span>
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {filteredLogs.length}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Track walking distance, finger gripper sets, chest expansions, and resistance bands
                </p>
              </div>
            </div>

            {/* Filter Toolbar Controls: Full width with Add Log strictly at far right end at last */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full">
              
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exercise or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
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

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Workout:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Exercises</option>
                  <option value="walking">Walking</option>
                  <option value="finger_gripper">Finger Gripper</option>
                  <option value="chest_expansion">Chest Expansion</option>
                  <option value="resistance_band">Resistance Band</option>
                  <option value="other">Other Workouts</option>
                </select>
              </div>

              {/* Intensity Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Intensity:</span>
                <select
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Intensities</option>
                  <option value="high">High Intensity</option>
                  <option value="medium">Medium Intensity</option>
                  <option value="low">Low Intensity</option>
                </select>
              </div>

              {/* + Log Fitness Button - strictly right-aligned at far right end */}
              <div className="ml-auto flex items-center gap-2">
                {logs.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Droplets}
                    onClick={() => handleQuickAddWater(logs[0]._id || logs[0].id, 250)}
                    className="text-sky-700 border-sky-200 hover:bg-sky-50 shadow-sm"
                  >
                    +250ml Water
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => handleOpenAddModal('walking')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                >
                  + Log Fitness
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Workout Routine</th>
                  <th className="py-3 px-4">Sets / Reps / Distance</th>
                  <th className="py-3 px-4">Time & Duration</th>
                  <th className="py-3 px-4">Burn (kcal)</th>
                  <th className="py-3 px-4">Intensity</th>
                  <th className="py-3 px-4">Hydration</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Activity className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-semibold text-slate-600">No fitness logs match your filters</p>
                        <p className="text-xs text-slate-400">Click "+ Log Fitness" above to record today's exercise</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const id = log._id || log.id;
                    const catObj = PREDEFINED_WORKOUTS.find((p) => p.id === log.workoutCategory) || PREDEFINED_WORKOUTS[4];
                    const IconComponent = catObj.icon;
                    const intensityObj = INTENSITIES.find((i) => i.value === log.intensity) || INTENSITIES[1];
                    const isWalking = log.workoutCategory === 'walking' || (log.distanceMeters && log.distanceMeters > 0);

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-black text-slate-900 block text-xs">
                            {formatDateDisplay(log.date)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.date}
                          </span>
                        </td>

                        {/* Workout Routine & Category Badge */}
                        <td className="py-3 px-4 max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${catObj.badgeClass} shrink-0`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <div className="font-black text-slate-900 flex items-center gap-1.5">
                                <span>{log.workoutType}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {catObj.name}
                              </span>
                            </div>
                          </div>
                          {log.notes && (
                            <p className="text-xs text-slate-500 font-normal truncate mt-1" title={log.notes}>
                              {log.notes}
                            </p>
                          )}
                        </td>

                        {/* Sets / Reps OR Distance (Meters) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isWalking ? (
                            <div>
                              <div className="font-black text-emerald-700 text-xs flex items-center gap-1">
                                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{(log.distanceMeters || 0).toLocaleString()} meters</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {((log.distanceMeters || 0) / 1000).toFixed(2)} km walked
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="font-black text-indigo-700 text-xs flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{log.sets || 0} sets × {log.reps || 0} reps</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Total: {(log.sets || 0) * (log.reps || 0)} repetitions
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Time & Duration */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.durationMinutes || 30} mins</span>
                          </div>
                          {(log.startTime || log.endTime) && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {log.startTime || '—'} → {log.endTime || '—'}
                            </span>
                          )}
                        </td>

                        {/* Calories */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-extrabold text-amber-700 text-xs">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>{log.caloriesBurned} kcal</span>
                          </div>
                        </td>

                        {/* Intensity */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${intensityObj.color}`}>
                            {intensityObj.label}
                          </span>
                        </td>

                        {/* Hydration */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-sky-500" />
                            <span className="font-bold text-slate-800 text-xs">
                              {log.waterIntakeMl} ml
                            </span>
                            <button
                              onClick={() => handleQuickAddWater(id, 250)}
                              className="px-1.5 py-0.5 text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 shadow-2xs"
                              title="+250ml water"
                            >
                              +250
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.workoutCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                              Rest
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(log)}
                              title="Edit Workout"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(id)}
                              title="Delete Log"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
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

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No workout logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const id = log._id || log.id;
                const catObj = PREDEFINED_WORKOUTS.find((p) => p.id === log.workoutCategory) || PREDEFINED_WORKOUTS[4];
                const IconComponent = catObj.icon;
                const isWalking = log.workoutCategory === 'walking' || (log.distanceMeters && log.distanceMeters > 0);

                return (
                  <div
                    key={id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2 rounded-xl ${catObj.badgeClass}`}>
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {formatDateDisplay(log.date)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${catObj.badgeClass}`}>
                              {catObj.name}
                            </span>
                          </div>
                          <h3 className="font-black text-sm text-slate-900 mt-0.5">
                            {log.workoutType}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(log)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Specific performance metric block */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-bold">
                      {isWalking ? (
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <Footprints className="w-4 h-4 text-emerald-600" />
                          <span>{(log.distanceMeters || 0).toLocaleString()} meters ({((log.distanceMeters || 0)/1000).toFixed(1)} km)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-indigo-800">
                          <Activity className="w-4 h-4 text-indigo-600" />
                          <span>{log.sets || 0} sets × {log.reps || 0} reps</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.durationMinutes} min ({log.startTime} - {log.endTime})</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-slate-600 font-normal bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                        {log.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-700 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {log.caloriesBurned} kcal
                        </span>
                        <span>•</span>
                        <span className="font-bold text-sky-700 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-sky-500" />
                          {log.waterIntakeMl} ml
                        </span>
                      </div>

                      {log.workoutCompleted ? (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Rest Day
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>

      {/* ========================================================= */}
      {/* ADD / EDIT FITNESS LOG MODAL                              */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {editingLog ? 'Edit Workout Record' : 'Log Predefined Workout'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Select a routine below to configure its specific metrics
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workout Preset Selector Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Workout Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PREDEFINED_WORKOUTS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = formData.workoutCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectWorkoutCategory(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm scale-102 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </div>
                      <span className={`text-xs font-black mt-2 ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
              
              {/* Row 1: Date & Specific Workout Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workout Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {formErrors.date && (
                    <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                      {formErrors.date}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Routine Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.workoutType}
                    onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {formErrors.workoutType && (
                    <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                      {formErrors.workoutType}
                    </span>
                  )}
                </div>
              </div>

              {/* SPECIFIC FIELDS: DYNAMICALLY SWITCHED BASED ON WORKOUT TYPE */}
              
              {/* CASE A: WALKING (Meters, Start Time, End Time, Duration, Calories) */}
              {formData.workoutCategory === 'walking' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4 text-emerald-600" />
                      <span>Walking Specifics</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {((formData.distanceMeters || 0) / 1000).toFixed(2)} km total
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Distance (Meters) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Footprints className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="100"
                        min="0"
                        placeholder="e.g. 4500"
                        value={formData.distanceMeters}
                        onChange={(e) => setFormData({ ...formData, distanceMeters: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    {formErrors.distanceMeters && (
                      <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                        {formErrors.distanceMeters}
                      </span>
                    )}

                    {/* Quick Distance Increments */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">Quick add:</span>
                      {[2000, 3000, 4500, 6000].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData({ ...formData, distanceMeters: m })}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white hover:bg-emerald-100 text-slate-700 border border-emerald-200 transition-colors"
                        >
                          {m >= 1000 ? `${m/1000}km` : `${m}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: OTHER (Finger Gripper, Chest Expansion, Resistance Band) -> Sets, Reps */}
              {formData.workoutCategory !== 'walking' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>Sets & Repetitions</span>
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700">
                      Total: {(formData.sets || 0) * (formData.reps || 0)} reps
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        How many Sets? <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="e.g. 4"
                        value={formData.sets}
                        onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      {formErrors.sets && (
                        <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                          {formErrors.sets}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Reps per Set <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        placeholder="e.g. 20"
                        value={formData.reps}
                        onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      {formErrors.reps && (
                        <span className="text-rose-500 text-[11px] font-semibold mt-1 block">
                          {formErrors.reps}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TIME FIELDS FOR ALL WORKOUTS: Start Time, End Time & Duration */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Execution Time & Duration</span>
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="45"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Calories Burned & Water Intake */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Calories Burnt (kcal)
                  </label>
                  <div className="relative">
                    <Flame className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="10"
                      min="0"
                      placeholder="280"
                      value={formData.caloriesBurned}
                      onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Water Intake (ml)
                  </label>
                  <div className="relative">
                    <Droplets className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="50"
                      min="0"
                      placeholder="2000"
                      value={formData.waterIntakeMl}
                      onChange={(e) => setFormData({ ...formData, waterIntakeMl: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Workout Notes Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Exercise Notes / Grip / Resistance Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Heavy 50kg gripper used, 3s pause at peak grip..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              {/* Execution Status & Intensity Level SIDE-BY-SIDE IN THE LAST ROW */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Execution Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.workoutCompleted ? 'completed' : 'rest'}
                    onChange={(e) => setFormData({ ...formData, workoutCompleted: e.target.value === 'completed' })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="completed">Completed Workout</option>
                    <option value="rest">Rest / Recovery Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Intensity Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="high">High Intensity</option>
                    <option value="medium">Medium Intensity</option>
                    <option value="low">Low Intensity</option>
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingLog ? 'Save Changes' : 'Log Workout'}
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
              <h4 className="text-base font-black text-slate-900">Delete Fitness Log?</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This record will be permanently deleted from the database.
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
                onClick={() => handleDeleteLog(deleteConfirmId)}
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
