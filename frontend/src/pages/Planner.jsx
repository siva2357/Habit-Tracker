import { useState, useMemo, useEffect } from 'react';
import { Plus, Clock, Circle, CheckCircle2, Edit2, Trash2, Calendar as CalendarIcon, Download } from 'lucide-react';
import client from '../api/client';
import { Modal, Form, Button, Accordion } from 'react-bootstrap';

// Helper to get days in a specific month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Helper to format date key "YYYY-MM-DD"
const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getTodayDateString = () => {
  const today = new Date();
  return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// No initial mock data

export default function Planner() {
  const [tasksByDate, setTasksByDate] = useState({});
  
  useEffect(() => {
    client.get('/tasks').then(res => {
      const grouped = {};
      res.data.forEach(t => {
        if (!grouped[t.dateKey]) grouped[t.dateKey] = [];
        grouped[t.dateKey].push(t);
      });
      setTasksByDate(grouped);
    }).catch(console.error);
  }, []);
  
  // Calendar State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const todayDateString = getTodayDateString();

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeDateKey, setActiveDateKey] = useState(null);
  const [formData, setFormData] = useState({ title: '', time: '' });

  const handleClose = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', time: '' });
  };

  const handleShow = (dateKey, task = null) => {
    setActiveDateKey(dateKey);
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, time: task.time });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDayTasks = tasksByDate[activeDateKey] || [];
    
    try {
      if (editingTask) {
        const res = await client.put(`/tasks/${editingTask._id}`, formData);
        setTasksByDate({
          ...tasksByDate,
          [activeDateKey]: currentDayTasks.map(t => t._id === editingTask._id ? res.data : t)
        });
      } else {
        const res = await client.post('/tasks', { ...formData, dateKey: activeDateKey });
        setTasksByDate({
          ...tasksByDate,
          [activeDateKey]: [...currentDayTasks, res.data]
        });
      }
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save task.');
    }
  };

  const handleDelete = async (dateKey, taskId) => {
    try {
      await client.delete(`/tasks/${taskId}`);
      const currentDayTasks = tasksByDate[dateKey] || [];
      setTasksByDate({
        ...tasksByDate,
        [dateKey]: currentDayTasks.filter(t => t._id !== taskId)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  const toggleTask = async (dateKey, taskId) => {
    try {
      const currentDayTasks = tasksByDate[dateKey] || [];
      const task = currentDayTasks.find(t => t._id === taskId);
      const res = await client.put(`/tasks/${taskId}`, { completed: !task.completed });
      setTasksByDate({
        ...tasksByDate,
        [dateKey]: currentDayTasks.map(t => t._id === taskId ? res.data : t)
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Daily Planner</h1>
          <p>Organize your days with a detailed timeline.</p>
        </div>
      </div>

      <div className="flex justify-between items-center glass p-3" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <CalendarIcon size={24} color="var(--primary)" />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px', backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', fontWeight: 500 }}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="form-select"
            style={{ width: 'auto', backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', fontWeight: 500 }}
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }} onClick={() => alert('Downloading report...')}>
          <Download size={16} /> Download Report
        </button>
      </div>

      <Accordion defaultActiveKey={todayDateString}>
        {daysArray.map(day => {
          const dateKey = formatDateKey(currentYear, currentMonth, day);
          const tasks = tasksByDate[dateKey] || [];
          const isPast = dateKey < todayDateString;
          const isToday = dateKey === todayDateString;
          const isFuture = dateKey > todayDateString;

          return (
            <Accordion.Item eventKey={dateKey} key={dateKey} className="glass mb-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', opacity: isFuture ? 0.7 : 1 }}>
              <Accordion.Header>
                <div className="flex items-center justify-between w-100" style={{ paddingRight: '1.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                    {months[currentMonth]} {day}, {currentYear}
                    {isToday && <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Today</span>}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ background: 'var(--surface)', padding: '2rem 1.5rem' }}>
                
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                    <p>{isToday ? 'Your day is clear! Add some tasks.' : isPast ? 'No plans were made for this day.' : 'Future planning is locked.'}</p>
                    {isToday && (
                      <button className="btn btn-primary mt-4" onClick={() => handleShow(dateKey)}>
                        <Plus size={18} /> Add Task
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {isToday && (
                      <div className="flex justify-end mb-2">
                        <button className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }} onClick={() => handleShow(dateKey)}>
                          <Plus size={16} /> Add Task
                        </button>
                      </div>
                    )}

                    {tasks.map((task, index) => (
                      <div key={task._id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '80px', textAlign: 'right', paddingTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                          {task.time}
                        </div>
                        
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ 
                            width: '12px', height: '12px', borderRadius: '50%', 
                            background: task.completed ? 'var(--primary)' : 'var(--border)',
                            border: '2px solid var(--surface)', zIndex: 1, marginTop: '0.35rem'
                          }} />
                          {index !== tasks.length - 1 && (
                            <div style={{ width: '2px', height: '100%', minHeight: '3rem', background: 'var(--border)', position: 'absolute', top: '12px' }} />
                          )}
                        </div>

                        <div 
                          className="flex items-center justify-between"
                          style={{ 
                            flex: 1, background: task.completed ? 'rgba(99, 102, 241, 0.05)' : 'var(--background)', 
                            border: '1px solid var(--border)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
                            transition: 'all 0.2s',
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)'
                          }}
                        >
                          <div 
                            onClick={() => toggleTask(dateKey, task._id)}
                            className="flex items-center gap-3" 
                            style={{ cursor: 'pointer', textDecoration: task.completed ? 'line-through' : 'none' }}
                          >
                            {task.completed ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} color="var(--text-muted)" />}
                            <span style={{ fontWeight: 500 }}>{task.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 mr-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              <Clock size={14} />
                            </div>
                            <button className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%', border: 'none' }} onClick={() => handleShow(dateKey, task)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%', border: 'none', color: 'var(--danger)' }} onClick={() => handleDelete(dateKey, task._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>

      <Modal show={showModal} onHide={handleClose} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Team Sync Meeting" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Time</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., 09:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleClose} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingTask ? 'Save Changes' : 'Add Task'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
