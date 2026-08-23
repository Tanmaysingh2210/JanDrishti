import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function IndustryRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    registrationNumber: '',
    industryType: 'Information Technology & CSR',
    email: '',
    phone: '',
    website: '',
    address: '',
    district: 'Ranchi',
    state: 'Jharkhand',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonMobile: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        companyCode: formData.companyCode,
        registrationNumber: formData.registrationNumber,
        industryType: formData.industryType,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        contactPerson: {
          name: formData.contactPersonName,
          designation: formData.contactPersonDesignation,
          mobileNumber: formData.contactPersonMobile,
        },
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await fetch('https://jandrishti-em1u.onrender.com/api/industry/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Industry registration failed.');
      }

      setSuccessMsg('Industry account created successfully! Redirecting to your dashboard...');
      localStorage.setItem('jandrishti_user_role', 'industry');
      localStorage.setItem('jandrishti_user_info', JSON.stringify(data.industry || {}));

      setTimeout(() => {
        navigate('/industry-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans h-full min-h-screen flex flex-col md:flex-row antialiased">
      {/* LEFT PANEL: Branding & Visual Graphics */}
      <div className="hidden lg:flex w-[45%] bg-[#f2f4f6] flex-col justify-between border-r border-[#e0e3e5] relative overflow-hidden p-12 shrink-0">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-[#F36F56] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              factory
            </span>
            <span className="text-2xl font-black tracking-tight text-[#191c1e]">JanDrishti</span>
          </Link>

          <div className="max-w-[400px]">
            <h1 className="text-4xl font-extrabold text-[#191c1e] mb-4 leading-tight">
              Fuel innovation with <br />
              <span className="text-[#F36F56] relative inline-block">
                strategic R&D & CSR
                <svg className="absolute bottom-[2px] left-0 w-full h-[8px] text-[#F36F56] opacity-30" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0,5 Q50,0 100,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>
            <p className="text-base text-[#58423d]">
              Sponsor university innovation challenges, deploy corporate social responsibility funds, and co-create scalable solutions.
            </p>
          </div>
        </div>

        {/* Visual Box */}
        <div className="relative z-10 my-6 h-[280px] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border border-[#e0e3e5] text-center shadow-sm">
            <div className="w-16 h-16 bg-[#F36F56]/10 text-[#F36F56] rounded-2xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">domain_verification</span>
            </div>
            <h3 className="text-sm font-bold text-[#191c1e] mb-1">Corporate Partner Network</h3>
            <p className="text-xs text-[#58423d] max-w-xs">
              Directly review vetted academic proposals, deploy milestone-based funding, and measure real-world impact.
            </p>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="pt-6 border-t border-[#e0e3e5] grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="text-xs font-bold text-[#191c1e]">Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              partner_exchange
            </span>
            <span className="text-xs font-bold text-[#191c1e]">Collaborative</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <span className="text-xs font-bold text-[#191c1e]">Impactful</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="w-full lg:w-[55%] flex flex-col min-h-screen overflow-y-auto bg-white">
        <div className="flex-1 flex flex-col justify-center px-6 md:px-[64px] py-[48px] max-w-[720px] mx-auto w-full">
          <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-[#e0e3e5]">
            <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58423d] hover:text-[#F36F56]">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Registration Choices
            </Link>
          </div>

          <div className="mb-6">
            <span className="text-xs font-bold text-[#F36F56] tracking-widest uppercase mb-1 block">INDUSTRY PORTAL</span>
            <h2 className="text-3xl font-extrabold text-[#191c1e] mb-1">Register your company</h2>
            <p className="text-sm text-[#58423d]">Create your industry partner account to fund and collaborate on innovations.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-[#191c1e] mb-1">Company Name *</label>
              <input
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Official company name"
                className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
              />
            </div>

            {/* Code & Reg Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Company Code *</label>
                <input
                  name="companyCode"
                  type="text"
                  required
                  value={formData.companyCode}
                  onChange={handleChange}
                  placeholder="e.g. TECHCORP-01"
                  className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Registration / CIN Number *</label>
                <input
                  name="registrationNumber"
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. U72200JH2026PTC012345"
                  className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Corporate Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="csr@company.com"
                  className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                />
              </div>
            </div>

            {/* Contact Person Details */}
            <div className="p-4 bg-[#f8f9fb] rounded-xl border border-[#e0e3e5] space-y-3">
              <h4 className="text-xs font-bold text-[#191c1e]">CSR / Contact Person Details</h4>
              <div>
                <input
                  name="contactPersonName"
                  type="text"
                  required
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="contactPersonDesignation"
                  type="text"
                  value={formData.contactPersonDesignation}
                  onChange={handleChange}
                  placeholder="Designation (e.g. Head of CSR)"
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                />
                <input
                  name="contactPersonMobile"
                  type="tel"
                  value={formData.contactPersonMobile}
                  onChange={handleChange}
                  placeholder="Mobile Number"
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className="w-full h-[52px] pl-4 pr-12 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full h-[52px] pl-4 pr-12 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] focus:ring-2 focus:ring-[#F36F56]/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-[#F36F56] text-white font-bold text-sm rounded-xl hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Registering Company...' : 'Register Industry Account'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>
        </div>

        <footer className="w-full px-6 py-4 border-t border-[#e0e3e5] bg-white flex justify-between items-center text-xs text-[#58423d] mt-auto">
          <span>© 2026 JanDrishti. All rights reserved.</span>
          <div className="flex gap-4">
            <a className="hover:underline" href="#">Privacy Policy</a>
            <a className="hover:underline" href="#">Terms of Use</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default IndustryRegistrationPage;
