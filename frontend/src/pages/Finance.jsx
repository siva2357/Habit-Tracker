import { useState, useMemo, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, Calendar as CalendarIcon, Edit2, Trash2, Download, Settings } from 'lucide-react';
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

export default function Finance() {
  const [currentYear, setCurrentYear] = useState(() => Math.max(2026, new Date().getFullYear()));
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return (Math.max(2026, d.getFullYear()) === 2026 && d.getMonth() < 6) ? 6 : d.getMonth();
  });
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    client.get('/transactions').then(res => setTransactions(res.data)).catch(console.error);
    client.get('/budget').then(res => setBudget(res.data)).catch(console.error);
  }, []);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: getTodayDateString(),
    description: ''
  });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [budgetData, setBudgetData] = useState({ startingBalance: '' });

  const handleOpenBalanceModal = () => {
    if (budget) {
      setBudgetData({ startingBalance: budget.startingBalance });
    }
    setShowBalanceModal(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/budget', {
        startingBalance: Number(budgetData.startingBalance),
        expectedMonthlyIncome: 0
      });
      setBudget(res.data);
      setShowBalanceModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save balance settings.');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, currentMonth, currentYear]);

  // Group by date: { '2026-06-01': [t1, t2], ... }
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      if (t.type === 'expense') expense += Number(t.amount);
    });

    // Calculate cumulative balance carrying over from previous months
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      // Include transactions from past months up to the currently selected month
      if (tDate.getFullYear() < currentYear || (tDate.getFullYear() === currentYear && tDate.getMonth() <= currentMonth)) {
        if (t.type === 'income') cumulativeIncome += Number(t.amount);
        if (t.type === 'expense') cumulativeExpense += Number(t.amount);
      }
    });

    const baseBalance = budget ? budget.startingBalance : 0;
    const totalBalance = baseBalance + cumulativeIncome - cumulativeExpense;
    
    return { income, expense, balance: totalBalance };
  }, [filteredTransactions, transactions, currentMonth, currentYear, budget]);

  const handleClose = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      date: getTodayDateString(),
      description: ''
    });
  };

  const handleShow = (transaction = null, defaultDate = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({ ...transaction });
    } else {
      setFormData(prev => ({ ...prev, date: defaultDate || getTodayDateString() }));
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) return;

    try {
      if (editingTransaction) {
        const res = await client.put(`/transactions/${editingTransaction._id}`, formData);
        setTransactions(transactions.map(t => t._id === editingTransaction._id ? res.data : t));
      } else {
        const res = await client.post('/transactions', formData);
        setTransactions([res.data, ...transactions]);
      }
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save transaction.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete transaction.');
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Finance Tracker</h1>
          <p>Monitor your daily expenses and income across the months.</p>
        </div>
      </div>

      {/* Month/Year Selector and Actions */}
      <div className="flex items-center justify-between p-3 glass" style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarIcon size={20} color="var(--primary)" />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2rem 0.4rem 1rem' }}
          >
            {months.map((m, idx) => (
              (currentYear === 2026 && idx < 6) ? null : <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="form-select input-field"
            style={{ width: 'auto', backgroundColor: 'var(--background)', padding: '0.4rem 2rem 0.4rem 1rem' }}
          >
            {[2026, 2027, 2028, 2029].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }} onClick={() => alert('Downloading report...')}>
          <Download size={16} /> Download Report
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="stat-cards-grid">
        <div className="glass p-4" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Total Income</h3>
            </div>
            <button className="btn btn-outline flex items-center gap-1" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: 'none', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }} onClick={() => { setFormData({ type: 'income', amount: '', category: '', date: getTodayDateString(), description: '' }); setShowModal(true); }}>
              <Plus size={14} /> Add
            </button>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#10b981' }}>₹{stats.income.toFixed(2)}</h2>
        </div>

        <div className="glass p-4" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
              <TrendingDown size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Total Expenses</h3>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#ef4444' }}>₹{stats.expense.toFixed(2)}</h2>
        </div>

        <div className="glass p-4" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                <Wallet size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Net Balance</h3>
            </div>
            <button className="btn btn-outline flex items-center gap-1" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: 'none', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)' }} onClick={handleOpenBalanceModal}>
              <Edit2 size={14} /> Edit
            </button>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>₹{stats.balance.toFixed(2)}</h2>
        </div>
      </div>

      {/* Transaction List Accordion */}
      <Accordion defaultActiveKey={getTodayDateString()}>
        {daysArray.map(day => {
          const dateKey = formatDateKey(currentYear, currentMonth, day);
          const dayTransactions = groupedTransactions[dateKey] || [];
          
          const dailyIncome = dayTransactions.reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc, 0);
          const dailyExpense = dayTransactions.reduce((acc, t) => t.type === 'expense' ? acc + Number(t.amount) : acc, 0);

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
                    <span className="flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#10b981' }}>
                      <TrendingUp size={16} color="#10b981" /> +${dailyIncome.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ef4444' }}>
                      <TrendingDown size={16} color="#ef4444" /> -${dailyExpense.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body style={{ background: 'var(--surface)', padding: '1.5rem' }}>
                
                {isToday && (
                  <div className="flex justify-end mb-3">
                    <button className="btn btn-outline flex items-center gap-2" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleShow(null, dateKey)}>
                      <Plus size={14} /> Add Transaction
                    </button>
                  </div>
                )}

                {dayTransactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0 }}>
                      {isPast ? 'No transactions were logged for this day.' : 
                       isFuture ? 'Future date. Transactions cannot be logged in advance.' : 
                       'No transactions logged today.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dayTransactions.map(t => (
                      <div key={t._id} className="flex items-center justify-between p-3" style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-4">
                          <div style={{ padding: '0.75rem', background: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
                            {t.type === 'income' ? <TrendingUp size={20} color="#10b981" /> : <TrendingDown size={20} color="#ef4444" />}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{t.category}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                            {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                          </span>
                          {isToday && (
                            <div className="flex gap-2">
                              <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%' }} onClick={() => handleShow(t)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => handleDelete(t._id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
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

      {/* Transaction Modal */}
      <Modal show={showModal} onHide={handleClose} centered contentClassName="glass">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontWeight: 700 }}>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="form-select input-field"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Groceries, Salary, Rent" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="input-field"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Short note about this transaction" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
              />
            </Form.Group>

            <div className="flex justify-between gap-3">
              <Button variant="secondary" onClick={handleClose} className="btn btn-outline flex-grow-1" style={{ width: '100%' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary flex-grow-1" style={{ width: '100%' }}>
                {editingTransaction ? 'Save Changes' : 'Add Transaction'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Balance Configuration Modal */}
      <Modal show={showBalanceModal} onHide={() => setShowBalanceModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <Modal.Title style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>Set Starting Balance</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--surface)' }}>
          <Form onSubmit={handleSaveBudget}>
            <Form.Group className="form-group-custom">
              <Form.Label>Starting Bank Balance</Form.Label>
              <Form.Control
                type="number"
                required
                className="input-field"
                placeholder="e.g. 1000"
                value={budgetData.startingBalance}
                onChange={(e) => setBudgetData({ ...budgetData, startingBalance: e.target.value })}
              />
            </Form.Group>

            <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Button variant="outline-secondary" onClick={() => setShowBalanceModal(false)} className="btn btn-outline" style={{ border: 'none' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn btn-primary">
                Save Balance
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
