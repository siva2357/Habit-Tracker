import { Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import DayPlanner from './pages/DayPlanner';
import GoalPlanner from './pages/GoalPlanner';
import MyProjects from './pages/MyProjects';
import MyFitness from './pages/MyFitness';
import MyFinances from './pages/MyFinances';
import AccountSettings from './pages/AccountSettings';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        {/* Main Layout matches the theme instructions */}
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          
          {/* Guest Only Routes (Redirects to dashboard if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Protected Routes (Redirects to login if NOT logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habit-tracker" element={<HabitTracker />} />
            <Route path="/day-planner" element={<DayPlanner />} />
            <Route path="/goal-planner" element={<GoalPlanner />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/my-fitness" element={<MyFitness />} />
            <Route path="/my-finances" element={<MyFinances />} />
            <Route path="/account-settings" element={<AccountSettings />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
