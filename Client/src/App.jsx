import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CitizenRegistrationPage from './pages/CitizenRegistrationPage';
import GovtLoginPage from './pages/GovtLoginPage';
import UniversityLoginPage from './pages/UniversityLoginPage';
import UniversityRegistrationPage from './pages/UniversityRegistrationPage';
import GovtDashboardPage from './pages/GovtDashboardPage';
import UniversityDashboardPage from './pages/UniversityDashboardPage';
import IndustryDashboardPage from './pages/IndustryDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/govt-login" element={<GovtLoginPage />} />
        <Route path="/university-login" element={<UniversityLoginPage />} />
        <Route path="/university-register" element={<UniversityRegistrationPage />} />
        <Route path="/register" element={<CitizenRegistrationPage />} />
        <Route path="/citizen-register" element={<CitizenRegistrationPage />} />
        <Route path="/dashboard" element={<GovtDashboardPage />} />
        <Route path="/university-dashboard" element={<UniversityDashboardPage />} />
        <Route path="/industry-dashboard" element={<IndustryDashboardPage />} />
        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

