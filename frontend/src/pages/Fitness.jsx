import { useState, useMemo, useEffect } from 'react';
import { Plus, Activity, Edit2, Trash2, Calendar as CalendarIcon, Download, Flame, Clock } from 'lucide-react';
import client from '../api/client';
import { Modal, Form, Button, Accordion } from 'react-bootstrap';

// Helper to get days in a specific month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Helper to format date key "YYYY-MM-DD"
const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// No initial mock data, we fetch from API

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function Fitness() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    client.get('/exercises').then(res => setExercises(res.data)).catch(console.error);
  }, []);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    calories: '',
    date: getTodayDateString(),
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const exDate = new Date(ex.date);
      return exDate.getMonth() === currentMonth && exDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [exercises, currentMonth, currentYear]);

  // Group by date: { '2026-06-01': [ex1, ex2], ... }
  const groupedExercises = useMemo(() => {
    const groups = {};
    filteredExercises.forEach(ex => {
      if (!groups[ex.date]) groups[ex.date] = [];
      groups[ex.date].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const handleClose = () => {
    setShowModal(false);
    setEditingExercise(null);
    setFormData({
      name: '',
      duration: '',
      calories: '',
      date: getTodayDateString(),
    });
  };

  const handleShow = (exercise = null, defaultDate = null) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({ ...exercise });
    } else {
      setFormData(prev => ({ ...prev, date: defaultDate || getTodayDateString() }));
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.duration || !formData.date) return;

    try {
      if (editingExercise) {
        const res = await client.put(`/exercises/${editingExercise._id}`, formData);
        setExercises(exercises.map(ex => ex._id === editingExercise._id ? res.data : ex));
      } else {
        const res = await client.post('/exercises', formData);
        setExercises([res.data, ...exercises]);
      }
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save exercise.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/exercises/${id}`);
      setExercises(exercises.filter(ex => ex._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete exercise.');
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Fitness Tracker</h1>
          <p>Log your workouts and monitor your physical activity every day.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <Plus size={18} /> Add Exercise
        </button>
      </div>

      {/* Month/Year Selector and Actions */}
      <div className="flex justify-between items-center glass p-3" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <CalendarIcon size={20} color="var(--primary)" />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2.25rem 0.4rem 1rem' }}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2.25rem 0.4rem 1rem' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }} onClick={() => alert('Downloading report...')}>
          <Download size={16} /> Download Report
        </button>
      </div>

      <Accordion defaultActiveKey={getTodayDateString()}>
        {daysArray.map(day => {
          const dateKey = formatDateKey(currentYear, currentMonth, day);
          const dayExercises = groupedExercises[dateKey] || [];
          const totalDuration = dayExercises.reduce((acc, ex) => acc + Number(ex.duration), 0);
          const totalCalories = dayExercises.reduce((acc, ex) => acc + Number(ex.calories), 0);
          
          const todayStr = getTodayDateString();
          const isToday = dateKey === todayStr;
          const isPast = dateKey < todayStr;
          const isFuture = dateKey > todayStr;

          return (
            <Accordion.Item eventKey={dateKey} key={dateKey} className="glass mb-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', opacity: isFuture ? 0.6 : 1 }}>
              <Accordion.Header>
                <div className="flex items-center justify-between w-100" style={{ paddingRight: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                      <CalendarIcon size={18} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                      {months[currentMonth]} {day}, {currentYear}
                      {isToday && <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Today</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      <Clock size={16} color="var(--text-muted)" /> {totalDuration} mins
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--warning)' }}>
                      <Flame size={16} color="var(--warning)" /> {totalCalories} kcal
                    </span>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ background: 'var(--surface)', padding: '1.5rem' }}>
                
                {isToday && (
                  <div className="flex justify-end mb-3">
                    <button className="btn btn-outline flex items-center gap-2" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShow(null, dateKey)}>
                      <Plus size={14} /> Add Workout
                    </button>
                  </div>
                )}

                {dayExercises.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0 }}>
                      {isPast ? 'No workouts were logged for this day.' : 
                       isFuture ? 'Future date. Workouts cannot be logged in advance.' : 
                       'No workouts logged today. Get moving!'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dayExercises.map(ex => (
                      <div key={ex._id} className="flex items-center justify-between p-3" style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-4">
                          <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                            <Activity size={20} color="var(--primary)" />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{ex.name}</h4>
                            <div className="flex items-center gap-3 mt-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1"><Clock size={12} /> {ex.duration} min</span>
                              <span className="flex items-center gap-1"><Flame size={12} /> {ex.calories} kcal</span>
                            </div>
                          </div>
                        </div>
                        {isToday && (
                          <div className="flex gap-2">
                            <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%' }} onClick={() => handleShow(ex)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => handleDelete(ex._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>

      {/* Workout Modal */}
      <Modal show={showModal} onHide={handleClose} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingExercise ? 'Edit Workout' : 'Add Workout'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Workout Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Morning Jog, Yoga" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            
            <div className="flex gap-3 mb-3">
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>Duration (mins)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1"
                  placeholder="30" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                  className="input-field"
                />
              </Form.Group>
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>Calories (kcal)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0"
                  placeholder="200" 
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  required
                  className="input-field"
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-4">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>

            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleClose} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingExercise ? 'Save Changes' : 'Add Workout'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
