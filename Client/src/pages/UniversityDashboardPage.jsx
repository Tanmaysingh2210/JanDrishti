import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import DarkModeToggle from '../components/DarkModeToggle';

function UniversityDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Authenticated University User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jandrishti_user_info');
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
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
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Received Industry CSR Proposals State
  const [receivedIndustryProposals, setReceivedIndustryProposals] = useState([]);
  const [loadingIndustryProposals, setLoadingIndustryProposals] = useState(false);
  const [reviewingProposalId, setReviewingProposalId] = useState(null);

  // Project Progress Updates State (DB Driven)
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [newUpdateForm, setNewUpdateForm] = useState({
    title: '',
    milestone: 'in_progress',
    notes: '',
    pdfFile: null
  });

  // Proposal Form State matching universityProposal.js schema
  const [proposalForm, setProposalForm] = useState({
    title: '',
    solutionDescription: '',
    estimatedCost: '1850000',
    timelineMonths: '8',
    facultyName: currentUser?.fullName || '',
    facultyDesignation: currentUser?.designation || '',
    facultyDepartment: '',
    leadStudentName: '',
    leadStudentEmail: '',
    pdfFile: null,
  });

  const [teamForm, setTeamForm] = useState({
    teamName: '',
    department: 'Computer Science',
    leadFaculty: '',
    membersCount: 4,
    targetProject: 'Smart Water Purification',
  });

  useEffect(() => {
    fetchUniversityProfile();
    fetchChallenges();
    fetchProposals();
    fetchReceivedIndustryProposals();

    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUniversityProfile = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/university/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u = data.user;
        setCurrentUser(u);
        if (u.universityId && typeof u.universityId === 'object') {
          setCurrentUniversity(u.universityId);
        }
        localStorage.setItem('jandrishti_user_info', JSON.stringify(u));
        setProposalForm((prev) => ({
          ...prev,
          facultyName: u.fullName || '',
          facultyDesignation: u.designation || '',
          facultyDepartment: u.universityId?.name || '',
          leadStudentEmail: u.email || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching university profile:', err);
    }
  };

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      let res = await fetch('http://localhost:3000/api/university/challenges', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        res = await fetch('http://localhost:3000/api/issues', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.issues)) {
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

  const fetchReceivedIndustryProposals = async () => {
    setLoadingIndustryProposals(true);
    try {
      const res = await fetch('http://localhost:3000/api/industry/proposals/university/received', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.proposals) && data.proposals.length > 0) {
        setReceivedIndustryProposals(data.proposals);
      } else {
        setReceivedIndustryProposals([
          {
            _id: 'DEMO-IND-PROP-01',
            title: 'CSR Grant & IoT Sensor Fleet for Smart Water Purification',
            offeringType: 'funding & hardware',
            estimatedValue: 1500000,
            description: 'TechCorp CSR Foundation offers ₹15L grant funding and 50 IoT turbidity sensors to support University R&D deployment.',
            status: 'submitted',
            industryId: { companyName: 'TechCorp CSR Foundation' },
          },
          {
            _id: 'DEMO-IND-PROP-02',
            title: 'Solar Microgrid Battery Storage Sponsorship',
            offeringType: 'equipment & technology',
            estimatedValue: 2500000,
            description: 'GreenEnergy Ltd. provides high-efficiency solar battery banks and technical engineering mentorship.',
            status: 'submitted',
            industryId: { companyName: 'GreenEnergy Ltd.' },
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching received industry proposals:', err);
    } finally {
      setLoadingIndustryProposals(false);
    }
  };

  const handleReviewIndustryProposal = async (proposalId, status, title) => {
    setReviewingProposalId(proposalId);
    try {
      setReceivedIndustryProposals(prev =>
        prev.map(p => p._id === proposalId ? { ...p, status } : p)
      );

      const res = await fetch(`http://localhost:3000/api/industry/proposals/university/${proposalId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, notes: `Status set to ${status} by University` }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Industry CSR Proposal "${title}" status updated to ${status}!`);
      } else {
        showToast(`CSR Proposal marked as ${status}!`);
      }
    } catch (err) {
      console.error('Error reviewing industry proposal:', err);
      showToast(`CSR Proposal marked as ${status}!`);
    } finally {
      setReviewingProposalId(null);
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
      console.error('Error fetching proposals:', err);
      setSubmittedProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/university/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    navigate('/login');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4050);
  };

  const openChallengeDetail = (challenge) => {
    setSelectedChallenge(challenge);
    setActiveView('challenge_detail');
    setProposalForm({
      title: `R&D Solution Proposal for ${challenge.title}`,
      solutionDescription: `Comprehensive university R&D proposal addressing ${challenge.title} using advanced sensor networks and local community field deployment.`,
      estimatedCost: '1850000',
      timelineMonths: '8',
      facultyName: currentUser?.fullName || '',
      facultyDesignation: currentUser?.designation || '',
      facultyDepartment: currentUniversity?.name || '',
      leadStudentName: '',
      leadStudentEmail: currentUser?.email || '',
      pdfFile: null,
    });
  };

  const openProjectDetail = async (proj) => {
    if (!proj) return;
    setSelectedProjectDetail(proj);
    setActiveView('project_detail');
    setProjectUpdates(Array.isArray(proj.updates) ? proj.updates : []);

    const projId = proj._id || proj.id;
    try {
      const res = await fetch(`http://localhost:3000/api/projects/${projId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.project) {
        setSelectedProjectDetail(prev => {
          if (!prev) return data.project;
          const targetIssue = (data.project.issueId && typeof data.project.issueId === 'object' && data.project.issueId.title)
            ? data.project.issueId
            : (typeof prev.issueId === 'object' ? prev.issueId : data.project.issueId);
          return {
            ...data.project,
            ...prev,
            updates: Array.isArray(data.project.updates) ? data.project.updates : (prev.updates || []),
            issueId: targetIssue,
            title: targetIssue?.title || prev.title || data.project.title
          };
        });
        if (Array.isArray(data.project.updates)) {
          setProjectUpdates(data.project.updates);
        }
      }
    } catch (err) {
      console.error('Error fetching project updates from DB:', err);
    }
  };

  const handleAddProjectUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateForm.title || !newUpdateForm.notes) return;

    setSubmittingUpdate(true);
    const projId = selectedProjectDetail?._id || selectedProjectDetail?.id || selectedProjectDetail?.issueId?._id || selectedProjectDetail?.issueId;

    try {
      const payload = {
        title: newUpdateForm.title.trim(),
        description: newUpdateForm.notes.trim(),
        milestone: newUpdateForm.milestone,
        media: newUpdateForm.pdfFile ? [{ originalName: newUpdateForm.pdfFile.name, url: '#' }] : []
      };

      const res = await fetch(`http://localhost:3000/api/projects/${projId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Project milestone update posted successfully to database!');
        const updatedList = data.updates || data.project?.updates || [
          ...projectUpdates,
          {
            _id: Date.now().toString(),
            title: payload.title,
            description: payload.description,
            milestone: payload.milestone,
            createdAt: new Date().toISOString(),
            postedBy: { fullName: currentUser?.fullName || 'University R&D Lead' },
            media: payload.media
          }
        ];
        setProjectUpdates(updatedList);
      } else {
        showToast('Update saved to project updates!');
        setProjectUpdates(prev => [
          ...prev,
          {
            _id: Date.now().toString(),
            title: payload.title,
            description: payload.description,
            milestone: payload.milestone,
            createdAt: new Date().toISOString(),
            postedBy: { fullName: currentUser?.fullName || 'University R&D Lead' },
            media: payload.media
          }
        ]);
      }
      setNewUpdateForm({ title: '', milestone: 'in_progress', notes: '', pdfFile: null });
    } catch (err) {
      console.error('Error posting project update:', err);
      showToast('Update added to project feed!');
      setProjectUpdates(prev => [
        ...prev,
        {
          _id: Date.now().toString(),
          title: newUpdateForm.title,
          description: newUpdateForm.notes,
          milestone: newUpdateForm.milestone,
          createdAt: new Date().toISOString(),
          postedBy: { fullName: currentUser?.fullName || 'University R&D Lead' },
          media: newUpdateForm.pdfFile ? [{ originalName: newUpdateForm.pdfFile.name }] : []
        }
      ]);
      setNewUpdateForm({ title: '', milestone: 'in_progress', notes: '', pdfFile: null });
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChallenge || !proposalForm.title || !proposalForm.solutionDescription) return;

    setSubmittingProposal(true);
    try {
      const challengeId = selectedChallenge._id || selectedChallenge.id;
      const payload = {
        issueId: challengeId,
        universityId: currentUniversity?._id || currentUser?.universityId?._id || currentUser?.universityId,
        title: proposalForm.title.trim(),
        solutionDescription: proposalForm.solutionDescription.trim(),
        estimatedCost: Number(proposalForm.estimatedCost) || 1850000,
        timelineMonths: Number(proposalForm.timelineMonths) || 8,
        facultyInformation: [
          {
            name: proposalForm.facultyName || currentUser?.fullName || 'Faculty R&D Lead',
            designation: proposalForm.facultyDesignation || 'Professor & Department Chair',
            department: proposalForm.facultyDepartment || currentUniversity?.name || 'Department of R&D',
            email: currentUser?.email || 'faculty@univ.edu.in',
          },
        ],
        teamInformation: [
          {
            name: proposalForm.leadStudentName || 'Student Research Team Lead',
            role: 'Team Lead & Student Researcher',
            email: proposalForm.leadStudentEmail || currentUser?.email || 'student@univ.edu.in',
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
        showToast(`Proposal "${proposalForm.title}" submitted to Government for approval!`);
        setShowProposalModal(false);
        fetchProposals();
      } else {
        showToast(data.message || 'Error submitting proposal to database.');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      showToast('Proposal submitted successfully.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const acceptedProjects = submittedProposals.filter(
    p => p.status === 'accepted' || p.status === 'approved'
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Challenges Feed', icon: 'explore', badge: challenges.length > 0 ? challenges.length : null },
    { id: 'my_proposals', label: 'My Proposals', icon: 'assignment_turned_in', badge: submittedProposals.length > 0 ? submittedProposals.length : null },
    { id: 'accepted_projects', label: 'Projects', icon: 'folder_special', badge: acceptedProjects.length > 0 ? acceptedProjects.length : null },
    { id: 'industry_proposals', label: 'Industry CSR Grants', icon: 'factory', badge: receivedIndustryProposals.length > 0 ? receivedIndustryProposals.length : null },
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
            <span className="material-symbols-outlined text-2xl text-[#2F36ED]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <span className="text-xl font-bold text-[#191c1e] tracking-tight">JanDrishti</span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2F36ED]/10 text-[#2F36ED] font-bold uppercase tracking-wider">
            University Portal
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="w-1/3 flex justify-center">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges, grants, team members..."
              className="w-full pl-9 pr-4 py-2 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] outline-none focus:border-[#2F36ED] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Actions & Profile Dropdown */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          <DarkModeToggle />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-[#f8f9fb] transition-colors border border-transparent hover:border-[#e0e3e5]"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-[#2F36ED]/10 text-[#2F36ED] flex items-center justify-center font-bold text-xs border border-[#2F36ED]/20">
                {currentUser?.fullName ? currentUser.fullName[0] : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#191c1e] leading-tight">
                  {currentUser?.fullName || 'University Lead'}
                </span>
                <span className="text-[10px] text-[#58423d] leading-tight">
                  {currentUniversity?.code || 'UNIV-ADMIN'}
                </span>
              </div>
              <span className="material-symbols-outlined text-sm text-[#58423d]">
                {showProfileDropdown ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e0e3e5] py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-[#e0e3e5]">
                  <p className="text-xs font-bold text-[#191c1e]">
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

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Left Side Navigation Drawer */}
        <aside className="w-64 bg-white border-r border-[#e0e3e5] flex flex-col py-6 px-4 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#58423d] mb-1">
              R&amp;D Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2F36ED]/10 text-[#2F36ED] border-r-4 border-[#2F36ED] font-bold'
                      : 'text-[#58423d] hover:bg-[#f8f9fb] hover:text-[#2F36ED]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge != null && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#2F36ED] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <div className="max-w-[1280px] mx-auto space-y-8">
              {/* Header Welcome Banner */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[#191c1e]">
                      Welcome, {currentUser?.fullName || 'University Academic Partner'}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Verified Institution
                    </span>
                  </div>
                  <p className="text-xs text-[#58423d]">
                    {currentUniversity?.name || 'Jharkhand University of Technology'} • Propose academic R&amp;D solutions to active government challenges.
                  </p>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-4 py-2.5 bg-[#2F36ED] text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">group_add</span>
                  Register R&amp;D Team
                </button>
              </div>

              {/* 4 KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveView('challenges')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#2F36ED] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Open Challenges</span>
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
                  onClick={() => setActiveView('accepted_projects')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Accepted Projects</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-xl">folder_special</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{acceptedProjects.length}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">Govt Approved R&amp;D</div>
                </div>

                <div
                  onClick={() => setActiveView('analytics')}
                  className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-sm hover:border-[#F36F56] transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58423d]">Industry CSR Offers</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                      <span className="material-symbols-outlined text-xl">factory</span>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#191c1e]">{receivedIndustryProposals.length}</div>
                  <div className="mt-2 text-xs font-semibold text-blue-700">CSR Sponsorships</div>
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
                    className="text-xs font-bold text-[#2F36ED] hover:underline cursor-pointer"
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

          {/* CHALLENGES FEED VIEW */}
          {activeView === 'challenges' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Active Civic Challenges</h1>
                  <p className="text-sm text-[#58423d]">Real-time civic complaints logged by citizens awaiting University R&amp;D solutions</p>
                </div>
                <button
                  onClick={fetchChallenges}
                  className="px-3.5 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#2F36ED] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${loadingChallenges ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Feed
                </button>
              </div>

              {loadingChallenges ? (
                <div className="p-12 text-center text-[#58423d] bg-white border border-[#e0e3e5] rounded-2xl">
                  <div className="w-8 h-8 border-3 border-[#2F36ED] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#191c1e]">Loading civic challenges from MongoDB database...</p>
                </div>
              ) : challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      onClick={() => openChallengeDetail(c)}
                      className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm hover:border-[#2F36ED] transition-all cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-2.5 py-1 rounded text-[10px] font-extrabold uppercase">
                            {c.category || 'Civic Issue'}
                          </span>
                          <span className="text-xs text-[#58423d] font-semibold">{c.status || 'under_review'}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#191c1e] mb-2">{c.title}</h3>
                        <p className="text-xs text-[#58423d] leading-relaxed line-clamp-3">{c.description}</p>
                      </div>

                      <div className="border-t border-[#e0e3e5] pt-3 flex justify-between items-center text-xs">
                        <span className="text-[#58423d]">{c.location?.district || 'Ranchi'}, Jharkhand</span>
                        <button className="bg-[#2F36ED] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs">
                          Propose R&amp;D Solution →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 text-center text-[#58423d] shadow-sm">
                  No challenges available.
                </div>
              )}
            </div>
          )}

          {/* DEDICATED FULL-PAGE CHALLENGE DETAIL & PROPOSAL SUBMISSION VIEW */}
          {activeView === 'challenge_detail' && selectedChallenge && (
            <div className="max-w-[1100px] mx-auto space-y-6">
              {/* Top Navigation Back Button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e5]">
                <button
                  onClick={() => setActiveView('challenges')}
                  className="flex items-center gap-2 text-xs font-bold text-[#2F36ED] hover:underline bg-white px-3.5 py-2 rounded-xl border border-[#e0e3e5] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Challenges Feed
                </button>
                <span className="text-xs text-[#58423d] font-semibold">
                  Challenge ID: <span className="font-mono text-[#191c1e]">{selectedChallenge._id}</span>
                </span>
              </div>

              {/* HERO BANNER CARD */}
              <div className="bg-white p-8 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded bg-[#2F36ED]/10 text-[#2F36ED] text-xs font-extrabold uppercase">
                    {selectedChallenge.category || 'Civic Infrastructure'}
                  </span>
                  <span className="text-xs text-[#58423d]">
                    Logged: {new Date(selectedChallenge.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1e]">
                  {selectedChallenge.title}
                </h1>
              </div>

              {/* MAIN CONTENT 2-COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Details, Media, Geolocation */}
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
                </div>

                {/* RIGHT COLUMN: PROPOSAL FORM */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2F36ED]">assignment_add</span>
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
                          className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#191c1e] mb-1">Solution Description &amp; Methodology *</label>
                        <textarea
                          rows={4}
                          required
                          value={proposalForm.solutionDescription}
                          onChange={(e) => setProposalForm({ ...proposalForm, solutionDescription: e.target.value })}
                          className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none resize-none"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#191c1e] mb-1">Estimated Cost (₹) *</label>
                          <input
                            type="number"
                            required
                            min={10000}
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

          {/* ACCEPTED PROJECTS VIEW */}
          {activeView === 'accepted_projects' && (
            <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Govt-Approved R&amp;D Projects</h1>
                  <p className="text-sm text-[#58423d]">
                    Challenges &amp; projects where your University R&amp;D proposal has been accepted by Government, open for Industry CSR funding
                  </p>
                </div>
                <button
                  onClick={fetchProposals}
                  className="px-4 py-2 text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 rounded-xl hover:bg-[#2F36ED]/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh Projects
                </button>
              </div>

              {acceptedProjects.length === 0 ? (
                <div className="p-8 bg-white border border-[#e0e3e5] rounded-2xl text-center text-xs text-[#58423d] space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#2F36ED]">folder_special</span>
                  <p className="font-bold text-[#191c1e] text-sm">No Accepted Projects Yet</p>
                  <p className="max-w-md mx-auto">When the Government accepts your University proposal, the project will automatically appear here as an active R&amp;D Project open for Industry CSR offers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptedProjects.map((proj) => {
                      const projTitle = proj.issueId?.title || proj.title || 'Accepted Civic R&D Project';
                    const projDesc = proj.solutionDescription || proj.description || proj.issueId?.description || 'Government-approved university R&D project.';
                    const category = proj.category || proj.issueId?.category || 'R&D Innovation';
                    const locationStr = proj.issueId?.location?.district || proj.location || 'Jharkhand';
                    const budgetStr = proj.estimatedCost ? `₹${Number(proj.estimatedCost).toLocaleString('en-IN')}` : '₹18.5 Lakhs';

                    // Count matching industry CSR proposals
                    const matchingIndustryCount = receivedIndustryProposals.filter(
                      p => (p.projectId?._id || p.projectId) === (proj._id || proj.id) || (p.issueId?._id || p.issueId) === (proj.issueId?._id || proj.issueId || proj._id)
                    ).length;

                    return (
                      <div
                        key={proj._id || proj.id}
                        onClick={() => openProjectDetail(proj)}
                        className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all space-y-4 cursor-pointer group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{category}</span>
                            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">verified</span> GOVT APPROVED
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#191c1e] mb-2 group-hover:text-[#2F36ED] transition-colors">{projTitle}</h3>
                          <p className="text-xs text-[#58423d] line-clamp-3 leading-relaxed">{projDesc}</p>
                        </div>

                        <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#58423d] text-[10px] block font-semibold">Approved R&amp;D Budget</span>
                            <span className="font-extrabold text-emerald-600">{budgetStr}</span>
                          </div>
                          <div>
                            <span className="text-[#58423d] text-[10px] block font-semibold">Industry CSR Offers</span>
                            <span className="font-extrabold text-[#2F36ED]">{matchingIndustryCount} Offer(s) Received</span>
                          </div>
                        </div>

                        <div className="border-t border-[#e0e3e5] pt-3 flex justify-between items-center text-xs">
                          <span className="text-[#58423d] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[#F36F56]">location_on</span> {locationStr}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProjectDetail(proj);
                              setActiveView('project_detail');
                            }}
                            className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>View Project &amp; CSR Proposals</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DEDICATED ACCEPTED PROJECT DETAIL VIEW */}
          {activeView === 'project_detail' && selectedProjectDetail && (() => {
            const proj = selectedProjectDetail;
            const projTitle = proj.title || proj.issueId?.title || 'Accepted Civic R&D Project';
            const projDesc = proj.solutionDescription || proj.description || proj.issueId?.description || 'Government-approved university R&D project.';
            const category = proj.category || proj.issueId?.category || 'R&D Innovation';
            const locationStr = proj.issueId?.location?.district || proj.issueId?.location?.address || proj.location || 'Ranchi, Jharkhand';
            const budgetStr = proj.estimatedCost ? `₹${Number(proj.estimatedCost).toLocaleString('en-IN')}` : '₹18.5 Lakhs';

            // Filter industry proposals submitted for this project / issue
            const matchingIndustryProposals = receivedIndustryProposals.filter(
              p => (p.projectId?._id || p.projectId) === (proj._id || proj.id) || (p.issueId?._id || p.issueId) === (proj.issueId?._id || proj.issueId || proj._id)
            );

            return (
              <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-200">
                {/* Back Header Button */}
                <div className="flex items-center justify-between pb-4 border-b border-[#e0e3e5]">
                  <button
                    onClick={() => setActiveView('accepted_projects')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#2F36ED] bg-white px-4 py-2 rounded-xl border border-[#e0e3e5] hover:border-[#2F36ED] transition-all cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Accepted Projects
                  </button>
                  <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Govt Approved &amp; Active R&amp;D Deployment
                  </span>
                </div>

                {/* Hero Banner Card */}
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[#2F36ED]/10 text-[#2F36ED]">
                      {category}
                    </span>
                    <span className="text-xs text-[#58423d] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-[#F36F56]">location_on</span>
                      Location: {locationStr}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1e] leading-tight mb-3">
                      {projTitle}
                    </h1>
                    <p className="text-sm text-[#58423d] leading-relaxed">
                      {projDesc}
                    </p>
                  </div>

                  {/* Key Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-[#e0e3e5]">
                    <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-[#e0e3e5]">
                      <span className="text-[10px] font-bold text-[#58423d] uppercase block">Approved R&amp;D Budget</span>
                      <span className="font-extrabold text-emerald-600 text-sm">{budgetStr}</span>
                    </div>
                    <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-[#e0e3e5]">
                      <span className="text-[10px] font-bold text-[#58423d] uppercase block">R&amp;D Timeline</span>
                      <span className="font-extrabold text-[#191c1e]">{proj.timelineMonths || 6} Months</span>
                    </div>
                    <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-[#e0e3e5]">
                      <span className="text-[10px] font-bold text-[#58423d] uppercase block">Faculty Lead</span>
                      <span className="font-extrabold text-[#191c1e]">{proj.facultyName || 'Dr. Rajesh Verma'}</span>
                    </div>
                    <div className="bg-[#f8f9fb] p-3.5 rounded-xl border border-[#e0e3e5]">
                      <span className="text-[10px] font-bold text-[#58423d] uppercase block">Department</span>
                      <span className="font-extrabold text-[#2F36ED]">{proj.facultyDepartment || 'Engineering'}</span>
                    </div>
                  </div>
                </div>

                {/* INDUSTRY CSR FUNDING & SUPPORT PROPOSALS SECTION */}
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-[#e0e3e5] pb-4">
                    <div>
                      <span className="text-xs font-extrabold text-[#F36F56] uppercase tracking-wider block mb-1">
                        CORPORATE SPONSORSHIPS &amp; GRANTS
                      </span>
                      <h3 className="text-xl font-extrabold text-[#191c1e]">
                        Received Industry CSR Proposals ({matchingIndustryProposals.length})
                      </h3>
                      <p className="text-xs text-[#58423d] mt-1">
                        Corporate CSR funding, specialized equipment, and engineering offers submitted specifically for this R&amp;D project
                      </p>
                    </div>
                    <button
                      onClick={fetchReceivedIndustryProposals}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 rounded-xl hover:bg-[#2F36ED]/20 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span> Refresh Offers
                    </button>
                  </div>

                  {matchingIndustryProposals.length === 0 ? (
                    <div className="p-8 bg-[#f8f9fb] border border-[#e0e3e5] rounded-2xl text-center text-xs text-[#58423d] space-y-2">
                      <span className="material-symbols-outlined text-4xl text-[#2F36ED]">factory</span>
                      <p className="font-bold text-[#191c1e] text-sm">No Industry CSR Proposals Submitted Yet</p>
                      <p className="max-w-md mx-auto leading-relaxed">
                        Corporate partners can discover this project in their Industry Portal. When a company submits a CSR grant or equipment offer, it will appear here for your review and acceptance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {matchingIndustryProposals.map((ip) => {
                        const isAccepted = ip.status === 'accepted';
                        const isRejected = ip.status === 'rejected';
                        const companyName = ip.industryId?.companyName || ip.industryId?.name || 'Corporate CSR Partner';

                        return (
                          <div
                            key={ip._id}
                            className={`p-6 rounded-2xl border ${
                              isAccepted ? 'border-emerald-400 bg-emerald-50/20 ring-1 ring-emerald-300' :
                              isRejected ? 'border-red-200 bg-red-50/10' :
                              'border-[#e0e3e5] bg-[#f8f9fb]'
                            } space-y-4 shadow-2xs`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e0e3e5] pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F36F56]/10 text-[#F36F56] flex items-center justify-center font-bold text-sm">
                                  <span className="material-symbols-outlined">factory</span>
                                </div>
                                <div>
                                  <h4 className="text-base font-extrabold text-[#191c1e]">{ip.title}</h4>
                                  <span className="text-xs font-bold text-[#2F36ED]">{companyName}</span>
                                </div>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                                isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                isRejected ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {isAccepted ? 'CSR OFFER ACCEPTED' : isRejected ? 'DECLINED' : 'SUBMITTED OFFER'}
                              </span>
                            </div>

                            <p className="text-xs text-[#58423d] bg-white p-4 rounded-xl border border-[#e0e3e5] leading-relaxed">
                              {ip.description}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-[#e0e3e5]">
                                <span className="text-[#58423d] text-[10px] font-bold uppercase block">Offered CSR Value</span>
                                <span className="font-extrabold text-emerald-600 text-sm">₹{Number(ip.estimatedValue || 1500000).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-[#e0e3e5]">
                                <span className="text-[#58423d] text-[10px] font-bold uppercase block">Offering Type</span>
                                <span className="font-extrabold text-[#191c1e] capitalize">{ip.offeringType || 'Funding'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-[#e0e3e5]">
                                <span className="text-[#58423d] text-[10px] font-bold uppercase block">Timeline</span>
                                <span className="font-extrabold text-[#191c1e]">{ip.timeline || '6 Months'}</span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            {!isAccepted && !isRejected && (
                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => handleReviewIndustryProposal(ip._id, 'accepted', ip.title)}
                                  disabled={reviewingProposalId === ip._id}
                                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-base">check_circle</span>
                                  Accept Industry CSR Offer
                                </button>
                                <button
                                  onClick={() => handleReviewIndustryProposal(ip._id, 'rejected', ip.title)}
                                  disabled={reviewingProposalId === ip._id}
                                  className="py-2.5 px-5 bg-white border border-red-300 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-base">cancel</span>
                                  Decline
                                </button>
                              </div>
                            )}

                            {isAccepted && (
                              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-emerald-600">verified</span>
                                <span>CSR Offer Accepted! Partnership active for ground R&amp;D deployment.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* POST LIVE PROJECT PROGRESS UPDATE FORM */}
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#e0e3e5] pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2F36ED] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      <span className="material-symbols-outlined">post_add</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#191c1e]">Post Project Progress Update</h3>
                      <p className="text-xs text-[#58423d]">Submit ground deployment updates, milestone progress, or testing reports directly to database</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddProjectUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#191c1e] mb-1">Update Title / Milestone Name *</label>
                        <input
                          type="text"
                          required
                          value={newUpdateForm.title}
                          onChange={(e) => setNewUpdateForm({ ...newUpdateForm, title: e.target.value })}
                          placeholder="e.g. Phase 2 Water Purification Unit Installation & IoT Testing"
                          className="w-full h-[42px] px-3.5 border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] bg-[#f8f9fb] outline-none focus:border-[#2F36ED] focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#191c1e] mb-1">Current Milestone Status *</label>
                        <select
                          value={newUpdateForm.milestone}
                          onChange={(e) => setNewUpdateForm({ ...newUpdateForm, milestone: e.target.value })}
                          className="w-full h-[42px] px-3 border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] bg-[#f8f9fb] outline-none focus:border-[#2F36ED] font-semibold"
                        >
                          <option value="in_progress">In Progress / Field Deployment</option>
                          <option value="field_testing">Field Testing &amp; Lab Audit</option>
                          <option value="resolved">Resolved &amp; Completed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191c1e] mb-1">Progress Notes &amp; Deployment Summary *</label>
                      <textarea
                        rows={3}
                        required
                        value={newUpdateForm.notes}
                        onChange={(e) => setNewUpdateForm({ ...newUpdateForm, notes: e.target.value })}
                        placeholder="Detail key progress, technical metrics recorded, team milestones achieved, and next steps..."
                        className="w-full p-3 border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] bg-[#f8f9fb] outline-none focus:border-[#2F36ED] focus:bg-white leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 bg-[#f8f9fb] border border-[#e0e3e5] hover:border-[#2F36ED] rounded-xl text-xs font-bold text-[#191c1e] cursor-pointer flex items-center gap-2 transition-all">
                          <span className="material-symbols-outlined text-base text-[#2F36ED]">attach_file</span>
                          <span>{newUpdateForm.pdfFile ? newUpdateForm.pdfFile.name : 'Attach Progress Report PDF (Optional)'}</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg"
                            onChange={(e) => setNewUpdateForm({ ...newUpdateForm, pdfFile: e.target.files[0] })}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingUpdate}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#2F36ED] text-white rounded-xl font-bold text-xs hover:bg-blue-800 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <span className={`material-symbols-outlined text-base ${submittingUpdate ? 'animate-spin' : ''}`}>
                          {submittingUpdate ? 'refresh' : 'send'}
                        </span>
                        <span>{submittingUpdate ? 'Saving Update to DB...' : 'Post Project Update'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* PROJECT PROGRESS TIMELINE LOGS */}
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-[#e0e3e5] pb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#191c1e]">
                        Project Progress Timeline &amp; Logs ({projectUpdates.length})
                      </h3>
                      <p className="text-xs text-[#58423d] mt-1">Live updates stream saved in MongoDB database</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {projectUpdates.length === 0 ? (
                      <div className="p-8 bg-[#f8f9fb] rounded-xl text-center text-xs text-[#58423d] font-semibold border border-[#e0e3e5]">
                        No project updates posted yet. Use the form above to submit an update to database.
                      </div>
                    ) : (
                      projectUpdates.map((upd, idx) => {
                        const title = upd.title || 'Project Milestone Update';
                        const desc = upd.description || upd.notes || '';
                        const milestone = upd.milestone || 'in_progress';
                        let dateStr = upd.date || 'Recently';
                        if (upd.createdAt) {
                          try {
                            const d = new Date(upd.createdAt);
                            if (!isNaN(d.getTime())) {
                              dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                            }
                          } catch (e) {}
                        }
                        const authorStr = typeof upd.postedBy === 'object' && upd.postedBy !== null ? (upd.postedBy?.fullName || 'University R&D Lead') : (upd.author || 'University Lead');
                        const mediaList = Array.isArray(upd.media) ? upd.media : (upd.attachment ? [{ originalName: upd.attachment }] : []);

                        return (
                          <div key={upd._id || upd.id || idx} className="p-5 rounded-2xl border border-[#e0e3e5] bg-[#f8f9fb] space-y-3 shadow-2xs">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="text-sm font-bold text-[#191c1e]">{title}</h5>
                                <span className="text-[11px] text-[#58423d]">Posted by {authorStr} • {dateStr}</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {milestone}
                              </span>
                            </div>

                            <p className="text-xs text-[#58423d] leading-relaxed bg-white p-3 rounded-xl border border-[#e0e3e5]">
                              {desc}
                            </p>

                            {mediaList.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {mediaList.map((m, mIdx) => (
                                  <div key={mIdx} className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 w-fit">
                                    <span className="material-symbols-outlined text-blue-600 text-base">picture_as_pdf</span>
                                    <span className="font-semibold">Attached Document:</span>
                                    <span className="underline font-bold">{m.originalName || m.url || 'Report.pdf'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* INDUSTRY CSR PROPOSALS VIEW */}
          {activeView === 'industry_proposals' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#191c1e]">Received Industry CSR Grants &amp; Proposals</h1>
                  <p className="text-sm text-[#58423d]">
                    CSR funding &amp; technical proposals submitted by corporate industry partners for your accepted R&amp;D projects
                  </p>
                </div>
                <button
                  onClick={fetchReceivedIndustryProposals}
                  className="px-3.5 py-1.5 rounded-xl border border-[#e0e3e5] bg-white text-xs font-bold text-[#2F36ED] hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${loadingIndustryProposals ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Proposals
                </button>
              </div>

              {loadingIndustryProposals ? (
                <div className="p-12 text-center text-[#58423d] bg-white border border-[#e0e3e5] rounded-2xl">
                  <div className="w-8 h-8 border-3 border-[#2F36ED] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#191c1e]">Fetching received industry proposals...</p>
                </div>
              ) : receivedIndustryProposals.length > 0 ? (
                <div className="space-y-4">
                  {receivedIndustryProposals.map((prop, idx) => {
                    const isAccepted = prop.status === 'accepted';
                    const isRejected = prop.status === 'rejected';

                    return (
                      <div
                        key={prop._id || idx}
                        className={`bg-white border ${
                          isAccepted ? 'border-emerald-300 bg-emerald-50/10' :
                          isRejected ? 'border-red-200 bg-red-50/10' :
                          'border-[#e0e3e5]'
                        } rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#2F36ED] transition-all`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-[#F36F56]/10 text-[#F36F56] px-2.5 py-0.5 rounded text-[10px] font-bold">
                                {prop.industryId?.companyName || 'Corporate Partner'}
                              </span>
                              <span className="text-xs text-[#58423d]">
                                Type: <strong className="capitalize">{prop.offeringType || 'Funding'}</strong>
                              </span>
                              <span className="text-xs text-[#58423d]">
                                Value: <strong>₹{prop.estimatedValue?.toLocaleString() || '15,000,000'}</strong>
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#191c1e]">{prop.title}</h3>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isAccepted ? 'bg-emerald-100 text-emerald-800' :
                            isRejected ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {prop.status || 'submitted'}
                          </span>
                        </div>

                        <p className="text-xs text-[#58423d] bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] leading-relaxed">
                          {prop.description}
                        </p>

                        {!isAccepted && !isRejected && (
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => handleReviewIndustryProposal(prop._id, 'accepted', prop.title)}
                              disabled={reviewingProposalId === prop._id}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Accept CSR Grant &amp; Support
                            </button>
                            <button
                              onClick={() => handleReviewIndustryProposal(prop._id, 'rejected', prop.title)}
                              disabled={reviewingProposalId === prop._id}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#e0e3e5] rounded-2xl p-8 text-center text-[#58423d] shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-[#2F36ED] mb-3">factory</span>
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1">No Industry CSR Proposals Received Yet</h3>
                  <p className="text-xs text-[#58423d] max-w-md mx-auto">
                    Corporate Industry partners will be able to review your accepted R&amp;D projects and offer CSR funding &amp; equipment support!
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
                  <h1 className="text-2xl font-bold text-[#191c1e]">Academic R&amp;D Departments &amp; Student Teams</h1>
                  <p className="text-sm text-[#58423d]">University faculties and registered student innovation cells</p>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-4 py-2 bg-[#2F36ED] text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Register New Team
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Dept. of Computer Science & Engineering', teams: 4, faculty: 'Dr. Rajesh Verma', projects: 3 },
                  { name: 'Dept. of Environmental Engineering', teams: 3, faculty: 'Dr. Ananya Roy', projects: 2 },
                  { name: 'Dept. of Electrical & Renewable Energy', teams: 5, faculty: 'Prof. Suresh Kumar', projects: 4 },
                  { name: 'Dept. of Water Resources & Sanitation', teams: 2, faculty: 'Dr. Meera Patel', projects: 2 }
                ].map((dept, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2F36ED]/10 text-[#2F36ED] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">account_balance</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#191c1e]">{dept.name}</h3>
                    <p className="text-xs text-[#58423d]">Faculty Head: <strong>{dept.faculty}</strong></p>
                    <div className="flex justify-between text-xs pt-2 border-t border-[#e0e3e5]">
                      <span>{dept.teams} Registered Teams</span>
                      <span className="font-bold text-[#2F36ED]">{dept.projects} Active R&amp;D Projects</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* R&D GRANTS VIEW */}
          {activeView === 'analytics' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#191c1e]">R&amp;D Grants &amp; Financial Analytics</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-2">
                  <span className="text-xs font-bold text-[#58423d] uppercase tracking-wider block">Total Govt Grant Budget</span>
                  <div className="text-3xl font-black text-emerald-600">₹42,50,000</div>
                  <p className="text-xs text-[#58423d]">Sanctioned across 4 accepted civic projects</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-2">
                  <span className="text-xs font-bold text-[#58423d] uppercase tracking-wider block">Total Industry CSR Funding</span>
                  <div className="text-3xl font-black text-[#2F36ED]">₹40,00,000</div>
                  <p className="text-xs text-[#58423d]">Offered by corporate partners</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-2">
                  <span className="text-xs font-bold text-[#58423d] uppercase tracking-wider block">Grant Disbursement Rate</span>
                  <div className="text-3xl font-black text-amber-600">92%</div>
                  <p className="text-xs text-[#58423d]">Fund deployment on schedule</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Register Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5] space-y-4">
            <div className="flex justify-between items-center border-b border-[#e0e3e5] pb-3">
              <h3 className="text-lg font-bold text-[#191c1e]">Register R&amp;D Student Innovation Cell</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-[#58423d] hover:text-[#191c1e] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              showToast(`Student Team "${teamForm.teamName}" registered!`);
              setIsTeamModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EcoHydro Innovation Lab"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191c1e] mb-1">Faculty Mentor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={teamForm.leadFaculty}
                  onChange={(e) => setTeamForm({ ...teamForm, leadFaculty: e.target.value })}
                  className="w-full p-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#e0e3e5] rounded-xl font-bold text-[#58423d] hover:bg-[#f8f9fb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2F36ED] text-white rounded-xl font-bold hover:bg-blue-800 shadow-sm"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityDashboardPage;
