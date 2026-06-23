import { useState, useEffect } from 'react';
import { Plus, Target, Edit2, Trash2, BookOpen, Send, CheckCircle } from 'lucide-react';
import client from '../api/client';
import { Modal, Form, Button, Accordion } from 'react-bootstrap';

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  
  useEffect(() => {
    client.get('/goals').then(res => setGoals(res.data)).catch(console.error);
  }, []);
  
  // Goal Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ title: '', status: 'Pending' });

  // Progress Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [editingProgress, setEditingProgress] = useState(null);
  const [progressFormData, setProgressFormData] = useState({ title: '', text: '' });

  // Goal Modal Handlers
  const handleClose = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormData({ title: '', status: 'Pending' });
  };

  const handleShow = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({ title: goal.title, status: goal.status });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        const res = await client.put(`/goals/${editingGoal._id}`, formData);
        setGoals(goals.map(g => g._id === editingGoal._id ? res.data : g));
      } else {
        const res = await client.post('/goals', { ...formData, diary: [] });
        setGoals([...goals, res.data]);
      }
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save goal.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete goal.');
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      const res = await client.put(`/goals/${goalId}`, { status: newStatus });
      setGoals(goals.map(g => g._id === goalId ? res.data : g));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  // Progress Modal Handlers
  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setEditingProgress(null);
    setProgressFormData({ title: '', text: '' });
    setActiveGoalId(null);
  };

  const handleShowProgressModal = (goalId, progress = null) => {
    setActiveGoalId(goalId);
    if (progress) {
      setEditingProgress(progress);
      setProgressFormData({ title: progress.title, text: progress.text });
    }
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressFormData.title.trim() || !progressFormData.text.trim()) return;

    try {
      const g = goals.find(goal => goal._id === activeGoalId);
      if (!g) return;
      
      let updatedDiary;
      if (editingProgress) {
        updatedDiary = g.diary.map(entry => 
          entry._id === editingProgress._id ? { ...entry, title: progressFormData.title.trim(), text: progressFormData.text.trim() } : entry
        );
      } else {
        const newEntry = {
          date: getTodayDateString(),
          title: progressFormData.title.trim(),
          text: progressFormData.text.trim()
        };
        updatedDiary = [newEntry, ...g.diary];
      }

      const res = await client.put(`/goals/${activeGoalId}`, { diary: updatedDiary });
      setGoals(goals.map(goal => goal._id === activeGoalId ? res.data : goal));
      handleCloseProgressModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save progress entry.');
    }
  };

  const handleDeleteProgress = async (goalId, progressId) => {
    try {
      const g = goals.find(goal => goal._id === goalId);
      if (!g) return;
      const updatedDiary = g.diary.filter(entry => entry._id !== progressId);
      const res = await client.put(`/goals/${goalId}`, { diary: updatedDiary });
      setGoals(goals.map(goal => goal._id === goalId ? res.data : goal));
    } catch (err) {
      console.error(err);
      alert('Failed to delete progress entry.');
    }
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
      <div className="flex items-center justify-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Long-Term Goals</h1>
          <p>Track your major milestones with a daily progress diary.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <Accordion>
        {goals.map(goal => (
          <Accordion.Item eventKey={goal._id} key={goal._id} className="glass mb-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <Accordion.Header>
              <div className="flex items-center justify-between w-100" style={{ paddingRight: '1.5rem' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(goal.status) }} />
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{goal.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: getStatusColor(goal.status), background: 'var(--surface)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    {goal.status}
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
                    value={goal.status} 
                    onChange={(e) => handleStatusChange(goal._id, e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShow(goal)}>
                    <Edit2 size={14} className="mr-1" /> Edit
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--danger)' }} onClick={() => handleDelete(goal._id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>

              {/* Diary Section */}
              <div className="diary-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 m-0" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    <BookOpen size={18} color="var(--primary)" /> Progress Diary
                  </h3>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShowProgressModal(goal._id)}>
                    <Plus size={16} className="mr-1" /> Add Progress
                  </button>
                </div>

                {/* Diary History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  {goal.diary.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No entries yet. Start logging your journey!
                    </div>
                  ) : (
                    goal.diary.map(entry => (
                      <div key={entry._id} className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', width: '100%' }}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{entry.title}</h4>
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                              {entry.date}
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', borderRadius: '50%' }} onClick={() => handleShowProgressModal(goal._id, entry)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => handleDeleteProgress(goal._id, entry._id)}>
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
          <Modal.Title style={{ fontWeight: 700 }}>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Run a Marathon" 
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
                {editingGoal ? 'Save Changes' : 'Add Goal'}
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
