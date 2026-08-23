import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CitizenRegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    aadhaarNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  // Simple password strength calculator (0-4)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/citizen/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          aadhaarNumber: formData.aadhaarNumber,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      if (data.token) {
        localStorage.setItem('jandrishti_token', data.token);
      }
      localStorage.setItem('jandrishti_user_role', 'citizen');
      localStorage.setItem('jandrishti_user_info', JSON.stringify(data.citizen || {}));

      setTimeout(() => {
        navigate('/citizen-home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans h-screen flex flex-col md:flex-row overflow-hidden">
      {/* LEFT PANEL (Branding) */}
      <div className="hidden md:flex flex-col w-[45%] h-full bg-gradient-to-br from-[#fff5f2] to-[#ffe8e4] relative p-8 overflow-hidden justify-between border-r border-[#e0e3e5]">
        {/* Animated Ripples */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-[#f36f56]/20 animate-ping opacity-25"></div>
          <div className="absolute inset-4 rounded-full border border-[#f36f56]/15 animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-[#f36f56] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#191c1e]">JanDrishti</span>
          </div>

          {/* Headline */}
          <div className="max-w-[420px]">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#191c1e] leading-tight">
              Make your voice <span className="text-[#f36f56]">count.</span>
            </h1>
            <p className="text-lg text-[#58423d]">
              Join your community in reporting problems and creating meaningful change.
            </p>
          </div>
        </div>

        {/* Abstract Visual Area */}
        <div className="relative z-10 flex-grow flex items-center justify-center py-6">
          <div className="w-full max-w-[380px] bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/50 text-center">
            <div className="w-16 h-16 bg-[#f36f56]/10 text-[#f36f56] rounded-2xl mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">how_to_reg</span>
            </div>
            <h3 className="text-lg font-bold text-[#191c1e] mb-1">Citizen Empowerment Portal</h3>
            <p className="text-xs text-[#58423d]">
              Directly report civic issues, track resolution progress, and engage with local governance.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="material-symbols-outlined text-[#f36f56] mt-0.5">shield</span>
            <div>
              <h3 className="text-sm font-semibold text-[#191c1e]">Secure</h3>
              <p className="text-xs text-[#58423d]">Your data is protected with SHA-256 Aadhaar hashing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="material-symbols-outlined text-[#f36f56] mt-0.5">visibility</span>
            <div>
              <h3 className="text-sm font-semibold text-[#191c1e]">Transparent</h3>
              <p className="text-xs text-[#58423d]">Track every issue and policy update seamlessly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-white/40 shadow-sm">
            <span className="material-symbols-outlined text-[#f36f56] mt-0.5">group</span>
            <div>
              <h3 className="text-sm font-semibold text-[#191c1e]">Impactful</h3>
              <p className="text-xs text-[#58423d]">Together, we create meaningful societal progress.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Registration Form) */}
      <div className="w-full md:w-[55%] h-full bg-white overflow-y-auto relative">
        {/* Top bar / Language & Nav */}
        <div className="sticky top-0 right-0 px-8 py-4 w-full flex justify-between items-center bg-white/90 backdrop-blur-md z-20 border-b border-[#f2f4f6]">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58423d] hover:text-[#a83824] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Landing Page
          </Link>
          <button type="button" className="flex items-center gap-1 text-xs font-medium text-[#58423d] hover:text-[#191c1e] transition-colors">
            <span className="material-symbols-outlined text-[18px]">language</span>
            English
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>

        <div className="max-w-[600px] mx-auto px-6 py-8 md:py-12 flex flex-col min-h-full">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#f36f56] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-xl font-bold text-[#191c1e]">JanDrishti</span>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <span className="text-xs font-bold text-[#f36f56] tracking-wider uppercase mb-1 block">CITIZEN PORTAL</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-1">Create your account</h2>
            <p className="text-sm text-[#58423d]">Join JanDrishti and make your voice count.</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#191c1e] block">Full Name *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">person</span>
                  <input
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[42px] pr-4 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e]"
                    placeholder="Enter your full name"
                    type="text"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#191c1e] block">Mobile Number *</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#8b716c] text-[20px]">phone_iphone</span>
                    <span className="text-[#8b716c] border-r border-[#e0e3e5] pr-1.5 text-xs">+91</span>
                  </div>
                  <input
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[84px] pr-4 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e]"
                    placeholder="10-digit mobile number"
                    type="tel"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#191c1e] block">Aadhaar Number *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">badge</span>
                  <input
                    name="aadhaarNumber"
                    required
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[42px] pr-4 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e] tracking-widest"
                    placeholder="Enter 12-digit Aadhaar number"
                    type="text"
                    maxLength={12}
                  />
                </div>
                <p className="text-[11px] text-[#5d5e61] mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  Your Aadhaar is hashed using SHA-256 for privacy protection.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#191c1e] block">Email Address *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">mail</span>
                  <input
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[42px] pr-4 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e]"
                    placeholder="name@example.com"
                    type="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#191c1e] block">Password *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">lock</span>
                  <input
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[42px] pr-[42px] rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e]"
                    placeholder="Create password"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] hover:text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {/* Strength indicator */}
                <div className="flex gap-1 mt-1.5">
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength >= 1 ? 'bg-red-400' : 'bg-[#e0e3e5]'}`}></div>
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength >= 2 ? 'bg-orange-400' : 'bg-[#e0e3e5]'}`}></div>
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength >= 3 ? 'bg-yellow-400' : 'bg-[#e0e3e5]'}`}></div>
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength >= 4 ? 'bg-emerald-500' : 'bg-[#e0e3e5]'}`}></div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#191c1e] block">Confirm Password *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">lock</span>
                  <input
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-[52px] pl-[42px] pr-[42px] rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] focus:bg-white focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 outline-none transition-all text-sm text-[#191c1e]"
                    placeholder="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] hover:text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#f36f56] bg-[#f8f9fb] border-[#e0e3e5] rounded focus:ring-[#f36f56]/50 cursor-pointer"
                />
              </div>
              <label htmlFor="agreeTerms" className="text-xs text-[#58423d] cursor-pointer">
                I agree to the <a href="#" className="text-[#262ce7] hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-[#262ce7] hover:underline font-medium">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#f36f56] text-white font-semibold text-sm rounded-xl hover:bg-[#a83824] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#58423d]">
                Already have an account? <Link to="/login" className="text-[#262ce7] font-semibold hover:underline">Login</Link>
              </p>
            </div>

            {/* Security Card */}
            <div className="mt-6 p-4 bg-[#f2f4f6] rounded-xl border border-[#e0e3e5] flex items-start gap-3">
              <div className="bg-[#f36f56]/10 p-2 rounded-full text-[#f36f56] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">shield_lock</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#191c1e] mb-0.5">Your data is safe with us</h4>
                <p className="text-[12px] leading-relaxed text-[#58423d]">
                  We protect your personal information using secure authentication and privacy-first database architecture.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-[#e0e3e5] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-[11px] text-[#5d5e61]">© 2026 JanDrishti Civic Systems. All rights reserved.</span>
            <div className="flex gap-4 text-[11px]">
              <a href="#" className="text-[#5d5e61] hover:text-[#191c1e]">Privacy Policy</a>
              <a href="#" className="text-[#5d5e61] hover:text-[#191c1e]">Terms of Use</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenRegistrationPage;
