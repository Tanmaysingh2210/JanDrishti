import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UniversityRegistrationPage() {
  const navigate = useNavigate();

  // Workflow View States: 'stage1' (Details), 'submitted' (Confirmation Screen), 'check_status' (Check Modal), 'stage2' (Representative & Password Setup)
  const [viewState, setViewState] = useState('stage1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check Status email state
  const [checkEmail, setCheckEmail] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Stage 1: University Details
    universityName: '',
    shortName: '',
    code: '',
    type: 'central',
    email: '',
    phone: '',
    website: '',
    address: '',
    state: 'Jharkhand',
    district: 'Ranchi',

    // Stage 2: Representative & Password
    representativeName: '',
    representativeEmail: '',
    representativeMobile: '',
    representativeDesignation: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setError('');
  };

  // 1. Submit Stage 1: University Approval Request
  const handleStage1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.universityName || !formData.code || !formData.email || !formData.phone || !formData.address) {
      setError('Please fill in all required university information fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/university/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Approval request submission failed.');
      }

      setViewState('submitted');
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Check Approval Status by Email
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError('');
    setStatusResult(null);

    if (!checkEmail) {
      setError('Please enter your university official email.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/university/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: checkEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No registration request found for this email.');
      }

      setStatusResult(data);

      if (data.isApproved) {
        // Pre-fill university email and prompt for Stage 2
        setFormData((prev) => ({ ...prev, email: data.university.email }));
      }
    } catch (err) {
      setError(err.message || 'No approval request found.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Stage 2: Final Representative & Password Setup
  const handleStage2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.representativeName || !formData.representativeEmail || !formData.representativeMobile) {
      setError('Please fill in all representative fields.');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

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
      const response = await fetch('http://localhost:3000/api/university/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Final registration failed.');
      }

      setSuccessMsg('University account created & representative configured! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans h-full min-h-screen flex flex-col md:flex-row antialiased">
      {/* LEFT PANEL: Branding & Visuals */}
      <div className="hidden lg:flex w-[45%] bg-[#f8f9fb] flex-col justify-between border-r border-[#e0e3e5] relative overflow-hidden p-12 shrink-0">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <span className="material-symbols-outlined text-[#F36F56] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              assured_workload
            </span>
            <span className="text-2xl font-black tracking-tight text-[#191c1e]">JanDrishti</span>
          </Link>

          <div className="max-w-[400px]">
            <h1 className="text-4xl font-extrabold text-[#191c1e] mb-4 leading-tight">
              Institutional <br />
              <span className="text-[#F36F56] relative inline-block">
                Approval &amp; Onboarding
                <svg className="absolute bottom-[2px] left-0 w-full h-[8px] text-[#F36F56] opacity-30" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0,5 Q50,0 100,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>
            <p className="text-base text-[#58423d]">
              Submit your university details for government admin approval. Once approved, configure your institutional representative and password.
            </p>
          </div>
        </div>

        {/* 3D Visual Box */}
        <div className="relative z-10 my-6 h-[320px] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-[#e0e3e5]/60 flex flex-col items-center justify-center p-6 border border-[#dfc0b9] text-center shadow-inner">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md border border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#F36F56] text-4xl">verified_user</span>
            </div>
            <h3 className="text-lg font-bold text-[#191c1e] mb-1">2-Step Government Approval</h3>
            <p className="text-xs text-[#58423d] max-w-xs">
              1. Submit University Profile → 2. Government Admin Approves → 3. Setup Representative &amp; Password.
            </p>
          </div>
        </div>

        {/* Features Bottom Bar */}
        <div className="relative z-10 pt-6 border-t border-[#e0e3e5] grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="text-xs font-bold text-[#191c1e]">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              group
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

      {/* RIGHT PANEL: Form & Status Views */}
      <div className="w-full lg:w-[55%] flex flex-col min-h-screen overflow-y-auto bg-white">
        <div className="flex-1 flex flex-col justify-center px-6 md:px-[64px] py-[48px] max-w-[720px] mx-auto w-full">
          {/* Top Header with "Check Approval Status" Corner Button */}
          <div className="flex items-center justify-between gap-2 mb-8 pb-4 border-b border-[#e0e3e5]">
            <Link to="/register" className="inline-flex items-center gap-1 text-xs font-bold text-[#58423d] hover:text-[#F36F56]">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Choice Page
            </Link>

            <button
              type="button"
              onClick={() => {
                setError('');
                setStatusResult(null);
                setViewState(viewState === 'check_status' ? 'stage1' : 'check_status');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#2F36ED] text-[#2F36ED] hover:bg-[#2F36ED]/5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-base">manage_search</span>
              {viewState === 'check_status' ? 'Register New Request' : 'Already filled this form? Check for approval'}
            </button>
          </div>

          {/* VIEW 1: STAGE 1 FORM (UNIVERSITY DETAILS) */}
          {viewState === 'stage1' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#F36F56] uppercase tracking-wider mb-1 block">
                  STAGE 1 OF 2: UNIVERSITY APPROVAL REQUEST
                </span>
                <h2 className="text-3xl font-extrabold text-[#191c1e] mb-1">Enter University Details</h2>
                <p className="text-sm text-[#58423d]">
                  Fill in your institution details to submit an approval request to Government Administrators.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStage1Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="universityName"
                    type="text"
                    required
                    value={formData.universityName}
                    onChange={handleChange}
                    placeholder="Full official university name"
                    className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                      Short Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="shortName"
                      type="text"
                      required
                      value={formData.shortName}
                      onChange={handleChange}
                      placeholder="e.g. IIT Ranchi"
                      className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                      University Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="code"
                      type="text"
                      required
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. IITR-JH"
                      className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    University Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                  >
                    <option value="central">Central University</option>
                    <option value="state">State University</option>
                    <option value="deemed">Deemed University</option>
                    <option value="private">Private University</option>
                    <option value="government">Government Institution</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                      Official University Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@university.ac.in"
                      className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                      Official Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    Campus Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full campus street address"
                    className="w-full p-3 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[56px] bg-[#F36F56] text-white font-bold text-sm rounded-xl hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? 'Submitting Request...' : 'Submit University Approval Request'}
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          )}

          {/* VIEW 2: SUBMITTED CONFIRMATION SCREEN */}
          {viewState === 'submitted' && (
            <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">pending_actions</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-800 inline-block">
                Approval Request Submitted
              </span>
              <h2 className="text-2xl font-extrabold text-[#191c1e]">Approval Request Under Government Review</h2>
              <p className="text-xs text-[#58423d] leading-relaxed max-w-md mx-auto">
                Your request to associate <strong>{formData.universityName}</strong> ({formData.email}) with the JanDrishti platform has been successfully submitted to Government Administrators.
              </p>
              <div className="p-4 bg-white rounded-xl border border-[#e0e3e5] text-xs text-left space-y-2 text-[#58423d]">
                <p><strong>Next Steps:</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Government Administrators review and verify your university profile.</li>
                  <li>Once approved, return to this page and click <strong>"Already filled this form? Check for approval"</strong>.</li>
                  <li>Enter <strong>{formData.email}</strong> to set up your representative profile &amp; create your account password.</li>
                </ol>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCheckEmail(formData.email);
                    setViewState('check_status');
                  }}
                  className="px-5 py-2.5 bg-[#2F36ED] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Check Approval Status Now →
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: CHECK APPROVAL STATUS MODAL/CARD */}
          {viewState === 'check_status' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#2F36ED] uppercase tracking-wider mb-1 block">
                  APPROVAL VERIFICATION
                </span>
                <h2 className="text-3xl font-extrabold text-[#191c1e] mb-1">Check University Approval Status</h2>
                <p className="text-sm text-[#58423d]">
                  Enter the official university email you submitted during Stage 1 to check government approval status.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                    Official University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={checkEmail}
                    onChange={(e) => setCheckEmail(e.target.value)}
                    placeholder="info@university.ac.in"
                    className="w-full h-[52px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#2F36ED] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] bg-[#2F36ED] text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Checking Status...' : 'Check Approval Status'}
                  <span className="material-symbols-outlined text-base">search</span>
                </button>
              </form>

              {/* Status Result Box */}
              {statusResult && (
                <div className="mt-6">
                  {statusResult.isApproved ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <span className="material-symbols-outlined text-2xl text-emerald-600">verified</span>
                        <span>Government Approval Granted!</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        Congratulations! <strong>{statusResult.university.name}</strong> has been approved by Government Admin. You can now configure your representative details and set up your password.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            universityName: statusResult.university.name,
                            email: statusResult.university.email,
                            code: statusResult.university.code,
                          }));
                          setViewState('stage2');
                        }}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Proceed to Set Up Representative &amp; Password →
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <span className="material-symbols-outlined text-2xl text-amber-600">hourglass_top</span>
                        <span>Approval Status: Pending Review</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Your university approval request for <strong>{statusResult.university.name}</strong> is currently pending government administrator review. Please check back later.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: STAGE 2 FORM (REPRESENTATIVE & PASSWORD SETUP) */}
          {viewState === 'stage2' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">
                  STAGE 2 OF 2: REPRESENTATIVE &amp; PASSWORD SETUP
                </span>
                <h2 className="text-3xl font-extrabold text-[#191c1e] mb-1">Complete Account Registration</h2>
                <p className="text-sm text-[#58423d]">
                  Your institution is approved! Fill in representative details and set your password to log in.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleStage2Submit} className="space-y-4">
                <div className="p-4 bg-[#f8f9fb] rounded-xl border border-[#e0e3e5] space-y-3">
                  <h4 className="text-xs font-bold text-[#191c1e]">Representative Details</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#58423d] mb-1">Full Name *</label>
                    <input
                      name="representativeName"
                      type="text"
                      required
                      value={formData.representativeName}
                      onChange={handleChange}
                      placeholder="e.g. Prof. A. K. Sharma"
                      className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#58423d] mb-1">Representative Email *</label>
                      <input
                        name="representativeEmail"
                        type="email"
                        required
                        value={formData.representativeEmail}
                        onChange={handleChange}
                        placeholder="admin@university.ac.in"
                        className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#58423d] mb-1">Mobile Number *</label>
                      <input
                        name="representativeMobile"
                        type="tel"
                        required
                        value={formData.representativeMobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile"
                        className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#58423d] mb-1">Designation</label>
                    <input
                      name="representativeDesignation"
                      type="text"
                      value={formData.representativeDesignation}
                      onChange={handleChange}
                      placeholder="e.g. Dean of Research / Registrar"
                      className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] outline-none"
                    />
                  </div>
                </div>

                {/* Password Fields */}
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
                        className="w-full h-[52px] pl-4 pr-12 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
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
                        className="w-full h-[52px] pl-4 pr-12 border border-[#e0e3e5] rounded-xl bg-white text-sm text-[#191c1e] focus:border-[#F36F56] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
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
                  {loading ? 'Creating University Account...' : 'Complete Setup & Create Account'}
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full px-6 py-4 border-t border-[#e0e3e5] bg-white flex flex-col md:flex-row items-center justify-between gap-2 text-center mt-auto">
          <span className="text-xs text-[#58423d]">© 2026 JanDrishti. All rights reserved.</span>
          <div className="flex gap-4 text-xs">
            <a className="text-[#262ce7] hover:underline" href="#">Privacy Policy</a>
            <a className="text-[#262ce7] hover:underline" href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversityRegistrationPage;
