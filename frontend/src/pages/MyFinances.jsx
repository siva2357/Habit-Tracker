import React, { useState, useEffect } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { Wallet, TrendingUp, TrendingDown, IndianRupee, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

const MyFinances = () => {
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  const [newTx, setNewTx] = useState({
    _id: null,
    title: '',
    amount: '',
    type: 'expense',
    category: 'General'
  });

  const [balanceInput, setBalanceInput] = useState('');
  const [balanceTxId, setBalanceTxId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/myfinances');
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch finances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async () => {
    if (!newTx.title || !newTx.amount) return;
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const amountNum = Number(newTx.amount);
      const finalAmount = newTx.type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum);
      
      const payload = {
        title: newTx.title,
        amount: finalAmount,
        type: newTx.type,
        category: newTx.category,
        date: dateKey
      };

      if (newTx._id) {
        await api.put(`/myfinances/${newTx._id}`, payload);
      } else {
        await api.post('/myfinances', payload);
      }

      setIsAddTxModalOpen(false);
      setNewTx({ _id: null, title: '', amount: '', type: 'expense', category: 'General' });
      fetchTransactions();
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const openAddTxModal = () => {
    setNewTx({ _id: null, title: '', amount: '', type: 'expense', category: 'General' });
    setIsAddTxModalOpen(true);
  };

  const openEditTxModal = (tx) => {
    setNewTx({
      _id: tx._id,
      title: tx.title,
      amount: Math.abs(tx.amount).toString(),
      type: tx.type,
      category: tx.category
    });
    setIsAddTxModalOpen(true);
  };

  const confirmDeleteTx = (tx) => {
    setTxToDelete(tx);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteTx = async () => {
    if (!txToDelete) return;
    try {
      await api.delete(`/myfinances/${txToDelete._id}`);
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleAddBalance = async () => {
    if (!balanceInput) return;
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const payload = {
        title: 'Initial Balance / Deposit',
        amount: Math.abs(Number(balanceInput)),
        type: 'income',
        category: 'Balance',
        date: balanceTxId ? undefined : dateKey // Don't change date if updating
      };

      if (balanceTxId) {
        await api.put(`/myfinances/${balanceTxId}`, payload);
      } else {
        await api.post('/myfinances', payload);
      }
      
      setIsBalanceModalOpen(false);
      setBalanceInput('');
      setBalanceTxId(null);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to add/edit balance:", error);
    }
  };

  const balanceTx = transactions.find(t => t.category === 'Balance');
  const openBalanceModal = () => {
    if (balanceTx) {
      setBalanceTxId(balanceTx._id);
      setBalanceInput(Math.abs(balanceTx.amount).toString());
    } else {
      setBalanceTxId(null);
      setBalanceInput('');
    }
    setIsBalanceModalOpen(true);
  };

  const selectedDateKey = selectedDate.toISOString().split('T')[0];
  const todaysTx = transactions.filter(t => t.date === selectedDateKey && t.category !== 'Balance');

  // Calculations
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Calculate income/expenses for the current month (Excluding Initial Balance deposits)
  const currentMonthPrefix = selectedDateKey.substring(0, 7);
  const monthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix) && t.category !== 'Balance');
  const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  
  const todaysNet = todaysTx.reduce((acc, curr) => acc + curr.amount, 0);

  const LeftPanel = () => (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-4 flex justify-center">
        {/* Mock Calendar Widget */}
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
      
      <div className="glass-panel p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <h3 className="text-sm font-semibold mb-1 text-emerald-400 uppercase tracking-wider">Today's Net</h3>
        <p className="text-lg text-white font-bold mb-1">
          {todaysNet >= 0 ? '+' : '-'}₹{Math.abs(todaysNet).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Wallet size={14} className="text-emerald-400" />
          <span>Balance Change</span>
        </div>
      </div>
    </div>
  );

  return (
    <ModuleLayout 
      title="My Finances" 
      leftPanel={<LeftPanel />}
      onAdd={openBalanceModal}
      addText={balanceTx ? "Edit Balance" : "Add Balance"}
      addIcon={balanceTx ? Pencil : Plus}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Wallet size={120} />
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Balance</p>
          <h3 className="text-4xl font-bold text-white">₹{totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center gap-1">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-1">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-slate-400">Income ({selectedDate.toLocaleString('default', { month: 'long' })})</p>
          <h3 className="text-2xl font-bold text-emerald-400">+₹{monthIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center gap-1">
          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-1">
            <TrendingDown size={20} />
          </div>
          <p className="text-sm text-slate-400">Expenses ({selectedDate.toLocaleString('default', { month: 'long' })})</p>
          <h3 className="text-2xl font-bold text-red-400">-₹{monthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <p className="text-slate-400 m-0">You have {todaysTx.length} transactions today.</p>
          </div>
          <button onClick={openAddTxModal} className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20 text-sm">
             <Plus size={18} /> Add Transaction
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-center p-8 text-accent">Loading...</div>
          ) : todaysTx.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{tx.title}</h4>
                  <p className="text-xs text-slate-400">{tx.category} • {tx.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.type === 'income' ? '+' : ''}{tx.amount < 0 ? `-₹${Math.abs(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : `₹${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => openEditTxModal(tx)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors" title="Edit">
                     <Pencil size={16} />
                   </button>
                   <button onClick={() => confirmDeleteTx(tx)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors" title="Delete">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && todaysTx.length === 0 && (
            <div className="text-center p-6 text-slate-400 border border-dashed border-white/10 rounded-xl">
              No transactions for this date.
            </div>
          )}
        </div>
      </div>

      <GlassModal 
        isOpen={isAddTxModalOpen} 
        onClose={() => setIsAddTxModalOpen(false)}
        title={newTx._id ? "Edit Transaction" : "Add Transaction"}
        onSave={handleAddTransaction}
        saveText={newTx._id ? "Update Transaction" : "Save Transaction"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Title</label>
            <input 
              type="text" 
              value={newTx.title}
              onChange={e => setNewTx({...newTx, title: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Grocery Store" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Category</label>
            <input 
              type="text" 
              value={newTx.category}
              onChange={e => setNewTx({...newTx, category: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors" 
              placeholder="e.g. Food, Salary, Rent" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="number" 
                  value={newTx.amount}
                  onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                  placeholder="0.00" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Type</label>
              <select 
                value={newTx.type}
                onChange={e => setNewTx({...newTx, type: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              >
                <option className="bg-[#0f172a]" value="expense">Expense</option>
                <option className="bg-[#0f172a]" value="income">Income</option>
              </select>
            </div>
          </div>
        </div>
      </GlassModal>

      <GlassModal 
        isOpen={isBalanceModalOpen} 
        onClose={() => setIsBalanceModalOpen(false)}
        title={balanceTxId ? "Edit Balance" : "Add Balance"}
        onSave={handleAddBalance}
        saveText={balanceTxId ? "Update Balance" : "Save Balance"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Amount (₹)</label>
            <div className="relative">
              <IndianRupee size={16} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="number" 
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white outline-none focus:border-accent transition-colors" 
                placeholder="0.00" 
              />
            </div>
          </div>
        </div>
      </GlassModal>

      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        onSave={executeDeleteTx}
        saveText="Yes, Delete Transaction"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to delete <strong>"{txToDelete?.title}"</strong>?</p>
          <p className="text-red-400 mt-2 text-sm">This action cannot be undone.</p>
        </div>
      </GlassModal>
    </ModuleLayout>
  );
};

export default MyFinances;
