import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

function IndustryDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOpportunityModal, setSelectedOpportunityModal] = useState(null);
  const [isInitiativeModalOpen, setIsInitiativeModalOpen] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dynamic API State
  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [submittedProposals, setSubmittedProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Proposal Modal Form State
  const [pledgeForm, setPledgeForm] = useState({
    title: '',
    offeringType: 'funding',
    estimatedValue: '500000',
    timeline: '6 Months',
    resourcesOffered: 'Financial Grant & Technical Mentorship',
    description: '',
  });

  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    sector: 'CSR Clean Energy',
    budget: '150000000',
    targetRegion: 'Northern District',
    description: ''
  });

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
      const res = await fetch('http://localhost:3000/api/industry/proposals/projects', {
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
      const res = await fetch('http://localhost:3000/api/industry/proposals/my', {
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

  const openPledgeModal = (opp) => {
    setSelectedOpportunityModal(opp);
    const oppTitle = opp.title || opp.issueId?.title || 'Project';
    setPledgeForm({
      title: `CSR Sponsorship & Grant for ${oppTitle}`,
      offeringType: 'funding',
      estimatedValue: '500000',
      timeline: '6 Months',
      resourcesOffered: 'Financial CSR Grant & Technical Equipment',
      description: `Corporate CSR Grant & Technology Support offered by Industry for ${oppTitle}.`,
    });
  };

  const handlePledgeFundingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpportunityModal || !pledgeForm.title) return;

    setSubmittingProposal(true);
    try {
      const projectId = selectedOpportunityModal._id;
      const issueId = selectedOpportunityModal.issueId?._id || selectedOpportunityModal.issueId || selectedOpportunityModal._id;
      const universityId = selectedOpportunityModal.universityId?._id || selectedOpportunityModal.universityId;

      const payload = {
        projectId,
        issueId,
        universityId,
        title: pledgeForm.title.trim(),
        offeringType: pledgeForm.offeringType,
        description: pledgeForm.description.trim(),
        resourcesOffered: pledgeForm.resourcesOffered.trim(),
        estimatedValue: Number(pledgeForm.estimatedValue) || 500000,
        timeline: pledgeForm.timeline,
      };

      const res = await fetch('http://localhost:3000/api/industry/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`CSR Proposal "${pledgeForm.title}" submitted to University!`);
        setSelectedOpportunityModal(null);
        fetchSubmittedProposals();
      } else {
        showToast(data.message || 'Error submitting CSR proposal.');
      }
    } catch (err) {
      console.error('Error submitting industry proposal:', err);
      showToast('Error submitting proposal to university.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const [requests, setRequests] = useState([
    { id: 'REQ-88', company: 'TechCorp CSR Foundation', project: 'Digital Literacy & Skill Program', status: 'Pending', statusColor: 'bg-[#F36F56]/10 text-[#F36F56]' },
    { id: 'REQ-92', company: 'GreenEnergy Ltd.', project: 'Rural Solar Microgrid Expansion', status: 'In Review', statusColor: 'bg-[#F1F3F5] text-[#454556]' },
    { id: 'REQ-95', company: 'EduBuild Global Foundation', project: 'Smart School Infrastructure Renewal', status: 'Approved', statusColor: 'bg-emerald-500/10 text-emerald-600' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'CSR Funds Approved', time: '15m ago', text: '₹2.5 Cr disbursed for Rural Solar Storage expansion.' },
    { id: 2, title: 'New Partnership Inquiry', time: '2h ago', text: 'TechCorp CSR submitted a digital literacy initiative.' },
    { id: 3, title: 'Quarterly Impact Benchmark', time: '4h ago', text: 'Q3 Citizen Impact target reached 1.2 Million beneficiaries.' }
  ]);


  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Opportunities (Govt Approved)', icon: 'explore', badge: opportunities.length > 0 ? opportunities.length : null },
    { id: 'my_proposals', label: 'My CSR Proposals', icon: 'assignment_turned_in', badge: submittedProposals.length > 0 ? submittedProposals.length : null },
    { id: 'projects', label: 'CSR Projects', icon: 'assignment' },
    { id: 'institutions', label: 'Institutions', icon: 'account_balance' },
    { id: 'industry', label: 'Corporate Partners', icon: 'factory' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'reports', label: 'Impact Reports', icon: 'description' }
  ];

  const secondaryNavItems = [
    { id: 'users', label: 'Users & Roles', icon: 'group' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
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

  const handlePledgeFunding = (e) => {
    e.preventDefault();
    showToast(`Pledged funding for '${selectedOpportunityModal.title}' successfully submitted!`);
    setSelectedOpportunityModal(null);
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

        {/* Global Live Search */}
        <div className="flex-1 max-w-md mx-6 relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767588] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opportunities, CSR funds, projects..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DFE3E8] bg-[#F1F3F5] focus:bg-white focus:border-[#2F36ED] focus:ring-2 focus:ring-[#2F36ED]/20 outline-none transition-all text-xs text-[#0F172A] placeholder-[#767588]"
          />
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="text-[#454556] hover:bg-[#F1F3F5] hover:text-[#2F36ED] p-2 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F36F56] rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {showNotificationsMenu && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-[#DFE3E8] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#DFE3E8]">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Notifications ({notifications.length})</span>
                  <button onClick={() => setNotifications([])} className="text-[11px] text-[#2F36ED] font-semibold hover:underline">Clear all</button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#454556] text-center py-4">No unread notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-[#F1F3F5] hover:bg-[#2F36ED]/5 transition-colors cursor-pointer border border-[#DFE3E8]/50">
                        <div className="flex justify-between text-xs font-bold text-[#0F172A]">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-[#454556] font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#454556] mt-1 leading-snug">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="hover:bg-[#F1F3F5] px-3.5 py-1.5 rounded-xl border border-[#DFE3E8] text-xs font-semibold text-[#454556] hover:text-[#2F36ED] hover:border-[#2F36ED] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Exit Portal
          </button>

          <div className="h-6 w-px bg-[#DFE3E8] mx-1 hidden sm:block"></div>

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
                <button onClick={() => navigate('/')} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 mt-1">
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
        <nav className="w-64 bg-white border-r border-[#DFE3E8] flex flex-col py-6 px-4 shrink-0 overflow-y-auto justify-between shadow-2xs">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
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

          <div className="flex flex-col gap-1 border-t border-[#DFE3E8] pt-4">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#454556] mb-1">
              Administration
            </div>
            {secondaryNavItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#2F36ED]/10 text-[#2F36ED] border-r-4 border-[#2F36ED] font-bold'
                      : 'text-[#454556] hover:text-[#2F36ED] hover:bg-[#F1F3F5] hover:translate-x-1'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 bg-[#F1F3F5]">
          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <div className="max-w-[1280px] mx-auto space-y-10">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#DFE3E8]">
                <div>
                  <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Industry Dashboard</h1>
                  <p className="text-sm text-[#454556] mt-1">Overview of corporate partnerships, CSR funding allocations, and citizen impact metrics.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  <button 
                    onClick={() => showToast('Exporting Q3 Corporate Impact Audit PDF...')}
                    className="bg-white text-[#2F36ED] border border-[#DFE3E8] hover:border-[#2F36ED] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span> Export Report
                  </button>
                  <button 
                    onClick={() => setIsInitiativeModalOpen(true)}
                    className="bg-[#F36F56] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#d95d46] transition-all shadow-md shadow-[#F36F56]/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> New Initiative
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI Card 1 */}
                <div 
                  onClick={() => setActiveView('my_proposals')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Proposals Sent to University</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">send</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">{submittedProposals.length}</h3>
                  <div className="flex items-center text-xs font-semibold text-[#2F36ED]">
                    <span className="material-symbols-outlined text-[16px] mr-1">school</span>
                    <span>{submittedProposals.filter(p => p.status === 'accepted').length} Accepted by Universities</span>
                  </div>
                </div>

                {/* KPI Card 2 */}
                <div 
                  onClick={() => setActiveView('projects')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Total CSR Value Offered</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">payments</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">
                    ₹{submittedProposals.reduce((sum, p) => sum + (p.estimatedValue || 0), 0).toLocaleString('en-IN') || '0'}
                  </h3>
                  <div className="flex items-center text-xs font-semibold text-[#F36F56]">
                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                    <span>Live CSR Deployments</span>
                  </div>
                </div>

                {/* KPI Card 3 */}
                <div 
                  onClick={() => setActiveView('analytics')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Projects Completed</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">task_alt</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">86</h3>
                  <div className="flex items-center text-xs font-medium text-[#454556]">
                    <span className="material-symbols-outlined text-[16px] mr-1">horizontal_rule</span>
                    <span>Steady vs last quarter</span>
                  </div>
                </div>

                {/* KPI Card 4 */}
                <div 
                  onClick={() => setActiveView('analytics')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#F36F56] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Citizens Impacted</p>
                    <span className="material-symbols-outlined text-[#F36F56] text-[22px] group-hover:scale-110 transition-transform">groups</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">1.2M</h3>
                  <div className="flex items-center text-xs font-semibold text-emerald-600">
                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                    <span>+24% this quarter</span>
                  </div>
                </div>
              </div>

              {/* Bento Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recommended Opportunities */}
                <div className="lg:col-span-2 bg-white border border-[#DFE3E8] rounded-2xl shadow-xs overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-[#DFE3E8] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#0F172A]">Recommended Opportunities</h3>
                    <button onClick={() => setActiveView('challenges')} className="text-[#2F36ED] text-xs font-bold hover:underline cursor-pointer">View All &rarr;</button>
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1">
                    {opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpportunityModal(opp)}
                        className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-transparent hover:border-[#2F36ED]/20 hover:bg-[#F1F3F5]/60 transition-all cursor-pointer group"
                      >
                        <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-[#DFE3E8] relative">
                          <img
                            src={opp.img}
                            alt={opp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2F36ED] transition-colors">{opp.title}</h4>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${opp.priorityColor}`}>
                                {opp.priority}
                              </span>
                            </div>
                            <p className="text-xs text-[#454556] line-clamp-2 leading-relaxed">{opp.description}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#DFE3E8] pt-3 mt-3 text-xs text-[#454556] font-medium">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-[#2F36ED]">location_on</span> {opp.location}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-emerald-600">
                              <span className="material-symbols-outlined text-[16px]">payments</span> Est. {opp.budget}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                  {/* Partnership Requests Card */}
                  <div className="bg-white border border-[#DFE3E8] rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#DFE3E8] flex justify-between items-center">
                      <h3 className="text-lg font-bold text-[#0F172A]">Partnership Requests</h3>
                      <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-0.5 rounded-full">{requests.length} Pending</span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[#DFE3E8]">
                      {requests.map((req) => (
                        <div key={req.id} className="p-4 hover:bg-[#F1F3F5]/60 transition-colors cursor-pointer flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">{req.company}</p>
                            <p className="text-[11px] text-[#454556]">{req.project}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${req.statusColor}`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-[#DFE3E8] text-center bg-white">
                      <button onClick={() => setActiveView('industry')} className="text-[#2F36ED] text-xs font-bold hover:underline cursor-pointer">Manage All Requests &rarr;</button>
                    </div>
                  </div>

                  {/* Impact Snapshot Card */}
                  <div className="bg-[#2F36ED] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#F36F56]">insights</span>
                        Q3 Impact Snapshot
                      </h3>

                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span>Target Completion (Q3)</span>
                            <span>78%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-white rounded-full h-2" style={{ width: '78%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1.5">
                            <span>CSR Fund Utilization</span>
                            <span>92%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#F36F56] rounded-full h-2" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveView('reports')}
                        className="mt-8 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-xs font-bold text-white cursor-pointer"
                      >
                        View Detailed Impact Audit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPPORTUNITIES VIEW (Govt Approved Projects) */}
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
                  <p className="max-w-md mx-auto">When the Government accepts a University proposal, the project will automatically appear here as an Opportunity for Industry CSR funding.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {opportunities.map((opp) => {
                    const univName = opp.universityId?.name || opp.assignedUniversityId?.name || 'Assigned University';
                    const oppTitle = opp.title || opp.issueId?.title || 'Civic Infrastructure Project';
                    const oppDesc = opp.issueId?.description || opp.description || 'Assigned academic R&D project approved by government.';
                    const category = opp.issueId?.category || 'R&D Innovation';
                    const locationStr = opp.issueId?.location?.district || opp.universityId?.district || 'Jharkhand';

                    return (
                      <div key={opp._id} className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <span className="text-xs font-semibold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{category}</span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">school</span> {univName}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2">{oppTitle}</h3>
                          <p className="text-xs text-[#454556] line-clamp-3 leading-relaxed">{oppDesc}</p>
                        </div>

                        <div className="border-t border-[#DFE3E8] pt-4 flex justify-between items-center">
                          <div className="text-xs">
                            <span className="text-[#767588] block text-[10px]">Location</span>
                            <span className="font-bold text-[#0F172A]">{locationStr}</span>
                          </div>
                          <button
                            onClick={() => openPledgeModal(opp)}
                            className="bg-[#F36F56] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#d95d46] transition-all cursor-pointer shadow-md shadow-[#F36F56]/20 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">send</span>
                            Send Proposal to University
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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

              {/* STATS SUMMARY BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#DFE3E8] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2F36ED]/10 text-[#2F36ED] flex items-center justify-center font-bold text-xl shrink-0">
                    <span className="material-symbols-outlined">send</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#767588] uppercase tracking-wider block">Total Proposals Sent</span>
                    <span className="text-2xl font-black text-[#0F172A]">{submittedProposals.length}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#DFE3E8] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#767588] uppercase tracking-wider block">Accepted by University</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {submittedProposals.filter(p => p.status === 'accepted').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#DFE3E8] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#767588] uppercase tracking-wider block">Pending / Under Review</span>
                    <span className="text-2xl font-black text-blue-600">
                      {submittedProposals.filter(p => p.status === 'submitted' || p.status === 'pending').length}
                    </span>
                  </div>
                </div>
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
                  <p className="max-w-md mx-auto">Go to the "Opportunities" tab, select an assigned University project, and submit your CSR funding proposal.</p>
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
                        className={`bg-white border ${
                          isAccepted ? 'border-emerald-400 bg-emerald-50/10 shadow-md ring-1 ring-emerald-300' :
                          isRejected ? 'border-red-200 bg-red-50/10' :
                          'border-[#DFE3E8] shadow-xs'
                        } rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="text-base font-bold text-[#0F172A] flex-1">{prop.title}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                              isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
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

                        <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#DFE3E8] pt-3">
                          <div className="bg-[#F1F3F5] p-2.5 rounded-xl border border-[#DFE3E8]">
                            <span className="text-[#767588] block text-[10px]">Offered CSR Value</span>
                            <span className="font-extrabold text-emerald-600">₹{prop.estimatedValue?.toLocaleString('en-IN') || '—'}</span>
                          </div>
                          <div className="bg-[#F1F3F5] p-2.5 rounded-xl border border-[#DFE3E8]">
                            <span className="text-[#767588] block text-[10px]">Offering Type</span>
                            <span className="font-extrabold text-[#0F172A] capitalize">{prop.offeringType || 'Funding'}</span>
                          </div>
                        </div>

                        {isAccepted && (
                          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-100/80 p-3 rounded-xl border border-emerald-300">
                            <span className="material-symbols-outlined text-lg text-emerald-600">verified</span>
                            <span>Proposal Accepted by {univName}! CSR Funding &amp; Project Active.</span>
                          </div>
                        )}

                        {isRejected && (
                          <div className="flex items-center gap-2 text-xs text-red-700 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                            <span className="material-symbols-outlined text-sm text-red-600">cancel</span>
                            <span>Proposal declined by university.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              )}
            </div>
          )}


          {/* CSR PROJECTS VIEW */}
          {activeView === 'projects' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Corporate Sponsored Projects</h1>
                  <p className="text-sm text-[#454556]">Active CSR deployment initiatives across sovereign districts</p>
                </div>
                <button onClick={() => setIsInitiativeModalOpen(true)} className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                  + New CSR Project
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#DFE3E8] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F3F5] border-b border-[#DFE3E8]">
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">ID</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Project Name</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Location</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">CSR Budget</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE3E8]">
                    <tr>
                      <td className="p-4 text-xs font-mono font-bold text-[#454556]">PRJ-CSR-01</td>
                      <td className="p-4 text-xs font-bold text-[#0F172A]">Northern District Smart Irrigation Pilot</td>
                      <td className="p-4 text-xs text-[#454556]">Northern District</td>
                      <td className="p-4 text-xs font-bold text-emerald-600">₹15,00,00,000</td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-xs font-bold">Active Deployment</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-xs font-mono font-bold text-[#454556]">PRJ-CSR-02</td>
                      <td className="p-4 text-xs font-bold text-[#0F172A]">Rural Clean Water Access Purification</td>
                      <td className="p-4 text-xs text-[#454556]">Eastern Rural Belt</td>
                      <td className="p-4 text-xs font-bold text-emerald-600">₹32,00,00,000</td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-[#2F36ED]/10 text-[#2F36ED] rounded-md text-xs font-bold">Infrastructure Setup</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Placeholder for other views */}
          {['institutions', 'industry', 'analytics', 'reports', 'users', 'settings'].includes(activeView) && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#0F172A] capitalize">Industry {activeView} Module</h1>
              <div className="bg-white border border-[#DFE3E8] rounded-2xl p-12 text-center text-[#454556] shadow-xs">
                <span className="material-symbols-outlined text-5xl text-[#2F36ED] mb-3">factory</span>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                  Corporate {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module Active
                </h3>
                <p className="text-xs text-[#454556] max-w-md mx-auto">
                  TechCorp CSR Foundation workspace synced with government &amp; university hubs.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Send Proposal to University Modal */}
      {selectedOpportunityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95 space-y-4">
            <button
              onClick={() => setSelectedOpportunityModal(null)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">school</span>
                {selectedOpportunityModal.universityId?.name || selectedOpportunityModal.assignedUniversityId?.name || 'Assigned University'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0F172A] leading-tight">
              {selectedOpportunityModal.title || selectedOpportunityModal.issueId?.title}
            </h3>

            <form onSubmit={handlePledgeFundingSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">CSR Proposal Title</label>
                <input
                  type="text"
                  required
                  value={pledgeForm.title}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Offering Type</label>
                  <select
                    value={pledgeForm.offeringType}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, offeringType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs bg-white focus:border-[#2F36ED] outline-none"
                  >
                    <option value="funding">Funding / Grant</option>
                    <option value="technology">Technology Support</option>
                    <option value="equipment">Equipment &amp; Hardware</option>
                    <option value="services">Technical Services</option>
                    <option value="mentorship">Mentorship &amp; R&amp;D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Offered Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={pledgeForm.estimatedValue}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, estimatedValue: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Proposal Details &amp; Objectives</label>
                <textarea
                  rows={3}
                  required
                  value={pledgeForm.description}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  placeholder="Describe your CSR sponsorship goals, technical support, and resources offered..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunityModal(null)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#d95d46] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {submittingProposal ? (
                    <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Sending...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">send</span> Submit Proposal to University</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* New Initiative Modal */}
      {isInitiativeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsInitiativeModalOpen(false)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">Create Corporate CSR Initiative</h3>
            <p className="text-xs text-[#454556] mb-6">Propose new civic projects backed by corporate sponsorship</p>

            <form onSubmit={handleInitiativeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rural Digital Skill Centers"
                  value={initiativeForm.title}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Sector</label>
                  <select
                    value={initiativeForm.sector}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, sector: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs bg-white focus:border-[#2F36ED] outline-none"
                  >
                    <option>CSR Clean Energy</option>
                    <option>Public Health &amp; Water</option>
                    <option>Education &amp; Digital Literacy</option>
                    <option>Sustainable Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    value={initiativeForm.budget}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Description / Goals</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe target goals and intended civic impact..."
                  value={initiativeForm.description}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInitiativeModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 cursor-pointer"
                >
                  Launch Initiative
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
