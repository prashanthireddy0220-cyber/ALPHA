import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { GlassHeader } from './components/common/GlassHeader';
import { CursorLight } from './components/3d/CursorLight';
import { GlobalDragonBackground } from './components/3d/GlobalDragonBackground';
import { CinematicIntro } from './components/intro/CinematicIntro';

import { HomePage } from './pages/HomePage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { VolunteerAttendancePage } from './pages/VolunteerAttendancePage';
import { VolunteerLoginPage } from './pages/VolunteerLoginPage';
import { VerifyPassPage } from './pages/VerifyPassPage';

// Protected Route wrappers
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainApp = () => {
  const [introFinished, setIntroFinished] = useState(() => {
    return sessionStorage.getItem('alpha_intro_played') === 'true';
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative selection:bg-cyan-500 selection:text-black">
      {/* 1-Time Session Cinematic Intro */}
      {!introFinished && (
        <CinematicIntro onComplete={() => setIntroFinished(true)} />
      )}

      {/* Global 3D Blue Dragon Atmospheric Environment */}
      <GlobalDragonBackground />
      <CursorLight />

      {/* Liquid Glass Header */}
      <GlassHeader />

      {/* Routes */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event-details" element={<EventDetailsPage />} />
          <Route path="/event-specifications" element={<Navigate to="/event-details" replace />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/tracks" element={<HomePage />} />
          <Route path="/timeline" element={<Navigate to="/" replace />} />
          <Route path="/rules" element={<HomePage />} />
          <Route path="/faq" element={<HomePage />} />
          <Route path="/sponsors" element={<HomePage />} />
          <Route path="/contact" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={<AdminPage />}
          />

          <Route path="/attendance/login" element={<VolunteerLoginPage />} />
          <Route path="/attendance" element={<VolunteerAttendancePage />} />

          {/* Fallback route aliases for typo /attendence */}
          <Route path="/attendence/login" element={<Navigate to="/attendance/login" replace />} />
          <Route path="/attendence" element={<Navigate to="/attendance" replace />} />
          <Route path="/attendence/*" element={<Navigate to="/attendance" replace />} />

          <Route path="/verify/:teamId" element={<VerifyPassPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <MainApp />
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
