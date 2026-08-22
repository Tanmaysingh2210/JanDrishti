import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UniversityRegistrationPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1: University Info
    universityName: '',
    shortName: '',
    code: '',
    type: 'state',
    email: '',
    phone: '',
    website: '',
    address: '',
    state: 'Jharkhand',
    district: '',

    // Step 2: Representative Info
    representativeName: '',
    representativeDesignation: '',
    representativeEmail: '',
    representativeMobile: '',

    // Step 3: Security
    password: '',
    confirmPassword: '',

    // Step 4: Document
    verificationDocument: null,
  });

  const [docFileName, setDocFileName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'verificationDocument' && files && files[0]) {
      setFormData((prev) => ({ ...prev, verificationDocument: files[0] }));
      setDocFileName(files[0].name);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.universityName || !formData.code || !formData.email) {
        setError('University Name, Code, and Official Email are required.');
        return;
      }
    } else if (step === 2) {
      if (!formData.representativeName || !formData.representativeEmail) {
        setError('Representative Name and Email are required.');
        return;
      }
    } else if (step === 3) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please enter and confirm your password.');
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
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('universityName', formData.universityName);
      data.append('shortName', formData.shortName);
      data.append('code', formData.code);
      data.append('type', formData.type);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('website', formData.website);
      data.append('address', formData.address);
      data.append('state', formData.state);
      data.append('district', formData.district);

      data.append('representativeName', formData.representativeName);
      data.append('representativeDesignation', formData.representativeDesignation);
      data.append('representativeEmail', formData.representativeEmail);
      data.append('representativeMobile', formData.representativeMobile);

      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);

      if (formData.verificationDocument) {
        data.append('verificationDocument', formData.verificationDocument);
      }

      const response = await fetch('http://localhost:5000/api/university/register', {
        method: 'POST',
        body: data,
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'University registration failed.');
      }

      setSuccessMsg('University registered successfully! Awaiting government verification.');
      setTimeout(() => {
        navigate('/university-login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to submit university registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen flex flex-col md:flex-row antialiased font-sans">
      {/* Left Panel: Branding */}
      <div className="hidden md:flex md:w-5/12 bg-[#f2f4f6] flex-col justify-between p-8 xl:p-12 border-r border-[#e0e3e5]">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#262ce7] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-2xl font-bold text-[#191c1e] tracking-tight">JanDrishti</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#191c1e] mb-4 leading-tight">
            Turn expertise into <span className="text-[#f36f56]">real-world impact.</span>
          </h1>
          <p className="text-base text-[#58423d]">
            Bring your university's expertise and innovation to real-world community problems.
          </p>
        </div>

        {/* Node artwork */}
        <div className="relative w-full aspect-square max-w-sm mx-auto my-8">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border border-[#e0e3e5]">
              <span className="material-symbols-outlined text-[#262ce7] text-[36px]">school</span>
            </div>
          </div>
          <div className="absolute top-[12%] left-[12%] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#e0e3e5]">
            <span className="material-symbols-outlined text-[#f36f56]">account_balance</span>
          </div>
          <div className="absolute top-[12%] right-[12%] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#e0e3e5]">
            <span className="material-symbols-outlined text-[#262ce7]">factory</span>
          </div>
          <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#e0e3e5]">
            <span className="material-symbols-outlined text-[#f36f56]">lightbulb</span>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-[#e0e3e5] text-xs text-[#58423d]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#f36f56] text-sm">shield</span>
            <span>Government Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#262ce7] text-sm">group</span>
            <span>Collaborative</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full md:w-7/12 flex flex-col min-h-screen bg-white overflow-y-auto">
        <div className="flex-grow flex flex-col p-6 md:p-12 max-w-3xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f2f4f6]">
            <Link to="/university-login" className="inline-flex items-center gap-1 text-xs font-semibold text-[#58423d] hover:text-[#262ce7]">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Login
            </Link>
            <span className="text-xs text-[#5d5e61]">Step {step} of 4</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <span className="text-xs font-bold text-[#f36f56] tracking-widest uppercase mb-1 block">UNIVERSITY REGISTRATION</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-1">
              {step === 1 && 'Register your university'}
              {step === 2 && 'University representative'}
              {step === 3 && 'Account Security'}
              {step === 4 && 'Verification Document'}
            </h2>
            <p className="text-sm text-[#58423d]">
              {step === 1 && 'Step 1: Tell us about your institution.'}
              {step === 2 && 'Step 2: Tell us who will represent your university.'}
              {step === 3 && 'Step 3: Create secure password credentials.'}
              {step === 4 && 'Step 4: Upload university authorization document.'}
            </p>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { num: 1, label: 'University' },
              { num: 2, label: 'Representative' },
              { num: 3, label: 'Security' },
              { num: 4, label: 'Verification' },
            ].map((item) => (
              <div key={item.num} className="flex flex-col">
                <div className={`h-1.5 w-full rounded-full mb-1 transition-all ${step >= item.num ? 'bg-[#f36f56]' : 'bg-[#e0e3e5]'}`}></div>
                <span className={`text-[11px] font-semibold ${step >= item.num ? 'text-[#f36f56]' : 'text-[#5d5e61]'}`}>
                  0{item.num} {item.label}
                </span>
              </div>
            ))}
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4 bg-[#f8f9fb] p-6 rounded-2xl border border-[#e0e3e5]">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">University Name *</label>
                  <input
                    name="universityName"
                    required
                    value={formData.universityName}
                    onChange={handleChange}
                    placeholder="Full official name of the university"
                    className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">Short Name (Acronym)</label>
                    <input
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleChange}
                      placeholder="e.g. JSSATE / BIT"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">University Code *</label>
                    <input
                      name="code"
                      required
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Official University Code"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">University Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 cursor-pointer"
                  >
                    <option value="state">State University</option>
                    <option value="central">Central University</option>
                    <option value="deemed">Deemed University</option>
                    <option value="private">Private University</option>
                    <option value="other">Other Institution</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">Official Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="registrar@university.edu"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">Official Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Website URL</label>
                  <input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.university.edu"
                    className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Official Address</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Main campus address"
                    className="w-full p-3 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">State</label>
                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State name"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#191c1e] mb-1">District</label>
                    <input
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="District / City"
                      className="w-full h-[50px] px-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4 bg-[#f8f9fb] p-6 rounded-2xl border border-[#e0e3e5]">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Representative Name *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">person</span>
                    <input
                      name="representativeName"
                      required
                      value={formData.representativeName}
                      onChange={handleChange}
                      placeholder="Full name of representative"
                      className="w-full h-[50px] pl-11 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Designation</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">work</span>
                    <input
                      name="representativeDesignation"
                      value={formData.representativeDesignation}
                      onChange={handleChange}
                      placeholder="e.g. Nodal Officer / Dean / HOD"
                      className="w-full h-[50px] pl-11 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Representative Email *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">mail</span>
                    <input
                      name="representativeEmail"
                      type="email"
                      required
                      value={formData.representativeEmail}
                      onChange={handleChange}
                      placeholder="representative@university.edu"
                      className="w-full h-[50px] pl-11 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Representative Mobile</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">phone_iphone</span>
                    <input
                      name="representativeMobile"
                      type="tel"
                      value={formData.representativeMobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="w-full h-[50px] pl-11 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-4 bg-[#f8f9fb] p-6 rounded-2xl border border-[#e0e3e5]">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Password *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">lock</span>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className="w-full h-[50px] pl-11 pr-11 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b716c] text-[20px]">lock</span>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full h-[50px] pl-11 pr-4 rounded-xl border border-[#e0e3e5] bg-white text-sm outline-none focus:border-[#f36f56] focus:ring-2 focus:ring-[#f36f56]/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-4 bg-[#f8f9fb] p-6 rounded-2xl border border-[#e0e3e5]">
                <label className="block text-xs font-semibold text-[#191c1e]">Verification Document (PDF/Image)</label>
                <div className="border-2 border-dashed border-[#e0e3e5] bg-white p-8 rounded-xl text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-[#f36f56] mb-2">upload_file</span>
                  <p className="text-sm font-semibold text-[#191c1e] mb-1">Upload Official Authorization Document</p>
                  <p className="text-xs text-[#58423d] mb-4">Official university letterhead / AICTE approval (Max 10MB)</p>

                  <input
                    type="file"
                    id="verificationDocument"
                    name="verificationDocument"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="verificationDocument"
                    className="px-6 py-2.5 bg-[#e0e0ff] text-[#262ce7] text-xs font-semibold rounded-xl hover:bg-[#secondary-fixed-dim] cursor-pointer transition-colors"
                  >
                    Browse Files
                  </label>

                  {docFileName && (
                    <div className="mt-4 text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      Selected: {docFileName}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[#e0e3e5]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-[#e0e3e5] rounded-xl text-xs font-semibold text-[#58423d] hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-[#f36f56] text-white rounded-xl text-xs font-semibold hover:bg-[#a83824] flex items-center gap-1 cursor-pointer"
                >
                  Continue
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#f36f56] text-white rounded-xl text-xs font-semibold hover:bg-[#a83824] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UniversityRegistrationPage;
