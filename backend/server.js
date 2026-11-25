const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
  // Ensure default admin user exists
  try {
    const adminEmail = 'admin@gmail.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: '123456',
        role: 'admin'
      });
      console.log('Default admin seeded: admin@gmail.com / 123456');
    }
  } catch (err) {
    console.error('Auto-seed check error:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

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
