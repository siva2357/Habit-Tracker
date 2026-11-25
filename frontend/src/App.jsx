import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import ControlPanel from './pages/ControlPanel';

// Core & Module Startup Pages
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/modules/HabitsPage';
import PlannerPage from './pages/modules/PlannerPage';
import GoalsPage from './pages/modules/GoalsPage';
import ProjectsPage from './pages/modules/ProjectsPage';
import ProjectCreatePage from './pages/forms/ProjectCreatePage';
import ProjectDetailPage from './pages/views/ProjectDetailPage';
import ProjectUpdateStepsPage from './pages/forms/ProjectUpdateStepsPage';
import FitnessPage from './pages/modules/FitnessPage';
import FinancesPage from './pages/modules/FinancesPage';

// Protected Route Guard for Admin Only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Login Route Guard: if already logged in, redirect to Control Panel
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* 1. Login Page */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* 2. Control Panel Hub */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ControlPanel />
          </ProtectedRoute>
        }
      />

      {/* 3. Startup Pages for each Core Module */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <HabitsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <PlannerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <ProjectCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute>
            <ProjectCreatePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id/steps"
        element={
          <ProtectedRoute>
            <ProjectUpdateStepsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fitness"
        element={
          <ProtectedRoute>
            <FitnessPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finances"
        element={
          <ProtectedRoute>
            <FinancesPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
