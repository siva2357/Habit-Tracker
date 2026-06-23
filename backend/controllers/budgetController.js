const Budget = require('../models/Budget');

exports.getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({ user: req.user.id });
    if (!budget) {
      budget = await Budget.create({ user: req.user.id, startingBalance: 0, expectedMonthlyIncome: 0 });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { startingBalance, expectedMonthlyIncome } = req.body;
    let budget = await Budget.findOne({ user: req.user.id });
    if (budget) {
      budget.startingBalance = startingBalance;
      budget.expectedMonthlyIncome = expectedMonthlyIncome;
      await budget.save();
    } else {
      budget = await Budget.create({ user: req.user.id, startingBalance, expectedMonthlyIncome });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
