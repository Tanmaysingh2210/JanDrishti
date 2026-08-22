import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UniversityLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/university/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'University login failed');
      }

      if (data.token) {
        localStorage.setItem('university_token', data.token);
      }

      navigate('/university-dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to university authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col md:flex-row antialiased font-sans">
      {/* Left Panel (45% Desktop) */}
      <div className="hidden md:flex flex-col w-[45%] bg-[#F1F3F5] relative overflow-hidden p-8 justify-between border-r border-[#e0e3e5]">
        {/* Background Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F1F3F5] via-[#F1F3F5] to-[#ffdad3] opacity-40 z-0"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[32px] text-[#a83824]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
              <span className="text-2xl font-black text-[#191c1e] tracking-tight">JanDrishti</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#191c1e] mb-4 leading-tight">
              Turn expertise into <br />
              <span className="text-[#f36f56]">real-world impact.</span>
            </h1>
            <p className="text-base text-[#58423d] max-w-md">
              Bring academic expertise and innovative solutions to the problems communities face.
            </p>
          </div>

          {/* Ecosystem Visual Node Art */}
          <div className="flex-grow flex items-center justify-center py-6 relative">
            <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
              {/* Central Node */}
              <div className="w-24 h-24 bg-white rounded-full shadow-lg border border-[#e0e3e5] flex flex-col items-center justify-center z-20">
                <div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined text-[#262ce7]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    school
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#191c1e]">University</span>
              </div>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="grid grid-cols-3 gap-4 border-t border-[#e0e3e5] pt-6">
            <div>
              <div className="w-7 h-7 rounded-full bg-[#ffdad3] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[#a83824] text-sm">verified_user</span>
              </div>
              <h4 className="text-xs font-semibold text-[#191c1e]">Secure</h4>
              <p className="text-[11px] text-[#58423d]">Your data is protected.</p>
            </div>
            <div>
              <div className="w-7 h-7 rounded-full bg-[#e0e0ff] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[#262ce7] text-sm">hub</span>
              </div>
              <h4 className="text-xs font-semibold text-[#191c1e]">Collaborative</h4>
              <p className="text-[11px] text-[#58423d]">Connect with real problems.</p>
            </div>
            <div>
              <div className="w-7 h-7 rounded-full bg-[#ffdad3] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[#a83824] text-sm">flare</span>
              </div>
              <h4 className="text-xs font-semibold text-[#191c1e]">Impactful</h4>
              <p className="text-[11px] text-[#58423d]">Turn knowledge to action.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (55% Desktop) */}
      <div className="w-full md:w-[55%] bg-white min-h-screen flex flex-col relative">
        {/* Top Bar */}
        <div className="w-full px-8 py-6 flex justify-between items-center border-b border-[#f2f4f6]">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58423d] hover:text-[#262ce7] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-1 text-xs text-[#58423d]">
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span>English</span>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="flex-grow flex items-center justify-center px-6 sm:px-12 md:px-16 py-10">
          <div className="w-full max-w-[460px]">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-widest text-[#f36f56] uppercase mb-1 block">UNIVERSITY PORTAL</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1e] mb-1">Welcome back</h2>
              <p className="text-sm text-[#58423d]">Sign in to propose solutions to real-world problems.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mb-6">
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#191c1e]" htmlFor="email">
                  Official Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">mail</span>
                  <input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@university.edu"
                    className="block w-full h-[52px] pl-12 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm text-[#191c1e] focus:ring-2 focus:ring-[#f36f56]/20 focus:border-[#f36f56] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-[#191c1e]" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#262ce7] font-medium hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">lock</span>
                  <input
                    id="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full h-[52px] pl-12 pr-12 rounded-xl border border-[#e0e3e5] bg-white text-sm text-[#191c1e] focus:ring-2 focus:ring-[#f36f56]/20 focus:border-[#f36f56] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b716c] hover:text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#f36f56] text-white font-semibold text-sm rounded-xl hover:bg-[#a83824] transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center mb-6">
              <p className="text-xs text-[#58423d]">
                New university to JanDrishti?{' '}
                <Link to="/university-register" className="text-[#262ce7] font-semibold hover:underline">
                  Register your university
                </Link>
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e0e3e5] mb-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-[#e0e0ff] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#262ce7] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#191c1e] mb-0.5">Academic collaboration</h4>
                <p className="text-xs text-[#58423d]">Connect your university's expertise with real-world community problems.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-4 px-8 flex flex-col md:flex-row justify-between items-center gap-2 bg-[#f8f9fb] border-t border-[#e0e3e5] mt-auto">
          <p className="text-xs text-[#5d5e61]">© 2026 JanDrishti Civic Systems. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <a className="text-[#262ce7] hover:underline" href="#">Privacy Policy</a>
            <a className="text-[#262ce7] hover:underline" href="#">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default UniversityLoginPage;
