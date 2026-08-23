import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import IssueMap from '../components/IssueMap';
import { openPdfDocument } from '../utils/pdfViewer';

function GovtDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Top Right Profile Dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic Universities State (API driven)
  const [universities, setUniversities] = useState([]);
  const [loadingUnivs, setLoadingUnivs] = useState(false);
  const [univSearchQuery, setUnivSearchQuery] = useState('');
  const [univTypeFilter, setUnivTypeFilter] = useState('all');
  const [univApprovalFilter, setUnivApprovalFilter] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  // Dynamic Challenges / Citizen Issues State (API driven)
  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  // Dynamic Industries State (API driven)
  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [indSearchQuery, setIndSearchQuery] = useState('');
  const [indTypeFilter, setIndTypeFilter] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  // Assignment Modal States in Challenge Detail Page
  const [assignUnivId, setAssignUnivId] = useState('');
  const [assignIndId, setAssignIndId] = useState('');

  // University Proposals for selected challenge
  const [issueProposals, setIssueProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [acceptingProposalId, setAcceptingProposalId] = useState(null);

  // Selected University, Industry, & Updates states for Govt Challenge Detail
  const [govtProjectDetail, setGovtProjectDetail] = useState(null);
  const [govtIndustryProposal, setGovtIndustryProposal] = useState(null);

  useEffect(() => {
    fetchUniversities();
    fetchChallenges();
    fetchIndustries();

    // Close profile dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('https://jandrishti-em1u.onrender.com/api/government/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const fetchUniversities = async () => {
    setLoadingUnivs(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/university', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.universities)) {
        setUniversities(data.universities);
      } else {
        setUniversities([]);
      }
    } catch (err) {
      console.error('Error fetching universities:', err);
      setUniversities([]);
    } finally {
      setLoadingUnivs(false);
    }
  };

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/issues', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.issues)) {
        setChallenges(data.issues);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/industry', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.industries)) {
        setIndustries(data.industries);
      } else {
        setIndustries([]);
      }
    } catch (err) {
      console.error('Error fetching industries:', err);
      setIndustries([]);
    } finally {
      setLoadingIndustries(false);
    }
  };

  const handleApproveUniversity = async (univId, univName) => {
    try {
      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/university/${univId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage(`${univName} has been approved!`);
      } else {
        setToastMessage(`${univName} updated.`);
      }

      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 4000);
      fetchUniversities();
    } catch (err) {
      setToastMessage(`${univName} updated.`);
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 4000);
      fetchUniversities();
    }
  };

  const handleAssignUniversityToChallenge = (univId) => {
    const univ = universities.find((u) => (u.id || u._id) === univId);
    if (!univ || !selectedChallenge) return;

    const updatedChallenge = {
      ...selectedChallenge,
      assignedUniversity: univ,
      status: 'in_progress',
    };

    setSelectedChallenge(updatedChallenge);
    setChallenges((prev) =>
      prev.map((c) => (c._id === selectedChallenge._id || c.id === selectedChallenge.id ? updatedChallenge : c))
    );

    setToastMessage(`Assigned ${univ.name} to challenge!`);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3000);
  };

  const handleAssignIndustryToChallenge = (indId) => {
    const ind = industries.find((i) => (i.id || i._id) === indId);
    if (!ind || !selectedChallenge) return;

    const updatedChallenge = {
      ...selectedChallenge,
      assignedIndustry: ind,
    };

    setSelectedChallenge(updatedChallenge);
    setChallenges((prev) =>
      prev.map((c) => (c._id === selectedChallenge._id || c.id === selectedChallenge.id ? updatedChallenge : c))
    );

    setToastMessage(`Assigned ${ind.companyName} as Industry Partner!`);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3000);
  };

  // Filter Universities dynamically
  const filteredUniversities = universities.filter((univ) => {
    const matchesSearch =
      (univ.name || '').toLowerCase().includes(univSearchQuery.toLowerCase()) ||
      (univ.code || '').toLowerCase().includes(univSearchQuery.toLowerCase()) ||
      (univ.email || '').toLowerCase().includes(univSearchQuery.toLowerCase()) ||
      (univ.district || '').toLowerCase().includes(univSearchQuery.toLowerCase());

    const matchesType = univTypeFilter === 'all' || (univ.type || '').toLowerCase() === univTypeFilter.toLowerCase();

    const matchesApproval =
      univApprovalFilter === 'all' ||
      (univApprovalFilter === 'approved' && univ.isApproved) ||
      (univApprovalFilter === 'pending' && !univ.isApproved);

    return matchesSearch && matchesType && matchesApproval;
  });

  const pendingUnivCount = universities.filter((u) => !u.isApproved).length;
  const approvedUnivCount = universities.filter((u) => u.isApproved).length;

  // Filter Challenges dynamically
  const filteredChallenges = challenges.filter((c) => {
    const title = c.title || '';
    const category = c.category || '';
    const desc = c.description || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter Industries dynamically
  const filteredIndustries = industries.filter((ind) => {
    const matchesSearch =
      (ind.companyName || '').toLowerCase().includes(indSearchQuery.toLowerCase()) ||
      (ind.companyCode || '').toLowerCase().includes(indSearchQuery.toLowerCase()) ||
      (ind.registrationNumber || '').toLowerCase().includes(indSearchQuery.toLowerCase()) ||
      (ind.email || '').toLowerCase().includes(indSearchQuery.toLowerCase()) ||
      (ind.contactPerson?.name || '').toLowerCase().includes(indSearchQuery.toLowerCase());

    const matchesType =
      indTypeFilter === 'all' ||
      (ind.industryType || '').toLowerCase().includes(indTypeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Main Navigation Items (No Administration at bottom as requested)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Challenges', icon: 'warning', badge: challenges.length > 0 ? challenges.length : null },
    { id: 'institutions', label: 'Institutions', icon: 'account_balance', badge: pendingUnivCount > 0 ? pendingUnivCount : null },
    { id: 'industry', label: 'Industry', icon: 'factory', badge: industries.length > 0 ? industries.length : null },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'reports', label: 'Reports', icon: 'description' },
  ];

  const openChallengeDetail = (challenge) => {
    setSelectedChallenge(challenge);
    setActiveView('challenge_detail');
    const issueId = challenge._id || challenge.id;
    fetchProposalsForIssue(issueId);
    fetchProjectDetailForGovt(issueId);
  };

  const fetchProjectDetailForGovt = async (issueId) => {
    if (!issueId) return;
    try {
      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/projects/${issueId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.project) {
        setGovtProjectDetail(data.project);
      } else {
        setGovtProjectDetail(null);
      }
    } catch (err) {
      console.error('Error fetching project detail for govt:', err);
      setGovtProjectDetail(null);
    }

    try {
      const resInd = await fetch('https://jandrishti-em1u.onrender.com/api/industry/proposals/all', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const dataInd = await resInd.json();
      if (resInd.ok && dataInd.success && Array.isArray(dataInd.proposals)) {
        const matchingInd = dataInd.proposals.find(p =>
          (p.issueId?._id || p.issueId) === issueId || (p.projectId?._id || p.projectId) === issueId
        );
        setGovtIndustryProposal(matchingInd || null);
      }
    } catch (err) {
      console.error('Error fetching industry proposals for govt:', err);
    }
  };

  const fetchProposalsForIssue = async (issueId) => {
    if (!issueId) return;
    setLoadingProposals(true);
    setIssueProposals([]);
    try {
      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/government/proposals/issue/${issueId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.proposals)) {
        setIssueProposals(data.proposals);
      } else {
        setIssueProposals([]);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setIssueProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleAcceptProposal = async (proposalId, proposalTitle) => {
    setAcceptingProposalId(proposalId);
    try {
      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/government/proposals/${proposalId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectionNotes: 'Accepted by government' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`Proposal "${proposalTitle}" accepted! Issue assigned to university.`);
        if (data.issue) {
          setSelectedChallenge(data.issue);
        } else {
          setSelectedChallenge((prev) => prev ? { ...prev, status: 'assigned' } : prev);
        }
        // Refresh proposals and challenges
        fetchProposalsForIssue(selectedChallenge._id || selectedChallenge.id);
        fetchChallenges();
      } else {
        setToastMessage(data.message || 'Failed to accept proposal.');
      }
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 4000);
    } catch (err) {
      setToastMessage('Error accepting proposal.');
      setShowNotificationToast(true);
      setTimeout(() => setShowNotificationToast(false), 4000);
    } finally {
      setAcceptingProposalId(null);
    }
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex flex-col h-screen overflow-hidden font-sans antialiased">
      {/* Toast Notification */}
      {showNotificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#191c1e] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-[#F36F56]/30">
          <span className="material-symbols-outlined text-[#F36F56]">check_circle</span>
          <div>
            <div className="text-xs font-bold">Government Admin Action</div>
            <div className="text-xs text-[#dfc0b9]">{toastMessage || 'Operation completed successfully.'}</div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 bg-white border-b border-[#e0e3e5] flex items-center justify-between px-6 h-16 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 w-1/3">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[#F36F56] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-xl font-black text-[#F36F56] tracking-tight">JanDrishti</span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F36F56]/10 text-[#F36F56] font-bold uppercase tracking-wider">
            Government Center
          </span>
        </div>

        {/* Top Right Profile Button with Dropdown Menu */}
        <div className="flex items-center justify-end w-1/3 gap-3">
          <DarkModeToggle />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="flex items-center gap-3 hover:bg-[#f8f9fb] p-1.5 rounded-xl border border-[#e0e3e5] cursor-pointer transition-all shadow-sm"
            >
              <div className="flex flex-col items-end pl-2">
                <span className="text-xs text-[#191c1e] font-bold">District Officer</span>
                <span className="text-[10px] uppercase font-semibold text-[#F36F56]">Admin Access</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#F36F56] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                DO
              </div>
              <span className="material-symbols-outlined text-[#58423d] text-base pr-1">
                {showProfileDropdown ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-[#e0e3e5] rounded-2xl shadow-xl z-50 py-2 divide-y divide-[#e0e3e5] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-[#f8f9fb] rounded-t-2xl">
                  <p className="text-xs font-extrabold text-[#191c1e]">District Officer</p>
                  <p className="text-[11px] text-[#58423d]">admin.ranchi@jharkhand.gov.in</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#F36F56]/10 text-[#F36F56] text-[10px] font-bold">
                    Sovereign Admin
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-red-600">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Side Navigation Bar (Bottom Administration Removed) */}
        <nav className="w-64 bg-white border-r border-[#e0e3e5] flex flex-col justify-between py-6 px-4 shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#58423d] mb-1">
              Main Operations
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F36F56]/10 text-[#F36F56] border border-[#F36F56]/20 font-bold'
                      : 'text-[#58423d] hover:bg-[#f2f4f6] hover:text-[#F36F56]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F36F56] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#f8f9fb]">
          {/* DASHBOARD OVERVIEW VIEW */}
          {activeView === 'dashboard' && (
            <div className="space-y-8 max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Command Center Overview</h1>
                  <p className="text-sm text-[#58423d] mt-1">
                    Live MongoDB metrics for civic challenges, institutional governance, and corporate R&amp;D partners.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('challenges')}
                  className="bg-[#F36F56] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#a83824] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Manage Challenges
                </button>
              </div>

              {/* KPI Cards (Dynamic from API) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div
                  onClick={() => setActiveView('challenges')}
                  className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Reported Challenges</span>
                    <div className="w-10 h-10 rounded-xl bg-[#262ce7]/10 flex items-center justify-center text-[#262ce7]">
                      <span className="material-symbols-outlined text-xl">campaign</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{challenges.length}</div>
                  <div className="mt-2 text-xs font-semibold text-[#262ce7]">Logged in Database</div>
                </div>

                <div
                  onClick={() => setActiveView('institutions')}
                  className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Universities Registered</span>
                    <div className="w-10 h-10 rounded-xl bg-[#F36F56]/10 flex items-center justify-center text-[#F36F56]">
                      <span className="material-symbols-outlined text-xl">school</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{universities.length}</div>
                  <div className="mt-2 text-xs font-semibold text-[#F36F56]">
                    {pendingUnivCount} Awaiting Approval
                  </div>
                </div>

                <div
                  onClick={() => setActiveView('industry')}
                  className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Industry Partners</span>
                    <div className="w-10 h-10 rounded-xl bg-[#454eff]/10 flex items-center justify-center text-[#454eff]">
                      <span className="material-symbols-outlined text-xl">factory</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{industries.length}</div>
                  <div className="mt-2 text-xs font-semibold text-[#454eff]">Corporate CSR Grantees</div>
                </div>

                <div
                  onClick={() => setActiveView('institutions')}
                  className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Approved Institutions</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{approvedUnivCount}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">Active &amp; Granted Access</div>
                </div>
              </div>

              {/* Heatmap & Attention Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* District Heatmap Card — Full Leaflet Map with Issue Dots */}
                <div className="lg:col-span-2 bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden" style={{ height: 420 }}>
                  <div className="px-5 py-3 border-b border-[#e0e3e5] flex justify-between items-center" style={{ height: 54 }}>
                    <div>
                      <h2 className="text-base font-bold text-[#191c1e]">District Spatial Heatmap</h2>
                      <p className="text-[11px] text-[#58423d]">Issue coordinates across Jharkhand — hover a dot for details</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#F36F56]">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {challenges.length} Issues
                    </span>
                  </div>
                  <IssueMap issues={challenges} height={366} />
                </div>


                {/* Urgent Attention Panel */}
                <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm flex flex-col h-[420px]">
                  <div className="p-6 border-b border-[#e0e3e5] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F36F56]">warning</span>
                      Pending Operations
                    </h2>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {pendingUnivCount > 0 && (
                      <div
                        onClick={() => {
                          setUnivApprovalFilter('pending');
                          setActiveView('institutions');
                        }}
                        className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex flex-col gap-1 hover:border-amber-500 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                            Pending University
                          </span>
                          <span className="text-xs text-amber-900 font-bold">{pendingUnivCount} Action Needed</span>
                        </div>
                        <h3 className="text-xs font-bold text-[#191c1e]">University Approvals Awaiting Review</h3>
                        <p className="text-xs text-[#58423d]">
                          {pendingUnivCount} university registration(s) require government admin verification.
                        </p>
                      </div>
                    )}

                    {challenges.filter(c => c.status !== 'assigned').length > 0 ? (
                      challenges.filter(c => c.status !== 'assigned').slice(0, 4).map((c, idx) => (
                        <div
                          key={c._id || idx}
                          onClick={() => openChallengeDetail(c)}
                          className="p-4 rounded-xl border border-[#e0e3e5] bg-white flex flex-col gap-1 hover:border-[#F36F56] transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <span className="bg-[#F36F56] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                              {c.category || 'Civic Issue'}
                            </span>
                            <span className="text-xs text-[#58423d] font-semibold">{c.status || 'submitted'}</span>
                          </div>
                          <h3 className="text-xs font-bold text-[#191c1e]">{c.title}</h3>
                          <p className="text-xs text-[#58423d] line-clamp-1">{c.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#58423d] flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-2xl text-emerald-500">check_circle</span>
                        All issues have been assigned. No pending operations.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES DIRECTORY VIEW (DYNAMIC API DRIVEN) */}
          {activeView === 'challenges' && (
            <div className="space-y-6 max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Challenge Directory</h1>
                  <p className="text-sm text-[#58423d]">
                    Click any challenge to open its dedicated full page view with assigned teams, location, and progress.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchChallenges}
                    className="px-3 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#262ce7] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-sm ${loadingChallenges ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    Refresh API Data
                  </button>
                  <span className="px-3 py-1.5 rounded-full bg-[#F36F56]/10 text-[#F36F56] text-xs font-extrabold">
                    {challenges.length} Logged
                  </span>
                </div>
              </div>

              {/* Challenges Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] flex gap-4 items-center shadow-sm">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenge title, category, or description..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] focus:border-[#F36F56] outline-none"
                  />
                </div>
              </div>

              {/* Challenges Table */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b border-[#e0e3e5]">
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Challenge Title</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Category</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Location / Address</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e3e5]">
                      {loadingChallenges ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-[#58423d]">
                            <div className="w-8 h-8 border-3 border-[#F36F56] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-[#191c1e]">Fetching challenges from server database API...</p>
                          </td>
                        </tr>
                      ) : filteredChallenges.length > 0 ? (
                        filteredChallenges.map((item, idx) => (
                          <tr
                            key={item._id || idx}
                            onClick={() => openChallengeDetail(item)}
                            className="hover:bg-[#f8f9fb] transition-colors cursor-pointer"
                          >
                            <td className="p-4">
                              <div className="font-bold text-sm text-[#191c1e] group-hover:text-[#F36F56]">{item.title}</div>
                              <div className="text-xs text-[#58423d] line-clamp-1 mt-0.5">{item.description}</div>
                            </td>
                            <td className="p-4">
                              <span className="bg-[#f8f9fb] border border-[#e0e3e5] px-2.5 py-1 rounded-lg text-xs font-bold text-[#58423d]">
                                {item.category || 'Civic'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-[#58423d]">
                              <div className="font-semibold text-[#191c1e]">{item.location?.address || 'Main Road'}</div>
                              <div>{item.location?.district || 'Ranchi'}, {item.location?.state || 'Jharkhand'}</div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  item.status === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                                }`}
                              >
                                {item.status || 'under_review'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChallengeDetail(item);
                                }}
                                className="px-4 py-1.5 bg-[#F36F56] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm hover:bg-[#a83824]"
                              >
                                View Full Page →
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-[#58423d]">
                            <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-2">assignment_late</span>
                            <p className="text-sm font-bold text-[#191c1e]">No reported challenges found in database</p>
                            <p className="text-xs text-[#58423d] max-w-md mx-auto mt-1">
                              When citizens submit issues via the portal, they will automatically appear here live.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED CHALLENGE DETAIL FULL PAGE VIEW */}
          {activeView === 'challenge_detail' && selectedChallenge && (
            <div className="space-y-8 max-w-[1280px] mx-auto">
              {/* Back Nav Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e0e3e5] pb-4">
                <div>
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#262ce7] hover:underline mb-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Challenges Directory
                  </button>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1e]">{selectedChallenge.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F36F56]/10 text-[#F36F56]">
                      {selectedChallenge.category || 'Civic Issue'}
                    </span>
                    <span className="text-xs text-[#58423d]">
                      Reported ID: <strong className="text-[#191c1e]">{selectedChallenge._id || selectedChallenge.id}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      selectedChallenge.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : selectedChallenge.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    Status: {selectedChallenge.status || 'under_review'}
                  </span>
                </div>
              </div>

              {/* PROJECT PROGRESS STEPPER TRACKER */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm">
                <h3 className="text-sm font-bold text-[#191c1e] mb-4">Project Progress Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                      ✓
                    </div>
                    <span className="text-xs font-bold text-emerald-800">1. Citizen Logged</span>
                    <span className="text-[11px] text-emerald-600 mt-0.5">Issue Verified</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                      ✓
                    </div>
                    <span className="text-xs font-bold text-emerald-800">2. Govt Triage</span>
                    <span className="text-[11px] text-emerald-600 mt-0.5">Approved for R&amp;D</span>
                  </div>

                  {/* Step 3 */}
                  {(() => {
                    const hasAcceptedProposal = issueProposals.some(p => p.status === 'accepted' || p.status === 'approved');
                    const acceptedProp = issueProposals.find(p => p.status === 'accepted' || p.status === 'approved');
                    const assignedUnivName = acceptedProp?.universityId?.name;

                    return (
                      <div
                        className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                          hasAcceptedProposal
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-slate-50 border-[#e0e3e5]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                            hasAcceptedProposal ? 'bg-emerald-600 text-white' : 'bg-[#e0e3e5] text-[#58423d]'
                          }`}
                        >
                          {hasAcceptedProposal ? '✓' : '3'}
                        </div>
                        <span className="text-xs font-bold text-[#191c1e]">3. University Assigned</span>
                        <span className="text-[11px] text-[#58423d] mt-0.5 font-semibold">
                          {hasAcceptedProposal ? (assignedUnivName || 'University Assigned') : 'Awaiting Proposal Acceptance'}
                        </span>
                      </div>
                    );
                  })()}


                  {/* Step 4 — Industry Collaboration (University-driven) */}
                  <div className="flex flex-col items-center text-center p-3 rounded-xl border bg-[#f8f9fb] border-[#e0e3e5]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 bg-[#454eff] text-white">
                      4
                    </div>
                    <span className="text-xs font-bold text-[#191c1e]">4. Industry Collaboration</span>
                    <span className="text-[11px] text-[#58423d] mt-0.5">University selects partners</span>
                  </div>

                  {/* Step 5 — Deployed & Resolved */}
                  <div
                    className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                      selectedChallenge.status === 'resolved'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-[#f8f9fb] border-[#e0e3e5]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                        selectedChallenge.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-[#e0e3e5] text-[#58423d]'
                      }`}
                    >
                      {selectedChallenge.status === 'resolved' ? '✓' : '5'}
                    </div>
                    <span className="text-xs font-bold text-[#191c1e]">5. Deployed &amp; Resolved</span>
                    <span className="text-[11px] text-[#58423d] mt-0.5">Civic Resolution</span>
                  </div>
                </div>
              </div>

              {/* STACKED FULL-WIDTH SECTIONS */}
              <div className="space-y-6">
                {/* 1. DETAILED DESCRIPTION CARD */}
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-3">
                  <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F36F56]">description</span>
                    Challenge Description &amp; Specifications
                  </h3>
                  <p className="text-sm text-[#58423d] leading-relaxed">
                    {selectedChallenge.description}
                  </p>
                </div>

                {/* 2. MEDIA GALLERY CARD */}
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F36F56]">photo_library</span>
                    Media Gallery (Field Inspections &amp; Photos)
                  </h3>

                  {((selectedChallenge.photos?.length || 0) + (selectedChallenge.videos?.length || 0)) === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-[#58423d] bg-[#f8f9fb] rounded-xl border border-[#e0e3e5]">
                      <span className="material-symbols-outlined text-4xl text-[#e0e3e5] mb-2">image_not_supported</span>
                      <p className="text-xs font-semibold">No media uploaded by citizen</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(selectedChallenge.photos || []).map((photo, idx) => (
                        <div key={photo._id || idx} className="rounded-xl border border-[#e0e3e5] overflow-hidden bg-[#f8f9fb] p-3">
                          <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
                            <img
                              src={photo.url}
                              alt={`Citizen Photo ${idx + 1}`}
                              className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div style={{ display: 'none' }} className="w-full h-40 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-[#58423d] mb-2">
                              <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-1">broken_image</span>
                              <span className="text-xs font-bold">Image failed to load</span>
                            </div>
                          </a>
                          <span className="text-xs font-semibold text-[#191c1e]">Geotagged Photo #{idx + 1}</span>
                          <p className="text-[11px] text-[#58423d]">Captured by Citizen</p>
                        </div>
                      ))}
                      {(selectedChallenge.videos || []).map((video, idx) => (
                        <div key={video._id || idx} className="rounded-xl border border-[#e0e3e5] overflow-hidden bg-[#f8f9fb] p-3">
                          <a href={video.url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="w-full h-40 bg-slate-800 rounded-lg flex flex-col items-center justify-center mb-2 hover:opacity-90 transition-opacity">
                              <span className="material-symbols-outlined text-4xl text-white mb-1">play_circle</span>
                              <span className="text-xs font-bold text-white">Click to Play Video</span>
                            </div>
                          </a>
                          <span className="text-xs font-semibold text-[#191c1e]">Location Video Log #{idx + 1}</span>
                          <p className="text-[11px] text-[#58423d]">Submitted by Citizen</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. LOCATION & GEOTAG DETAILS CARD */}
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F36F56]">location_on</span>
                    Location &amp; Geotag Details
                  </h3>

                  <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e0e3e5] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#58423d]">Street Address:</span>
                      <p className="font-bold text-[#191c1e]">{selectedChallenge.location?.address || 'Main Campus Road'}</p>
                    </div>
                    <div>
                      <span className="text-[#58423d]">District &amp; State:</span>
                      <p className="font-bold text-[#191c1e]">{selectedChallenge.location?.district || 'Ranchi'}, {selectedChallenge.location?.state || 'Jharkhand'}</p>
                    </div>
                    <div>
                      <span className="text-[#58423d]">GPS Coordinates:</span>
                      <p className="font-mono font-bold text-[#262ce7]">23.3441° N, 85.3096° E</p>
                    </div>
                    <div>
                      <span className="text-[#58423d]">Zone Jurisdiction:</span>
                      <p className="font-bold text-[#191c1e]">Ranchi Municipal Corporation</p>
                    </div>
                  </div>
                </div>

                {/* 4. DYNAMIC PARTNERS GRID (2-COLUMN FOR SELECTED UNIVERSITY & SELECTED INDUSTRY) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SELECTED UNIVERSITY PARTNER CARD */}
                  {(() => {
                    const acceptedProp = issueProposals.find(p => p.status === 'accepted' || p.status === 'approved');
                    const hasAcceptedProposal = Boolean(acceptedProp);
                    const univObj = hasAcceptedProposal ? acceptedProp?.universityId : null;
                    const univName = univObj?.name || null;
                    
                    return (
                      <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-[#191c1e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2F36ED] text-xl">account_balance</span>
                            Selected University Partner
                          </h3>
                          {hasAcceptedProposal && univName ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                              Assigned
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-300">
                              Unassigned
                            </span>
                          )}
                        </div>

                        {hasAcceptedProposal && univName ? (
                          <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e0e3e5] space-y-3 text-xs">
                            <div>
                              <p className="font-extrabold text-[#191c1e] text-sm">{univName}</p>
                              <p className="text-[11px] text-[#58423d]">{univObj?.code || 'UNIV-R&D'} · {univObj?.district || 'Ranchi, Jharkhand'}</p>
                              <p className="text-[11px] text-[#2F36ED] font-semibold">{univObj?.email || 'rd.cell@univ.edu.in'}</p>
                            </div>

                            {acceptedProp && (
                              <div className="pt-2 border-t border-[#e0e3e5] space-y-2">
                                <span className="text-[10px] font-bold text-[#58423d] uppercase tracking-wider block">Approved Solution Proposal</span>
                                <p className="font-bold text-[#191c1e]">{acceptedProp.title}</p>
                                <p className="text-[#58423d] text-[11px] line-clamp-2 leading-relaxed">{acceptedProp.solutionDescription}</p>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="bg-white p-2 rounded-lg border border-[#e0e3e5]">
                                    <span className="text-[10px] text-[#58423d] block">Est. Budget</span>
                                    <span className="font-bold text-[#2F36ED]">₹{acceptedProp.estimatedCost?.toLocaleString('en-IN') || '18,50,000'}</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-[#e0e3e5]">
                                    <span className="text-[10px] text-[#58423d] block">Duration</span>
                                    <span className="font-bold text-[#191c1e]">{acceptedProp.timelineMonths || 8} Months</span>
                                  </div>
                                </div>

                                {acceptedProp.facultyInformation?.[0] && (
                                  <div className="text-[11px] text-[#58423d] pt-1">
                                    <strong>Faculty Lead:</strong> {acceptedProp.facultyInformation[0].name} ({acceptedProp.facultyInformation[0].designation || 'Professor'})
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                            <p className="font-bold text-[#191c1e] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400 text-base">domain_disabled</span>
                              Unassigned — No University Selected
                            </p>
                            <p className="text-[11px] text-[#58423d] leading-relaxed">
                              Review the submitted proposals below and click <strong>"Accept Proposal"</strong> to select and assign an academic partner.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* SELECTED INDUSTRY CSR PARTNER CARD */}
                  {(() => {
                    const indProp = govtIndustryProposal;
                    const indCompName = indProp?.industryId?.companyName || indProp?.companyName || (govtProjectDetail?.acceptedProposalId ? 'TechCorp CSR Foundation' : null);
                    
                    return (
                      <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-[#191c1e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#F36F56] text-xl">factory</span>
                            Selected Industry CSR Partner
                          </h3>
                          {indCompName ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                              Co-Funded
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#58423d] text-[10px] font-bold border border-slate-300">
                              Open for CSR
                            </span>
                          )}
                        </div>

                        {indCompName ? (
                          <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e0e3e5] space-y-3 text-xs">
                            <div>
                              <p className="font-extrabold text-[#191c1e] text-sm">{indCompName}</p>
                              <p className="text-[11px] text-[#58423d]">{indProp?.offeringType || 'Financial Grant & IoT Sensors'}</p>
                              <p className="text-[11px] text-[#F36F56] font-semibold">{indProp?.industryId?.email || 'csr@industry.org'}</p>
                            </div>

                            <div className="pt-2 border-t border-[#e0e3e5] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#58423d] uppercase tracking-wider">CSR Pledged Funding</span>
                                <span className="font-extrabold text-[#F36F56] text-sm">
                                  ₹{(indProp?.estimatedValue || indProp?.pledgedAmount || 1500000).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <p className="text-[#58423d] text-[11px] leading-relaxed">
                                {indProp?.description || 'TechCorp CSR Foundation offers ₹15L grant funding and technical equipment to support university deployment.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#58423d] space-y-1">
                            <p className="font-bold text-[#191c1e]">Awaiting Industry CSR Co-Funding</p>
                            <p className="text-[11px]">Once assigned to a University, CSR corporate partners can pledge grant co-funding directly.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 5. PROJECT PROGRESS UPDATES & MILESTONE TIMELINE STREAM CARD */}
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-xl">update</span>
                      Project Progress Updates &amp; Logs Stream
                    </h3>
                    {govtProjectDetail?.updates?.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {govtProjectDetail.updates.length} Updates Posted
                      </span>
                    )}
                  </div>

                  {(!govtProjectDetail?.updates || govtProjectDetail.updates.length === 0) ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#58423d] text-center space-y-1">
                      <span className="material-symbols-outlined text-3xl text-slate-400">pending_actions</span>
                      <p className="font-bold text-[#191c1e] text-sm">No Progress Updates Posted Yet</p>
                      <p className="text-[11px]">As the University R&amp;D team logs deployment milestones, progress logs will appear here live in real time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {govtProjectDetail.updates.map((upd, idx) => (
                        <div key={upd._id || idx} className="p-4 bg-[#f8f9fb] rounded-xl border border-[#e0e3e5] space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-[#191c1e] text-sm">{upd.title}</p>
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                              {upd.milestone || 'In Progress'}
                            </span>
                          </div>
                          <p className="text-[#58423d] leading-relaxed">{upd.description}</p>
                          <div className="flex justify-between items-center text-[11px] text-[#58423d] pt-2 border-t border-[#e0e3e5]">
                            <span>Posted by: <strong>{(typeof upd.postedBy === 'object' && upd.postedBy !== null) ? (upd.postedBy.fullName || upd.postedBy.email || 'University R&D Team') : (upd.postedBy || 'University R&D Team')}</strong></span>
                            <span>{upd.createdAt ? new Date(upd.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. UNIVERSITY PROPOSALS & GOVERNMENT APPROVAL SECTION */}
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2F36ED]">assignment_turned_in</span>
                      University Proposals
                      {issueProposals.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-[#2F36ED]/10 text-[#2F36ED] rounded-full text-[11px] font-bold">{issueProposals.length}</span>
                      )}
                    </h3>
                    <button
                      onClick={() => fetchProposalsForIssue(selectedChallenge._id || selectedChallenge.id)}
                      className="text-xs text-[#F36F56] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Refresh
                    </button>
                  </div>

                  {loadingProposals ? (
                    <div className="flex items-center gap-2 text-xs text-[#58423d] py-4">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Loading proposals...
                    </div>
                  ) : issueProposals.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">inbox</span>
                      No proposals submitted for this issue yet. Universities will appear here after submitting.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {issueProposals.map((proposal) => (
                        <div
                          key={proposal._id}
                          className={`p-5 rounded-xl border ${
                            proposal.status === 'accepted' ? 'border-emerald-300 bg-emerald-50/30' :
                            proposal.status === 'rejected' ? 'border-red-200 bg-red-50/20' :
                            'border-[#e0e3e5] bg-white'
                          } space-y-3`}
                        >
                          {/* Header: Title + Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-[#191c1e] leading-tight">{proposal.title}</h4>
                              <p className="text-[11px] text-[#58423d] mt-0.5">
                                <strong>{proposal.universityId?.name || 'University'}</strong>
                                {proposal.submittedBy?.fullName && ` · ${proposal.submittedBy.fullName}`}
                              </p>
                              {proposal.createdAt && (
                                <p className="text-[10px] text-[#58423d] mt-0.5">
                                  Submitted: {new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                              proposal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {proposal.status}
                            </span>
                          </div>

                          {/* Solution Description */}
                          <p className="text-xs text-[#58423d] bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] leading-relaxed">
                            {proposal.solutionDescription}
                          </p>

                          {/* Cost + Timeline */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#f8f9fb] p-2.5 rounded-xl border border-[#e0e3e5] text-xs">
                              <span className="text-[#58423d] block text-[10px]">Estimated Cost</span>
                              <span className="font-extrabold text-[#2F36ED]">₹{proposal.estimatedCost?.toLocaleString('en-IN') || '—'}</span>
                            </div>
                            <div className="bg-[#f8f9fb] p-2.5 rounded-xl border border-[#e0e3e5] text-xs">
                              <span className="text-[#58423d] block text-[10px]">Timeline</span>
                              <span className="font-extrabold text-[#191c1e]">{proposal.timelineMonths || '—'} month{proposal.timelineMonths !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {/* Faculty Information */}
                          {proposal.facultyInformation?.length > 0 && (
                            <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] space-y-1">
                              <p className="text-[10px] font-bold text-[#58423d] uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-[#2F36ED]">person_book</span>
                                Faculty Information
                              </p>
                              {proposal.facultyInformation.map((f, i) => (
                                <div key={i} className="text-xs text-[#191c1e]">
                                  <span className="font-bold">{f.name}</span>
                                  {f.designation && <span className="text-[#58423d]"> · {f.designation}</span>}
                                  {f.department && <span className="text-[#58423d]"> · {f.department}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Team Information */}
                          {proposal.teamInformation?.length > 0 && (
                            <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] space-y-1">
                              <p className="text-[10px] font-bold text-[#58423d] uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-[#2F36ED]">groups</span>
                                Team Members
                              </p>
                              {proposal.teamInformation.map((m, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-bold text-[#191c1e]">{m.name}</span>
                                  {m.role && <span className="text-[#58423d]"> · {m.role}</span>}
                                  {m.designation && <span className="text-[#58423d]"> · {m.designation}</span>}
                                  {m.email && <p className="text-[#2F36ED] text-[10px]">{m.email}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* PDF Proposal Link */}
                          <button
                            type="button"
                            onClick={() => openPdfDocument(proposal.proposalPdf, {
                              title: proposal.title,
                              university: proposal.universityId?.name,
                              faculty: proposal.facultyInformation?.[0]?.name,
                              description: proposal.solutionDescription,
                              budget: proposal.estimatedCost,
                              timeline: proposal.timelineMonths,
                              team: proposal.teamInformation,
                              date: proposal.createdAt,
                              type: 'University R&D Proposal'
                            })}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#2F36ED]/30 bg-[#2F36ED]/5 hover:bg-[#2F36ED]/10 transition-colors text-left cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base text-[#2F36ED]">picture_as_pdf</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#2F36ED] truncate">
                                {proposal.proposalPdf?.originalName || 'R&D Proposal Document'}
                              </p>
                              <p className="text-[10px] text-[#58423d]">Click to view PDF</p>
                            </div>
                            <span className="material-symbols-outlined text-sm text-[#2F36ED]">open_in_new</span>
                          </button>

                          {/* Accept / Accepted state */}
                          {proposal.status === 'submitted' && (
                            <button
                              onClick={() => handleAcceptProposal(proposal._id, proposal.title)}
                              disabled={!!acceptingProposalId}
                              className="w-full h-[38px] bg-[#F36F56] text-white rounded-xl text-xs font-bold hover:bg-[#a83824] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              {acceptingProposalId === proposal._id ? (
                                <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Accepting...</>
                              ) : (
                                <><span className="material-symbols-outlined text-sm">check_circle</span> Accept Proposal</>
                              )}
                            </button>
                          )}

                          {proposal.status === 'accepted' && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              Accepted — {proposal.universityId?.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* INSTITUTIONS VIEW (STRICTLY BACKEND API DATA) */}
          {activeView === 'institutions' && (
            <div className="space-y-6 max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Institutional Governance</h1>
                  <p className="text-sm text-[#58423d] mt-0.5">
                    View, filter, search, and approve registered universities live from MongoDB database API.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchUniversities}
                    className="px-3 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#262ce7] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-sm ${loadingUnivs ? 'animate-spin' : ''}`}>refresh</span>
                    Refresh API Data
                  </button>
                  <span className="px-3 py-1.5 rounded-full bg-[#262ce7]/10 text-[#262ce7] text-xs font-extrabold">
                    {universities.length} Registered
                  </span>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div
                  onClick={() => setUnivApprovalFilter('all')}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
                    univApprovalFilter === 'all' ? 'border-[#F36F56] ring-2 ring-[#F36F56]/20' : 'border-[#e0e3e5]'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#58423d] uppercase tracking-wider mb-1">Total Universities</div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{universities.length}</div>
                  <div className="text-xs text-[#58423d] mt-1">Total Database Records</div>
                </div>

                <div
                  onClick={() => setUnivApprovalFilter('approved')}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
                    univApprovalFilter === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#e0e3e5]'
                  }`}
                >
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Approved &amp; Active</div>
                  <div className="text-3xl font-extrabold text-emerald-600">{approvedUnivCount}</div>
                  <div className="text-xs text-emerald-700 mt-1">Verified &amp; Granted Access</div>
                </div>

                <div
                  onClick={() => setUnivApprovalFilter('pending')}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
                    univApprovalFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[#e0e3e5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Awaiting Approval</span>
                    {pendingUnivCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>}
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600">{pendingUnivCount}</div>
                  <div className="text-xs text-amber-800 mt-1">Awaiting Government Admin Review</div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative w-full md:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={univSearchQuery}
                    onChange={(e) => setUnivSearchQuery(e.target.value)}
                    placeholder="Search name, code, email, district..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] focus:border-[#F36F56] outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center bg-[#f8f9fb] border border-[#e0e3e5] p-1 rounded-xl">
                    <button
                      onClick={() => setUnivApprovalFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        univApprovalFilter === 'all' ? 'bg-[#F36F56] text-white' : 'text-[#58423d] hover:text-[#191c1e]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setUnivApprovalFilter('approved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        univApprovalFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-[#58423d] hover:text-[#191c1e]'
                      }`}
                    >
                      Approved ({approvedUnivCount})
                    </button>
                    <button
                      onClick={() => setUnivApprovalFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        univApprovalFilter === 'pending' ? 'bg-amber-500 text-white' : 'text-amber-800 hover:text-amber-900'
                      }`}
                    >
                      Awaiting Approval ({pendingUnivCount})
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={univTypeFilter}
                      onChange={(e) => setUnivTypeFilter(e.target.value)}
                      className="px-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
                    >
                      <option value="all">All University Types</option>
                      <option value="central">Central University</option>
                      <option value="state">State University</option>
                      <option value="deemed">Deemed University</option>
                      <option value="private">Private University</option>
                      <option value="government">Government Institution</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* UNIVERSITIES TABLE */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b border-[#e0e3e5]">
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">University &amp; Code</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Type</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Contact Info</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">District / State</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Representative</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Approval Status</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e3e5]">
                      {loadingUnivs ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-[#58423d]">
                            <div className="w-8 h-8 border-3 border-[#F36F56] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-[#191c1e]">Fetching live universities from server API...</p>
                          </td>
                        </tr>
                      ) : filteredUniversities.length > 0 ? (
                        filteredUniversities.map((univ) => {
                          const univId = univ.id || univ._id;
                          return (
                            <tr key={univId} className="hover:bg-[#f8f9fb] transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-sm text-[#191c1e]">{univ.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#191c1e] font-mono text-[11px] font-bold rounded border border-[#e0e3e5]">
                                    {univ.code}
                                  </span>
                                  {univ.shortName && <span className="text-xs text-[#58423d]">({univ.shortName})</span>}
                                </div>
                              </td>

                              <td className="p-4">
                                <span className="px-2.5 py-1 bg-[#262ce7]/10 text-[#262ce7] rounded-lg text-xs font-bold uppercase tracking-wide">
                                  {univ.type}
                                </span>
                              </td>

                              <td className="p-4 text-xs space-y-1">
                                <div className="text-[#191c1e] font-medium">{univ.email}</div>
                                {univ.phone && <div className="text-[#58423d]">+91 {univ.phone}</div>}
                              </td>

                              <td className="p-4 text-xs text-[#58423d]">
                                <div className="font-semibold text-[#191c1e]">{univ.district || 'Ranchi'}</div>
                                <div>{univ.state || 'Jharkhand'}</div>
                              </td>

                              <td className="p-4 text-xs">
                                {univ.representative ? (
                                  <div>
                                    <div className="font-bold text-[#191c1e]">{univ.representative.name}</div>
                                    <div className="text-[11px] text-[#58423d]">{univ.representative.designation || 'Nodal Officer'}</div>
                                    <div className="text-[11px] text-[#262ce7]">{univ.representative.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-[#58423d] italic">Not Assigned</span>
                                )}
                              </td>

                              <td className="p-4">
                                {univ.isApproved ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Approved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                    Awaiting Approval
                                  </span>
                                )}
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!univ.isApproved && (
                                    <button
                                      onClick={() => handleApproveUniversity(univId, univ.name)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-sm">check_circle</span>
                                      Approve
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setSelectedUniversity(univ)}
                                    className="px-3 py-1.5 border border-[#e0e3e5] text-[#262ce7] hover:bg-[#f2f4f6] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-[#58423d]">
                            <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-2">school</span>
                            <p className="text-sm font-bold text-[#191c1e]">No universities found in database</p>
                            <p className="text-xs text-[#58423d] max-w-md mx-auto mt-1">
                              When universities register via the portal (`/university-register`), they will appear here live for government review and approval.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INDUSTRY VIEW (STRICTLY DYNAMIC BACKEND API DATA) */}
          {activeView === 'industry' && (
            <div className="space-y-6 max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Industry Partners &amp; CSR Network</h1>
                  <p className="text-sm text-[#58423d] mt-0.5">
                    Search, filter, and view corporate partners sponsoring university research grants.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchIndustries}
                    className="px-3 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#262ce7] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-sm ${loadingIndustries ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    Refresh API Data
                  </button>
                  <span className="px-3 py-1.5 rounded-full bg-[#454eff]/10 text-[#454eff] text-xs font-extrabold">
                    {industries.length} Corporate Partners
                  </span>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative w-full md:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={indSearchQuery}
                    onChange={(e) => setIndSearchQuery(e.target.value)}
                    placeholder="Search company name, code, CIN, or contact..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] focus:border-[#F36F56] outline-none"
                  />
                </div>

                <div className="relative w-full md:w-auto">
                  <select
                    value={indTypeFilter}
                    onChange={(e) => setIndTypeFilter(e.target.value)}
                    className="w-full md:w-auto px-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs font-semibold text-[#191c1e] cursor-pointer outline-none"
                  >
                    <option value="all">All Industry Sectors</option>
                    <option value="Information Technology">Information Technology &amp; AI</option>
                    <option value="Manufacturing">Manufacturing &amp; Metallurgy</option>
                    <option value="Renewable Energy">Renewable Energy &amp; Solar</option>
                    <option value="Biotechnology">Biotechnology &amp; Health</option>
                  </select>
                </div>
              </div>

              {/* INDUSTRIES TABLE */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b border-[#e0e3e5]">
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Company &amp; Code</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Registration (CIN)</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Industry Sector</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">Corporate Contact</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider">CSR Representative</th>
                        <th className="p-4 text-xs font-bold text-[#58423d] uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e3e5]">
                      {loadingIndustries ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-[#58423d]">
                            <div className="w-8 h-8 border-3 border-[#F36F56] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-[#191c1e]">Fetching live industries from server API...</p>
                          </td>
                        </tr>
                      ) : filteredIndustries.length > 0 ? (
                        filteredIndustries.map((ind) => (
                          <tr key={ind._id} className="hover:bg-[#f8f9fb] transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-sm text-[#191c1e]">{ind.companyName}</div>
                              <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#191c1e] font-mono text-[11px] font-bold rounded border border-[#e0e3e5] inline-block mt-1">
                                {ind.companyCode}
                              </span>
                            </td>

                            <td className="p-4 text-xs font-mono text-[#58423d]">
                              {ind.registrationNumber}
                            </td>

                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-[#454eff]/10 text-[#454eff] rounded-lg text-xs font-bold">
                                {ind.industryType || 'Information Technology'}
                              </span>
                            </td>

                            <td className="p-4 text-xs space-y-1">
                              <div className="text-[#191c1e] font-medium">{ind.email}</div>
                              <div className="text-[#58423d]">+91 {ind.phone}</div>
                            </td>

                            <td className="p-4 text-xs">
                              {ind.contactPerson ? (
                                <div>
                                  <div className="font-bold text-[#191c1e]">{ind.contactPerson.name}</div>
                                  <div className="text-[11px] text-[#58423d]">{ind.contactPerson.designation || 'Head of CSR'}</div>
                                  {ind.contactPerson.mobileNumber && (
                                    <div className="text-[11px] text-[#262ce7]">+91 {ind.contactPerson.mobileNumber}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#58423d] italic">N/A</span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedIndustry(ind)}
                                className="px-3 py-1.5 border border-[#e0e3e5] text-[#262ce7] hover:bg-[#f2f4f6] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-[#58423d]">
                            <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-2">factory</span>
                            <p className="text-sm font-bold text-[#191c1e]">No industry partners found in database</p>
                            <p className="text-xs text-[#58423d] max-w-md mx-auto mt-1">
                              When companies register via the portal (`/industry-register`), they will appear here live.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other Modules Placeholder */}
          {['analytics', 'reports', 'users', 'settings'].includes(activeView) && (
            <div className="space-y-6 max-w-[1280px] mx-auto">
              <h1 className="text-2xl font-bold text-[#191c1e] capitalize">{activeView} Management</h1>
              <div className="bg-white border border-[#e0e3e5] rounded-2xl p-12 text-center text-[#58423d] shadow-sm">
                <span className="material-symbols-outlined text-5xl text-[#F36F56] mb-3">verified_user</span>
                <h3 className="text-lg font-bold text-[#191c1e] mb-1">
                  Active Sovereign {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module
                </h3>
                <p className="text-xs text-[#58423d] max-w-md mx-auto">
                  Authorized access granted for District Officer. System synchronized with central database.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* INDUSTRY DETAIL MODAL */}
      {selectedIndustry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#e0e3e5] relative space-y-4">
            <button
              onClick={() => setSelectedIndustry(null)}
              className="absolute top-4 right-4 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#454eff] bg-[#454eff]/10 px-2.5 py-1 rounded-md">
                {selectedIndustry.companyCode}
              </span>
              <span className="text-xs font-bold text-[#58423d] uppercase">{selectedIndustry.industryType}</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#191c1e]">{selectedIndustry.companyName}</h3>
              <p className="text-xs text-[#58423d] font-mono">CIN: {selectedIndustry.registrationNumber}</p>
            </div>

            <div className="bg-[#f8f9fb] p-4 rounded-xl space-y-2 border border-[#e0e3e5] text-xs">
              <div className="flex justify-between">
                <span className="text-[#58423d]">Corporate Email:</span>
                <span className="font-bold text-[#191c1e]">{selectedIndustry.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58423d]">Corporate Phone:</span>
                <span className="font-bold text-[#191c1e]">+91 {selectedIndustry.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58423d]">District &amp; State:</span>
                <span className="font-bold text-[#191c1e]">{selectedIndustry.district || 'Ranchi'}, {selectedIndustry.state || 'Jharkhand'}</span>
              </div>
              {selectedIndustry.website && (
                <div className="flex justify-between">
                  <span className="text-[#58423d]">Website:</span>
                  <a href={selectedIndustry.website} target="_blank" rel="noreferrer" className="font-bold text-[#262ce7] hover:underline">
                    {selectedIndustry.website}
                  </a>
                </div>
              )}
            </div>

            {selectedIndustry.contactPerson && (
              <div className="p-4 bg-[#454eff]/5 rounded-xl border border-[#454eff]/20 text-xs space-y-1">
                <h4 className="font-bold text-[#454eff] mb-1">CSR &amp; Innovation Lead</h4>
                <p><strong className="text-[#191c1e]">Name:</strong> {selectedIndustry.contactPerson.name}</p>
                <p><strong className="text-[#191c1e]">Designation:</strong> {selectedIndustry.contactPerson.designation || 'Head of CSR'}</p>
                {selectedIndustry.contactPerson.mobileNumber && (
                  <p><strong className="text-[#191c1e]">Mobile:</strong> +91 {selectedIndustry.contactPerson.mobileNumber}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedIndustry(null)}
                className="w-full py-2.5 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#58423d] hover:bg-[#f2f4f6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSITY DETAIL MODAL */}
      {selectedUniversity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#e0e3e5] relative space-y-4">
            <button
              onClick={() => setSelectedUniversity(null)}
              className="absolute top-4 right-4 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#262ce7] bg-[#262ce7]/10 px-2.5 py-1 rounded-md">
                {selectedUniversity.code}
              </span>
              <span className="text-xs font-bold text-[#58423d] uppercase">{selectedUniversity.type} UNIVERSITY</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#191c1e]">{selectedUniversity.name}</h3>
              {selectedUniversity.shortName && <p className="text-xs text-[#58423d] font-semibold">{selectedUniversity.shortName}</p>}
            </div>

            <div className="bg-[#f8f9fb] p-4 rounded-xl space-y-2 border border-[#e0e3e5] text-xs">
              <div className="flex justify-between">
                <span className="text-[#58423d]">Official Email:</span>
                <span className="font-bold text-[#191c1e]">{selectedUniversity.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58423d]">Official Phone:</span>
                <span className="font-bold text-[#191c1e]">{selectedUniversity.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58423d]">District &amp; State:</span>
                <span className="font-bold text-[#191c1e]">{selectedUniversity.district}, {selectedUniversity.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58423d]">Approval Status:</span>
                <span className={`font-bold ${selectedUniversity.isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedUniversity.isApproved ? 'Approved & Active' : 'Awaiting Government Approval'}
                </span>
              </div>
            </div>

            {selectedUniversity.representative && (
              <div className="p-4 bg-[#262ce7]/5 rounded-xl border border-[#262ce7]/20 text-xs space-y-1">
                <h4 className="font-bold text-[#262ce7] mb-1">Nodal Representative</h4>
                <p><strong className="text-[#191c1e]">Name:</strong> {selectedUniversity.representative.name}</p>
                <p><strong className="text-[#191c1e]">Designation:</strong> {selectedUniversity.representative.designation || 'Nodal Officer'}</p>
                <p><strong className="text-[#191c1e]">Email:</strong> {selectedUniversity.representative.email}</p>
                {selectedUniversity.representative.mobile && <p><strong className="text-[#191c1e]">Mobile:</strong> {selectedUniversity.representative.mobile}</p>}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedUniversity(null)}
                className="flex-1 py-2.5 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#58423d] hover:bg-[#f2f4f6]"
              >
                Close
              </button>
              {!selectedUniversity.isApproved && (
                <button
                  onClick={() => {
                    handleApproveUniversity(selectedUniversity.id || selectedUniversity._id, selectedUniversity.name);
                    setSelectedUniversity(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Approve University
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovtDashboardPage;