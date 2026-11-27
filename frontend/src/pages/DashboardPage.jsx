import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Flame,
  CalendarCheck2,
  CheckCircle2,
  CalendarDays,
  Target,
  FolderGit2,
  HeartPulse,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  Database
} from 'lucide-react';
import LiquidHeader from '../components/LiquidHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import StatCard from '../components/StatCard';

// Icon Map for modules
const ICON_MAP = {
  habits: CheckCircle2,
  planner: CalendarDays,
  goals: Target,
  projects: FolderGit2,
  fitness: HeartPulse,
  finances: IndianRupee
};

// Clean Initial Modules
const DEFAULT_MODULES = [
  {
    id: 'habits',
    name: 'Habit Tracker',
    category: 'Consistency & Routine',
    path: '/habits',
    progress: 0,
    metric: '0 of 0 habits completed for today',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#8b5cf6',
    icon: CheckCircle2,
    lastUpdated: 'Live MongoDB'
  },
  {
    id: 'planner',
    name: 'Day Planner',
    category: 'Time Blocking',
    path: '/planner',
    progress: 0,
    metric: '0 of 0 daily blocks completed',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#0284c7',
    icon: CalendarDays,
    lastUpdated: 'Live MongoDB'
  },
  {
    id: 'goals',
    name: 'Goal Planner',
    category: 'Strategic Milestones',
    path: '/goals',
    progress: 0,
    metric: '0 active goals • 0 completed',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#ec4899',
    icon: Target,
    lastUpdated: 'Live MongoDB'
  },
  {
    id: 'projects',
    name: 'My Projects',
    category: 'Personal & Work',
    path: '/projects',
    progress: 0,
    metric: '0 active projects • 0 deliverables done',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#f59e0b',
    icon: FolderGit2,
    lastUpdated: 'Live MongoDB'
  },
  {
    id: 'fitness',
    name: 'My Fitness',
    category: 'Health & Biometrics',
    path: '/fitness',
    progress: 0,
    metric: '0ml / 0ml • 0h sleep',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#10b981',
    icon: HeartPulse,
    lastUpdated: 'Live MongoDB'
  },
  {
    id: 'finances',
    name: 'My Finances',
    category: 'Cashflow & Budget (₹)',
    path: '/finances',
    progress: 0,
    metric: '₹0 net surplus • 0 transactions',
    status: 'Not Started',
    statusColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: '#0d9488',
    icon: IndianRupee,
    lastUpdated: 'Live MongoDB'
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // Dynamic Dashboard State
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [statCards, setStatCards] = useState({
    habits: { value: '0 / 0 Done', subtitle: '0 Habits Monitored', trend: '0% Done' },
    planner: { value: '0 / 0 Done', subtitle: '0 blocks left', trend: '0% Completed' },
    goals: { value: '0 Active', subtitle: '0 of 0 Completed', trend: '0% Achieved' },
    projects: { value: '0 Projects', subtitle: '0 Tasks Done', trend: '0% Deliverables' },
    fitness: { value: '0 ml', subtitle: 'Hydration • 0h Sleep', trend: '0% Water Goal' },
    finances: { value: '₹0', subtitle: 'Surplus: ₹0', trend: '₹0 (₹)' }
  });
  const [averageProgress, setAverageProgress] = useState(0);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch Realtime Dashboard Data from MongoDB
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      let storedBase = localStorage.getItem('trackit_finance_initial_balance') || localStorage.getItem('trackit_base_balance');
      if (!storedBase || storedBase === '50000') {
        storedBase = '0';
        localStorage.setItem('trackit_finance_initial_balance', '0');
        localStorage.removeItem('trackit_base_balance');
      }
      const res = await fetch(`/api/dashboard/summary?baseBalance=${storedBase}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.modules)) {
          const hydratedModules = json.modules.map((m) => ({
            ...m,
            icon: ICON_MAP[m.id] || Sparkles
          }));
          setModules(hydratedModules);
          if (json.statCards) {
            setStatCards(json.statCards);
          }
          if (json.averageProgress !== undefined) {
            setAverageProgress(json.averageProgress);
          }
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch {
      // Local fallback active
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Re-fetch when tab is focused (e.g. after editing tasks or transactions in other tabs)
    const handleFocus = () => fetchDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md relative z-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-xs text-slate-800">{data.name}</span>
          </div>
          <p className="text-xs font-semibold text-slate-600">
            Progress: <span className="text-indigo-600 font-bold">{data.progress}%</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.metric}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white pb-16 overflow-x-hidden">
      {/* Top Header Navigation (Fixed at top) */}
      <LiquidHeader title="Dashboard" subtitle="Central Overview & Real-Time Multi-Module Progress" />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 space-y-5 sm:space-y-6 pt-20 sm:pt-24">

        {/* Top Control Bar: Real-time Database Status & Manual Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime MongoDB Connected</span>
            </span>
            {lastRefreshed && (
              <span className="text-[11px] font-semibold text-slate-400 hidden xs:inline">
                • Synced at {lastRefreshed}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Fetch fresh real-time metrics from MongoDB"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Refresh Pulse'}</span>
            </button>
          </div>
        </div>

        {/* Top Row: 6 Reusable Stat Cards Representing All 6 Core Modules */}
        <div className="space-y-2.5">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Modules Live Pulse</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Click any card to inspect module
            </span>
          </div>

          {/* Fully Responsive Stat Cards Breakpoints:
              1 Card (Mobile), 2 Cards (Medium), 3 Cards (Large & Extra Large) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
            {/* Stat Card 1: Habit Tracker */}
            <StatCard
              title="Habit Tracker"
              value={statCards.habits?.value || '0 / 0 Done'}
              subtitle={statCards.habits?.subtitle || '0 Habits Monitored'}
              trend={statCards.habits?.trend || '0% Done'}
              trendPositive={true}
              icon={Flame}
              iconColor="text-amber-500"
              iconBg="bg-amber-50 border-amber-200"
            />

            {/* Stat Card 2: Day Planner */}
            <StatCard
              title="Day Planner"
              value={statCards.planner?.value || '0 / 0 Done'}
              subtitle={statCards.planner?.subtitle || '0 blocks left'}
              trend={statCards.planner?.trend || '0% Completed'}
              trendPositive={true}
              icon={CalendarCheck2}
              iconColor="text-sky-600"
              iconBg="bg-sky-50 border-sky-200"
            />

            {/* Stat Card 3: Goal Planner */}
            <StatCard
              title="Goal Planner"
              value={statCards.goals?.value || '0 Active'}
              subtitle={statCards.goals?.subtitle || '0 of 0 Completed'}
              trend={statCards.goals?.trend || '0% Achieved'}
              trendPositive={true}
              icon={Target}
              iconColor="text-pink-600"
              iconBg="bg-pink-50 border-pink-200"
            />

            {/* Stat Card 4: My Projects */}
            <StatCard
              title="My Projects"
              value={statCards.projects?.value || '0 Projects'}
              subtitle={statCards.projects?.subtitle || '0 Tasks Done'}
              trend={statCards.projects?.trend || '0% Deliverables'}
              trendPositive={true}
              icon={FolderGit2}
              iconColor="text-amber-600"
              iconBg="bg-amber-50 border-amber-200"
            />

            {/* Stat Card 5: My Fitness */}
            <StatCard
              title="My Fitness"
              value={statCards.fitness?.value || '0 ml'}
              subtitle={statCards.fitness?.subtitle || 'Hydration • 0h Sleep'}
              trend={statCards.fitness?.trend || '0% Water Goal'}
              trendPositive={true}
              icon={HeartPulse}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50 border-emerald-200"
            />

            {/* Stat Card 6: My Finances (In RUPEES ₹ Only - Live MongoDB Balance) */}
            <StatCard
              title="My Finances"
              value={statCards.finances?.value || '₹0'}
              subtitle={statCards.finances?.subtitle || 'Surplus: ₹0'}
              trend={statCards.finances?.trend || '₹0 (₹)'}
              trendPositive={true}
              icon={IndianRupee}
              iconColor="text-teal-700"
              iconBg="bg-teal-50 border-teal-200"
            />
          </div>
        </div>

        {/* Middle Section: Donut Chart + Module Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Donut Chart Card */}
          <Card variant="glass" className="p-4 sm:p-6 border border-slate-200 bg-white lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Module Progress Distribution</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Real-time completion percentage across all life domains
                  </p>
                </div>
                <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 self-start xs:self-auto">
                  {modules.length} Modules
                </span>
              </div>

              {/* Chart Visual with Center Text (Responsive percentage radii) */}
              <div className="relative h-56 sm:h-64 md:h-72 w-full flex items-center justify-center my-1 sm:my-2">
                {/* Center of Donut Metric (Rendered at z-0 behind the chart and tooltip) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight select-none">
                    {activeModule ? `${activeModule.progress}%` : `${averageProgress}%`}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center px-2 truncate max-w-[150px] select-none">
                    {activeModule ? activeModule.name : 'Avg Progress'}
                  </span>
                </div>

                {/* Chart & Tooltip Layer (Rendered at relative z-10 so tooltip always floats on top) */}
                <div className="w-full h-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modules}
                        dataKey="progress"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="58%"
                        outerRadius="86%"
                        paddingAngle={4}
                        cornerRadius={6}
                        onMouseEnter={(data) => setActiveModule(data)}
                        onMouseLeave={() => setActiveModule(null)}
                      >
                        {modules.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                            className="cursor-pointer transition-transform duration-300 hover:opacity-90"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        content={<CustomTooltip />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Donut Legend Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 sm:pt-4 border-t border-slate-100">
              {modules.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path, { state: { from: '/dashboard', fromName: 'Dashboard' } })}
                  className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate">{item.name}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold">{item.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Module Bars Summary Card */}
          <Card variant="glass" className="p-4 sm:p-6 border border-slate-200 bg-white lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Completion Breakdown</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Individual tracking metrics and targets
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-xs py-1 px-2.5 self-start xs:self-auto"
                >
                  Control Panel
                </Button>
              </div>

              {/* Progress Bars List */}
              <div className="space-y-3 sm:space-y-3.5 my-2">
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all cursor-pointer hover:bg-slate-100/60"
                      onClick={() => navigate(mod.path, { state: { from: '/dashboard', fromName: 'Dashboard' } })}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: mod.color }} />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {mod.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 hidden md:inline">
                              {mod.category}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold text-slate-800 shrink-0 ml-2">
                          {mod.progress}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${mod.progress}%`,
                            backgroundColor: mod.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>All 6 sub-modules synced to Live MongoDB Atlas</span>
              </span>
              <span className="text-emerald-600 font-bold">100% Realtime</span>
            </div>
          </Card>
        </div>

        {/* Bottom Section: Table Card Section for Modules */}
        <Card variant="glass" className="p-4 sm:p-6 border border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-5 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span>Life Management Modules Overview</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Detailed table of current progress, metrics, and quick navigation actions
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              Active Admin Database
            </span>
          </div>

          {/* 1. Mobile Adaptive Card-List View (Shown on < 640px) */}
          <div className="block sm:hidden space-y-3">
            {modules.map((row) => {
              const RowIcon = row.icon;
              return (
                <div
                  key={row.id}
                  onClick={() => navigate(row.path, { state: { from: '/dashboard', fromName: 'Dashboard' } })}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 cursor-pointer active:scale-[0.99] transition-transform space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: row.color }}
                      >
                        <RowIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{row.name}</div>
                        <div className="text-[10px] text-slate-400">{row.category}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span className="truncate pr-2 font-medium text-slate-600">{row.metric}</span>
                      <span style={{ color: row.color }}>{row.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.progress}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Updated {row.lastUpdated}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                      Open <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Tablet & Desktop Responsive Table View (Shown on >= 640px) */}
          <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="pb-3.5 pl-2 font-bold">Module</th>
                  <th className="pb-3.5 font-bold">Category</th>
                  <th className="pb-3.5 font-bold">Current Metric</th>
                  <th className="pb-3.5 font-bold">Progress</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 pr-2 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {modules.map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(row.path, { state: { from: '/dashboard', fromName: 'Dashboard' } })}
                    >
                      {/* Module Column */}
                      <td className="py-4 pl-2 font-bold text-slate-900 flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0"
                          style={{ backgroundColor: row.color }}
                        >
                          <RowIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {row.category}
                          </div>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="py-4 font-semibold text-slate-600">
                        {row.category}
                      </td>

                      {/* Current Metric Column */}
                      <td className="py-4 font-bold text-slate-800">
                        {row.metric}
                      </td>

                      {/* Progress Column with Mini Visual Bar */}
                      <td className="py-4 font-extrabold">
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: row.color }} className="w-8 shrink-0">
                            {row.progress}%
                          </span>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${row.progress}%`, backgroundColor: row.color }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-4 pr-2 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
