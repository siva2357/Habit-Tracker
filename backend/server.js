const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const goalRoutes = require('./routes/goalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const habitRoutes = require('./routes/habitRoutes');
const projectRoutes = require('./routes/projectRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB().then(async () => {
  // Ensure default admin user exists and password is verified
  try {
    const adminEmail = 'admin@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: '123456',
        role: 'admin'
      });
      console.log('Default admin created in active database: admin@gmail.com / 123456');
    } else {
      const isMatch = await admin.matchPassword('123456');
      if (!isMatch) {
        admin.password = '123456';
        await admin.save();
        console.log('Default admin password synced to default: admin@gmail.com / 123456');
      } else {
        console.log('Default admin verified: admin@gmail.com (Authentication ready)');
      }
    }
  } catch (err) {
    console.error('Admin verification error on startup:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Ensure database connection is active before processing API requests (essential for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err.message);
    res.status(503).json({ success: false, message: 'Database connection unavailable: ' + err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/fitness', fitnessRoutes);

// Default Health & API Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend server is running successfully',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'API is ready for development',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
