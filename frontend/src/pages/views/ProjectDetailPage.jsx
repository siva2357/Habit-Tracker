import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  Calendar as CalendarIcon,
  ListChecks,
  Compass,
  Layers,
  Edit2,
  AlertCircle,
  Sparkles,
  Rocket,
  ShieldCheck,
  FileText
} from 'lucide-react';

const STEP_LIFECYCLE_STAGES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { value: 'testing', label: 'Testing', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'testing_completed', label: 'Testing Completed', color: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  { value: 'production_in_progress', label: 'Production In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { value: 'live', label: 'Live', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold', dot: 'bg-emerald-500' }
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch single project by ID
  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const json = await res.json();
        setProject(json.data);
      } else {
        // Fallback fetch all
        const allRes = await fetch('/api/projects');
        if (allRes.ok) {
          const allJson = await allRes.json();
          const match = (allJson.data || []).find((p) => (p._id || p.id) === id);
          if (match) setProject(match);
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

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

  const getStepStatusObj = (status) => {
    return STEP_LIFECYCLE_STAGES.find((s) => s.value === status) || STEP_LIFECYCLE_STAGES[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LiquidHeader title="Project Details" subtitle="Loading Workspace..." />
        <main className="max-w-[1100px] mx-auto px-4 pt-24 text-center">
          <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
            <FolderGit2 className="w-8 h-8 text-amber-500 mx-auto animate-pulse mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading project details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LiquidHeader title="Project Details" subtitle="Workspace Not Found" />
        <main className="max-w-[1100px] mx-auto px-4 pt-24 text-center">
          <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Project Workspace Not Found</h2>
            <p className="text-xs text-slate-500">The requested project ID does not exist in the database.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const stepsList = project.steps || [];
  const completedStepsCount = stepsList.filter((s) =>
    ['completed', 'testing_completed', 'live'].includes(s.status)
  ).length;

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-amber-100 selection:text-amber-900">
      <LiquidHeader
        title={project.title}
        subtitle="Project Workspace, Milestone Deliverables & Step Notes"
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 space-y-6">
        
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/projects')}
            className="text-xs font-bold"
          >
            Back to Projects
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={Edit2}
              onClick={() => navigate(`/projects/${project._id || project.id}/edit`)}
              className="text-amber-800 border-amber-200 hover:bg-amber-50 font-bold"
            >
              Edit Project
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => navigate(`/projects/${project._id || project.id}/steps`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold"
            >
              Update Steps & Progress
            </Button>
          </div>
        </div>

        {/* Hero KPI StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <StatCard
            title="Overall Progress"
            value={<>{project.progress}% <span className="text-xs font-semibold text-emerald-600">done</span></>}
            badge="Progress to 100%"
            icon={CheckCircle2}
            variant="emerald"
            footerLeft="Milestone Metric"
            footerRight={`${completedStepsCount} of ${stepsList.length} Steps`}
          />

          <StatCard
            title="Steps Defined"
            value={<>{stepsList.length} <span className="text-xs font-semibold text-amber-600">steps</span></>}
            badge="Deliverables"
            icon={ListChecks}
            variant="amber"
            footerLeft="Total Milestones"
            footerRight="100% Granular"
          />

          <StatCard
            title="Current Status"
            value={<span className="capitalize">{project.status?.replace('_', ' ')}</span>}
            badge="Lifecycle"
            icon={FolderGit2}
            variant="indigo"
            footerLeft={project.category}
            footerRight="100% Monitored"
          />

          <StatCard
            title="Project Deadline"
            value={<span className="text-sm font-black">{formatDateDisplay(project.deadline)}</span>}
            badge="Schedule"
            icon={Clock}
            variant="slate"
            footerLeft={`From ${formatDateDisplay(project.startDate)}`}
            footerRight="Target Horizon"
          />
        </div>

        {/* Project Profile Overview Card */}
        <Card variant="glass" className="p-5 sm:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {project.category} Workspace
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                Status: {project.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {project.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              {project.description}
            </p>
          )}
        </Card>

        {/* Step Milestones Detailed Stepper Section */}
        <Card variant="glass" className="p-5 sm:p-7 border border-slate-200/90 shadow-xl bg-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-amber-600" />
                <span>Execution Steps & Notes</span>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {stepsList.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sequential progression from Pending through Testing, Production, and Live release
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => navigate(`/projects/${project._id || project.id}/steps`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Update Step Progress
            </Button>
          </div>

          {/* Stepper Display */}
          <div className="space-y-4">
            {stepsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ListChecks className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No steps defined for this project yet</p>
                <p className="text-xs text-slate-400">Click "Update Step Progress" to add milestones</p>
              </div>
            ) : (
              stepsList.map((step, idx) => {
                const statusObj = getStepStatusObj(step.status);

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 relative hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                          Step {idx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {step.title}
                        </h3>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusObj.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                        <span>{statusObj.label}</span>
                      </span>
                    </div>

                    {step.description && (
                      <p className="text-xs text-slate-600 font-medium">
                        {step.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateDisplay(step.startDate)} → {formatDateDisplay(step.endDate)}</span>
                      </span>
                    </div>

                    {/* Step Notes / What was done */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>What Did We Do / Step Execution Notes</span>
                      </span>
                      <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">
                        {step.notes ? step.notes : <span className="text-slate-400 italic">No execution notes recorded yet.</span>}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
