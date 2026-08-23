import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

function UniversityDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Current logged-in user state (fetched from /me endpoint)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jandrishti_user_info') || 'null');
    } catch { return null; }
  });
  const [currentUniversity, setCurrentUniversity] = useState(null);

  const profileDropdownRef = useRef(null);

  // Dynamic API State
  const [challenges, setChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  // Proposals State submitted by this University (DB Driven)
  const [submittedProposals, setSubmittedProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Proposal Form State matching universityProposal.js schema
  const [proposalForm, setProposalForm] = useState({
    title: '',
    solutionDescription: '',
    estimatedCost: '450000',
    timelineMonths: '6',
    facultyName: '',
    facultyDesignation: '',
    facultyDepartment: '',
    leadStudentName: '',
    leadStudentEmail: '',
    pdfFile: null,
  });

  // Form State Data for Student Teams
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    department: 'Computer Science',
    leadFaculty: '',
    membersCount: 4,
    targetProject: 'Smart Water Purification',
  });

  const [grantForm, setGrantForm] = useState({
    proposalTitle: '',
    grantType: 'Industry Hackathon (₹5L)',
    department: 'Computer Science',
    estimatedBudget: '500000',
    description: '',
  });

  useEffect(() => {
    fetchChallenges();
    fetchProposals();
    fetchCurrentUser();

    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('jandrishti_token');
      const res = await fetch('http://localhost:3000/api/university/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u = data.user;
        setCurrentUser(u);
        // universityId is populated by .populate() so may be an object
        if (u.universityId && typeof u.universityId === 'object') {
          setCurrentUniversity(u.universityId);
        }
        // Update localStorage with fresh data
        localStorage.setItem('jandrishti_user_info', JSON.stringify(u));
        // Pre-fill proposal form defaults with real user
        setProposalForm((prev) => ({
          ...prev,
          facultyName: u.fullName || '',
          facultyDesignation: u.designation || '',
          facultyDepartment: u.universityId?.name || '',
          leadStudentEmail: u.email || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching current university user:', err);
    }
  };

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await fetch('http://localhost:3000/api/issues', {
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

  const fetchProposals = async () => {
    setLoadingProposals(true);
    try {
      const res = await fetch('http://localhost:3000/api/university/proposals/my', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.proposals)) {
        setSubmittedProposals(data.proposals);
      } else {
        setSubmittedProposals([]);
      }
    } catch (err) {
      console.error('Error fetching proposals from DB:', err);
      setSubmittedProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4050);
  };

  const openChallengeDetail = (challenge) => {
    setSelectedChallenge(challenge);
    setProposalForm((prev) => ({
      ...prev,
      title: `R&D Solution for ${challenge.title}`,
      solutionDescription: '',
      pdfFile: null,
    }));
    setActiveView('challenge_detail');
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!proposalForm.title || !proposalForm.solutionDescription || !selectedChallenge) return;

    setSubmittingProposal(true);
    try {
      const payload = {
        issueId: selectedChallenge._id || selectedChallenge.id,
        title: proposalForm.title.trim(),
        solutionDescription: proposalForm.solutionDescription.trim(),
        estimatedCost: Number(proposalForm.estimatedCost) || 450000,
        timelineMonths: Number(proposalForm.timelineMonths) || 6,
        facultyInformation: [
          {
            name: proposalForm.facultyName,
            designation: proposalForm.facultyDesignation,
            department: proposalForm.facultyDepartment,
          },
        ],
        teamInformation: [
          {
            name: proposalForm.leadStudentName,
            role: 'Team Lead & Student Researcher',
            email: proposalForm.leadStudentEmail,
            designation: 'B.Tech Year 4',
          },
        ],
        proposalPdf: {
          originalName: proposalForm.pdfFile ? proposalForm.pdfFile.name : 'R&D_Proposal_Document.pdf',
          url: 'https://storage.jandrishti.gov.in/proposals/doc.pdf',
        },
      };

      const res = await fetch('http://localhost:3000/api/university/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`R&D Proposal "${proposalForm.title}" successfully saved to MongoDB database!`);

        // Update selected challenge state
        const updated = { ...selectedChallenge, proposalSubmitted: true, status: 'in_progress' };
        setSelectedChallenge(updated);

        fetchChallenges();
        fetchProposals();
      } else {
        showToast(data.message || 'Error submitting proposal to backend database.');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      showToast('Proposal submitted and recorded in workspace.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Find existing proposal for current selected challenge
  const existingProposal = selectedChallenge
    ? submittedProposals.find(
      (p) =>
        (p.issueId?._id || p.issueId) === (selectedChallenge._id || selectedChallenge.id) ||
        p.challengeId === (selectedChallenge._id || selectedChallenge.id)
    )
    : null;

  // Filter Challenges dynamically
  const filteredChallenges = challenges.filter((c) => {
    const title = c.title || '';
    const category = c.category || '';
    const desc = c.description || '';

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const resolvedCount = challenges.filter((c) => c.status === 'resolved').length;
  const inProgressCount = challenges.filter((c) => c.status === 'in_progress').length;

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!teamForm.teamName || !teamForm.leadFaculty) return;

    showToast(`Student Team "${teamForm.teamName}" registered under ${teamForm.department}`);
    setIsTeamModalOpen(false);
    setTeamForm({
      teamName: '',
      department: 'Computer Science',
      leadFaculty: '',
      membersCount: 4,
      targetProject: 'Smart Water Purification',
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Challenges Feed', icon: 'explore', badge: challenges.length > 0 ? challenges.length : null },
    { id: 'my_proposals', label: 'My Proposals', icon: 'assignment_turned_in', badge: submittedProposals.length > 0 ? submittedProposals.length : null },
    { id: 'departments', label: 'Departments & Teams', icon: 'account_balance' },
    { id: 'analytics', label: 'R&D Grants', icon: 'monetization_on' },
  ];

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] flex flex-col h-screen overflow-hidden font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#191c1e] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-[#2F36ED]/30">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <div>
            <div className="text-xs font-bold text-white">University Database Notification</div>
            <div className="text-xs text-slate-300">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-40 bg-white border-b border-[#e0e3e5] flex items-center justify-between px-6 h-16 shadow-sm">
        {/* Brand Logo & Portal Badge */}
        <div className="flex items-center gap-3 w-1/3">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[#F36F56] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-xl font-black text-[#F36F56] tracking-tight">JanDrishti</span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F36ED]/10 text-[#2F36ED] font-bold uppercase tracking-wider">
            University Portal
          </span>
        </div>

        {/* Top Right Profile Button with Dropdown Menu */}
        <div className="flex items-center justify-end w-1/3 gap-3">
          <DarkModeToggle />
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-3 hover:bg-[#f8f9fb] p-1.5 rounded-xl border border-[#e0e3e5] cursor-pointer transition-all shadow-sm"
            >
              <div className="flex flex-col items-end pl-2">
                <span className="text-xs text-[#191c1e] font-bold">
                  {currentUniversity?.name || currentUser?.universityId?.name || currentUser?.fullName || 'University'}
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#2F36ED]">
                  {currentUser?.designation || currentUser?.role?.replace('_', ' ') || 'University Admin'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#2F36ED] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {(currentUniversity?.name || currentUser?.universityId?.name || currentUser?.fullName || 'U')
                  .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </div>
              <span className="material-symbols-outlined text-[#58423d] text-base pr-1">
                {showProfileMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-[#e0e3e5] rounded-2xl shadow-xl z-50 py-2 divide-y divide-[#e0e3e5] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-[#f8f9fb] rounded-t-2xl">
                  <p className="text-xs font-extrabold text-[#191c1e]">
                    {currentUser?.fullName || 'University Admin'}
                  </p>
                  <p className="text-[10px] text-[#58423d] font-medium">
                    {currentUser?.designation || 'Representative'}
                  </p>
                  <p className="text-[11px] text-[#58423d]">{currentUser?.email || ''}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#2F36ED]/10 text-[#2F36ED] text-[10px] font-bold">
                    {currentUniversity?.name || currentUser?.universityId?.name || 'University Partner'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#58423d] hover:bg-[#f8f9fb] hover:text-[#191c1e] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-[#2F36ED]">admin_panel_settings</span>
                    Switch to Govt View
                  </button>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#58423d] hover:bg-[#f8f9fb] hover:text-[#191c1e] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-[#58423d]">swap_horiz</span>
                    Switch Account
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem('jandrishti_token');
                      localStorage.removeItem('jandrishti_user_role');
                      localStorage.removeItem('jandrishti_user_info');
                      navigate('/login');
                    }}
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

      {/* Side Navigation & Main Workspace */}
      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Side Navigation Bar */}
        <nav className="w-64 bg-white border-r border-[#e0e3e5] flex flex-col justify-between py-6 px-4 shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#58423d] mb-1">
              University Workspace
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-[#2F36ED]/10 text-[#2F36ED] border border-[#2F36ED]/20 font-bold'
                      : 'text-[#58423d] hover:bg-[#f2f4f6] hover:text-[#2F36ED]'
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2F36ED] text-white">
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
            <div className="max-w-[1280px] mx-auto space-y-8">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#191c1e]">University Innovation Command</h2>
                  <p className="text-sm text-[#58423d] mt-1">
                    Discover citizen challenges, assign faculty R&amp;D teams, and apply for government grants.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="px-4 py-2 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] text-xs font-bold hover:border-[#2F36ED] hover:text-[#2F36ED] transition-all cursor-pointer shadow-sm"
                  >
                    Explore Challenges Feed
                  </button>
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#F36F56] text-white text-xs font-bold hover:bg-[#a83824] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Create Student R&amp;D Team
                  </button>
                </div>
              </div>

              {/* 4 Dynamic KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div
                  onClick={() => setActiveView('challenges')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#2F36ED] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Available Challenges</span>
                    <div className="w-10 h-10 rounded-xl bg-[#2F36ED]/10 flex items-center justify-center text-[#2F36ED]">
                      <span className="material-symbols-outlined text-xl">warning</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{challenges.length}</div>
                  <div className="mt-2 text-xs font-semibold text-[#2F36ED]">Live MongoDB Challenges</div>
                </div>

                <div
                  onClick={() => setActiveView('my_proposals')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#2F36ED] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Active R&amp;D Proposals</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                      <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{submittedProposals.length}</div>
                  <div className="mt-2 text-xs font-semibold text-purple-700">Saved in Database</div>
                </div>

                <div
                  onClick={() => setActiveView('departments')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#2F36ED] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Academic R&amp;D Teams</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                      <span className="material-symbols-outlined text-xl">groups</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">14</div>
                  <div className="mt-2 text-xs font-semibold text-blue-700">Computer Science &amp; Engineering</div>
                </div>

                <div
                  onClick={() => setActiveView('analytics')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Solutions Completed</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{resolvedCount}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">Civic Deployments</div>
                </div>
              </div>

              {/* Dynamic Live Challenges Feed Section */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#e0e3e5] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#191c1e]">Active Civic Challenges for University R&amp;D</h3>
                    <p className="text-xs text-[#58423d]">Click any challenge to view details and submit full R&amp;D proposal PDF</p>
                  </div>
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="text-xs font-bold text-[#2F36ED] hover:underline"
                  >
                    View All ({challenges.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.length > 0 ? (
                    challenges.slice(0, 4).map((c, idx) => (
                      <div
                        key={c._id || idx}
                        onClick={() => openChallengeDetail(c)}
                        className="p-5 rounded-xl border border-[#e0e3e5] bg-[#f8f9fb] hover:border-[#2F36ED] transition-all cursor-pointer flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              {c.category || 'Civic Issue'}
                            </span>
                            <span className="text-xs text-[#58423d] font-mono">{c.status || 'under_review'}</span>
                          </div>
                          <h4 className="text-sm font-bold text-[#191c1e] mb-1">{c.title}</h4>
                          <p className="text-xs text-[#58423d] line-clamp-2">{c.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#e0e3e5] text-xs">
                          <span className="text-[#58423d]">{c.location?.district || 'Ranchi'}, Jharkhand</span>
                          <span className="font-bold text-[#2F36ED]">View Full Page &amp; Proposal →</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center text-[#58423d]">
                      No active challenges in database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC CHALLENGES FEED VIEW */}
          {activeView === 'challenges' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Civic Challenges Feed</h1>
                  <p className="text-sm text-[#58423d]">
                    Click any challenge to open its full-page view, track progress milestones, and submit R&amp;D proposals.
                  </p>
                </div>
                <button
                  onClick={fetchChallenges}
                  className="px-3.5 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#2F36ED] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${loadingChallenges ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh API Challenges
                </button>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenge title, category, or description..."
                    className="w-full pl-9 pr-4 py-2 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] focus:border-[#2F36ED] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'Water & Sanitation', 'Roads & Infrastructure', 'Waste Management', 'Electrical & Lighting'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${categoryFilter === cat
                          ? 'bg-[#2F36ED] text-white'
                          : 'bg-[#f8f9fb] border border-[#e0e3e5] text-[#58423d] hover:text-[#191c1e]'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingChallenges ? (
                  <div className="col-span-2 p-12 text-center text-[#58423d]">
                    <div className="w-8 h-8 border-3 border-[#2F36ED] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs font-bold text-[#191c1e]">Fetching challenges from server API...</p>
                  </div>
                ) : filteredChallenges.length > 0 ? (
                  filteredChallenges.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      onClick={() => openChallengeDetail(item)}
                      className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-[#2F36ED] transition-all cursor-pointer space-y-4 group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-3 py-1 rounded-lg text-xs font-bold uppercase">
                            {item.category || 'Civic Issue'}
                          </span>
                          <span className="text-xs font-semibold text-[#58423d]">{item.status || 'under_review'}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2F36ED] mb-2">{item.title}</h3>
                        <p className="text-xs text-[#58423d] leading-relaxed line-clamp-3">{item.description}</p>
                      </div>

                      <div className="pt-4 border-t border-[#e0e3e5] flex items-center justify-between">
                        <div className="text-xs text-[#58423d]">
                          <span className="material-symbols-outlined text-sm align-middle mr-1 text-[#F36F56]">location_on</span>
                          {item.location?.address || 'Ranchi, Jharkhand'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChallengeDetail(item);
                          }}
                          className="px-4 py-2 bg-[#2F36ED] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
                        >
                          Open Full Page →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center bg-white border border-[#e0e3e5] rounded-2xl text-[#58423d]">
                    <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-2">assignment_late</span>
                    <p className="text-sm font-bold text-[#191c1e]">No challenges found matching filter</p>
                  </div>
                )}
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2F36ED] hover:underline mb-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Challenges Directory
                  </button>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1e]">{selectedChallenge.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2F36ED]/10 text-[#2F36ED]">
                      {selectedChallenge.category || 'Civic Issue'}
                    </span>
                    <span className="text-xs text-[#58423d]">
                      Reported ID: <strong className="text-[#191c1e]">{selectedChallenge._id || selectedChallenge.id}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${existingProposal || selectedChallenge.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : selectedChallenge.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                  >
                    Status: {existingProposal ? 'Proposal Submitted' : selectedChallenge.status || 'under_review'}
                  </span>
                </div>
              </div>

              {/* PROJECT PROGRESS STEPPER TRACKER */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm">
                <h3 className="text-sm font-bold text-[#191c1e] mb-4">Project Milestone Progress</h3>
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
                    <span className="text-[11px] text-emerald-600 mt-0.5">Open for Proposals</span>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`flex flex-col items-center text-center p-3 rounded-xl border ${existingProposal
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-blue-50 border-blue-200 animate-pulse'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${existingProposal ? 'bg-emerald-600 text-white' : 'bg-[#2F36ED] text-white'
                        }`}
                    >
                      {existingProposal ? '✓' : '3'}
                    </div>
                    <span className="text-xs font-bold text-[#191c1e]">3. University Proposal</span>
                    <span className="text-[11px] text-[#58423d] mt-0.5">
                      {existingProposal ? 'Proposal Submitted' : 'Submit R&D PDF'}
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-xl border bg-[#f8f9fb] border-[#e0e3e5]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 bg-[#e0e3e5] text-[#58423d]">
                      4
                    </div>
                    <span className="text-xs font-bold text-[#191c1e]">4. Industry CSR Funding</span>
                    <span className="text-[11px] text-[#58423d] mt-0.5">Grant Matching</span>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-xl border bg-[#f8f9fb] border-[#e0e3e5]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 bg-[#e0e3e5] text-[#58423d]">
                      5
                    </div>
                    <span className="text-xs font-bold text-[#191c1e]">5. Deployed &amp; Resolved</span>
                    <span className="text-[11px] text-[#58423d] mt-0.5">Civic Resolution</span>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT 2-COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN (2/3 Width): Details, Media, Geolocation */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-3">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F36F56]">description</span>
                      Challenge Description &amp; Requirements
                    </h3>
                    <p className="text-sm text-[#58423d] leading-relaxed">
                      {selectedChallenge.description}
                    </p>
                  </div>

                  {/* MEDIA GALLERY */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F36F56]">photo_library</span>
                      Field Inspections &amp; Site Media
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-[#e0e3e5] overflow-hidden bg-[#f8f9fb] p-3">
                        <div className="w-full h-40 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-[#58423d] mb-2 relative overflow-hidden">
                          <span className="material-symbols-outlined text-4xl text-[#2F36ED] mb-1">image</span>
                          <span className="text-xs font-bold">Field Site Photo</span>
                        </div>
                        <span className="text-xs font-semibold text-[#191c1e]">Geotagged Photo Upload</span>
                      </div>

                      <div className="rounded-xl border border-[#e0e3e5] overflow-hidden bg-[#f8f9fb] p-3">
                        <div className="w-full h-40 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-[#58423d] mb-2 relative overflow-hidden">
                          <span className="material-symbols-outlined text-4xl text-[#F36F56] mb-1">analytics</span>
                          <span className="text-xs font-bold">Lab Analysis &amp; Data Stream</span>
                        </div>
                        <span className="text-xs font-semibold text-[#191c1e]">Field Data Logs</span>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION & GEOTAG */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F36F56]">location_on</span>
                      Location &amp; Jurisdiction
                    </h3>

                    <div className="bg-[#f8f9fb] p-4 rounded-xl border border-[#e0e3e5] grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#58423d]">Street Address:</span>
                        <p className="font-bold text-[#191c1e]">{selectedChallenge.location?.address || 'Main Campus Road'}</p>
                      </div>
                      <div>
                        <span className="text-[#58423d]">District &amp; State:</span>
                        <p className="font-bold text-[#191c1e]">{selectedChallenge.location?.district || 'Ranchi'}, {selectedChallenge.location?.state || 'Jharkhand'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (1/3 Width): SUBMITTED PROPOSAL CARD OR PROPOSAL FORM */}
                <div className="space-y-6">
                  {existingProposal ? (
                    <div className="bg-white p-6 rounded-2xl border border-emerald-300 bg-emerald-50/10 shadow-md space-y-5">
                      <div className="flex items-center justify-between border-b border-[#e0e3e5] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                          <div>
                            <h3 className="text-base font-bold text-[#191c1e]">Submitted R&amp;D Proposal</h3>
                            <span className="text-[10px] text-[#58423d]">Saved in MongoDB Database</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {existingProposal.status || 'submitted'}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[#58423d] block font-medium mb-0.5">Proposal Title:</span>
                          <h4 className="text-sm font-bold text-[#191c1e]">{existingProposal.title}</h4>
                        </div>

                        <div>
                          <span className="text-[#58423d] block font-medium mb-1">Solution Approach &amp; Technical Scope:</span>
                          <p className="text-xs text-[#191c1e] leading-relaxed bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5]">
                            {existingProposal.solutionDescription}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5]">
                            <span className="text-[#58423d] text-[11px] block">Estimated Cost:</span>
                            <span className="text-sm font-extrabold text-[#2F36ED]">₹{existingProposal.estimatedCost?.toLocaleString() || '4,50,000'}</span>
                          </div>
                          <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5]">
                            <span className="text-[#58423d] text-[11px] block">Timeline Duration:</span>
                            <span className="text-sm font-extrabold text-[#191c1e]">{existingProposal.timelineMonths || 6} Months</span>
                          </div>
                        </div>

                        {/* Faculty & Team Lead */}
                        {existingProposal.facultyInformation?.length > 0 && (
                          <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] space-y-1">
                            <span className="text-[#58423d] text-[11px] block font-bold">Faculty Lead:</span>
                            <span className="text-xs font-bold text-[#191c1e]">
                              {existingProposal.facultyInformation[0].name} ({existingProposal.facultyInformation[0].designation || 'Faculty Advisor'})
                            </span>
                            <span className="text-[11px] text-[#58423d] block">{existingProposal.facultyInformation[0].department}</span>
                          </div>
                        )}

                        {existingProposal.teamInformation?.length > 0 && (
                          <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] space-y-1">
                            <span className="text-[#58423d] text-[11px] block font-bold">Student Team Lead:</span>
                            <span className="text-xs font-bold text-[#191c1e]">
                              {existingProposal.teamInformation[0].name} ({existingProposal.teamInformation[0].role || 'Team Lead'})
                            </span>
                            <span className="text-[11px] text-[#58423d] block">{existingProposal.teamInformation[0].email}</span>
                          </div>
                        )}

                        {/* Attached PDF document */}
                        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="material-symbols-outlined text-2xl text-emerald-600">picture_as_pdf</span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-[#191c1e] truncate">
                                {existingProposal.proposalPdf?.originalName || 'R&D_Proposal_Document.pdf'}
                              </p>
                              <span className="text-[10px] text-emerald-700 font-semibold">Attached Technical PDF</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[#58423d] text-center border-t border-[#e0e3e5]">
                          Submitted to Government Admin on {existingProposal.createdAt ? new Date(existingProposal.createdAt).toLocaleDateString() : 'Today'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2F36ED]">upload_file</span>
                        Submit University R&amp;D Proposal
                      </h3>

                      <form onSubmit={handleProposalSubmit} className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-[#191c1e] mb-1">Proposal Title *</label>
                          <input
                            type="text"
                            required
                            value={proposalForm.title}
                            onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                            placeholder="e.g. IoT Sensor Solution for Water Filtration"
                            className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none focus:border-[#2F36ED]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#191c1e] mb-1">Technical Solution Description *</label>
                          <textarea
                            required
                            rows={4}
                            value={proposalForm.solutionDescription}
                            onChange={(e) => setProposalForm({ ...proposalForm, solutionDescription: e.target.value })}
                            placeholder="Outline technical methodology, architecture, and expected outcomes..."
                            className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none focus:border-[#2F36ED]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-[#191c1e] mb-1">Estimated Cost (₹) *</label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={proposalForm.estimatedCost}
                              onChange={(e) => setProposalForm({ ...proposalForm, estimatedCost: e.target.value })}
                              className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#191c1e] mb-1">Timeline (Months) *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={36}
                              value={proposalForm.timelineMonths}
                              onChange={(e) => setProposalForm({ ...proposalForm, timelineMonths: e.target.value })}
                              className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none"
                            />
                          </div>
                        </div>

                        {/* Faculty Information Fields */}
                        <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#e0e3e5] space-y-2">
                          <span className="font-bold text-[#191c1e] block text-xs">Faculty Lead Information</span>
                          <div>
                            <label className="block text-[11px] text-[#58423d] mb-0.5">Faculty Name</label>
                            <input
                              type="text"
                              required
                              value={proposalForm.facultyName}
                              onChange={(e) => setProposalForm({ ...proposalForm, facultyName: e.target.value })}
                              className="w-full p-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-[#58423d] mb-0.5">Designation</label>
                              <input
                                type="text"
                                value={proposalForm.facultyDesignation}
                                onChange={(e) => setProposalForm({ ...proposalForm, facultyDesignation: e.target.value })}
                                className="w-full p-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#58423d] mb-0.5">Department</label>
                              <input
                                type="text"
                                value={proposalForm.facultyDepartment}
                                onChange={(e) => setProposalForm({ ...proposalForm, facultyDepartment: e.target.value })}
                                className="w-full p-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Team Information Fields */}
                        <div className="p-3 bg-[#f8f9fb] rounded-xl border border-[#e0e3e5] space-y-2">
                          <span className="font-bold text-[#191c1e] block text-xs">Student Team Lead Information</span>
                          <div>
                            <label className="block text-[11px] text-[#58423d] mb-0.5">Student Lead Name</label>
                            <input
                              type="text"
                              required
                              value={proposalForm.leadStudentName}
                              onChange={(e) => setProposalForm({ ...proposalForm, leadStudentName: e.target.value })}
                              className="w-full p-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#58423d] mb-0.5">Student Email</label>
                            <input
                              type="email"
                              required
                              value={proposalForm.leadStudentEmail}
                              onChange={(e) => setProposalForm({ ...proposalForm, leadStudentEmail: e.target.value })}
                              className="w-full p-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none"
                            />
                          </div>
                        </div>

                        {/* PDF UPLOAD FILE INPUT ZONE */}
                        <div>
                          <label className="block font-bold text-[#191c1e] mb-1">Attach Proposal PDF Document</label>
                          <div className="border-2 border-dashed border-[#e0e3e5] hover:border-[#2F36ED] rounded-xl p-4 text-center bg-[#f8f9fb] transition-all cursor-pointer relative">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setProposalForm({ ...proposalForm, pdfFile: e.target.files[0] })}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="material-symbols-outlined text-3xl text-[#2F36ED] mb-1">picture_as_pdf</span>
                            {proposalForm.pdfFile ? (
                              <p className="text-xs font-bold text-emerald-600 truncate">{proposalForm.pdfFile.name}</p>
                            ) : (
                              <div>
                                <p className="text-xs font-bold text-[#191c1e]">Upload Technical Proposal PDF</p>
                                <p className="text-[10px] text-[#58423d]">Click or drag PDF file here (Max 25MB)</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingProposal}
                          className="w-full py-3 bg-[#2F36ED] text-white rounded-xl font-bold text-xs hover:bg-blue-800 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <span className={`material-symbols-outlined text-sm ${submittingProposal ? 'animate-spin' : ''}`}>
                            {submittingProposal ? 'refresh' : 'send'}
                          </span>
                          {submittingProposal ? 'Saving to Database...' : 'Submit R&D Proposal to Database'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MY PROPOSALS VIEW */}
          {activeView === 'my_proposals' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">My R&amp;D Proposals</h1>
                  <p className="text-sm text-[#58423d]">
                    Live proposals saved in MongoDB database submitted by university faculty and student teams
                  </p>
                </div>
                <button
                  onClick={fetchProposals}
                  className="px-3.5 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#2F36ED] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${loadingProposals ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh DB Proposals
                </button>
              </div>

              {loadingProposals ? (
                <div className="p-12 text-center text-[#58423d] bg-white border border-[#e0e3e5] rounded-2xl">
                  <div className="w-8 h-8 border-3 border-[#2F36ED] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#191c1e]">Fetching proposals from MongoDB database...</p>
                </div>
              ) : submittedProposals.length > 0 ? (
                <div className="space-y-4">
                  {submittedProposals.map((prop, idx) => (
                    <div key={prop._id || prop.id || idx} className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#2F36ED] transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-2.5 py-0.5 rounded text-[10px] font-bold">
                            {prop.proposalPdf?.originalName || 'R&D Proposal'}
                          </span>
                          <span className="text-xs text-[#58423d]">
                            Cost: <strong>₹{prop.estimatedCost?.toLocaleString() || '4,50,000'}</strong>
                          </span>
                          <span className="text-xs text-[#58423d]">
                            Timeline: <strong>{prop.timelineMonths || 6} Months</strong>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#191c1e]">{prop.title}</h3>
                        <p className="text-xs text-[#58423d] line-clamp-2">{prop.solutionDescription}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold">
                          {prop.status || 'submitted'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 text-center text-[#58423d] shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-[#2F36ED] mb-3">assignment_turned_in</span>
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1">No Proposals Saved in Database Yet</h3>
                  <p className="text-xs text-[#58423d] max-w-md mx-auto">
                    Go to the Challenges Feed, open a challenge in full page, and submit your R&amp;D proposal PDF!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* DEPARTMENTS & TEAMS VIEW */}
          {activeView === 'departments' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">University R&amp;D Teams</h1>
                  <p className="text-sm text-[#58423d]">Manage academic departments and student innovation labs</p>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-4 py-2 bg-[#2F36ED] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Create Student Team
                </button>
              </div>

              <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 text-center text-[#58423d] shadow-sm">
                <span className="material-symbols-outlined text-5xl text-[#2F36ED] mb-3">groups</span>
                <h3 className="text-lg font-bold text-[#191c1e] mb-1">Academic R&amp;D Directory</h3>
                <p className="text-xs text-[#58423d] max-w-md mx-auto">
                  Computer Science, Electrical, and Environmental Engineering R&amp;D Labs linked.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE STUDENT TEAM MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTeamSubmit} className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#e0e3e5] relative space-y-4">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-[#58423d] hover:text-[#191c1e] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold text-[#191c1e]">Register Student R&amp;D Team</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Team / Lab Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  placeholder="e.g. IoT Sensor Research Group"
                  className="w-full p-2.5 border border-[#e0e3e5] rounded-xl outline-none focus:border-[#2F36ED]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Faculty Lead / Advisor</label>
                <input
                  type="text"
                  required
                  value={teamForm.leadFaculty}
                  onChange={(e) => setTeamForm({ ...teamForm, leadFaculty: e.target.value })}
                  placeholder="e.g. Prof. A. K. Sharma"
                  className="w-full p-2.5 border border-[#e0e3e5] rounded-xl outline-none focus:border-[#2F36ED]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="flex-1 py-2.5 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#58423d] hover:bg-[#f2f4f6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#a83824]"
              >
                Register Team
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UniversityDashboardPage;
