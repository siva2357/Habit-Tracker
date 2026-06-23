import { useState, useMemo } from 'react';
import { Plus, Check, X, Edit2, Trash2, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Modal, Form, Button } from 'react-bootstrap';

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

const initialHabits = [
  { id: 1, title: 'Morning Jog (3km)', tracking: { '2026-06-01': true, '2026-06-02': false, '2026-06-03': true } },
  { id: 2, title: 'Read 20 pages', tracking: {} },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Habits() {
  const [habits, setHabits] = useState(initialHabits);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({ title: '' });

  // Calendar State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const handleClose = () => {
    setShowModal(false);
    setEditingHabit(null);
    setFormData({ title: '' });
  };

  const handleShow = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({ title: habit.title });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingHabit) {
      setHabits(habits.map(h => 
        h.id === editingHabit.id ? { ...h, title: formData.title } : h
      ));
    } else {
      const newHabit = {
        id: Date.now(),
        title: formData.title,
        tracking: {}
      };
      setHabits([...habits, newHabit]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // 3-State Toggle: null -> true (check) -> false (cross) -> null
  const toggleDay = (habitId, dateKey) => {
    setHabits(habits.map(h => {
      if (h.id !== habitId) return h;
      
      const currentVal = h.tracking[dateKey];
      const isPast = dateKey < getTodayDateString();
      let newVal;
      
      if (currentVal === undefined) newVal = true;
      else if (currentVal === true) newVal = false;
      else newVal = undefined; // reset

      const updatedTracking = { ...h.tracking };
      if (newVal === undefined) {
        delete updatedTracking[dateKey];
      } else {
        updatedTracking[dateKey] = newVal;
      }

      return { ...h, tracking: updatedTracking };
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Habits Tracker</h1>
          <p>Build good habits, break the bad ones. Track every day.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}><Plus size={18} /> Add Habit</button>
      </div>

      <div className="flex items-center justify-between p-3 glass" style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarIcon size={20} color="var(--primary)" />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)' }}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)' }}
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

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {habits.map(habit => {
          // Calculate monthly completion
          let completedCount = 0;
          daysArray.forEach(day => {
            const dateKey = formatDateKey(currentYear, currentMonth, day);
            if (habit.tracking[dateKey] === true) completedCount++;
          });

          return (
            <div key={habit.id} className="card glass" style={{ padding: '1.5rem' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{habit.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Completed {completedCount} / {daysInMonth} days this month</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => handleShow(habit)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(habit.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <div className="flex items-center gap-2" style={{ minWidth: 'max-content' }}>
                  {daysArray.map(day => {
                    const dateKey = formatDateKey(currentYear, currentMonth, day);
                    let status = habit.tracking[dateKey];
                    const isPast = dateKey < getTodayDateString();
                    
                    if (status === undefined && isPast) {
                      status = false; // Implicitly failed if past and not tracked
                    }
                    
                    let bg = 'var(--surface)';
                    let border = '1px solid var(--border)';
                    let content = null;

                    if (status === true) {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      border = '1px solid var(--success)';
                      content = <Check size={16} color="var(--success)" />;
                    } else if (status === false) {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      border = '1px solid var(--danger)';
                      content = <X size={16} color="var(--danger)" />;
                    }

                    return (
                      <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{day}</span>
                        <button 
                          onClick={() => toggleDay(habit.id, dateKey)}
                          style={{
                            width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                            background: bg, border: border, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', flexShrink: 0
                          }}
                        >
                          {content}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onHide={handleClose} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Habit Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Read 20 pages" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>
            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleClose} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingHabit ? 'Save Changes' : 'Add Habit'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
