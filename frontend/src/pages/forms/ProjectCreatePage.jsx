import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import {
  FolderGit2,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Calendar as CalendarIcon,
  ListChecks,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ['Engineering', 'DevOps', 'Design', 'Product', 'Research', 'Personal'];

export default function ProjectCreatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    startDate: todayStr,
    deadline: nextMonthStr,
    steps: [
      {
        title: '',
        description: '',
        startDate: todayStr,
        endDate: nextMonthStr,
        status: 'pending',
        notes: ''
      }
    ]
  });

  const [formErrors, setFormErrors] = useState({});

  // If in Edit mode, fetch existing project data
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const json = await res.json();
          const proj = json.data;
          if (isMounted && proj) {
            setFormData({
              title: proj.title || '',
              description: proj.description || '',
              category: proj.category || 'Engineering',
              startDate: proj.startDate || todayStr,
              deadline: proj.deadline || nextMonthStr,
              steps: proj.steps && proj.steps.length > 0
                ? proj.steps.map((s) => ({
                    title: s.title || '',
                    description: s.description || '',
                    startDate: s.startDate || proj.startDate || todayStr,
                    endDate: s.endDate || proj.deadline || nextMonthStr,
                    status: s.status || 'pending',
                    notes: s.notes || ''
                  }))
                : [
                    {
                      title: '',
                      description: '',
                      startDate: proj.startDate || todayStr,
                      endDate: proj.deadline || nextMonthStr,
                      status: 'pending',
                      notes: ''
                    }
                  ]
            });
          }
        }
      } catch (err) {
        console.error('Failed to load project for edit:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProject();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit, todayStr, nextMonthStr]);

  // Add a Step (Only placeholders, no prefilled data)
  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: '',
          description: '',
          startDate: prev.startDate,
          endDate: prev.deadline,
          status: 'pending',
          notes: ''
        }
      ]
    }));
  };

  // Remove a Step
  const handleRemoveStep = (idx) => {
    if (formData.steps.length <= 1) {
      addToast('Project must have at least one step', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  // Update a Step
  const handleUpdateStep = (idx, field, val) => {
    setFormData((prev) => {
      const updated = [...prev.steps];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, steps: updated };
    });
  };

  // Validate Form
  const validateForm = () => {
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

  // Submit Form (Routes back strictly to /projects)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const completedSteps = formData.steps.filter((s) =>
      ['completed', 'testing_completed', 'live'].includes(s.status)
    ).length;

    const progress = formData.steps.length > 0
      ? Math.round((completedSteps / formData.steps.length) * 100)
      : 0;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      status: progress === 100 ? 'completed' : 'in_progress',
      progress,
      tasksTotal: formData.steps.length,
      tasksCompleted: completedSteps,
      startDate: formData.startDate,
      deadline: formData.deadline,
      steps: formData.steps
    };

    try {
      const url = isEdit ? `/api/projects/${id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(
          isEdit
            ? `Successfully updated project "${payload.title}"! 🚀`
            : `Created project "${payload.title}" with ${formData.steps.length} steps! 🚀`,
          'success'
        );
        navigate('/projects');
      } else {
        const errData = await res.json().catch(() => null);
        addToast(`Failed to save project to database: ${errData?.message || res.status}`, 'error');
      }
    } catch (err) {
      addToast(`Database error: Unable to save project (${err.message})`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <LiquidHeader title="Loading Project" subtitle="Fetching project form data..." />
        <main className="max-w-[1000px] mx-auto px-4 pt-24 text-center">
          <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
            <FolderGit2 className="w-8 h-8 text-amber-500 mx-auto animate-pulse mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading project details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 selection:bg-amber-100 selection:text-amber-900">
      <LiquidHeader
        title={isEdit ? 'Edit Project Profile' : 'Create New Project'}
        subtitle="Define Project Profile, Scope & Execution Step Milestones"
      />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24 space-y-6">
        
        {/* Top Back Action: Strictly routes back to /projects */}
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {formData.steps.length} Steps Defined
            </span>
          </div>
        </div>

        {/* Project Form Card */}
        <Card variant="glass" className="p-5 sm:p-8 border border-slate-200/90 shadow-xl bg-white space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 shrink-0">
              <FolderGit2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isEdit ? 'Edit Project Workspace & Steps' : 'Project Profile & Step Builder'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Set up title, project type, dates, and milestones. Each step counts toward 100% progress.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Information (Priority completely removed) */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>01. Project Profile</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Task Queue & Realtime Worker Fleet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
                {formErrors.title && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Clean 3-Column Layout: Project Type, Start Date, End Date (No Priority) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Deadline)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description & Objectives
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key project deliverables, architecture, and expected outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Section 2: Steps & Deliverables Builder */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>02. Step Milestones</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Each step has title and dates in one row, and full description at the end.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddStep}
                  className="text-amber-800 border-amber-200 hover:bg-amber-50 font-bold"
                >
                  + Add Step
                </Button>
              </div>

              {formErrors.steps && (
                <p className="text-xs text-rose-500 font-semibold">{formErrors.steps}</p>
              )}

              {/* Steps List */}
              <div className="space-y-4">
                {formData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {/* Step Card Header */}
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
                      <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg">
                        Step {idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* ROW 1: Step Title, Start Date, End Date in a SINGLE ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Step Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Database Schema & Migration"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Step Start Date
                        </label>
                        <input
                          type="date"
                          value={step.startDate}
                          onChange={(e) => handleUpdateStep(idx, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Step End Date
                        </label>
                        <input
                          type="date"
                          value={step.endDate}
                          onChange={(e) => handleUpdateStep(idx, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* ROW 2 (AT LAST): Step Description in a FULL ROW (not half) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Step Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Implement schema with compound indices, define Mongoose models and migrations"
                        value={step.description}
                        onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions: Routes back strictly to /projects */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                icon={CheckCircle2}
                disabled={submitting}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 font-bold"
              >
                {submitting
                  ? isEdit ? 'Updating Project...' : 'Creating Project...'
                  : isEdit ? 'Update Project Profile' : 'Create Project Profile'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
