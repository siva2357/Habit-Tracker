import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Briefcase, Clock, CheckCircle, ChevronDown, Plus, Pencil, Trash2, Circle } from 'lucide-react';
import api from '../services/api';

const MyProjects = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({ pendingCount: 0, inProgressCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState(null);
  
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [newProject, setNewProject] = useState({
    _id: null,
    title: '',
    category: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Pending'
  });

  const [newTask, setNewTask] = useState({
    _id: null, // We'll just use taskIndex for editing, but let's keep _id null pattern for consistency if needed, wait task uses index
    projectId: null,
    taskIndex: null, // Store index for editing
    title: '',
    date: '',
    description: '',
    status: 'Pending'
  });

  const colors = ["bg-[#3b82f6]", "bg-[#10b981]", "bg-[#ec4899]", "bg-[#8b5cf6]", "bg-[#f59e0b]", "bg-[#14b8a6]"];

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/myprojects');
      const formattedProjects = (data.items || []).map((p, i) => ({
        ...p,
        color: colors[i % colors.length]
      }));
      setProjects(formattedProjects);
      if (data.stats) setProjectStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = async () => {
    if (!newProject.title || !newProject.category) return;
    try {
      if (newProject._id) {
        await api.put(`/myprojects/${newProject._id}`, {
          title: newProject.title,
          category: newProject.category,
          startDate: newProject.startDate,
          endDate: newProject.endDate,
          description: newProject.description,
          status: newProject.status
        });
      } else {
        await api.post('/myprojects', {
          title: newProject.title,
          category: newProject.category,
          startDate: newProject.startDate,
          endDate: newProject.endDate,
          description: newProject.description,
          status: newProject.status,
          tasks: []
        });
      }
      setIsAddModalOpen(false);
      setNewProject({ _id: null, title: '', category: '', startDate: '', endDate: '', description: '', status: 'Pending' });
      fetchProjects();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const openAddProjectModal = () => {
    setNewProject({ _id: null, title: '', category: '', startDate: '', endDate: '', description: '', status: 'Pending' });
    setIsAddModalOpen(true);
  };

  const openEditProjectModal = (project) => {
    setNewProject({
      _id: project._id,
      title: project.title,
      category: project.category,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description || '',
      status: project.status || 'Pending'
    });
    setIsAddModalOpen(true);
  };

  const confirmDeleteProject = (project) => {
    setProjectToDelete(project);
    setIsDeleteProjectModalOpen(true);
  };

  const executeDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/myprojects/${projectToDelete._id}`);
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const openTaskModalForProject = (id) => {
    setNewTask({
      projectId: id,
      taskIndex: null,
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'Pending'
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (project, task, index) => {
    setNewTask({
      projectId: project._id,
      taskIndex: index,
      title: task.title,
      date: task.date || '',
      description: task.description || '',
      status: task.status || 'Pending'
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!newTask.title || !newTask.projectId) return;
    
    const project = projects.find(p => p._id === newTask.projectId);
    if (!project) return;

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      date: newTask.date,
      status: newTask.status
    };

    let updatedTasks = [...(project.tasks || [])];
    if (newTask.taskIndex !== null) {
      // Edit
      updatedTasks[newTask.taskIndex] = taskData;
    } else {
      // Add
      updatedTasks.push(taskData);
    }

    try {
      await api.put(`/myprojects/${project._id}`, {
        tasks: updatedTasks
      });
      setIsTaskModalOpen(false);
      setNewTask({ projectId: null, taskIndex: null, title: '', date: '', description: '', status: 'Pending' });
      fetchProjects();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const confirmDeleteTask = (project, taskIndex) => {
    setTaskToDelete({ project, taskIndex });
    setIsDeleteTaskModalOpen(true);
  };

  const executeDeleteTask = async () => {
    if (!taskToDelete) return;
    const { project, taskIndex } = taskToDelete;
    
    const updatedTasks = [...project.tasks];
    updatedTasks.splice(taskIndex, 1);
    
    try {
      await api.put(`/myprojects/${project._id}`, { tasks: updatedTasks });
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const { pendingCount, inProgressCount, completedCount } = projectStats;

  return (
    <ModuleLayout 
      title="My Projects" 
      onAdd={openAddProjectModal}
      addText="Add Project"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-500/20 text-slate-400 flex items-center justify-center mb-2">
            <Clock size={24} />
          </div>
          <h3 className="text-3xl font-bold">{pendingCount}</h3>
          <p className="text-slate-400">Pending</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-2">
            <Briefcase size={24} />
          </div>
          <h3 className="text-3xl font-bold">{inProgressCount}</h3>
          <p className="text-slate-400">In Progress</p>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-3xl font-bold">{completedCount}</h3>
          <p className="text-slate-400">Completed</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center p-8 text-accent">Loading projects...</div>
        ) : projects.map((project, idx) => {
          const isOpen = openProject === idx;
          return (
            <div key={project._id} className="glass-panel p-6 flex flex-col transition-all">
              {/* Accordion Header */}
              <div 
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                onClick={() => setOpenProject(isOpen ? null : idx)}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${project.status === 'Completed' || project.status === 'Done' ? 'bg-emerald-500/10 text-emerald-500' : project.status === 'In Progress' ? 'bg-accent/10 text-accent' : 'bg-slate-500/10 text-slate-400'}`}>
                      {project.status}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit Project" onClick={(e) => { e.stopPropagation(); openEditProjectModal(project); }}><Pencil size={14} /></button>
                      <button className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Delete Project" onClick={(e) => { e.stopPropagation(); confirmDeleteProject(project); }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">Category: <span className="text-white font-medium">{project.category}</span></p>
                </div>
                
                <div className="flex items-center gap-4">
                  <ChevronDown size={20} className={`shrink-0 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Accordion Body */}
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100 mt-6 pt-6 border-t border-white/10' : 'max-h-0 opacity-0'}`}>
                <div className="w-full">
                  {project.description && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Description</h4>
                      <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a]/30 p-4 rounded-xl border border-white/5">{project.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Briefcase size={16} className="text-accent" /> Project Tasks</h4>
                    <button onClick={(e) => { e.stopPropagation(); openTaskModalForProject(project._id); }} className="text-xs bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-accent/20">
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.tasks && project.tasks.map((t, i) => (
                      <div key={i} className="glass-panel p-4 flex flex-col justify-between gap-4 group hover:border-white/20 transition-colors bg-[#0f172a]/30">
                         <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-start gap-2">
                             <h5 className="font-semibold text-white mb-0.5 flex items-center gap-2">
                               {t.status === 'Done' || t.status === 'Completed' ? <CheckCircle size={14} className="text-emerald-500" /> : <Circle size={14} className="text-slate-500" />} 
                               {t.title}
                             </h5>
                             <span className="text-xs text-slate-300 font-medium whitespace-nowrap mt-1">{t.date || 'Just now'}</span>
                           </div>
                           <p className="text-sm text-slate-400 leading-snug pl-5">{t.description}</p>
                         </div>
                         <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5 w-full">
                           <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'Done' || t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'In Progress' ? 'bg-accent/10 text-accent' : 'bg-slate-500/10 text-slate-400'}`}>
                             {t.status}
                           </span>
                           <div className="flex gap-2">
                             <button onClick={() => openEditTaskModal(project, t, i)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit"><Pencil size={14} /></button>
                             <button onClick={() => confirmDeleteTask(project, i)} className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                           </div>
                         </div>
                      </div>
                    ))}
                    {(!project.tasks || project.tasks.length === 0) && (
                      <div className="text-center p-6 glass-panel border-dashed border-white/10 md:col-span-2">
                        <p className="text-sm text-slate-400">No tasks created yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && projects.length === 0 && (
          <div className="text-center p-8 text-slate-400">
            No projects added yet. Click "Add Project" to get started!
          </div>
        )}
      </div>

      <GlassModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={newProject._id ? "Edit Project" : "Create New Project"}
        onSave={handleSaveProject}
        saveText={newProject._id ? "Update Project" : "Save Project"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Project Title</label>
            <input 
              type="text" 
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Redesign Website" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Category</label>
            <input 
              type="text" 
              value={newProject.category}
              onChange={(e) => setNewProject({...newProject, category: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Work, Personal" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Start Date</label>
              <input 
                type="date" 
                value={newProject.startDate}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">End Date</label>
              <input 
                type="date" 
                value={newProject.endDate}
                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description</label>
            <textarea 
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors min-h-[100px]" 
              placeholder="Add details or notes..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Status</label>
            <select 
              value={newProject.status}
              onChange={(e) => setNewProject({...newProject, status: e.target.value})}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </GlassModal>

      <GlassModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)}
        title={newTask.taskIndex !== null ? "Edit Task" : "Add Project Task"}
        onSave={handleSaveTask}
        saveText={newTask.taskIndex !== null ? "Update Task" : "Save Task"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Task Title</label>
            <input 
              type="text" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Design UI" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Due Date</label>
            <input 
              type="date" 
              value={newTask.date}
              onChange={(e) => setNewTask({...newTask, date: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Description</label>
            <textarea 
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors min-h-[100px]" 
              placeholder="What needs to be done?"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Status</label>
            <select 
              value={newTask.status}
              onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </GlassModal>

      {/* Delete Confirmation Modals */}
      <GlassModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        title="Confirm Deletion"
        onSave={executeDeleteProject}
        saveText="Yes, Delete Project"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to delete the project <strong>"{projectToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This will also delete all associated tasks.</p>
        </div>
      </GlassModal>

      <GlassModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => setIsDeleteTaskModalOpen(false)}
        title="Confirm Task Deletion"
        onSave={executeDeleteTask}
        saveText="Yes, Delete Task"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to delete this task?</p>
        </div>
      </GlassModal>
    </ModuleLayout>
  );
};

export default MyProjects;
