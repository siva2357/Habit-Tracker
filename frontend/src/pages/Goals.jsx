import { useState } from 'react';
import { Plus, Target, Edit2, Trash2, BookOpen, Send, CheckCircle } from 'lucide-react';
import { Modal, Form, Button, Accordion } from 'react-bootstrap';

const initialGoals = [
  { 
    id: 1, 
    title: 'Learn React', 
    status: 'In Progress', 
    diary: [
      { id: 1, date: '2026-06-20', text: 'Started reading the official documentation and built a counter app.' },
      { id: 2, date: '2026-06-21', text: 'Learned about hooks, specifically useState and useEffect.' }
    ] 
  },
  { 
    id: 2, 
    title: 'Run a Marathon', 
    status: 'Pending', 
    diary: [] 
  },
];

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ title: '', status: 'Pending' });

  // Diary Entry State per goal
  const [diaryInputs, setDiaryInputs] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(goals.map(g => 
        g.id === editingGoal.id ? { ...g, title: formData.title, status: formData.status } : g
      ));
    } else {
      const newGoal = {
        id: Date.now(),
        title: formData.title,
        status: formData.status,
        diary: []
      };
      setGoals([...goals, newGoal]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleStatusChange = (goalId, newStatus) => {
    setGoals(goals.map(g => 
      g.id === goalId ? { ...g, status: newStatus } : g
    ));
  };

  const handleDiaryInput = (goalId, text) => {
    setDiaryInputs({ ...diaryInputs, [goalId]: text });
  };

  const addDiaryEntry = (e, goalId) => {
    e.preventDefault();
    const text = diaryInputs[goalId]?.trim();
    if (!text) return;

    const newEntry = {
      id: Date.now(),
      date: getTodayDateString(),
      text
    };

    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return { ...g, diary: [newEntry, ...g.diary] }; // Add to top
      }
      return g;
    }));

    // Clear input
    setDiaryInputs({ ...diaryInputs, [goalId]: '' });
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
          <h1>Long-Term Goals</h1>
          <p>Track your major milestones with a daily progress diary.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <Accordion className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {goals.map(goal => (
          <Accordion.Item eventKey={goal.id.toString()} key={goal.id} className="glass mb-3" style={{ border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
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
              <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Update Status:</label>
                  <select 
                    value={goal.status} 
                    onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.25rem 2rem 0.25rem 1rem', fontSize: '0.875rem', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
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
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--danger)' }} onClick={() => handleDelete(goal.id)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>

              {/* Diary Section */}
              <div className="diary-section">
                <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  <BookOpen size={18} color="var(--primary)" /> Progress Diary
                </h3>
                
                {/* Add Entry Form */}
                <form onSubmit={(e) => addDiaryEntry(e, goal.id)} className="mb-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Log your progress or steps taken today..." 
                    value={diaryInputs[goal.id] || ''}
                    onChange={(e) => handleDiaryInput(goal.id, e.target.value)}
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={!diaryInputs[goal.id]?.trim()}>
                    <Send size={16} />
                  </button>
                </form>

                {/* Diary History */}
                <div className="flex flex-col gap-3">
                  {goal.diary.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No entries yet. Start logging your journey!
                    </div>
                  ) : (
                    goal.diary.map(entry => (
                      <div key={entry.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {entry.date}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
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
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="input-field"
                style={{ appearance: 'auto' }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
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
    </div>
  );
}
