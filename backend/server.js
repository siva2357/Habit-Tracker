const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const signUpRoutes = require('./routes/SignUpRoutes');
const loginRoutes = require('./routes/LoginRoutes');
const accountSettingsRoutes = require('./routes/AccountSettingsRoutes');
const dashboardRoutes = require('./routes/DashboardRoutes');
const habitTrackerRoutes = require('./routes/HabitTrackerRoutes');
const dayPlannerRoutes = require('./routes/DayPlannerRoutes');
const goalPlannerRoutes = require('./routes/GoalPlannerRoutes');
const myProjectsRoutes = require('./routes/MyProjectsRoutes');
const myFitnessRoutes = require('./routes/MyFitnessRoutes');
const myFinancesRoutes = require('./routes/MyFinancesRoutes');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  // Remove trailing slash if present
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/signup', signUpRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/accountsettings', accountSettingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habittracker', habitTrackerRoutes);
app.use('/api/dayplanner', dayPlannerRoutes);
app.use('/api/goalplanner', goalPlannerRoutes);
app.use('/api/myprojects', myProjectsRoutes);
app.use('/api/myfitness', myFitnessRoutes);
app.use('/api/myfinances', myFinancesRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('Habit Tracker API is successfully running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});

// Required for Vercel deployment
module.exports = app;
