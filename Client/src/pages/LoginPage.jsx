import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('govt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'govt') {
      navigate('/dashboard');
    } else if (role === 'univ') {
      navigate('/university-dashboard');
    } else if (role === 'industry') {
      navigate('/industry-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-slate-bg min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-[480px] flex flex-col gap-6 my-auto py-8">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-action-orange">
              JAN-DRISHTI
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              Societal Innovation Collaboration Portal
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors border border-outline-variant rounded-full px-4 py-2 bg-surface cursor-pointer shadow-sm hover:border-primary"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Landing Page
          </Link>
        </header>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-[16px] p-8 custom-shadow border border-surface-container-low">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-sovereign-navy mb-2 tracking-tight">WELCOME BACK</h2>
            <p className="text-sm text-on-surface-variant">Sign in to continue to JanDrishti</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant mb-3 tracking-widest uppercase">
                Select Your Role
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'citizen', label: 'CITIZEN', icon: 'person' },
                  { id: 'govt', label: 'GOVT', icon: 'account_balance' },
                  { id: 'univ', label: 'UNIV', icon: 'school' },
                  { id: 'industry', label: 'INDUSTRY', icon: 'factory' }
                ].map((item) => (
                  <label key={item.id} className="cursor-pointer relative">
                    <input
                      type="radio"
                      name="role"
                      value={item.id}
                      checked={role === item.id}
                      onChange={() => setRole(item.id)}
                      className="peer sr-only"
                    />
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low peer-checked:border-primary-container peer-checked:bg-primary-fixed peer-checked:text-primary-container transition-all">
                      <span className="material-symbols-outlined mb-1 text-xl" style={{ fontVariationSettings: "'FILL' 0", fontWeight: 300 }}>
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-semibold">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary-container mb-1.5" htmlFor="email">
                  Email / Phone
                </label>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email/Phone no"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-container mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-fixed-dim transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant text-primary-container focus:ring-primary-container h-4 w-4"
                />
                <span className="text-xs font-medium text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="text-xs font-semibold text-primary-container hover:text-secondary-container transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-primary-container text-white rounded-xl py-3 px-4 text-sm font-bold hover:bg-secondary-container transition-colors focus:ring-4 focus:ring-primary-fixed-dim outline-none shadow-md cursor-pointer"
              >
                LOGIN
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-green">lock</span>
                Secure Government Institutional Login
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="text-center space-y-3 pt-2">
          <p className="text-xs text-on-surface-variant flex flex-wrap items-center justify-center gap-2">
            <span>New Citizen? <Link className="text-primary-container font-semibold hover:underline" to="/register">Register here</Link></span>
            <span>|</span>
            <span>University? <Link className="text-primary-container font-semibold hover:underline" to="/university-register">Register University</Link></span>
          </p>
          <div className="flex justify-center gap-3 text-xs text-outline">
            <a className="hover:text-primary-container transition-colors" href="#">Privacy Policy</a>
            <span>|</span>
            <a className="hover:text-primary-container transition-colors" href="#">Help Desk</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LoginPage;
