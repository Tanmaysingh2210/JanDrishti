import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function GovtLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const savedRole = localStorage.getItem('jandrishti_user_role');
    const token = localStorage.getItem('jandrishti_token') || localStorage.getItem('government_token');
    const userInfo = localStorage.getItem('jandrishti_user_info');
    if (savedRole || token || userInfo) {
      if (savedRole === 'govt' || token) navigate('/dashboard');
      else if (savedRole === 'univ') navigate('/university-dashboard');
      else if (savedRole === 'industry') navigate('/industry-dashboard');
      else navigate('/citizen-home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/government/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Government login failed');
      }

      if (data.token) {
        localStorage.setItem('government_token', data.token);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to government authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#f8f9fb] text-[#191c1e] font-sans antialiased min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL (45%) */}
      <section className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden bg-gradient-to-br from-[#f8f9fb] to-[#f2f4f6] border-r border-[#dfc0b9]/30 p-8 justify-between">
        {/* Decorative gradient orb */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f36f56]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#f36f56] rounded-lg flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined font-bold">account_balance</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#191c1e]">JanDrishti</span>
          </div>

          {/* Messaging */}
          <div className="mt-4 mb-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#191c1e] mb-4 leading-tight">
              Turning public issues into <span className="text-[#f36f56]">meaningful action.</span>
            </h1>
            <p className="text-lg text-[#58423d] max-w-md">
              Empower government teams to review, coordinate and drive solutions for community problems.
            </p>
          </div>

          {/* Civic Network Visual */}
          <div className="flex-1 flex items-center justify-center relative min-h-[260px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
              <line x1="200" y1="150" x2="100" y2="70" stroke="#e0e3e5" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="200" y1="150" x2="300" y2="70" stroke="#e0e3e5" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="200" y1="150" x2="100" y2="230" stroke="#e0e3e5" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="200" y1="150" x2="300" y2="230" stroke="#e0e3e5" strokeWidth="2" strokeDasharray="4 4" />

              {/* Center Node */}
              <circle cx="200" cy="150" r="36" fill="#f8f9fb" stroke="#F36F56" strokeWidth="3" />
              <text x="200" y="150" textAnchor="middle" dominantBaseline="central" fontFamily="Material Symbols Outlined" fontSize="28" fill="#F36F56">
                account_balance
              </text>

              {/* Surrounding Nodes */}
              <circle cx="100" cy="70" r="22" fill="#f8f9fb" stroke="#F36F56" strokeWidth="2" />
              <text x="100" y="70" textAnchor="middle" dominantBaseline="central" fontFamily="Material Symbols Outlined" fontSize="18" fill="#F36F56">
                groups
              </text>

              <circle cx="300" cy="70" r="22" fill="#f8f9fb" stroke="#F36F56" strokeWidth="2" />
              <text x="300" y="70" textAnchor="middle" dominantBaseline="central" fontFamily="Material Symbols Outlined" fontSize="18" fill="#F36F56">
                lightbulb
              </text>

              <circle cx="100" cy="230" r="22" fill="#f8f9fb" stroke="#262ce7" strokeWidth="2" />
              <text x="100" y="230" textAnchor="middle" dominantBaseline="central" fontFamily="Material Symbols Outlined" fontSize="18" fill="#262ce7">
                school
              </text>

              <circle cx="300" cy="230" r="22" fill="#f8f9fb" stroke="#262ce7" strokeWidth="2" />
              <text x="300" y="230" textAnchor="middle" dominantBaseline="central" fontFamily="Material Symbols Outlined" fontSize="18" fill="#262ce7">
                factory
              </text>
            </svg>
          </div>

          {/* Features */}
          <div className="mt-auto grid grid-cols-3 gap-4 border-t border-[#e0e3e5]/60 pt-6">
            <div>
              <span className="material-symbols-outlined text-[#f36f56] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <h4 className="text-xs font-semibold text-[#191c1e]">Secure</h4>
              <p className="text-[11px] text-[#58423d]">Your data is protected.</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-[#f36f56] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              <h4 className="text-xs font-semibold text-[#191c1e]">Transparent</h4>
              <p className="text-[11px] text-[#58423d]">Track every update.</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-[#f36f56] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              <h4 className="text-xs font-semibold text-[#191c1e]">Impactful</h4>
              <p className="text-[11px] text-[#58423d]">Together, create change.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL (55%) */}
      <section className="w-full lg:w-[55%] flex flex-col bg-white min-h-screen">
        {/* Header Bar */}
        <header className="flex justify-between items-center px-8 py-6 w-full border-b border-[#f2f4f6]">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58423d] hover:text-[#f36f56] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-1 text-xs text-[#58423d]">
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span>English</span>
          </div>
        </header>

        {/* Main Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 max-w-xl mx-auto w-full py-10">
          <div className="mb-8">
            <p className="text-xs font-bold text-[#f36f56] tracking-widest uppercase mb-1">GOVERNMENT PORTAL</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1e] mb-1">Welcome back</h2>
            <p className="text-sm text-[#58423d]">Sign in to manage and coordinate public issues.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#191c1e] block" htmlFor="email">
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
                  placeholder="official@example.gov.in"
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#e0e3e5] rounded-xl text-sm text-[#191c1e] focus:ring-2 focus:ring-[#f36f56]/20 focus:border-[#f36f56] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#191c1e] block" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-[#262ce7] hover:underline">Forgot password?</a>
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
                  className="w-full h-[52px] pl-12 pr-12 bg-white border border-[#e0e3e5] rounded-xl text-sm text-[#191c1e] focus:ring-2 focus:ring-[#f36f56]/20 focus:border-[#f36f56] outline-none transition-all"
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
              className="w-full h-[52px] bg-[#f36f56] hover:bg-[#a83824] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Info Cards */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb]">
              <span className="material-symbols-outlined text-[#f36f56] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <h4 className="text-xs font-bold text-[#191c1e] mb-0.5">Authorized government officials only</h4>
                <p className="text-xs text-[#58423d]">Government accounts are provisioned for authorized officials.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f2f4f6]">
              <span className="material-symbols-outlined text-[#f36f56] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <div>
                <h4 className="text-xs font-bold text-[#191c1e] mb-0.5">Secure government access</h4>
                <p className="text-xs text-[#58423d]">Your access is protected using encrypted token authentication.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-8 py-4 border-t border-[#e0e3e5] mt-auto">
          <div className="max-w-xl mx-auto flex justify-between items-center text-xs text-[#5d5e61]">
            <p>© 2026 JanDrishti. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-[#262ce7] hover:underline">Privacy Policy</a>
              <a href="#" className="text-[#262ce7] hover:underline">Terms of Use</a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default GovtLoginPage;
