import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Check, X, Flame, Trophy, Calendar as CalendarIcon, Target, Pencil, Trash2, Dumbbell } from 'lucide-react';
import api from '../services/api';

const MyFitness = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fitnessData, setFitnessData] = useState([]);
  const [statsData, setStatsData] = useState({ overallPct: 0, currentStreak: 0, longestStreak: 0, totalDone: 0 });
  const [loading, setLoading] = useState(true);
  
  // Selected Date State
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State for Add/Edit
  const [modalFitness, setModalFitness] = useState({ _id: null, title: '', description: '' });
  
  // Delete Confirmation State
  const [fitnessToDelete, setFitnessToDelete] = useState(null);
  
  const [formError, setFormError] = useState('');

  const fetchFitness = async () => {
    try {
      const { data } = await api.get('/myfitness');
      setFitnessData(data.items);
      setStatsData(data.stats);
    } catch (error) {
      console.error("Failed to fetch fitness data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitness();
  }, []);

  const handleSaveFitness = async () => {
    if (!modalFitness.title.trim()) {
      setFormError('Exercise Name is required.');
      return;
    }
    setFormError('');
    try {
      if (modalFitness._id) {
        // Edit existing
        await api.put(`/myfitness/${modalFitness._id}`, {
          title: modalFitness.title,
          description: modalFitness.description
        });
      } else {
        // Create new
        await api.post('/myfitness', {
          title: modalFitness.title,
          description: modalFitness.description,
          tracking: {}
        });
      }
      setIsAddModalOpen(false);
      setModalFitness({ _id: null, title: '', description: '' });
      fetchFitness();
    } catch (error) {
      console.error("Failed to save exercise:", error);
    }
  };

  const openAddModal = () => {
    setFormError('');
    setModalFitness({ _id: null, title: '', description: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (fitness) => {
    setFormError('');
    setModalFitness({ _id: fitness._id, title: fitness.title, description: fitness.description });
    setIsAddModalOpen(true);
  };

  const confirmDelete = (fitness) => {
    setFitnessToDelete(fitness);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!fitnessToDelete) return;
    try {
      await api.delete(`/myfitness/${fitnessToDelete._id}`);
      setIsDeleteModalOpen(false);
      setFitnessToDelete(null);
      fetchFitness();
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const toggleFitnessDay = async (fitness, status) => {
    // status should be true (done) or false (not done)
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    // Check current status
    const currentStatus = fitness.tracking ? fitness.tracking[dateKey] : undefined;
    let nextStatus = status;
    
    // If clicking the same button that is already active, unselect it (clear tracking for that day)
    if (currentStatus === status) {
      nextStatus = undefined;
    }

    // Optimistic UI Update
    setFitnessData(prev => prev.map(f => {
      if (f._id === fitness._id) {
        return {
          ...f,
          tracking: { ...f.tracking, [dateKey]: nextStatus }
        };
      }
      return f;
    }));

    try {
      await api.put(`/myfitness/${fitness._id}`, {
        tracking: { ...fitness.tracking, [dateKey]: nextStatus }
      });
      // Refresh to update stats from backend
      fetchFitness();
    } catch (error) {
      console.error("Failed to update tracking:", error);
      fetchFitness(); // Revert on failure
    }
  };

  // Calendar Left Panel
  const LeftPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-4 flex justify-center">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setMonth(d.getMonth() - 1);
                  setSelectedDate(d);
                }} 
                className="p-1 hover:bg-white/10 rounded"
              >&lt;</button>
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setMonth(d.getMonth() + 1);
                  setSelectedDate(d);
                }}
                className="p-1 hover:bg-white/10 rounded"
              >&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()}, (_, i) => {
              const day = i + 1;
              const isSelected = selectedDate.getDate() === day;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(day);
                    setSelectedDate(d);
                  }}
                  className={`p-1 rounded cursor-pointer transition-colors ${isSelected ? 'bg-accent text-white font-bold' : 'hover:bg-white/10'}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  // Calculate Daily Stats
  let dailyCompleted = 0;
  let dailyTotal = fitnessData.length;
  
  fitnessData.forEach(f => {
    if (f.tracking && f.tracking[selectedDateKey] === true) {
      dailyCompleted++;
    }
  });

  const dailyPct = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;

  return (
    <ModuleLayout 
      title="My Fitness" 
      leftPanel={<LeftPanel />}
      onAdd={openAddModal}
      addText="Add Exercise"
    >
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <p className="text-slate-400 m-0">Daily Exercise Checklist</p>
        </div>
      </div>

      {/* Summary Stats at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 m-0">Overall</p>
            <h3 className="text-2xl font-bold m-0">{statsData.overallPct}%</h3>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 m-0">Current Streak</p>
            <h3 className="text-2xl font-bold m-0">{statsData.currentStreak} Days</h3>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 m-0">Longest Streak</p>
            <h3 className="text-2xl font-bold m-0">{statsData.longestStreak} Days</h3>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 m-0">Total Done</p>
            <h3 className="text-2xl font-bold m-0">{statsData.totalDone}</h3>
          </div>
        </div>
      </div>

      {/* Daily Pie Chart */}
      <div className="glass-panel p-6 mb-8 flex flex-col items-center justify-center relative">
        <h3 className="text-lg font-semibold mb-6 w-full border-b border-white/10 pb-3 flex items-center gap-2 justify-center">
          <Dumbbell size={18} className="text-accent" />
          Daily Completion Rate
        </h3>
        <div className="relative w-40 h-40 rounded-full border-4 border-white/5 flex items-center justify-center shadow-lg">
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#6366f1 0% ${dailyPct}%, rgba(255,255,255,0.05) ${dailyPct}% 100%)`,
              opacity: 0.9
            }}
          />
          <div className="absolute inset-2 rounded-full bg-[#0f172a] flex items-center justify-center z-10 shadow-inner">
            <span className="text-2xl font-bold">{dailyPct}%</span>
          </div>
        </div>
        <p className="text-slate-400 mt-4">{dailyCompleted} of {dailyTotal} exercises completed</p>
      </div>

      {/* Daily 3-Column Tracker Grid */}
      <div className="glass-panel p-6">
        {loading ? (
          <div className="text-center p-8 text-accent">Loading exercises...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-4 pb-2 border-b border-white/10 text-slate-400 font-semibold px-4">
              <div>Exercise</div>
              <div className="text-center">Done</div>
              <div className="text-center">Not Done</div>
            </div>
            
            {/* Rows */}
            {fitnessData.map((fitness) => {
              const isDone = fitness.tracking && fitness.tracking[selectedDateKey] === true;
              const isNotDone = fitness.tracking && fitness.tracking[selectedDateKey] === false;

              return (
                <div key={fitness._id} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-transparent hover:border-white/10 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>{fitness.title || fitness.name || fitness.type}</span>
                      {fitness.description && <span className="text-xs text-slate-400">{fitness.description}</span>}
                    </div>
                    <div className="flex gap-2 shrink-0 pr-4">
                      <button onClick={() => openEditModal(fitness)} className="text-blue-400 hover:text-blue-300 transition-colors p-1.5 hover:bg-blue-500/10 rounded-lg" title="Edit Exercise">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => confirmDelete(fitness)} className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-500/20 rounded-lg" title="Delete Exercise">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Done Column */}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleFitnessDay(fitness, true)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isDone 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-emerald-400'
                      }`}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                  
                  {/* Not Done Column */}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleFitnessDay(fitness, false)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isNotDone 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-red-400'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })}

            {fitnessData.length === 0 && (
              <div className="text-center p-8 text-slate-400 border border-dashed border-white/10 rounded-xl">
                No exercises added yet. Click "Add Exercise" to get started!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Fitness Modal */}
      <GlassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={modalFitness._id ? "Edit Exercise" : "Add New Exercise"}
        onSave={handleSaveFitness}
        saveText="Save Exercise"
        error={formError}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Exercise Name</label>
            <input 
              type="text" 
              value={modalFitness.title}
              onChange={(e) => setModalFitness({...modalFitness, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. 50 Pushups" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description (Optional)</label>
            <textarea 
              value={modalFitness.description}
              onChange={(e) => setModalFitness({...modalFitness, description: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors min-h-[100px]" 
              placeholder="Add details or motivation for this exercise..."
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
          <p className="text-slate-300">Are you sure you want to delete the exercise <strong>"{fitnessToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This action cannot be undone and will erase all tracking history for this exercise.</p>
        </div>
      </GlassModal>

    </ModuleLayout>
  );
};

export default MyFitness;
