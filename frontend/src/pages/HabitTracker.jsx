import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Check, X, Flame, Trophy, Calendar as CalendarIcon, Target, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

const HabitTracker = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitData, setHabitData] = useState([]);
  const [statsData, setStatsData] = useState({ overallPct: 0, currentStreak: 0, longestStreak: 0, totalDone: 0 });
  const [loading, setLoading] = useState(true);
  
  // Selected Date State
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State for Add/Edit
  const [modalHabit, setModalHabit] = useState({ _id: null, title: '', description: '' });
  
  // Delete Confirmation State
  const [habitToDelete, setHabitToDelete] = useState(null);
  
  const [formError, setFormError] = useState('');

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habittracker');
      setHabitData(data.items);
      setStatsData(data.stats);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleSaveHabit = async () => {
    if (!modalHabit.title.trim()) {
      setFormError('Habit Name is required.');
      return;
    }
    setFormError('');
    try {
      if (modalHabit._id) {
        // Edit existing
        await api.put(`/habittracker/${modalHabit._id}`, {
          title: modalHabit.title,
          description: modalHabit.description
        });
      } else {
        // Create new
        await api.post('/habittracker', {
          title: modalHabit.title,
          description: modalHabit.description,
          tracking: {}
        });
      }
      setIsAddModalOpen(false);
      setModalHabit({ _id: null, title: '', description: '' });
      fetchHabits();
    } catch (error) {
      console.error("Failed to save habit:", error);
    }
  };

  const openAddModal = () => {
    setFormError('');
    setModalHabit({ _id: null, title: '', description: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (habit) => {
    setFormError('');
    setModalHabit({ _id: habit._id, title: habit.title, description: habit.description });
    setIsAddModalOpen(true);
  };

  const confirmDelete = (habit) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!habitToDelete) return;
    try {
      await api.delete(`/habittracker/${habitToDelete._id}`);
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
      fetchHabits();
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const toggleHabitDay = async (habit, status) => {
    // status should be true (done) or false (not done)
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    // Check current status
    const currentStatus = habit.tracking ? habit.tracking[dateKey] : undefined;
    let nextStatus = status;
    
    // If clicking the same button that is already active, unselect it (clear tracking for that day)
    if (currentStatus === status) {
      nextStatus = undefined;
    }

    // Optimistic UI Update
    setHabitData(prev => prev.map(h => {
      if (h._id === habit._id) {
        return {
          ...h,
          tracking: { ...h.tracking, [dateKey]: nextStatus }
        };
      }
      return h;
    }));

    try {
      await api.put(`/habittracker/${habit._id}`, {
        tracking: { ...habit.tracking, [dateKey]: nextStatus }
      });
      // Refresh to update stats from backend
      fetchHabits();
    } catch (error) {
      console.error("Failed to update tracking:", error);
      fetchHabits(); // Revert on failure
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
  let dailyTotal = habitData.length;
  
  habitData.forEach(h => {
    if (h.tracking && h.tracking[selectedDateKey] === true) {
      dailyCompleted++;
    }
  });

  const dailyPct = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;

  // Stats are fetched from backend (statsData)

  return (
    <ModuleLayout 
      title="Habit Tracker" 
      leftPanel={<LeftPanel />}
      onAdd={openAddModal}
      addText="Add Habit"
    >
      
      {/* Header removed unnecessary elements */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <p className="text-slate-400 m-0">Daily Habit Checklist</p>
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
          <Target size={18} className="text-accent" />
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
        <p className="text-slate-400 mt-4">{dailyCompleted} of {dailyTotal} habits completed</p>
      </div>

      {/* Daily 3-Column Tracker Grid */}
      <div className="glass-panel p-6">
        {loading ? (
          <div className="text-center p-8 text-accent">Loading habits...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-4 pb-2 border-b border-white/10 text-slate-400 font-semibold px-4">
              <div>Habit</div>
              <div className="text-center">Done</div>
              <div className="text-center">Not Done</div>
            </div>
            
            {/* Rows */}
            {habitData.map((habit) => {
              const isDone = habit.tracking && habit.tracking[selectedDateKey] === true;
              const isNotDone = habit.tracking && habit.tracking[selectedDateKey] === false;

              return (
                <div key={habit._id} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl border border-transparent hover:border-white/10 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>{habit.title}</span>
                      {habit.description && <span className="text-xs text-slate-400">{habit.description}</span>}
                    </div>
                    <div className="flex gap-2 shrink-0 pr-4">
                      <button onClick={() => openEditModal(habit)} className="text-blue-400 hover:text-blue-300 transition-colors p-1.5 hover:bg-blue-500/10 rounded-lg" title="Edit Habit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => confirmDelete(habit)} className="text-red-400 hover:text-red-300 transition-colors p-1.5 hover:bg-red-500/20 rounded-lg" title="Delete Habit">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Done Column */}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleHabitDay(habit, true)}
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
                      onClick={() => toggleHabitDay(habit, false)}
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

            {habitData.length === 0 && (
              <div className="text-center p-8 text-slate-400 border border-dashed border-white/10 rounded-xl">
                No habits added yet. Click "Add Habit" to get started!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Habit Modal */}
      <GlassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={modalHabit._id ? "Edit Habit" : "Add New Habit"}
        onSave={handleSaveHabit}
        saveText="Save Habit"
        error={formError}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Habit Name</label>
            <input 
              type="text" 
              value={modalHabit.title}
              onChange={(e) => setModalHabit({...modalHabit, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Read 10 pages" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description (Optional)</label>
            <textarea 
              value={modalHabit.description}
              onChange={(e) => setModalHabit({...modalHabit, description: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors min-h-[100px]" 
              placeholder="Add details or motivation for this habit..."
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
          <p className="text-slate-300">Are you sure you want to delete the habit <strong>"{habitToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This action cannot be undone and will erase all tracking history for this habit.</p>
        </div>
      </GlassModal>

    </ModuleLayout>
  );
};

export default HabitTracker;
