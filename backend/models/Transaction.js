const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount'],
      min: [0, 'Amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'income', 'expense'],
      required: [true, 'Please specify transaction type (credit/debit)'],
      default: 'debit'
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
      default: 'General'
    },
    date: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Other'],
      default: 'UPI'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
