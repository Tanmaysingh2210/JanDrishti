import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function RegistrationSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] font-sans h-full min-h-screen flex flex-col md:flex-row antialiased">
      {/* LEFT PANEL: Visual Graphics & Branding */}
      <div className="hidden lg:flex w-[45%] bg-[#f2f4f6] flex-col justify-between border-r border-[#e0e3e5] relative overflow-hidden p-12 shrink-0">
        {/* Radial background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#191c1e 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-[#F36F56] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              assured_workload
            </span>
            <span className="text-2xl font-black tracking-tight text-[#191c1e]">JanDrishti</span>
          </Link>

          <div className="max-w-[400px]">
            <h1 className="text-4xl font-extrabold text-[#191c1e] mb-4 leading-tight">
              Empowering societal <br />
              <span className="text-[#F36F56] relative inline-block">
                collaboration & innovation
                <svg className="absolute bottom-[2px] left-0 w-full h-[8px] text-[#F36F56] opacity-30" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0,5 Q50,0 100,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>
            <p className="text-base text-[#58423d]">
              Connect citizens, universities, industries, and government to turn real-world challenges into solved outcomes.
            </p>
          </div>
        </div>

        {/* Central Graphic Illustration */}
        <div className="relative z-10 my-6 h-[300px] flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border border-[#e0e3e5] shadow-sm text-center relative overflow-hidden">
            {/* Visual Nodes */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#F36F56]/10 text-[#F36F56] rounded-2xl flex items-center justify-center shadow-sm border border-[#F36F56]/20 mb-2">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <span className="text-xs font-bold text-[#191c1e]">Citizens</span>
              </div>

              <div className="w-8 h-[2px] bg-[#e0e3e5]"></div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#262ce7]/10 text-[#262ce7] rounded-2xl flex items-center justify-center shadow-md border border-[#262ce7]/20 mb-2">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <span className="text-xs font-bold text-[#191c1e]">Universities</span>
              </div>

              <div className="w-8 h-[2px] bg-[#e0e3e5]"></div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#F36F56]/10 text-[#F36F56] rounded-2xl flex items-center justify-center shadow-sm border border-[#F36F56]/20 mb-2">
                  <span className="material-symbols-outlined text-2xl">factory</span>
                </div>
                <span className="text-xs font-bold text-[#191c1e]">Industries</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#191c1e] mb-1">Unified Innovation Portal</h3>
            <p className="text-xs text-[#58423d] max-w-xs">
              Select your role on the right to access customized portals, workflows, and grant funding tools.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 pt-6 border-t border-[#e0e3e5] grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F36F56] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="text-xs font-bold text-[#191c1e]">Secure</span>
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

      {/* RIGHT PANEL: 3 Registration Options */}
      <div className="w-full lg:w-[55%] flex flex-col min-h-screen overflow-y-auto bg-white">
        <div className="flex-1 flex flex-col justify-center px-6 md:px-[64px] py-[48px] max-w-[720px] mx-auto w-full">
          {/* Top Bar / Nav */}
          <div className="flex items-center justify-between gap-2 mb-8 pb-4 border-b border-[#e0e3e5]">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58423d] hover:text-[#262ce7] transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Landing Page
            </Link>
            <Link to="/login" className="text-xs font-semibold text-[#262ce7] hover:underline">
              Already have an account? Login
            </Link>
          </div>

          {/* Header Title */}
          <div className="mb-8">
            <span className="text-xs font-bold text-[#F36F56] tracking-widest uppercase mb-1 block">
              REGISTRATION PORTAL
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] mb-2">Choose Your Account Type</h2>
            <p className="text-sm text-[#58423d]">Select how you would like to participate in the JanDrishti platform.</p>
          </div>

          {/* 3 REGISTRATION CARDS */}
          <div className="space-y-4 mb-8">
            {/* OPTION 1: CITIZEN */}
            <div
              onClick={() => navigate('/citizen-register')}
              className="group bg-white p-6 rounded-2xl border border-[#e0e3e5] hover:border-[#F36F56] hover:shadow-md transition-all cursor-pointer flex items-start gap-5 relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-[#F36F56]/10 text-[#F36F56] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#F36F56] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#191c1e] group-hover:text-[#F36F56] transition-colors">
                    Register as a Citizen
                  </h3>
                  <span className="material-symbols-outlined text-[#58423d] group-hover:text-[#F36F56] group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <p className="text-xs text-[#58423d] leading-relaxed">
                  Report local civic issues, track resolution progress in real time, and vote on community improvement proposals.
                </p>
              </div>
            </div>

            {/* OPTION 2: UNIVERSITY */}
            <div
              onClick={() => navigate('/university-register')}
              className="group bg-white p-6 rounded-2xl border border-[#e0e3e5] hover:border-[#262ce7] hover:shadow-md transition-all cursor-pointer flex items-start gap-5 relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-[#262ce7]/10 text-[#262ce7] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#262ce7] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#191c1e] group-hover:text-[#262ce7] transition-colors">
                    Register as a University
                  </h3>
                  <span className="material-symbols-outlined text-[#58423d] group-hover:text-[#262ce7] group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <p className="text-xs text-[#58423d] leading-relaxed">
                  Deploy academic research expertise, register student & faculty innovation teams, and access government & industry R&D grants.
                </p>
              </div>
            </div>

            {/* OPTION 3: INDUSTRY */}
            <div
              onClick={() => navigate('/industry-register')}
              className="group bg-white p-6 rounded-2xl border border-[#e0e3e5] hover:border-[#F36F56] hover:shadow-md transition-all cursor-pointer flex items-start gap-5 relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-[#F36F56]/10 text-[#F36F56] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#F36F56] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">factory</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#191c1e] group-hover:text-[#F36F56] transition-colors">
                    Register as an Industry
                  </h3>
                  <span className="material-symbols-outlined text-[#58423d] group-hover:text-[#F36F56] group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
                <p className="text-xs text-[#58423d] leading-relaxed">
                  Sponsor societal innovation challenges, pledge CSR funds for university prototypes, and scale high-impact solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-[#f2f4f6] p-4 rounded-xl border border-[#e0e3e5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#262ce7] text-xl">shield_person</span>
              <span className="text-xs text-[#58423d]">Government bodies register via administrative access.</span>
            </div>
            <Link to="/login" className="text-xs font-semibold text-[#262ce7] hover:underline">
              Govt Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-6 py-4 border-t border-[#e0e3e5] bg-white flex flex-col md:flex-row items-center justify-between gap-2 text-center mt-auto">
          <span className="text-xs text-[#58423d]">© 2026 JanDrishti. All rights reserved.</span>
          <div className="flex gap-4 text-xs">
            <a className="text-[#262ce7] hover:underline" href="#">Privacy Policy</a>
            <a className="text-[#262ce7] hover:underline" href="#">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default RegistrationSelectionPage;
