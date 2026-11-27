import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  X,
  CreditCard,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import LiquidHeader from '../../components/LiquidHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import { Input, Select, Textarea, DateInput } from '../../components/Input';
import { useToast } from '../../context/ToastContext';

// Category list
const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Food & Dining',
  'Rent & Housing',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health & Fitness',
  'Travel',
  'Education',
  'Other'
];

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other'
];

// Helper to format Indian Rupees
const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Category badge color mapper
const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'Salary':
    case 'Freelance':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Investments':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Food & Dining':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Rent & Housing':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Shopping':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'Utilities':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Health & Fitness':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export default function FinancesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fromPath = location.state?.from || '/';
  const fromName = location.state?.fromName || (fromPath === '/dashboard' ? 'Dashboard' : 'Control Panel');

  // Core Data & Filter States
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all | credit | debit
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial / Base Balance state (persisted in localStorage, defaults to 0)
  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('trackit_finance_initial_balance');
    if (saved === null || saved === '50000') {
      localStorage.setItem('trackit_finance_initial_balance', '0');
      return 0;
    }
    return Number(saved);
  });
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [balanceInputMode, setBalanceInputMode] = useState('starting'); // 'starting' | 'current'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Modal Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'debit', // 'credit' | 'debit'
    category: 'Food & Dining',
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch transactions from backend with fallback
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/finances');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setTransactions(json.data);
          }
        }
      } catch (err) {
        console.log('Using local transactions fallback:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Compute month options dynamically from current month & transaction dates
  const monthOptions = useMemo(() => {
    const options = [
      { value: 'all', label: 'All Months (All Time)' },
      { value: '2026-11', label: 'November 2026 (Current)' },
      { value: '2026-10', label: 'October 2026' },
      { value: '2026-09', label: 'September 2026' },
      { value: '2026-08', label: 'August 2026' },
      { value: '2026-07', label: 'July 2026' }
    ];
    return options;
  }, []);

  // Filtered transactions list based on search, type, category, and month
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month match
      if (selectedMonth !== 'all') {
        const txDate = (tx.date || '').toString().slice(0, 7);
        if (txDate !== selectedMonth) return false;
      }

      // Type match (normalized)
      const normType = tx.type === 'income' ? 'credit' : tx.type === 'expense' ? 'debit' : tx.type;
      if (filterType !== 'all' && normType !== filterType) {
        return false;
      }

      // Category match
      if (filterCategory !== 'all' && tx.category !== filterCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = tx.title?.toLowerCase().includes(query);
        const matchesCategory = tx.category?.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query);
        const matchesMethod = tx.paymentMethod?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesMethod) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedMonth, filterType, filterCategory, searchQuery]);

  // Overall Financial Summary based on currently selected month & initial balance
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;

    const source = selectedMonth === 'all'
      ? transactions
      : transactions.filter((t) => (t.date || '').toString().slice(0, 7) === selectedMonth);

    source.forEach((tx) => {
      const normType = tx.type === 'income' ? 'credit' : tx.type === 'expense' ? 'debit' : tx.type;
      const amt = Number(tx.amount) || 0;
      if (normType === 'credit') {
        credit += amt;
      } else {
        debit += amt;
      }
    });

    const netCashflow = credit - debit;
    // Auto-calculated Live Balance = Initial Starting Balance + Inflows (Credits) - Outflows (Debits)
    const totalBalance = initialBalance + netCashflow;
    const savingsRate = credit > 0 ? Math.round(((credit - debit) / credit) * 100) : 0;

    return {
      totalBalance,
      netCashflow,
      totalCredit: credit,
      totalDebit: debit,
      savingsRate,
      transactionCount: source.length
    };
  }, [transactions, selectedMonth, initialBalance]);

  // Open balance modal
  const handleOpenEditBalance = () => {
    setBalanceInput(initialBalance.toString());
    setBalanceInputMode('starting');
    setIsBalanceModalOpen(true);
  };

  // Save updated balance
  const handleSaveBalance = (e) => {
    if (e) e.preventDefault();
    const val = Number(balanceInput);
    if (isNaN(val)) {
      addToast('Please enter a valid numeric balance amount', 'error');
      return;
    }

    let newInitial = val;
    if (balanceInputMode === 'current') {
      // User entered desired CURRENT balance:
      // Current = Initial + Credit - Debit => Initial = Current - Credit + Debit
      newInitial = val - summary.totalCredit + summary.totalDebit;
    }

    setInitialBalance(newInitial);
    localStorage.setItem('trackit_finance_initial_balance', newInitial.toString());
    setIsBalanceModalOpen(false);
    const calculatedLive = newInitial + summary.totalCredit - summary.totalDebit;
    addToast(
      `Balance updated! Starting balance is set to ${formatINR(newInitial)} (Live: ${formatINR(calculatedLive)})`,
      'success'
    );
  };

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      title: '',
      amount: '',
      type: 'debit',
      category: 'Food & Dining',
      paymentMethod: 'UPI',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    const normType = tx.type === 'income' ? 'credit' : tx.type === 'expense' ? 'debit' : tx.type;
    const formattedDate = tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    setFormData({
      title: tx.title || '',
      amount: tx.amount?.toString() || '',
      type: normType || 'debit',
      category: tx.category || 'General',
      paymentMethod: tx.paymentMethod || 'UPI',
      date: formattedDate,
      notes: tx.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Transaction description is required';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than ₹0';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      amount: Math.abs(Number(formData.amount)),
      type: formData.type,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      notes: formData.notes.trim()
    };

    if (editingTransaction) {
      // EDIT MODE
      const targetId = editingTransaction._id || editingTransaction.id;
      try {
        const res = await fetch(`/api/finances/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setTransactions((prev) =>
            prev.map((t) => ((t._id || t.id) === targetId ? json.data : t))
          );
          addToast(`Updated transaction: ${payload.title}`, 'success');
          handleCloseModal();
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status} (${res.statusText || 'Error'})`;
          addToast(`Failed to update transaction: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database connection error: Unable to update transaction (${err.message})`, 'error');
      }
    } else {
      // ADD MODE
      try {
        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          setTransactions((prev) => [json.data, ...prev]);
          addToast(`Added transaction: ${payload.title}`, 'success');
          handleCloseModal();
        } else {
          const errData = await res.json().catch(() => null);
          const errorMsg = errData?.message || `Server returned ${res.status} (${res.statusText || 'Error'})`;
          addToast(`Failed to save transaction to database: ${errorMsg}`, 'error');
        }
      } catch (err) {
        addToast(`Database connection error: Unable to save transaction (${err.message})`, 'error');
      }
    }
  };

  // Delete transaction with confirmation
  const handleDeleteTransaction = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/finances/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id));
        addToast(`Deleted "${title}"`, 'info');
      } else {
        const errData = await res.json().catch(() => null);
        const errorMsg = errData?.message || `Server returned ${res.status}`;
        addToast(`Failed to delete transaction from database: ${errorMsg}`, 'error');
      }
    } catch (err) {
      addToast(`Database connection error: Unable to delete (${err.message})`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-800">
      {/* Edge-to-Edge Fixed Liquid Header */}
      <LiquidHeader
        title="My Finances"
        subtitle="Cashflow, Credit, Debit & Transactions (₹ INR)"
      />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6 sm:space-y-8">
        
        {/* Module Sub-Bar */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Finance Hub
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Currency in Indian Rupees (₹)
              </span>
            </div>
          </div>

          {/* Top Header Action: Set Balance Only */}
          <Button
            variant="outline"
            size="sm"
            icon={Pencil}
            onClick={handleOpenEditBalance}
            className="self-start xs:self-auto text-xs shadow-xs font-bold"
          >
            Set Balance
          </Button>
        </div>

        {/* ========================================================= */}
        {/* HERO SECTION: Total Balance, Debit, Credit + Month Filter */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-4 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white overflow-hidden relative">
          
          {/* Top Hero Bar: Month Dropdown + Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 shrink-0">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Financial Overview
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Consolidated cash balance, inflow credits, and outflow debits
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Dropdown Selector */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xs:inline">Period:</span>
              </div>
              <div className="w-full sm:w-56 lg:w-64">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold bg-white text-slate-800 border border-slate-300 rounded-xl px-2.5 py-1.5 sm:py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs cursor-pointer"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3 Main Hero Stat Cards using Reusable StatCard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 pt-4 sm:pt-6">
            <StatCard
              title="Total Net Balance"
              value={formatINR(summary.totalBalance)}
              badge="Net Surplus"
              icon={IndianRupee}
              variant="indigo"
              details={
                <>
                  {initialBalance !== 0 && (
                    <>
                      <span>Base: <strong className="text-slate-700">{formatINR(initialBalance)}</strong></span>
                      <span>•</span>
                    </>
                  )}
                  <span className="text-emerald-700 font-bold">+{formatINR(summary.totalCredit)}</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">-{formatINR(summary.totalDebit)}</span>
                </>
              }
              footerLeft={`Savings Rate: ${summary.savingsRate}%`}
              footerRight="Auto-calculated"
            />

            <StatCard
              title="Total Credit (Income)"
              value={`+${formatINR(summary.totalCredit)}`}
              badge="Inflow"
              icon={ArrowDownLeft}
              variant="emerald"
              footerLeft="Active Income Streams"
              footerRight="100% Verified"
            />

            <StatCard
              title="Total Debit (Expense)"
              value={`-${formatINR(summary.totalDebit)}`}
              badge="Outflow"
              icon={ArrowUpRight}
              variant="rose"
              footerLeft="Controlled Burn"
              footerRight={`${summary.totalCredit > 0 ? Math.round((summary.totalDebit / summary.totalCredit) * 100) : 0}% of Inflow`}
            />
          </div>
        </Card>

        {/* ========================================================= */}
        {/* TRANSACTIONS TABLE SECTION: Table, Filters & Row Actions */}
        {/* ========================================================= */}
        <Card variant="glass" className="p-3.5 sm:p-6 lg:p-7 border border-slate-200/90 shadow-xl bg-white space-y-4 sm:space-y-5">
          
          {/* Table Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span>Transactions Log</span>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredTransactions.length}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Complete list of credits and debits with in-row editing actions
              </p>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
              {/* Search Box */}
              <div className="w-full sm:w-48 lg:w-56 relative">
                <input
                  type="text"
                  placeholder="Search description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-2" />
              </div>

              {/* Type Pill Toggle */}
              <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                    filterType === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                    filterType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  Credit
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                    filterType === 'debit'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-rose-700'
                  }`}
                >
                  Debit
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all shadow-2xs shrink-0 max-w-[130px] sm:max-w-none truncate"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Add Transaction Button */}
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddModal}
                className="text-xs py-1.5 px-3 shadow-sm font-bold shrink-0 ml-auto"
              >
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Desktop Table View (>= md screens) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No transactions found for the selected filter or search query.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const normType = tx.type === 'income' ? 'credit' : tx.type === 'expense' ? 'debit' : tx.type;
                    const isCredit = normType === 'credit';
                    const id = tx._id || tx.id;
                    const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A';

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {dateStr}
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {tx.title}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {tx.notes}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(tx.category)}`}>
                            {tx.category}
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            <span>{tx.paymentMethod || 'UPI'}</span>
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>Credit</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Debit</span>
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className={`py-3.5 px-4 text-right font-black whitespace-nowrap text-sm sm:text-base ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}>
                          {isCredit ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              title="Edit Transaction"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(id, tx.title)}
                              title="Delete Transaction"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Rows (< md screens) */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium text-xs">
                No transactions match your search/filter.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const normType = tx.type === 'income' ? 'credit' : tx.type === 'expense' ? 'debit' : tx.type;
                const isCredit = normType === 'credit';
                const id = tx._id || tx.id;
                const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }) : 'N/A';

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {tx.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500">{dateStr}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(tx.category)}`}>
                            {tx.category}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`text-sm font-black shrink-0 ${isCredit ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isCredit ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                      </div>
                    </div>

                    {/* Footer Row: Payment method, Type badge, and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {isCredit ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Credit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            Debit
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{tx.paymentMethod || 'UPI'}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(id, tx.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 bg-slate-50 border border-slate-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </Card>

      </main>

      {/* ========================================================= */}
      {/* MODAL FORM: Add & Edit Transaction                       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {editingTransaction ? (
                      <>
                        <Pencil className="w-5 h-5 text-indigo-600" />
                        <span>Edit Transaction</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <span>Add New Transaction</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {editingTransaction
                      ? 'Update transaction amount, category, or payment method'
                      : 'Record an income credit or expenditure debit'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                
                {/* 1. Transaction Type Toggle (Credit vs Debit) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                    Transaction Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'credit' })}
                      className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'credit'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Credit (Income)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'debit' })}
                      className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'debit'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Debit (Expense)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Title / Description */}
                <div>
                  <Input
                    label="Transaction Description"
                    placeholder="e.g. Monthly Salary, Grocery Shopping, Coffee"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={formErrors.title}
                    required
                  />
                </div>

                {/* 3. Amount & Date (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Amount (₹ INR)"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 5000"
                      icon={IndianRupee}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      error={formErrors.amount}
                      required
                    />
                  </div>

                  <div>
                    <DateInput
                      label="Transaction Date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      error={formErrors.date}
                      required
                    />
                  </div>
                </div>

                {/* 4. Category & Payment Method (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                      required
                    />
                  </div>

                  <div>
                    <Select
                      label="Payment Method"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      options={PAYMENT_METHODS.map((method) => ({ value: method, label: method }))}
                      required
                    />
                  </div>
                </div>

                {/* 5. Optional Notes / Remarks */}
                <div>
                  <Textarea
                    label="Notes & Remarks (Optional)"
                    placeholder="Add details, invoice numbers, or payment notes..."
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                  >
                    {editingTransaction ? 'Save Changes' : 'Record Transaction'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: Set / Adjust Balance                               */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isBalanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-indigo-600" />
                    <span>Set Balance</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure your initial opening balance or set current live balance
                  </p>
                </div>
                <button
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBalance} className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                    Balance Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBalanceInputMode('starting');
                        setBalanceInput(initialBalance.toString());
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        balanceInputMode === 'starting'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Starting Base
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBalanceInputMode('current');
                        setBalanceInput(summary.totalBalance.toString());
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        balanceInputMode === 'current'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Current Balance
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                    Amount (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      autoFocus
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      placeholder="e.g. 0"
                      className="w-full text-base font-bold pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {balanceInputMode === 'starting'
                      ? 'Live Balance will auto-calculate as: Starting Balance + Total Credit - Total Debit.'
                      : 'Sets your current balance today; all future credits and debits auto-adjust.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInitialBalance(0);
                      localStorage.setItem('trackit_finance_initial_balance', '0');
                      setIsBalanceModalOpen(false);
                      addToast('Base amount reset to ₹0', 'info');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline transition-colors cursor-pointer"
                  >
                    Reset Base to ₹0
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setIsBalanceModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                    >
                      Save Balance
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
