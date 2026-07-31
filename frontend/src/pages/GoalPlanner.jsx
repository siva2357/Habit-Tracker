import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Target, Flag, Circle, CheckCircle, TrendingUp, MoreVertical, ChevronDown, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../services/api';

const GoalPlanner = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [goalStats, setGoalStats] = useState({ pendingGoalsCount: 0, completedGoalsCount: 0, notCompletedGoalsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeleteProgressModalOpen, setIsDeleteProgressModalOpen] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState(null);

  const [newGoal, setNewGoal] = useState({
    _id: null,
    title: '',
    target: '',
    targetDate: '',
    description: '',
    status: 'Pending',
    color: 'bg-[#3b82f6]' // Default color
  });

  const [progressUpdate, setProgressUpdate] = useState({
    goalId: null,
    progressIndex: null,
    title: '',
    description: ''
  });

  const [openGoal, setOpenGoal] = useState(null);

  const colors = ["bg-[#3b82f6]", "bg-[#10b981]", "bg-[#ec4899]", "bg-[#8b5cf6]", "bg-[#f59e0b]", "bg-[#14b8a6]"];

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goalplanner');
      // Assign persistent mock colors based on ID length or index if color is not in DB schema natively
      const goalsWithColors = (data.items || []).map((g, i) => ({
        ...g,
        color: colors[i % colors.length]
      }));
      setGoals(goalsWithColors);
      if (data.stats) {
        setGoalStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoal = async () => {
    if (!newGoal.title || !newGoal.target) return;
    try {
      if (newGoal._id) {
        // Edit existing goal
        await api.put(`/goalplanner/${newGoal._id}`, {
          title: newGoal.title,
          target: newGoal.target,
          targetDate: newGoal.targetDate || new Date().toISOString().split('T')[0],
          description: newGoal.description,
          status: newGoal.status
        });
      } else {
        // Create new goal
        await api.post('/goalplanner', {
          title: newGoal.title,
          target: newGoal.target,
          targetDate: newGoal.targetDate || new Date().toISOString().split('T')[0],
          description: newGoal.description,
          status: newGoal.status,
          progressHistory: []
        });
      }
      setIsAddModalOpen(false);
      setNewGoal({ _id: null, title: '', target: '', targetDate: '', description: '', status: 'Pending', color: 'bg-[#3b82f6]' });
      fetchGoals();
    } catch (error) {
      console.error("Failed to save goal:", error);
    }
  };

  const openAddModal = () => {
    setNewGoal({ _id: null, title: '', target: '', targetDate: '', description: '', status: 'Pending', color: 'bg-[#3b82f6]' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (goal) => {
    setNewGoal({
      _id: goal._id,
      title: goal.title,
      target: goal.target,
      targetDate: goal.targetDate || '',
      description: goal.description || '',
      status: goal.status || 'Pending',
      color: goal.color
    });
    setIsAddModalOpen(true);
  };

  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!goalToDelete) return;
    try {
      await api.delete(`/goalplanner/${goalToDelete._id}`);
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleAddProgress = async () => {
    if (!progressUpdate.goalId) return;
    const goalToUpdate = goals.find(g => g._id === progressUpdate.goalId);
    if (!goalToUpdate) return;

    let updatedHistory = [...(goalToUpdate.progressHistory || [])];
    
    const newHistoryEntry = {
      title: progressUpdate.title || 'Update',
      description: progressUpdate.description,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    if (progressUpdate.progressIndex !== null && progressUpdate.progressIndex !== undefined) {
      newHistoryEntry.date = updatedHistory[progressUpdate.progressIndex].date || newHistoryEntry.date;
      updatedHistory[progressUpdate.progressIndex] = newHistoryEntry;
    } else {
      updatedHistory.push(newHistoryEntry);
    }

    try {
      await api.put(`/goalplanner/${goalToUpdate._id}`, {
        progressHistory: updatedHistory
      });
      setIsProgressModalOpen(false);
      setProgressUpdate({ goalId: null, progressIndex: null, title: '', description: '' });
      fetchGoals();
    } catch (error) {
      console.error("Failed to add progress:", error);
    }
  };

  const openEditProgressModal = (goal, progress, index) => {
    setProgressUpdate({
      goalId: goal._id,
      progressIndex: index,
      title: progress.title,
      description: progress.description
    });
    setIsProgressModalOpen(true);
  };

  const confirmDeleteProgress = (goal, progressIndex) => {
    setProgressToDelete({ goal, progressIndex });
    setIsDeleteProgressModalOpen(true);
  };

  const executeDeleteProgress = async () => {
    if (!progressToDelete) return;
    const { goal, progressIndex } = progressToDelete;
    
    const updatedHistory = [...goal.progressHistory];
    updatedHistory.splice(progressIndex, 1);
    
    try {
      await api.put(`/goalplanner/${goal._id}`, { progressHistory: updatedHistory });
      setIsDeleteProgressModalOpen(false);
      setProgressToDelete(null);
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete progress:", error);
    }
  };

  const updateGoalStatus = async (goal, newStatus) => {
    // Optimistic UI
    setGoals(prev => prev.map(g =>
      g._id === goal._id ? { ...g, status: newStatus } : g
    ));
    try {
      await api.put(`/goalplanner/${goal._id}`, {
        status: newStatus
      });
      fetchGoals(); // To update stats
    } catch (error) {
      console.error("Failed to update goal status:", error);
      fetchGoals(); // Revert on failure
    }
  };

  const openProgressModalForGoal = (goal) => {
    setProgressUpdate({ goalId: goal._id, progressIndex: null, title: '', description: '' });
    setIsProgressModalOpen(true);
  };

  // Use stats from API
  const { pendingGoalsCount, completedGoalsCount, notCompletedGoalsCount } = goalStats;

  return (
    <ModuleLayout
      title="Goal Planner"
      onAdd={openAddModal}
      addText="Add Goal"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-2">
            <Target size={24} />
          </div>
          <h3 className="text-3xl font-bold">{pendingGoalsCount}</h3>
          <p className="text-slate-400">Pending</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-3xl font-bold">{completedGoalsCount}</h3>
          <p className="text-slate-400">Completed</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-2">
            <Circle size={24} />
          </div>
          <h3 className="text-3xl font-bold">{notCompletedGoalsCount}</h3>
          <p className="text-slate-400">Not Completed</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center p-8 text-accent">Loading goals...</div>
        ) : goals.map((goal, idx) => {
          const isOpen = openGoal === idx;
          return (
            <div key={goal._id} className="glass-panel p-6 flex flex-col transition-all relative">

              {/* Accordion Header */}
              <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer pr-8"
                onClick={() => setOpenGoal(isOpen ? null : idx)}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{goal.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${goal.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        goal.status === 'Not Completed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          'bg-accent/10 border-accent/20 text-accent'
                      }`}>{goal.status}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(goal); }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors"
                        title="Edit Goal"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(goal); }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">Target: <span className="text-white font-medium">{goal.target}</span> <span className="mx-2 opacity-30">•</span> Deadline: <span className="text-white font-medium">{goal.targetDate}</span></p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end md:justify-start">
                  <ChevronDown size={20} className={`shrink-0 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Accordion Body */}
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100 mt-6 pt-6 border-t border-white/10' : 'max-h-0 opacity-0'}`}>
                <div className="w-full flex flex-col gap-6">
                  {/* Goal Description */}
                  {goal.description && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
                      <p className="text-slate-400 text-sm whitespace-pre-wrap">{goal.description}</p>
                    </div>
                  )}

                  {/* Progress Updates */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><TrendingUp size={16} className="text-accent" /> Progress History</h4>
                      <button onClick={(e) => { e.stopPropagation(); openProgressModalForGoal(goal); }} className="text-xs bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-accent/20">
                        <Plus size={14} /> Add Progress
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goal.progressHistory && goal.progressHistory.map((p, i) => (
                        <div key={i} className="glass-panel p-4 flex flex-col justify-between gap-4 group hover:border-white/20 transition-colors bg-[#0f172a]/30">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-semibold text-white mb-0.5">{p.title}</h5>
                              <span className="text-xs text-slate-300 font-medium whitespace-nowrap mt-1">{p.date || 'Just now'}</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-snug">{p.description}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditProgressModal(goal, p, i); }} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit Log">
                              <Pencil size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); confirmDeleteProgress(goal, i); }} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Delete Log">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!goal.progressHistory || goal.progressHistory.length === 0) && (
                        <div className="text-center p-6 glass-panel border-dashed border-white/10 md:col-span-2">
                          <p className="text-sm text-slate-400">No progress updates yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && goals.length === 0 && (
          <div className="text-center p-8 text-slate-400">
            No goals planned yet. Click "Add Goal" to get started!
          </div>
        )}
      </div>

      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={newGoal._id ? "Edit Goal" : "Create New Goal"}
        onSave={handleSaveGoal}
        saveText={newGoal._id ? "Update Goal" : "Save Goal"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Goal Name</label>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              placeholder="e.g. Learn React Native"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Target</label>
            <input
              type="text"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              placeholder="e.g. Build 3 Apps"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Target Date</label>
            <input
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description</label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors min-h-[100px]"
              placeholder="Add details or notes..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Status</label>
            <select
              value={newGoal.status}
              onChange={(e) => setNewGoal({ ...newGoal, status: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Not Completed">Not Completed</option>
            </select>
          </div>

        </div>
      </GlassModal>

      <GlassModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Add Progress Update"
        onSave={handleAddProgress}
        saveText="Save Progress"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Title</label>
            <input
              type="text"
              value={progressUpdate.title}
              onChange={(e) => setProgressUpdate({ ...progressUpdate, title: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              placeholder="e.g. Completed Phase 1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description</label>
            <textarea
              value={progressUpdate.description}
              onChange={(e) => setProgressUpdate({ ...progressUpdate, description: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors min-h-[100px]"
              placeholder="What did you achieve?"
            ></textarea>
          </div>
        </div>
      </GlassModal>

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        onSave={executeDelete}
        saveText="Yes, Delete"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to delete the goal <strong>"{goalToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This will also delete all associated progress history.</p>
        </div>
      </GlassModal>
    </ModuleLayout>
  );
};

export default GoalPlanner;
