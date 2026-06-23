import { useState } from 'react';
import { Plus, Briefcase, Edit2, Trash2, BookOpen } from 'lucide-react';
import { Modal, Form, Button, Accordion } from 'react-bootstrap';

const initialProjects = [
  { 
    id: 1, 
    title: 'Build Portfolio Website', 
    status: 'In Progress', 
    updates: [
      { id: 1, date: '2026-06-20', title: 'Started Design', text: 'Created the wireframes for the homepage and about section.' },
      { id: 2, date: '2026-06-21', title: 'Setup Repository', text: 'Initialized Vite React project and configured styling.' }
    ] 
  },
  { 
    id: 2, 
    title: 'Learn Advanced TypeScript', 
    status: 'Pending', 
    updates: [] 
  },
];

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  
  // Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', status: 'Pending' });

  // Progress Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [editingProgress, setEditingProgress] = useState(null);
  const [progressFormData, setProgressFormData] = useState({ title: '', text: '' });

  // Project Modal Handlers
  const handleClose = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ title: '', status: 'Pending' });
  };

  const handleShow = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ title: project.title, status: project.status });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id ? { ...p, title: formData.title, status: formData.status } : p
      ));
    } else {
      const newProject = {
        id: Date.now(),
        title: formData.title,
        status: formData.status,
        updates: []
      };
      setProjects([...projects, newProject]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleStatusChange = (projectId, newStatus) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));
  };

  // Progress Modal Handlers
  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setEditingProgress(null);
    setProgressFormData({ title: '', text: '' });
    setActiveProjectId(null);
  };

  const handleShowProgressModal = (projectId, progress = null) => {
    setActiveProjectId(projectId);
    if (progress) {
      setEditingProgress(progress);
      setProgressFormData({ title: progress.title, text: progress.text });
    }
    setShowProgressModal(true);
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    if (!progressFormData.title.trim() || !progressFormData.text.trim()) return;

    setProjects(projects.map(p => {
      if (p.id === activeProjectId) {
        if (editingProgress) {
          // Update existing progress
          const updatedUpdates = p.updates.map(entry => 
            entry.id === editingProgress.id ? { ...entry, title: progressFormData.title, text: progressFormData.text } : entry
          );
          return { ...p, updates: updatedUpdates };
        } else {
          // Add new progress
          const newEntry = {
            id: Date.now(),
            date: getTodayDateString(),
            title: progressFormData.title.trim(),
            text: progressFormData.text.trim()
          };
          return { ...p, updates: [newEntry, ...p.updates] };
        }
      }
      return p;
    }));

    handleCloseProgressModal();
  };

  const handleDeleteProgress = (projectId, progressId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, updates: p.updates.filter(entry => entry.id !== progressId) };
      }
      return p;
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--success, #10b981)';
      case 'In Progress': return 'var(--primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Active Projects</h1>
          <p>Track your ongoing projects with a progress diary.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <Plus size={18} /> Add Project
        </button>
      </div>

      <Accordion>
        {projects.map(project => (
          <Accordion.Item eventKey={project.id.toString()} key={project.id} className="glass mb-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <Accordion.Header>
              <div className="flex items-center justify-between w-100" style={{ paddingRight: '1.5rem' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(project.status) }} />
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{project.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: getStatusColor(project.status), background: 'var(--surface)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    {project.status}
                  </span>
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body style={{ background: 'var(--surface)', padding: '2rem 1.5rem' }}>
              
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Update Status:</label>
                  <select 
                    value={project.status} 
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShow(project)}>
                    <Edit2 size={14} className="mr-1" /> Edit
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--danger)' }} onClick={() => handleDelete(project.id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>

              {/* Updates Section */}
              <div className="diary-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 m-0" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    <Briefcase size={18} color="var(--primary)" /> Progress Updates
                  </h3>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShowProgressModal(project.id)}>
                    <Plus size={16} className="mr-1" /> Add Progress
                  </button>
                </div>

                {/* Updates History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  {project.updates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No entries yet. Start logging your journey!
                    </div>
                  ) : (
                    project.updates.map(entry => (
                      <div key={entry.id} className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', width: '100%' }}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{entry.title}</h4>
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                              {entry.date}
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', borderRadius: '50%' }} onClick={() => handleShowProgressModal(project.id, entry)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => handleDeleteProgress(project.id, entry.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          {entry.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingProject ? 'Edit Project' : 'Add New Project'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Build Portfolio Website" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Status</Form.Label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="form-select input-field"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </Form.Group>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleClose} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingProject ? 'Save Changes' : 'Add Project'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Add/Edit Progress Modal */}
      <Modal show={showProgressModal} onHide={handleCloseProgressModal} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingProgress ? 'Edit Progress' : 'Log Progress'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProgressSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Progress Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Finished Module 1" 
                value={progressFormData.title}
                onChange={(e) => setProgressFormData({...progressFormData, title: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Description (Date: {editingProgress ? editingProgress.date : getTodayDateString()})</Form.Label>
              <Form.Control 
                as="textarea" 
                placeholder="What did you achieve today?" 
                value={progressFormData.text}
                onChange={(e) => setProgressFormData({...progressFormData, text: e.target.value})}
                required
                className="input-field"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </Form.Group>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleCloseProgressModal} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingProgress ? 'Save Changes' : 'Log Progress'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
