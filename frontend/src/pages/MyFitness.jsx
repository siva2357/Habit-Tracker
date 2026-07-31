import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Dumbbell, Activity, Flame, Timer, Play, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

const MyFitness = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState('Walking');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  const [newWorkout, setNewWorkout] = useState({
    _id: null,
    name: '',
    duration: '',
    calories: 0,
    steps: 0,
    sets: 0,
    reps: 0
  });

  const fetchWorkouts = async () => {
    try {
      const { data } = await api.get('/myfitness');
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleAddWorkout = async () => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const payload = {
        type: workoutType,
        name: newWorkout.name || workoutType,
        duration: newWorkout.duration || '30m',
        calories: Number(newWorkout.calories) || 0,
        steps: Number(newWorkout.steps) || 0,
        sets: Number(newWorkout.sets) || 0,
        reps: Number(newWorkout.reps) || 0,
        date: dateKey
      };
      if (newWorkout._id) {
        await api.put(`/myfitness/${newWorkout._id}`, payload);
      } else {
        await api.post('/myfitness', payload);
      }
      setIsAddModalOpen(false);
      setNewWorkout({ _id: null, name: '', duration: '', calories: 0, steps: 0, sets: 0, reps: 0 });
      fetchWorkouts();
    } catch (error) {
      console.error("Failed to save workout:", error);
    }
  };

  const openAddModal = () => {
    setNewWorkout({ _id: null, name: '', duration: '', calories: 0, steps: 0, sets: 0, reps: 0 });
    setWorkoutType('Walking');
    setIsAddModalOpen(true);
  };

  const openEditModal = (w) => {
    setNewWorkout({
      _id: w._id,
      name: w.name,
      duration: w.duration,
      calories: w.calories || 0,
      steps: w.steps || 0,
      sets: w.sets || 0,
      reps: w.reps || 0
    });
    setWorkoutType(w.type);
    setIsAddModalOpen(true);
  };

  const confirmDeleteWorkout = (w) => {
    setWorkoutToDelete(w);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    try {
      await api.delete(`/myfitness/${workoutToDelete._id}`);
      setIsDeleteModalOpen(false);
      setWorkoutToDelete(null);
      fetchWorkouts();
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const selectedDateKey = selectedDate.toISOString().split('T')[0];
  const todaysWorkouts = workouts.filter(w => w.date === selectedDateKey);

  // Stats calculation
  const totalCalories = workouts.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalWorkouts = workouts.length;
  // Approximation for active time based on 'm' and 'h' parsing
  const totalMinutes = workouts.reduce((acc, curr) => {
    if (!curr.duration) return acc;
    let mins = 0;
    if (curr.duration.includes('h')) {
      const parts = curr.duration.split('h');
      mins += parseInt(parts[0]) * 60;
      if (parts[1] && parts[1].includes('m')) {
        mins += parseInt(parts[1]);
      }
    } else if (curr.duration.includes('m')) {
      mins += parseInt(curr.duration);
    }
    return acc + mins;
  }, 0);
  const activeHours = Math.floor(totalMinutes / 60);
  const activeMins = totalMinutes % 60;
  
  const totalVolume = workouts.reduce((acc, curr) => acc + ((curr.sets || 0) * (curr.reps || 0) * 10), 0); // Mock weight 10kg

  const LeftPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-4 flex justify-center">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <div className="flex gap-2">
              <button onClick={() => {
                const d = new Date(selectedDate);
                d.setMonth(d.getMonth() - 1);
                setSelectedDate(d);
              }} className="p-1 hover:bg-white/10 rounded">&lt;</button>
              <button onClick={() => {
                const d = new Date(selectedDate);
                d.setMonth(d.getMonth() + 1);
                setSelectedDate(d);
              }} className="p-1 hover:bg-white/10 rounded">&gt;</button>
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

  return (
    <ModuleLayout 
      title="My Fitness" 
      leftPanel={<LeftPanel />}
      onAdd={openAddModal}
      addText="Log Workout"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-2">
            <Flame size={24} />
          </div>
          <p className="text-sm text-slate-400">Total Calories</p>
          <h3 className="text-2xl font-bold">{totalCalories.toLocaleString()}</h3>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
            <Timer size={24} />
          </div>
          <p className="text-sm text-slate-400">Active Time</p>
          <h3 className="text-2xl font-bold">{activeHours}h {activeMins}m</h3>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2">
            <Activity size={24} />
          </div>
          <p className="text-sm text-slate-400">Total Workouts</p>
          <h3 className="text-2xl font-bold">{totalWorkouts}</h3>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center mb-2">
            <Dumbbell size={24} />
          </div>
          <p className="text-sm text-slate-400">Est. Volume</p>
          <h3 className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}k kg</h3>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <p className="text-slate-400 m-0">You logged {todaysWorkouts.length} workouts today.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center p-8 text-accent">Loading...</div>
          ) : todaysWorkouts.map((w) => (
            <div key={w._id} className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{w.name}</h4>
                  <p className="text-sm text-slate-400">{w.type} • {w.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {w.type === 'Walking' ? (
                  <>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Steps</span>
                      <span className="font-bold text-accent text-lg">{w.steps || 0}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Calories</span>
                      <span className="font-bold text-orange-400 text-lg">{w.calories || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Sets</span>
                      <span className="font-bold text-emerald-400 text-lg">{w.sets || 0}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500 text-xs uppercase tracking-wider">Reps</span>
                      <span className="font-bold text-purple-400 text-lg">{w.reps || 0}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                   <button onClick={() => openEditModal(w)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors" title="Edit Workout">
                     <Pencil size={16} />
                   </button>
                   <button onClick={() => confirmDeleteWorkout(w)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors" title="Delete Workout">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && todaysWorkouts.length === 0 && (
            <div className="text-center p-6 text-slate-400 border border-dashed border-white/10 rounded-xl">
              No workouts logged for this date.
            </div>
          )}
        </div>
      </div>

      <GlassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={newWorkout._id ? "Edit Workout" : "Log Workout"}
        onSave={handleAddWorkout}
        saveText={newWorkout._id ? "Update Workout" : "Save Workout"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Workout Type</label>
            <select 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
            >
              <option className="bg-[#0f172a]" value="Walking">Walking</option>
              <option className="bg-[#0f172a]" value="Weight Training">Weight Training</option>
              <option className="bg-[#0f172a]" value="Bodyweight">Bodyweight</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Duration</label>
            <input 
              type="text" 
              value={newWorkout.duration}
              onChange={e => setNewWorkout({...newWorkout, duration: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. 45m or 1h 30m" 
            />
          </div>

          {workoutType === 'Walking' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400">Steps</label>
                <input 
                  type="number" 
                  value={newWorkout.steps}
                  onChange={e => setNewWorkout({...newWorkout, steps: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                  placeholder="e.g. 5000" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400">Calories Burned</label>
                <input 
                  type="number" 
                  value={newWorkout.calories}
                  onChange={e => setNewWorkout({...newWorkout, calories: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                  placeholder="e.g. 320" 
                />
              </div>
            </div>
          )}

          {(workoutType === 'Weight Training' || workoutType === 'Bodyweight') && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400">Exercise Name</label>
                <input 
                  type="text" 
                  value={newWorkout.name}
                  onChange={e => setNewWorkout({...newWorkout, name: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                  placeholder={workoutType === 'Weight Training' ? "e.g. Bench Press" : "e.g. Pushups"} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-400">Sets</label>
                  <input 
                    type="number" 
                    value={newWorkout.sets}
                    onChange={e => setNewWorkout({...newWorkout, sets: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                    placeholder="e.g. 3" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-400">Reps</label>
                  <input 
                    type="number" 
                    value={newWorkout.reps}
                    onChange={e => setNewWorkout({...newWorkout, reps: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                    placeholder="e.g. 12" 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </GlassModal>

      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        onSave={executeDeleteWorkout}
        saveText="Yes, Delete Workout"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to delete <strong>"{workoutToDelete?.name}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This action cannot be undone.</p>
        </div>
      </GlassModal>
    </ModuleLayout>
  );
};

export default MyFitness;
