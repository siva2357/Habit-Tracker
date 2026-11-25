import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  Target,
  FolderGit2,
  HeartPulse,
  Wallet,
  Sparkles,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import LiquidHeader from '../components/LiquidHeader';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

export default function ControlPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Modules from project_synopsis.md with direct startup page routing
  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      tagline: 'Life & Productivity Pulse',
      description: 'A complete overview of your daily activities, habit streaks, scheduled timetable, progress, and performance across all modules.',
      icon: LayoutDashboard,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      badge: 'Main Hub',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      coreFeatures: [
        'Daily completion score & productivity pulse',
        'Today’s scheduled activities snapshot',
        'Active streaks & upcoming reminders'
      ]
    },
    {
      id: 'habits',
      name: 'Habit Tracker',
      path: '/habits',
      tagline: 'Build Consistency & Streaks',
      description: 'Track daily habits, maintain streaks, monitor consistency, and analyse weekly, monthly, and yearly progress.',
      icon: CheckCircle2,
      gradient: 'from-violet-600 via-purple-600 to-indigo-600',
      badge: 'Consistency & Streaks',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      coreFeatures: [
        'Daily check-ins & instant streak tracking',
        'Frequency controls (daily, weekdays, custom)',
        'Monthly & yearly consistency heatmaps'
      ]
    },
    {
      id: 'planner',
      name: 'Day Planner',
      path: '/planner',
      tagline: 'Structured Hourly Timetable',
      description: 'Plan and organise daily schedules using a structured timetable with priority tasks and timely reminders.',
      icon: CalendarDays,
      gradient: 'from-sky-500 via-blue-600 to-indigo-600',
      badge: 'Hourly Timetable',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      coreFeatures: [
        'Structured hourly time blocking (06:00 to 22:00)',
        'Task prioritization (High, Medium, Low)',
        'Quick task check-off and progress tracking'
      ]
    },
    {
      id: 'goals',
      name: 'Goal Planner',
      path: '/goals',
      tagline: 'Milestones & Long-Term Vision',
      description: 'Set, organise, and monitor personal, career, education, finance, and lifestyle goals with milestone tracking.',
      icon: Target,
      gradient: 'from-pink-500 via-rose-500 to-violet-600',
      badge: 'Strategic Vision',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      coreFeatures: [
        'Multi-domain goals (Career, Health, Wealth, Personal)',
        'Milestone checklists with percentage sliders',
        'Target deadline countdowns'
      ]
    },
    {
      id: 'projects',
      name: 'My Projects',
      path: '/projects',
      tagline: 'Personal & Professional Initiatives',
      description: 'Manage professional and personal projects, tasks, milestones, deadlines, and overall deliverable progress.',
      icon: FolderGit2,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      badge: 'Project Workspaces',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      coreFeatures: [
        'Individual project boards & roadmap cards',
        'Deliverable checklists (To Do, In Progress, Done)',
        'Milestone deadlines & progress percentages'
      ]
    },
    {
      id: 'fitness',
      name: 'My Fitness',
      path: '/fitness',
      tagline: 'Workouts, Hydration, Sleep & Health',
      description: 'Track workouts, body measurements, weight, hydration, sleep, nutrition, and overall health progress.',
      icon: HeartPulse,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      badge: 'Health & Biometrics',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      coreFeatures: [
        'Daily hydration logger (quick ml tap tracker)',
        'Workout session logs with sets & calories',
        'Sleep cycle & rest quality tracking'
      ]
    },
    {
      id: 'finances',
      name: 'My Finances',
      path: '/finances',
      tagline: 'Income, Expenses & Budget Control',
      description: 'Manage income, expenses, budgets, savings, recurring payments, and comprehensive financial reports.',
      icon: Wallet,
      gradient: 'from-teal-500 via-emerald-600 to-green-600',
      badge: 'Personal Cashflow',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      coreFeatures: [
        'Income & expense transaction ledger',
        'Category monthly budgets with spending caps',
        'Recurring subscriptions & bill alert tracker'
      ]
    }
  ];

  // Smooth, Luxurious, Slower Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16, // Deliberate and smooth cascade
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.85, // Slower and cinematic
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-12 sm:pb-16 overflow-x-hidden">
      {/* Pinned Fixed Top Header */}
      <LiquidHeader />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24">
        {/* Welcome Banner Card with Smooth Motion */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card variant="glass" className="mb-6 sm:mb-8 p-4 sm:p-6 md:p-8 bg-white border border-slate-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
              <div className="w-full lg:w-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.35 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-indigo-50 border border-indigo-200/70 text-indigo-700 mb-2 sm:mb-3"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Personal Control Panel</span>
                </motion.div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Control Panel
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 sm:mt-2 max-w-2xl font-normal leading-relaxed">
                  Track Everything. Achieve Anything. Click any module card below to open its dedicated startup view.
                </p>
              </div>

              {/* Admin Single-User Status Glass Pill */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Admin Account</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">admin@gmail.com</div>
                </div>
                <span className="ml-auto text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Active
                </span>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <span>Core Module Sections</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Select any card to navigate directly to that module startup view.
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
            7 Modules Configured
          </span>
        </motion.div>

        {/* Staggered Animated Grid of Module Cards with Slower Cinematic Motion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  variant="interactive"
                  onClick={() => navigate(mod.path, { state: { from: '/', fromName: 'Control Panel' } })}
                  className="flex flex-col justify-between group border border-slate-200/90 bg-white p-4 sm:p-6 h-full"
                >
                  <div>
                    {/* Card Header: Icon & Badge */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <motion.div
                        whileHover={{ scale: 1.12, rotate: 3 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${mod.gradient} flex items-center justify-center text-white shadow-md shadow-indigo-500/20`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    {/* Module Name & Tagline */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {mod.name}
                    </h3>
                    <div className="text-[11px] sm:text-xs font-semibold text-indigo-600/90 mb-1.5 sm:mb-2">
                      {mod.tagline}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 sm:mb-4">
                      {mod.description}
                    </p>

                    {/* Core Features Preview */}
                    <div className="space-y-1 sm:space-y-1.5 pt-2.5 sm:pt-3 border-t border-slate-100">
                      {mod.coreFeatures.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/70 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors duration-300">
                      Open {mod.name}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-all duration-300 shadow-xs">
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
