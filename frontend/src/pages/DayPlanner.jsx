import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Clock, CheckCircle, Circle, Calendar as CalendarIcon, Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';

const DayPlanner = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Setup selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [modalTask, setModalTask] = useState({
    _id: null,
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/dayplanner');
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async () => {
    if (!modalTask.title) return;
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      if (modalTask._id) {
        // Update existing task
        await api.put(`/dayplanner/${modalTask._id}`, {
          title: modalTask.title,
          description: modalTask.description,
          startTime: modalTask.startTime,
          endTime: modalTask.endTime
        });
      } else {
        // Create new task
        await api.post('/dayplanner', {
          title: modalTask.title,
          description: modalTask.description,
          startTime: modalTask.startTime,
          endTime: modalTask.endTime,
          dateKey,
          status: 'created'
        });
      }
      setIsAddModalOpen(false);
      setModalTask({ _id: null, title: '', description: '', startTime: '09:00', endTime: '10:00' });
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const openAddModal = () => {
    setModalTask({ _id: null, title: '', description: '', startTime: '09:00', endTime: '10:00' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalTask({
      _id: task._id,
      title: task.title,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime
    });
    setIsAddModalOpen(true);
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/dayplanner/${taskToDelete._id}`);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    // Optimistic UI
    setTasks(prev => prev.map(t => 
      t._id === task._id ? { ...t, status: newStatus } : t
    ));
    try {
      await api.put(`/dayplanner/${task._id}`, {
        status: newStatus
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchTasks(); // Revert on failure
    }
  };

  const selectedDateKey = selectedDate.toISOString().split('T')[0];
  
  // Filter tasks for the selected date
  const todaysTasks = tasks.filter(t => t.dateKey === selectedDateKey).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Split into three buckets based on status (fallback to 'created' if missing)
  const getStatus = (t) => t.status || (t.completed ? 'completed' : 'created');
  const createdTasks = todaysTasks.filter(t => getStatus(t) === 'created');
  const notCompletedTasks = todaysTasks.filter(t => getStatus(t) === 'not_completed');
  const completedTasks = todaysTasks.filter(t => getStatus(t) === 'completed');

  const getDuration = (start, end) => {
    if (!start || !end) return "1h";
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const mins = (eH * 60 + eM) - (sH * 60 + sM);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const LeftPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-4 flex justify-center">
        {/* Mock Calendar Widget */}
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
      
      {createdTasks.length > 0 && (
        <div className="glass-panel p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <h3 className="text-sm font-semibold mb-1 text-indigo-400 uppercase tracking-wider">Next Up</h3>
          <p className="text-lg text-white font-bold mb-1">{createdTasks[0].title}</p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock size={14} className="text-indigo-400" />
            <span>{createdTasks[0].startTime} - {createdTasks[0].endTime}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderTaskCard = (task) => {
    const isCompleted = getStatus(task) === 'completed';
    return (
      <div key={task._id} className="glass-panel p-5 flex flex-col justify-between gap-4 min-h-[160px] hover:border-white/20 transition-colors border border-transparent group">
        <div className="flex flex-col gap-2">
          <h4 className={`text-lg font-semibold ${isCompleted ? 'line-through text-slate-300' : 'text-white'}`}>{task.title}</h4>
          {task.description && <p className="text-sm text-slate-300 m-0">{task.description}</p>}
          <span className="text-xs text-indigo-400 flex items-center gap-1 mt-1 font-medium bg-indigo-500/10 w-fit px-2 py-1 rounded-md">
            <Clock size={12} /> {task.startTime} - {task.endTime} ({getDuration(task.startTime, task.endTime)})
          </span>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-white/10 w-full justify-between mt-auto">
          <div className="flex gap-2 w-full">
            <button onClick={() => openEditModal(task)} className="bg-white/5 border border-white/10 hover:border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors p-2 rounded-xl flex items-center justify-center gap-1 flex-1 shadow-sm" title="Edit Task">
              <Pencil size={14} /> <span className="text-xs font-medium">Edit</span>
            </button>
            <button onClick={() => confirmDelete(task)} className="bg-white/5 border border-white/10 hover:border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors p-2 rounded-xl flex items-center justify-center gap-1 flex-1 shadow-sm" title="Delete Task">
              <Trash2 size={14} /> <span className="text-xs font-medium">Delete</span>
            </button>
          </div>
          <div className="flex gap-1 shrink-0">
            <button 
              onClick={() => updateTaskStatus(task, 'not_completed')} 
              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all border ${
                getStatus(task) === 'not_completed'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 cursor-default' 
                  : 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
              }`}
              title="Mark as Not Completed"
            >
              <X size={16} />
            </button>
            <button 
              onClick={() => updateTaskStatus(task, 'completed')} 
              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all border ${
                isCompleted 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 cursor-default' 
                  : 'bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
              title="Mark as Completed"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModuleLayout 
      title="Day Planner" 
      leftPanel={<LeftPanel />}
    >
      <div className="glass-panel p-6">
        
        {/* Header with Mobile Date Navigator */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-4 gap-4">
          <div className="w-full flex items-center justify-between md:hidden bg-white/5 p-2 rounded-xl mb-4">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400">&lt;</button>
            <span className="font-bold flex items-center gap-2">
              <CalendarIcon size={16} className="text-accent" />
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400">&gt;</button>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold hidden md:block">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <p className="text-slate-400 m-0">You have {createdTasks.length + notCompletedTasks.length} tasks pending today.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8 text-accent">Loading planner...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Create Task */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
                Created Tasks
              </h3>
              <div className="glass-panel p-4 flex flex-col items-center justify-center min-h-[80px] border-dashed border-2 hover:border-accent transition-colors cursor-pointer group" onClick={openAddModal}>
                <h4 className="font-bold text-md text-accent flex items-center gap-2"><span className="text-xl">+</span> Add New Task</h4>
              </div>
              {createdTasks.map(renderTaskCard)}
            </div>

            {/* Column 2: Not Completed */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400">
                <Circle size={18} className="text-red-400" /> Not Completed
              </h3>
              {notCompletedTasks.length > 0 ? (
                notCompletedTasks.map(renderTaskCard)
              ) : (
                <div className="text-center p-6 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
                  No tasks marked as not completed.
                </div>
              )}
            </div>

            {/* Column 3: Completed Tasks */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-400">
                <CheckCircle size={18} className="text-emerald-500" /> Completed
              </h3>
              {completedTasks.length > 0 ? (
                completedTasks.map(renderTaskCard)
              ) : (
                <div className="text-center p-6 text-slate-500 text-sm">
                  No completed tasks yet.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <GlassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={modalTask._id ? "Edit Task" : "Add New Task"}
        onSave={handleSaveTask}
        saveText="Save Task"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Task Name</label>
            <input 
              type="text" 
              value={modalTask.title}
              onChange={(e) => setModalTask({...modalTask, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="What needs to be done?" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Start Time</label>
              <input 
                type="time" 
                value={modalTask.startTime}
                onChange={(e) => setModalTask({...modalTask, startTime: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">End Time</label>
              <input 
                type="time" 
                value={modalTask.endTime}
                onChange={(e) => setModalTask({...modalTask, endTime: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description (Optional)</label>
            <textarea 
              value={modalTask.description}
              onChange={(e) => setModalTask({...modalTask, description: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors min-h-[100px]" 
              placeholder="Add details or notes..."
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
          <p className="text-slate-300">Are you sure you want to delete the task <strong>"{taskToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This action cannot be undone.</p>
        </div>
      </GlassModal>

    </ModuleLayout>
  );
};

export default DayPlanner;
