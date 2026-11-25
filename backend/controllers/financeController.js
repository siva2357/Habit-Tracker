const Transaction = require('../models/Transaction');

// Helper to normalize transaction type
const normalizeType = (t) => {
  const lower = (t || '').toLowerCase();
  return lower === 'income' ? 'credit' : lower === 'expense' ? 'debit' : lower;
};

// @desc    Get all transactions with optional filtering
// @route   GET /api/finances
exports.getTransactions = async (req, res) => {
  try {
    const { month, year, type, category } = req.query;
    let query = {};

    if (type && type !== 'all') {
      const norm = normalizeType(type);
      query.type = { $in: [norm, norm === 'credit' ? 'income' : 'expense'] };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (month && month !== 'all') {
      const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
      const monthIndex = parseInt(month, 10) - 1; // 0-based
      const startDate = new Date(Date.UTC(currentYear, monthIndex, 1));
      const endDate = new Date(Date.UTC(currentYear, monthIndex + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    // Compute summary metrics
    const all = await Transaction.find(month && month !== 'all' ? query : {});
    let totalCredit = 0;
    let totalDebit = 0;

    all.forEach((tx) => {
      const norm = normalizeType(tx.type);
      if (norm === 'credit') {
        totalCredit += Number(tx.amount || 0);
      } else {
        totalDebit += Number(tx.amount || 0);
      }
    });

    const totalBalance = totalCredit - totalDebit;

    res.json({
      success: true,
      count: transactions.length,
      summary: {
        totalBalance,
        totalCredit,
        totalDebit,
        savingsRate: totalCredit > 0 ? Math.round(((totalCredit - totalDebit) / totalCredit) * 100) : 0
      },
      data: transactions
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/finances
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    if (!title || amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and type are required'
      });
    }

    const transaction = await Transaction.create({
      title,
      amount: Math.abs(Number(amount)),
      type: normalizeType(type),
      category: category || 'General',
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('createTransaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing transaction
// @route   PUT /api/finances/:id
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    const existing = await Transaction.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (title !== undefined) existing.title = title;
    if (amount !== undefined) existing.amount = Math.abs(Number(amount));
    if (type !== undefined) existing.type = normalizeType(type);
    if (category !== undefined) existing.category = category;
    if (date !== undefined) existing.date = new Date(date);
    if (paymentMethod !== undefined) existing.paymentMethod = paymentMethod;
    if (notes !== undefined) existing.notes = notes;

    await existing.save();

    res.json({
      success: true,
      data: existing
    });
  } catch (error) {
    console.error('updateTransaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/finances/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Transaction.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      id
    });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
