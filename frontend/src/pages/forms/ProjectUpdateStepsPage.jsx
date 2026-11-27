import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import {
  FolderGit2,
  CheckCircle2,
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  ListChecks,
  AlertCircle,
  FileText,
  Calendar as CalendarIcon,
  Sparkles
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

export default function ProjectUpdateStepsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch single project by ID
  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const json = await res.json();
        setProject(json.data);
        const existingSteps = json.data.steps && json.data.steps.length > 0
          ? json.data.steps.map((s) => ({ ...s }))
          : [
              {
                title: 'Initial Deliverable',
                description: json.data.description || '',
                startDate: json.data.startDate || '',
                endDate: json.data.deadline || '',
                status: 'in_progress',
                notes: ''
              }
            ];
        setSteps(existingSteps);
      } else {
        const allRes = await fetch('/api/projects');
        if (allRes.ok) {
          const allJson = await allRes.json();
          const match = (allJson.data || []).find((p) => (p._id || p.id) === id);
          if (match) {
            setProject(match);
            setSteps(match.steps && match.steps.length > 0 ? match.steps.map((s) => ({ ...s })) : []);
          }
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

  // Update step field
  const handleStepChange = (idx, field, val) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Add new step
  const handleAddNewStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        title: `Deliverable Step ${prev.length + 1}`,
        description: '',
        startDate: project?.startDate || '',
        endDate: project?.deadline || '',
        status: 'pending',
        notes: ''
      }
    ]);
  };

  // Remove step
  const handleRemoveStep = (idx) => {
    if (steps.length <= 1) {
      addToast('Project must have at least one step', 'info');
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculate live dynamic progress toward 100%
  const liveProgress = useMemo(() => {
    const total = steps.length;
    if (total === 0) return { percent: 0, completed: 0, total: 0 };

    // Steps considered done toward 100%: completed, testing_completed, live
    const completed = steps.filter((s) =>
      ['completed', 'testing_completed', 'live'].includes(s.status)
    ).length;

    const percent = Math.round((completed / total) * 100);
    return { percent, completed, total };
  }, [steps]);

  const getStepStatusObj = (status) => {
    return STEP_LIFECYCLE_STAGES.find((s) => s.value === status) || STEP_LIFECYCLE_STAGES[0];
  };

  // Submit Step Updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    const targetId = project._id || project.id;
    const nextStatus = liveProgress.percent === 100 ? 'completed' : project.status;

    const payload = {
      steps,
      tasksTotal: steps.length,
      tasksCompleted: liveProgress.completed,
      progress: liveProgress.percent,
      status: nextStatus
    };

    try {
      const res = await fetch(`/api/projects/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(`Progress updated to ${liveProgress.percent}%! 🚀`, 'success');
        navigate('/projects');
      } else {
        const errData = await res.json().catch(() => null);
        addToast(`Failed to update progress in database: ${errData?.message || res.status}`, 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to save progress (${err.message})`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LiquidHeader title="Update Project Steps" subtitle="Loading Workspace..." />
        <main className="max-w-[1000px] mx-auto px-4 pt-24 text-center">
          <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
            <FolderGit2 className="w-8 h-8 text-amber-500 mx-auto animate-pulse mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading step updates...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LiquidHeader title="Update Project Steps" subtitle="Workspace Not Found" />
        <main className="max-w-[1000px] mx-auto px-4 pt-24 text-center">
          <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-4">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Project Not Found</h2>
            <Button variant="primary" size="sm" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      <LiquidHeader
        title={`Update Steps: ${project.title}`}
        subtitle="Advance Step Lifecycles, Record What Was Done & Progress to 100%"
      />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 space-y-6">
        
        {/* Top Navigation: Strictly Back to Projects */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/projects')}
            className="text-xs font-bold"
          >
            Back to Projects
          </Button>

          <span className="text-xs font-bold text-slate-500">
            {project.category} Workspace
          </span>
        </div>

        {/* Live Dynamic Progress Banner */}
        <Card variant="glass" className="p-5 sm:p-6 border border-slate-200/90 shadow-xl bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                Calculated Completion to 100%
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{liveProgress.percent}% Overall Progress</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {liveProgress.completed} of {liveProgress.total} Steps Completed / Live
                </span>
              </h2>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddNewStep}
              className="text-emerald-800 border-emerald-200 hover:bg-emerald-50 font-bold self-start sm:self-auto"
            >
              + Add New Step
            </Button>
          </div>
        </Card>

        {/* Step Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const statusObj = getStepStatusObj(step.status);

              return (
                <Card
                  key={idx}
                  variant="glass"
                  className="p-5 sm:p-6 border border-slate-200/90 shadow-md bg-white space-y-4 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                        Step {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Milestone Deliverable
                      </span>
                    </div>

                    {/* Step Lifecycle Selector (7 user stages) */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                        Stage:
                      </label>
                      <select
                        value={step.status}
                        onChange={(e) => handleStepChange(idx, 'status', e.target.value)}
                        className={`px-3 py-1.5 text-xs font-black rounded-xl border cursor-pointer ${statusObj.color}`}
                      >
                        {STEP_LIFECYCLE_STAGES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ROW 1: Step Title, Start Date, End Date in SINGLE ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Step Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                        placeholder="Step Title"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Step Start Date
                      </label>
                      <input
                        type="date"
                        value={step.startDate || ''}
                        onChange={(e) => handleStepChange(idx, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Step End Date
                      </label>
                      <input
                        type="date"
                        value={step.endDate || ''}
                        onChange={(e) => handleStepChange(idx, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* ROW 2: Step Description in FULL ROW */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Deliverable Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Set up database indices, optimize aggregation pipeline"
                      value={step.description || ''}
                      onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>

                  {/* ROW 3: What Did We Do / Step Execution Notes in FULL ROW */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>What did we do? / Step Execution Notes</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Write accomplishments of this step</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write notes of what was accomplished in this step (e.g. Completed schema migrations, tested with 5,000 synthetic records...)"
                      value={step.notes || ''}
                      onChange={(e) => handleStepChange(idx, 'notes', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs resize-none"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Form Actions: Routes back strictly to /projects */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold"
            >
              {saving ? 'Submitting Updates...' : 'Submit & Save Step Updates'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
