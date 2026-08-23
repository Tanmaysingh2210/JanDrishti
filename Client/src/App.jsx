import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationSelectionPage from './pages/RegistrationSelectionPage';
import CitizenRegistrationPage from './pages/CitizenRegistrationPage';
import UniversityRegistrationPage from './pages/UniversityRegistrationPage';
import IndustryRegistrationPage from './pages/IndustryRegistrationPage';
import CitizenHomePage from './pages/CitizenHomePage';
import GovtDashboardPage from './pages/GovtDashboardPage';
import UniversityDashboardPage from './pages/UniversityDashboardPage';
import IndustryDashboardPage from './pages/IndustryDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Registration Portal */}
        <Route path="/register" element={<RegistrationSelectionPage />} />
        <Route path="/citizen-register" element={<CitizenRegistrationPage />} />
        <Route path="/university-register" element={<UniversityRegistrationPage />} />
        <Route path="/register-university" element={<UniversityRegistrationPage />} />
        <Route path="/industry-register" element={<IndustryRegistrationPage />} />

        {/* Citizen Portal Dashboard (Protected) */}
        <Route
          path="/citizen-home"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen-dashboard"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenHomePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Institutional Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['govt']}>
              <GovtDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/university-dashboard"
          element={
            <ProtectedRoute allowedRoles={['univ']}>
              <UniversityDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry-dashboard"
          element={
            <ProtectedRoute allowedRoles={['industry']}>
              <IndustryDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
