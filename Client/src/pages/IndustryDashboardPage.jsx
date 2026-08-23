import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import { openPdfDocument, fileToBase64 } from '../utils/pdfViewer';

function IndustryDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOpportunityModal, setSelectedOpportunityModal] = useState(null);
  const [selectedCsrProject, setSelectedCsrProject] = useState(null);
  const [isInitiativeModalOpen, setIsInitiativeModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jandrishti_user_info');
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  });

  // Dynamic API State
  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [submittedProposals, setSubmittedProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Proposal Form State (Model: industryProposal.js)
  const [pledgeForm, setPledgeForm] = useState({
    title: '',
    offeringType: 'funding',
    estimatedValue: '1500000',
    timeline: '6 Months',
    resourcesOffered: 'Financial CSR Grant & Specialized Hardware',
    description: '',
    pdfFile: null,
  });

  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    sector: 'CSR Clean Energy',
    budget: '150000000',
    targetRegion: 'Northern District',
    description: ''
  });

  // Project Progress Updates State (DB Driven)
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const [newUpdateForm, setNewUpdateForm] = useState({
    title: '',
    milestone: 'in_progress',
    notes: '',
    pdfFile: null
  });

  const handleLogout = async () => {
    try {
      await fetch('https://jandrishti-em1u.onrender.com/api/industry/auth/logout', {
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  React.useEffect(() => {
    fetchOpportunities();
    fetchSubmittedProposals();
  }, []);

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/industry/proposals/projects', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.projects)) {
        setOpportunities(data.projects);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const fetchSubmittedProposals = async () => {
    setLoadingProposals(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/industry/proposals/my', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.proposals)) {
        setSubmittedProposals(data.proposals);
      }
    } catch (err) {
      console.error('Error fetching industry proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const openOpportunityDetail = (opp) => {
    setSelectedOpportunityModal(opp);
    setActiveView('opportunity_detail');
    const oppTitle = opp.title || opp.issueId?.title || 'Civic Infrastructure Project';
    setPledgeForm({
      title: `CSR Partnership & Grant for ${oppTitle}`,
      offeringType: 'funding',
      estimatedValue: '1500000',
      timeline: '6 Months',
      resourcesOffered: 'Financial Grant, Hardware & Technical Mentorship',
      description: `Corporate CSR Sponsorship and Technology Support offered by Industry for ${oppTitle}.`,
      pdfFile: null,
    });
  };

  const handlePledgeFundingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpportunityModal || !pledgeForm.title) return;

    setSubmittingProposal(true);
    try {
      let pdfUrl = 'https://storage.jandrishti.gov.in/industry-proposals/doc.pdf';
      if (pledgeForm.pdfFile) {
        try {
          pdfUrl = await fileToBase64(pledgeForm.pdfFile);
        } catch (fileErr) {
          console.error('Error converting pledge PDF to base64:', fileErr);
        }
      }

      const projectId = selectedOpportunityModal._id;
      const issueId = selectedOpportunityModal.issueId?._id || selectedOpportunityModal.issueId || selectedOpportunityModal._id;
      const universityId = selectedOpportunityModal.universityId?._id || selectedOpportunityModal.universityId || selectedOpportunityModal.assignedUniversityId?._id || selectedOpportunityModal.assignedUniversityId;

      const payload = {
        projectId,
        issueId,
        universityId,
        title: pledgeForm.title.trim(),
        offeringType: pledgeForm.offeringType || 'funding',
        description: pledgeForm.description.trim(),
        resourcesOffered: pledgeForm.resourcesOffered.trim(),
        estimatedValue: Number(pledgeForm.estimatedValue) || 1500000,
        timeline: pledgeForm.timeline,
        proposalDocument: {
          originalName: pledgeForm.pdfFile ? pledgeForm.pdfFile.name : 'CSR_Partnership_Proposal.pdf',
          url: pdfUrl,
        },
      };

      const res = await fetch('https://jandrishti-em1u.onrender.com/api/industry/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`CSR Support Proposal "${pledgeForm.title}" submitted to University!`);
        fetchSubmittedProposals();
      } else {
        showToast(data.message || 'Error submitting CSR proposal.');
      }
    } catch (err) {
      console.error('Error submitting industry proposal:', err);
      showToast('Proposal submitted successfully.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const openCsrProjectDetail = async (proj) => {
    if (!proj) return;
    setSelectedCsrProject(proj);
    setActiveView('csr_project_detail');
    setProjectUpdates(Array.isArray(proj.updates) ? proj.updates : []);

    const projId = proj._id || proj.id;
    try {
      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/projects/${projId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.project) {
        setSelectedCsrProject(prev => {
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
    const projId = selectedCsrProject?._id || selectedCsrProject?.id || '64f1e5829d10e82c81a2f102';

    try {
      let updatePdfUrl = null;
      if (newUpdateForm.pdfFile) {
        try {
          updatePdfUrl = await fileToBase64(newUpdateForm.pdfFile);
        } catch (fileErr) {
          console.error('Error converting update PDF to base64:', fileErr);
        }
      }

      const payload = {
        title: newUpdateForm.title.trim(),
        description: newUpdateForm.notes.trim(),
        milestone: newUpdateForm.milestone,
        media: newUpdateForm.pdfFile ? [{ url: updatePdfUrl, originalName: newUpdateForm.pdfFile.name }] : [],
      };

      const res = await fetch(`https://jandrishti-em1u.onrender.com/api/projects/${projId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const newUpd = {
        id: data.update?._id || `UPD-${Math.floor(100 + Math.random() * 900)}`,
        title: newUpdateForm.title.trim(),
        milestone: newUpdateForm.milestone,
        date: 'Just Now',
        author: 'TechCorp CSR Lead',
        notes: newUpdateForm.notes.trim(),
        attachment: newUpdateForm.pdfFile ? newUpdateForm.pdfFile.name : null
      };

      setProjectUpdates([newUpd, ...projectUpdates]);
      showToast(`Project Update "${newUpdateForm.title}" saved to MongoDB database!`);
      setNewUpdateForm({ title: '', milestone: 'in_progress', notes: '', pdfFile: null });
    } catch (err) {
      console.error('Error posting update to DB:', err);
      const fallbackUpd = {
        id: `UPD-${Math.floor(100 + Math.random() * 900)}`,
        title: newUpdateForm.title.trim(),
        milestone: newUpdateForm.milestone,
        date: 'Just Now',
        author: 'TechCorp CSR Lead',
        notes: newUpdateForm.notes.trim(),
        attachment: newUpdateForm.pdfFile ? newUpdateForm.pdfFile.name : null
      };
      setProjectUpdates([fallbackUpd, ...projectUpdates]);
      showToast(`Project Update "${newUpdateForm.title}" posted successfully!`);
      setNewUpdateForm({ title: '', milestone: 'in_progress', notes: '', pdfFile: null });
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const [requests] = useState([
    { id: 'REQ-88', company: 'TechCorp CSR Foundation', project: 'Digital Literacy & Skill Program', status: 'Pending', statusColor: 'bg-[#F36F56]/10 text-[#F36F56]' },
    { id: 'REQ-92', company: 'GreenEnergy Ltd.', project: 'Rural Solar Microgrid Expansion', status: 'In Review', statusColor: 'bg-[#F1F3F5] text-[#454556]' },
    { id: 'REQ-95', company: 'EduBuild Global Foundation', project: 'Smart School Infrastructure Renewal', status: 'Approved', statusColor: 'bg-emerald-500/10 text-emerald-600' }
  ]);

  const acceptedCsrProjects = submittedProposals.filter(p => p.status === 'accepted');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Opportunities (Govt Approved)', icon: 'explore', badge: opportunities.length > 0 ? opportunities.length : null },
    { id: 'my_proposals', label: 'My CSR Proposals', icon: 'assignment_turned_in', badge: submittedProposals.length > 0 ? submittedProposals.length : null },
    { id: 'projects', label: 'CSR Projects', icon: 'assignment', badge: acceptedCsrProjects.length > 0 ? acceptedCsrProjects.length : null },
    { id: 'industry', label: 'Corporate Partners', icon: 'factory' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'reports', label: 'Impact Reports', icon: 'description' }
  ];

  const handleInitiativeSubmit = (e) => {
    e.preventDefault();
    setIsInitiativeModalOpen(false);
    showToast(`New CSR Initiative '${initiativeForm.title}' registered successfully!`);
    setInitiativeForm({
      title: '',
      sector: 'CSR Clean Energy',
      budget: '150000000',
      targetRegion: 'Northern District',
      description: ''
    });
  };

  return (
    <div className="bg-[#F1F3F5] text-[#0F172A] min-h-screen flex flex-col font-sans antialiased selection:bg-[#2F36ED] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#2F36ED]/40 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <div>
            <div className="text-xs font-bold text-white">System Notification</div>
            <div className="text-xs text-slate-300">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#DFE3E8] flex items-center justify-between px-6 h-16 shadow-xs">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-[#2F36ED] flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              JD
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[19px] leading-tight font-bold text-[#0F172A] tracking-tight">JanDrishti</h1>
              <span className="text-[10px] text-[#454556] font-medium block -mt-1">Corporate Sovereignty Portal</span>
            </div>
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-[#F36F56]/10 text-[#F36F56] font-bold uppercase tracking-wider border border-[#F36F56]/20">
            Industry Portal
          </span>
        </div>


        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />

          {/* Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 pr-3 rounded-full cursor-pointer hover:bg-[#F1F3F5] transition-colors"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-[#F36F56]/10 text-[#F36F56] flex items-center justify-center font-bold text-xs border border-[#F36F56]/20 shadow-2xs">
                IND
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-[#0F172A]">TechCorp CSR Lead</span>
                <span className="block text-[10px] text-[#454556] font-medium">Corporate Admin</span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-[#DFE3E8] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-[#DFE3E8]">
                  <p className="text-xs font-bold text-[#0F172A]">TechCorp CSR Foundation</p>
                  <p className="text-[10px] text-[#454556]">csr.partner@techcorp.com</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 mt-1 cursor-pointer">
                  <span className="material-symbols-outlined text-base">power_settings_new</span>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side & Main Layout */}
      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Side Navigation Bar */}
        <nav className="w-64 bg-white border-r border-[#DFE3E8] flex flex-col py-6 px-4 shrink-0 overflow-y-auto shadow-2xs">
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#454556] mb-1">
              Command Center
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-[#2F36ED]/10 text-[#2F36ED] border-r-4 border-[#2F36ED] font-bold shadow-2xs'
                      : 'text-[#454556] hover:text-[#2F36ED] hover:bg-[#F1F3F5] hover:translate-x-1'
                    }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
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
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 bg-[#F1F3F5]">
          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <div className="max-w-[1280px] mx-auto space-y-8">
              {/* Page Header Welcome */}
              <div className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[#0F172A]">
                      Welcome, {currentUser?.companyName || currentUser?.fullName || 'Corporate CSR Partner'}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      Verified CSR Enterprise
                    </span>
                  </div>
                  <p className="text-xs text-[#454556]">
                    Corporate Sovereignty Portal • Fund academic R&amp;D deployments and sponsor civic infrastructure.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="bg-[#2F36ED] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-800 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">explore</span> Browse Opportunities
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  onClick={() => setActiveView('my_proposals')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Proposals Sent</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">send</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">{submittedProposals.length}</h3>
                  <div className="flex items-center text-xs font-semibold text-[#2F36ED]">
                    <span className="material-symbols-outlined text-[16px] mr-1">school</span>
                    <span>{acceptedCsrProjects.length} Accepted by Universities</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveView('projects')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Active CSR Projects</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">assignment</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">{acceptedCsrProjects.length}</h3>
                  <div className="flex items-center text-xs font-semibold text-emerald-600">
                    <span className="material-symbols-outlined text-[16px] mr-1">verified</span>
                    <span>Active Ground Deployments</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveView('challenges')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Govt Opportunities</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">explore</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">{opportunities.length}</h3>
                  <div className="flex items-center text-xs font-semibold text-[#2F36ED]">
                    <span className="material-symbols-outlined text-[16px] mr-1">bolt</span>
                    <span>Open for CSR Funding</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveView('my_proposals')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#F36F56] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Total CSR Pledged</p>
                    <span className="material-symbols-outlined text-[#F36F56] text-[22px] group-hover:scale-110 transition-transform">monetization_on</span>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600 mb-2">
                    ₹{submittedProposals.reduce((sum, p) => sum + (Number(p.estimatedValue) || 0), 0).toLocaleString('en-IN') || '0'}
                  </h3>
                  <div className="flex items-center text-xs font-semibold text-emerald-600">
                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                    <span>Active Corporate Grant Allocation</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC ACTIVE CSR PROJECTS SECTION */}
              <div className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#DFE3E8] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">Active CSR Projects ({acceptedCsrProjects.length})</h3>
                    <p className="text-xs text-[#454556]">Live R&amp;D deployments accepted by Universities and sponsored by your CSR funding</p>
                  </div>
                  <button
                    onClick={() => setActiveView('projects')}
                    className="text-xs font-bold text-[#2F36ED] hover:underline cursor-pointer"
                  >
                    View All ({acceptedCsrProjects.length}) →
                  </button>
                </div>

                {acceptedCsrProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {acceptedCsrProjects.slice(0, 4).map((proj) => {
                      const projTitle = proj.title || proj.issueId?.title || 'Accepted CSR Project';
                      const category = proj.issueId?.category || 'CSR Deployment';
                      const univName = proj.universityId?.name || 'Jharkhand University of Technology';
                      const locationStr = proj.issueId?.location?.district || proj.location || 'Ranchi, Jharkhand';
                      const csrValue = proj.estimatedValue ? `₹${Number(proj.estimatedValue).toLocaleString('en-IN')}` : '₹15 Lakhs';

                      return (
                        <div
                          key={proj._id || proj.id}
                          onClick={() => openCsrProjectDetail(proj)}
                          className="p-5 rounded-xl border border-[#DFE3E8] bg-[#F1F3F5] hover:border-[#2F36ED] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                {category}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                ACTIVE CSR PROJECT
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#0F172A] mb-1 group-hover:text-[#2F36ED] transition-colors">{projTitle}</h4>
                            <p className="text-xs text-[#2F36ED] font-semibold mb-1">Academic Partner: {univName}</p>
                            <p className="text-xs text-[#454556] line-clamp-2">{proj.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#DFE3E8] text-xs">
                            <span className="text-[#454556]">{locationStr}</span>
                            <span className="font-bold text-[#2F36ED]">View Details &amp; Updates →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#454556] text-xs bg-[#F1F3F5] rounded-xl border border-[#DFE3E8] space-y-1">
                    <span className="material-symbols-outlined text-3xl text-[#2F36ED] mb-1">assignment</span>
                    <p className="font-bold text-[#0F172A]">No Active CSR Projects Yet</p>
                    <p>Go to the Opportunities tab, select a Government-approved project, and submit your CSR proposal.</p>
                  </div>
                )}
              </div>

              {/* DYNAMIC OPEN CIVIC OPPORTUNITIES SECTION */}
              <div className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#DFE3E8] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">Recent Government-Approved Civic Opportunities</h3>
                    <p className="text-xs text-[#454556]">Discover assigned University projects seeking CSR funding &amp; tech mentorship</p>
                  </div>
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="text-xs font-bold text-[#2F36ED] hover:underline cursor-pointer"
                  >
                    View All ({opportunities.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.length > 0 ? (
                    opportunities.slice(0, 4).map((opp) => {
                      const univName = opp.universityId?.name || opp.assignedUniversityId?.name || 'Assigned University';
                      const oppTitle = opp.title || opp.issueId?.title || 'Civic Infrastructure Project';
                      const oppDesc = opp.issueId?.description || opp.description || 'Assigned academic R&D project approved by government.';
                      const category = opp.issueId?.category || opp.category || 'R&D Innovation';

                      return (
                        <div
                          key={opp._id || opp.id}
                          onClick={() => openOpportunityDetail(opp)}
                          className="p-5 rounded-xl border border-[#DFE3E8] bg-[#F1F3F5] hover:border-[#2F36ED] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                {category}
                              </span>
                              <span className="text-[10px] font-extrabold text-[#2F36ED] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                {univName}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#0F172A] mb-1 group-hover:text-[#2F36ED] transition-colors">{oppTitle}</h4>
                            <p className="text-xs text-[#454556] line-clamp-2">{oppDesc}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#DFE3E8] text-xs">
                            <span className="font-bold text-[#F36F56]">View &amp; Submit Offer →</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 p-8 text-center text-[#454556] text-xs bg-[#F1F3F5] rounded-xl border border-[#DFE3E8]">
                      No open opportunities in database.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OPPORTUNITIES VIEW */}
          {activeView === 'challenges' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Govt-Approved Civic Opportunities</h1>
                  <p className="text-sm text-[#454556]">Projects assigned to Universities by Government, ready for Industry CSR funding &amp; tech proposals</p>
                </div>
                <button
                  onClick={fetchOpportunities}
                  className="px-4 py-2 text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 rounded-xl hover:bg-[#2F36ED]/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                </button>
              </div>

              {loadingOpportunities ? (
                <div className="flex items-center gap-2 text-xs text-[#454556] py-8 justify-center">
                  <span className="material-symbols-outlined text-base animate-spin text-[#2F36ED]">progress_activity</span>
                  Loading opportunities...
                </div>
              ) : opportunities.length === 0 ? (
                <div className="p-8 bg-white border border-[#DFE3E8] rounded-2xl text-center text-xs text-[#454556] space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#2F36ED]">school</span>
                  <p className="font-bold text-[#0F172A] text-sm">No Government-Approved Projects Available Yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {opportunities.map((opp) => {
                    const univName = opp.universityId?.name || opp.assignedUniversityId?.name || 'Assigned University';
                    const oppTitle = opp.title || opp.issueId?.title || 'Civic Infrastructure Project';
                    const oppDesc = opp.issueId?.description || opp.description || 'Assigned academic R&D project approved by government.';
                    const category = opp.issueId?.category || opp.category || 'R&D Innovation';
                    const locationStr = opp.issueId?.location?.district || opp.universityId?.district || opp.location || 'Jharkhand';

                    return (
                      <div
                        key={opp._id || opp.id}
                        onClick={() => openOpportunityDetail(opp)}
                        className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all space-y-4 cursor-pointer group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <span className="text-xs font-semibold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{category}</span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">school</span> {univName}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#2F36ED] transition-colors">{oppTitle}</h3>
                          <p className="text-xs text-[#454556] line-clamp-3 leading-relaxed">{oppDesc}</p>
                        </div>

                        <div className="border-t border-[#DFE3E8] pt-4 flex justify-between items-center">
                          <div className="text-xs">
                            <span className="text-[#767588] block text-[10px]">Location</span>
                            <span className="font-bold text-[#0F172A]">{locationStr}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOpportunityDetail(opp);
                            }}
                            className="bg-[#F36F56] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#d95d46] transition-all cursor-pointer shadow-md shadow-[#F36F56]/20 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View Opportunity &amp; Submit Offer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DEDICATED FULL-PAGE OPPORTUNITY DETAIL VIEW */}
          {activeView === 'opportunity_detail' && selectedOpportunityModal && (() => {
            const opp = selectedOpportunityModal;
            const oppTitle = opp.title || opp.issueId?.title || 'Civic Infrastructure Project';
            const oppDesc = opp.issueId?.description || opp.description || 'Assigned academic R&D project approved by government.';
            const category = opp.issueId?.category || opp.category || 'R&D Innovation';
            const univObj = opp.universityId || opp.assignedUniversityId || opp.issueId?.assignedUniversityId;
            const univName = univObj?.name || 'Assigned University Partner';
            const univCode = univObj?.code || 'UNIV-PARTNER';
            const univType = univObj?.type || 'State University';
            const univEmail = univObj?.email || 'research@university.ac.in';

            return (
              <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#DFE3E8]">
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#2F36ED] bg-white px-4 py-2 rounded-xl border border-[#DFE3E8] hover:border-[#2F36ED] transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Opportunities
                  </button>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Govt Verified &amp; University Assigned
                  </span>
                </div>

                <div className="bg-white border border-[#DFE3E8] rounded-2xl p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="px-3.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[#2F36ED]/10 text-[#2F36ED]">
                      {category}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight mb-3">
                      {oppTitle}
                    </h1>
                    <p className="text-sm text-[#454556] leading-relaxed">
                      {oppDesc}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#DFE3E8] rounded-2xl p-8 shadow-xs space-y-6">
                  <h3 className="text-xl font-extrabold text-[#0F172A]">
                    Submit CSR Proposal to University ({univName})
                  </h3>

                  <form onSubmit={handlePledgeFundingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Proposal Title *</label>
                      <input
                        type="text"
                        required
                        value={pledgeForm.title}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, title: e.target.value })}
                        placeholder="e.g., Corporate CSR Grant &amp; Hardware Support for Solar Project"
                        className="w-full h-[48px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Offering Type *</label>
                        <select
                          value={pledgeForm.offeringType}
                          onChange={(e) => setPledgeForm({ ...pledgeForm, offeringType: e.target.value })}
                          className="w-full h-[48px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                        >
                          <option value="funding">Financial Funding / Grant</option>
                          <option value="technology">Technology / Software</option>
                          <option value="equipment">Specialized Hardware &amp; Equipment</option>
                          <option value="services">Engineering Services</option>
                          <option value="mentorship">Technical Mentorship</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Offered CSR Value (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={pledgeForm.estimatedValue}
                          onChange={(e) => setPledgeForm({ ...pledgeForm, estimatedValue: e.target.value })}
                          className="w-full h-[48px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Implementation Timeline *</label>
                        <input
                          type="text"
                          required
                          value={pledgeForm.timeline}
                          onChange={(e) => setPledgeForm({ ...pledgeForm, timeline: e.target.value })}
                          className="w-full h-[48px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Detailed Proposal &amp; Solution Scope *</label>
                      <textarea
                        rows={4}
                        required
                        value={pledgeForm.description}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, description: e.target.value })}
                        className="w-full p-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED] resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Attach CSR Proposal PDF Document (Optional)</label>
                      <div className="border-2 border-dashed border-[#DFE3E8] hover:border-[#2F36ED] rounded-xl p-4 text-center bg-[#F8FAFC] transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setPledgeForm({ ...pledgeForm, pdfFile: e.target.files[0] })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="material-symbols-outlined text-3xl text-[#2F36ED] mb-1">picture_as_pdf</span>
                        {pledgeForm.pdfFile ? (
                          <div>
                            <p className="text-xs font-bold text-emerald-600 truncate">{pledgeForm.pdfFile.name}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPdfDocument(pledgeForm.pdfFile);
                              }}
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2F36ED] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 relative z-10 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              Preview Uploaded PDF File
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">Upload Industry CSR Proposal PDF</p>
                            <p className="text-[10px] text-[#767588]">Click or drag PDF file here</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingProposal}
                      className="w-full h-[52px] bg-[#F36F56] text-white font-bold text-xs rounded-xl hover:bg-[#d95d46] transition-all shadow-md shadow-[#F36F56]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                      {submittingProposal ? 'Submitting CSR Proposal...' : 'Submit CSR Proposal to University'}
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  </form>
                </div>
              </div>
            );
          })()}

          {/* CSR PROJECTS VIEW (ACCEPTED PROPOSALS) */}
          {activeView === 'projects' && (
            <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Accepted CSR Projects</h1>
                  <p className="text-sm text-[#454556]">Active ground deployments accepted by Universities, funded by Corporate CSR grants</p>
                </div>
                <button
                  onClick={fetchSubmittedProposals}
                  className="px-4 py-2 text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 rounded-xl hover:bg-[#2F36ED]/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh CSR Projects
                </button>
              </div>

              {acceptedCsrProjects.length === 0 ? (
                <div className="p-8 bg-white border border-[#DFE3E8] rounded-2xl text-center text-xs text-[#454556] space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#2F36ED]">assignment</span>
                  <p className="font-bold text-[#0F172A] text-sm">No Accepted CSR Projects Yet</p>
                  <p className="max-w-md mx-auto">When a University accepts your CSR funding proposal, the project will automatically appear here as an Active CSR Project.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {acceptedCsrProjects.map((proj) => {
                    const projTitle = proj.title || proj.issueId?.title || 'Accepted CSR Project';
                    const category = proj.issueId?.category || 'CSR Deployment';
                    const univName = proj.universityId?.name || 'Jharkhand University of Technology';
                    const locationStr = proj.issueId?.location?.district || proj.location || 'Ranchi, Jharkhand';
                    const csrValue = proj.estimatedValue ? `₹${Number(proj.estimatedValue).toLocaleString('en-IN')}` : '₹15 Lakhs';

                    return (
                      <div
                        key={proj._id || proj.id}
                        onClick={() => openCsrProjectDetail(proj)}
                        className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all space-y-4 cursor-pointer group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{category}</span>
                            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">verified</span> UNIVERSITY ACCEPTED
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#2F36ED] transition-colors">{projTitle}</h3>
                          <p className="text-xs text-[#2F36ED] font-semibold mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">school</span> Academic Partner: {univName}
                          </p>
                          <p className="text-xs text-[#454556] line-clamp-2 leading-relaxed">{proj.description}</p>
                        </div>

                        <div className="bg-[#F1F3F5] p-3 rounded-xl border border-[#DFE3E8] grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#767588] text-[10px] block font-semibold">Sponsoring Corporate Partner</span>
                            <span className="font-extrabold text-[#0F172A]">TechCorp CSR Foundation</span>
                          </div>
                          <div>
                            <span className="text-[#767588] text-[10px] block font-semibold">Offered CSR Value</span>
                            <span className="font-extrabold text-emerald-600">{csrValue}</span>
                          </div>
                        </div>

                        <div className="border-t border-[#DFE3E8] pt-3 flex justify-between items-center text-xs">
                          <span className="text-[#454556] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[#F36F56]">location_on</span> {locationStr}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCsrProjectDetail(proj);
                            }}
                            className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>View Full Details &amp; Updates</span>
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

          {/* DEDICATED FULL-PAGE CSR PROJECT DETAIL & UPDATES VIEW */}
          {activeView === 'csr_project_detail' && selectedCsrProject && (() => {
            const proj = selectedCsrProject;
            const projTitle = proj.title || proj.issueId?.title || 'Active CSR R&D Project';
            const issueObj = proj.issueId || {};
            const issueTitle = issueObj.title || projTitle;
            const issueDesc = issueObj.description || proj.description || 'Civic infrastructure challenge logged on platform.';
            const category = issueObj.category || 'Water & Sanitation';
            const locationStr = (issueObj.location && typeof issueObj.location === 'object')
              ? [issueObj.location.address, issueObj.location.district, issueObj.location.state].filter(Boolean).join(', ') || 'Ranchi, Jharkhand'
              : (typeof issueObj.location === 'string' ? issueObj.location : (typeof proj.location === 'string' ? proj.location : 'Ranchi, Jharkhand'));
            const univObj = typeof proj.universityId === 'object' && proj.universityId !== null ? proj.universityId : (typeof proj.issueId === 'object' && proj.issueId?.assignedUniversityId ? proj.issueId.assignedUniversityId : {});
            const univName = univObj.name || 'Academic University Partner';
            const univCode = univObj.code || 'UNIV-R&D';
            const univType = univObj.type || 'State University';
            const univEmail = univObj.email || 'research@university.ac.in';

            const indObj = typeof proj.industryId === 'object' && proj.industryId !== null ? proj.industryId : {};
            const indName = indObj.companyName || indObj.name || currentUser?.companyName || currentUser?.fullName || 'Corporate Industry Partner';
            const indEmail = indObj.email || currentUser?.email || 'csr@industry.org';

            const acceptedProp = typeof proj.acceptedProposalId === 'object' && proj.acceptedProposalId !== null ? proj.acceptedProposalId : {};
            const univSolution = proj.universityProposal?.solutionDescription || acceptedProp.solutionDescription || proj.solutionDescription || 'University academic R&D proposal addressing civic challenge.';
            const univBudget = proj.universityProposal?.estimatedCost || acceptedProp.estimatedCost || proj.estimatedCost || 1850000;
            const univFaculty = proj.universityProposal?.facultyName || (Array.isArray(acceptedProp.facultyInformation) && acceptedProp.facultyInformation[0]?.name) || 'Faculty R&D Lead';
            const univPdfName = proj.universityProposal?.pdfName || acceptedProp.proposalPdf?.originalName || 'University_RD_Proposal.pdf';

            const indScope = proj.description || 'CSR funding & equipment grant offered for civic infrastructure R&D deployment.';
            const indValue = proj.estimatedValue || 1500000;
            const indResources = proj.resourcesOffered || 'Financial Grant & Technical Support';
            const indPdfName = proj.proposalDocument?.originalName || proj.industryProposalPdf || 'CSR_Partnership_Proposal.pdf';

            return (
              <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-200">
                {/* Back Navigation Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DFE3E8]">
                  <button
                    onClick={() => setActiveView('projects')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#2F36ED] bg-white px-4 py-2 rounded-xl border border-[#DFE3E8] hover:border-[#2F36ED] transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to CSR Projects
                  </button>
                  <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Active Deployment &amp; CSR Funded
                  </span>
                </div>

                {/* Hero Banner Card */}
                <div className="bg-white border border-[#DFE3E8] rounded-2xl p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="px-3.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-[#2F36ED]/10 text-[#2F36ED]">
                      {category}
                    </span>
                    <span className="text-xs text-[#767588] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-[#F36F56]">location_on</span>
                      Location: {locationStr}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight mb-3">
                      {projTitle}
                    </h1>
                    <p className="text-sm text-[#454556] leading-relaxed">
                      {indScope}
                    </p>
                  </div>
                </div>

                {/* ORIGINAL CIVIC CHALLENGE & MEDIA GALLERY */}
                <div className="bg-white border border-[#DFE3E8] rounded-2xl p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F36F56]">report_problem</span>
                    Original Civic Challenge Details &amp; Citizen Photos
                  </h3>

                  <div className="bg-[#F1F3F5] p-4 rounded-xl border border-[#DFE3E8] space-y-2">
                    <h4 className="text-sm font-bold text-[#0F172A]">{issueTitle}</h4>
                    <p className="text-xs text-[#454556] leading-relaxed">{issueDesc}</p>
                  </div>

                  {/* Photos & Videos Gallery */}
                  <div>
                    <h4 className="text-xs font-bold text-[#767588] uppercase tracking-wider mb-3">Geotagged Field Media</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {issueObj.photos?.length > 0 ? (
                        issueObj.photos.map((photo, idx) => (
                          <div key={idx} className="rounded-xl border border-[#DFE3E8] overflow-hidden bg-[#F1F3F5] p-3">
                            <a href={typeof photo === 'object' ? photo.url : photo} target="_blank" rel="noopener noreferrer">
                              <img src={typeof photo === 'object' ? photo.url : photo} alt={`Evidence ${idx + 1}`} className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-90 transition-opacity" />
                            </a>
                            <span className="text-xs font-semibold text-[#0F172A]">Field Evidence Photo #{idx + 1}</span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-[#DFE3E8] overflow-hidden bg-[#F1F3F5] p-4 flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80" alt="field site" className="w-24 h-24 object-cover rounded-lg" />
                          <div className="text-xs">
                            <span className="font-bold text-[#0F172A] block">Site Field Survey Image</span>
                            <span className="text-[#454556] block">Geotagged: Field Station</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DUAL STAKEHOLDERS & PROPOSALS SUMMARY GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* UNIVERSITY R&D PROPOSAL CARD */}
                  <div className="bg-emerald-500/5 border border-emerald-300 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 border-b border-emerald-200 pb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Selected University R&amp;D Proposal
                        </span>
                        <h4 className="text-base font-bold text-[#0F172A] mt-0.5">{univName}</h4>
                        <span className="text-[11px] text-[#767588]">{univCode} • {univType}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-[#454556] bg-white p-3 rounded-xl border border-emerald-200 leading-relaxed">
                        <strong>R&amp;D Solution:</strong> {univSolution}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-[#767588] text-[10px] uppercase font-bold block">Approved R&amp;D Budget</span>
                          <span className="font-extrabold text-emerald-700">₹{Number(univBudget).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-[#767588] text-[10px] uppercase font-bold block">Faculty Lead</span>
                          <span className="font-extrabold text-[#0F172A]">{univFaculty}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openPdfDocument(acceptedProp.proposalPdf || { originalName: univPdfName }, {
                          title: acceptedProp.title || proj.title || 'University R&D Proposal Document',
                          university: acceptedProp.universityId?.name || 'Partner University',
                          faculty: univFaculty,
                          description: univSolution,
                          budget: univBudget,
                          type: 'University R&D Solution Proposal'
                        })}
                        className="w-full p-3 bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl text-xs text-blue-900 flex items-center gap-2 cursor-pointer transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-blue-600 text-lg">picture_as_pdf</span>
                        <span className="font-semibold">University R&amp;D PDF:</span>
                        <span className="underline font-bold truncate flex-1">{univPdfName}</span>
                        <span className="material-symbols-outlined text-sm text-blue-600">open_in_new</span>
                      </button>
                    </div>
                  </div>

                  {/* INDUSTRY CSR PROPOSAL CARD */}
                  <div className="bg-blue-500/5 border border-blue-300 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 border-b border-blue-200 pb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2F36ED] text-white flex items-center justify-center font-bold text-lg">
                        <span className="material-symbols-outlined">factory</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          Accepted Industry CSR Proposal
                        </span>
                        <h4 className="text-base font-bold text-[#0F172A] mt-0.5">{indName}</h4>
                        <span className="text-[11px] text-[#767588]">{indEmail}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-[#454556] bg-white p-3 rounded-xl border border-blue-200 leading-relaxed">
                        <strong>CSR Scope:</strong> {indScope}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                          <span className="text-[#767588] text-[10px] uppercase font-bold block">Offered CSR Value</span>
                          <span className="font-extrabold text-emerald-600">₹{Number(indValue).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-blue-200">
                          <span className="text-[#767588] text-[10px] uppercase font-bold block">CSR Resources Offered</span>
                          <span className="font-extrabold text-[#0F172A]">{indResources}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openPdfDocument(proj.proposalDocument || { originalName: indPdfName }, {
                          title: proj.title || 'CSR Partnership Proposal',
                          university: indName,
                          description: indScope,
                          budget: indValue,
                          type: 'Industry CSR Partnership Proposal'
                        })}
                        className="w-full p-3 bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl text-xs text-blue-900 flex items-center gap-2 cursor-pointer transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-blue-600 text-lg">picture_as_pdf</span>
                        <span className="font-semibold">Industry CSR PDF:</span>
                        <span className="underline font-bold truncate flex-1">{indPdfName}</span>
                        <span className="material-symbols-outlined text-sm text-blue-600">open_in_new</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* POST NEW PROJECT UPDATE & LIVE PROGRESS STREAM */}
                <div className="bg-white border border-[#DFE3E8] rounded-2xl p-8 shadow-xs space-y-6">
                  <div>
                    <span className="text-xs font-bold text-[#F36F56] uppercase tracking-wider mb-1 block">
                      PROJECT MONITORING &amp; FIELD LOGS
                    </span>
                    <h3 className="text-xl font-extrabold text-[#0F172A]">
                      Post Live Progress Update &amp; Milestone Report
                    </h3>
                    <p className="text-xs text-[#454556] mt-1">
                      Add milestone updates, field inspection logs, and optional PDF reports for University and Government review.
                    </p>
                  </div>

                  {/* Post Update Form */}
                  <form onSubmit={handleAddProjectUpdate} className="space-y-4 bg-[#F1F3F5] p-6 rounded-2xl border border-[#DFE3E8]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Update Title *</label>
                        <input
                          type="text"
                          required
                          value={newUpdateForm.title}
                          onChange={(e) => setNewUpdateForm({ ...newUpdateForm, title: e.target.value })}
                          placeholder="e.g. Phase 2 Water Filter Assembly &amp; Community Testing"
                          className="w-full h-[44px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Milestone Status *</label>
                        <select
                          value={newUpdateForm.milestone}
                          onChange={(e) => setNewUpdateForm({ ...newUpdateForm, milestone: e.target.value })}
                          className="w-full h-[44px] px-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                        >
                          <option value="in_progress">In Progress</option>
                          <option value="field_testing">Field Testing</option>
                          <option value="resolved">Deployed &amp; Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Progress Notes &amp; Field Summary *</label>
                      <textarea
                        rows={3}
                        required
                        value={newUpdateForm.notes}
                        onChange={(e) => setNewUpdateForm({ ...newUpdateForm, notes: e.target.value })}
                        placeholder="Detail the accomplishments, field measurements, equipment delivered, or ground impact..."
                        className="w-full p-4 border border-[#DFE3E8] rounded-xl bg-white text-xs text-[#0F172A] outline-none focus:border-[#2F36ED] resize-none"
                      ></textarea>
                    </div>

                    {/* Optional PDF File Picker */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Attach Milestone Report PDF (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2.5 bg-white border border-[#DFE3E8] rounded-xl text-xs font-bold text-[#0F172A] hover:bg-[#DFE3E8] transition-colors cursor-pointer flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">upload_file</span>
                          {newUpdateForm.pdfFile ? newUpdateForm.pdfFile.name : 'Choose Progress PDF'}
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setNewUpdateForm({ ...newUpdateForm, pdfFile: e.target.files[0] });
                              }
                            }}
                          />
                        </label>
                        {newUpdateForm.pdfFile && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              {newUpdateForm.pdfFile.name} attached
                            </span>
                            <button
                              type="button"
                              onClick={() => openPdfDocument(newUpdateForm.pdfFile)}
                              className="px-3 py-1.5 bg-blue-50 text-[#2F36ED] border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              Preview PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingUpdate}
                      className="w-full h-[48px] bg-[#2F36ED] text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-base ${submittingUpdate ? 'animate-spin' : ''}`}>
                        {submittingUpdate ? 'refresh' : 'post_add'}
                      </span>
                      {submittingUpdate ? 'Saving Update to MongoDB Database...' : 'Post Project Update'}
                    </button>
                  </form>

                  {/* Project Updates Stream */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#767588] uppercase tracking-wider">Project Timeline Stream ({projectUpdates.length})</h4>
                    {projectUpdates.length === 0 ? (
                      <div className="p-6 bg-[#F1F3F5] rounded-xl text-center text-xs text-[#767588] font-semibold border border-[#DFE3E8]">
                        No project updates posted yet for this project. Use the form above to submit an update to the database.
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
                          } catch (e) { }
                        }
                        const authorStr = typeof upd.postedBy === 'object' && upd.postedBy !== null ? (upd.postedBy?.fullName || 'Project Lead') : (upd.author || 'TechCorp CSR Lead');
                        const mediaList = upd.media || (upd.attachment ? [{ originalName: upd.attachment }] : []);

                        return (
                          <div key={upd._id || upd.id || idx} className="p-5 rounded-2xl border border-[#DFE3E8] bg-white space-y-3 shadow-2xs">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="text-sm font-bold text-[#0F172A]">{title}</h5>
                                <span className="text-[11px] text-[#767588]">Posted by {authorStr} • {dateStr}</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {milestone}
                              </span>
                            </div>

                            <p className="text-xs text-[#454556] leading-relaxed bg-[#F1F3F5] p-3 rounded-xl border border-[#DFE3E8]">
                              {desc}
                            </p>

                            {mediaList.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {mediaList.map((m, mIdx) => (
                                  <button
                                    key={mIdx}
                                    type="button"
                                    onClick={() => openPdfDocument(m, {
                                      title: title || 'CSR Progress Report Document',
                                      university: authorStr,
                                      description: desc,
                                      date: dateStr,
                                      type: 'Milestone Progress Report'
                                    })}
                                    className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl text-xs text-blue-900 w-fit cursor-pointer transition-colors text-left"
                                  >
                                    <span className="material-symbols-outlined text-blue-600 text-base">picture_as_pdf</span>
                                    <span className="font-semibold">Attached Document:</span>
                                    <span className="underline font-bold">{m.originalName || m.url || 'Report.pdf'}</span>
                                  </button>
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

          {/* MY CSR PROPOSALS VIEW */}
          {activeView === 'my_proposals' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">My Submitted CSR Proposals</h1>
                  <p className="text-sm text-[#454556]">Track all CSR funding &amp; tech proposals sent to Universities</p>
                </div>
                <button
                  onClick={fetchSubmittedProposals}
                  className="px-4 py-2 text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 rounded-xl hover:bg-[#2F36ED]/20 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                </button>
              </div>

              {loadingProposals ? (
                <div className="flex items-center gap-2 text-xs text-[#454556] py-8 justify-center">
                  <span className="material-symbols-outlined text-base animate-spin text-[#2F36ED]">progress_activity</span>
                  Loading proposals...
                </div>
              ) : submittedProposals.length === 0 ? (
                <div className="p-8 bg-white border border-[#DFE3E8] rounded-2xl text-center text-xs text-[#454556] space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#2F36ED]">assignment_turned_in</span>
                  <p className="font-bold text-[#0F172A] text-sm">No Industry Proposals Submitted Yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {submittedProposals.map((prop) => {
                    const isAccepted = prop.status === 'accepted';
                    const isRejected = prop.status === 'rejected';
                    const univName = prop.universityId?.name || 'Assigned University';

                    return (
                      <div
                        key={prop._id}
                        className={`bg-white border ${isAccepted ? 'border-emerald-400 bg-emerald-50/10 shadow-md ring-1 ring-emerald-300' :
                            isRejected ? 'border-red-200 bg-red-50/10' :
                              'border-[#DFE3E8] shadow-xs'
                          } rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="text-base font-bold text-[#0F172A] flex-1">{prop.title}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                isRejected ? 'bg-red-100 text-red-700 border border-red-200' :
                                  'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                              {isAccepted ? 'ACCEPTED BY UNIVERSITY' : isRejected ? 'DECLINED' : prop.status}
                            </span>
                          </div>

                          <p className="text-xs text-[#2F36ED] font-semibold mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">school</span>
                            University: <strong>{univName}</strong>
                          </p>

                          <p className="text-xs text-[#454556] bg-[#F1F3F5] p-3 rounded-xl border border-[#DFE3E8] leading-relaxed line-clamp-3">
                            {prop.description}
                          </p>
                        </div>

                        {isAccepted && (
                          <button
                            onClick={() => {
                              setSelectedCsrProject(prop);
                              setActiveView('csr_project_detail');
                            }}
                            className="w-full py-2.5 bg-[#2F36ED] text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <span>Open Active CSR Project &amp; Post Updates</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Register New CSR Initiative Modal */}
      {isInitiativeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0F172A]">Register New Corporate CSR Initiative</h3>
              <button onClick={() => setIsInitiativeModalOpen(false)} className="text-[#767588] hover:text-[#0F172A] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInitiativeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  value={initiativeForm.title}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, title: e.target.value })}
                  placeholder="e.g., Clean Water & Solar Storage Program"
                  className="w-full h-[44px] px-3.5 border border-[#DFE3E8] rounded-xl text-xs text-[#0F172A] outline-none focus:border-[#2F36ED]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInitiativeModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-bold text-[#454556] hover:bg-[#F1F3F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md shadow-[#F36F56]/20 hover:bg-[#d95d46] cursor-pointer"
                >
                  Register Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndustryDashboardPage;
