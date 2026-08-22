import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UniversityDashboardPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedChallengeModal, setSelectedChallengeModal] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dynamic State Data
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    department: 'Computer Science',
    leadFaculty: '',
    membersCount: 4,
    targetProject: 'Smart Water Purification'
  });

  const [grantForm, setGrantForm] = useState({
    proposalTitle: '',
    grantType: 'Industry Hackathon (₹5L)',
    department: 'Computer Science',
    estimatedBudget: '500000',
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const [challenges, setChallenges] = useState([
    {
      id: 'CH-904',
      title: 'Smart Water Purification Monitoring',
      category: 'Civic Infrastructure',
      matchScore: '94%',
      department: 'Jal Jeevan Mission',
      description: 'Develop an IoT-based monitoring system for rural water filtration plants to predict maintenance needs and detect chemical imbalance.',
      tags: ['IoT', 'Data Science', 'Hardware'],
      budget: '₹4,50,000',
      deadline: 'Oct 30, 2026'
    },
    {
      id: 'CH-892',
      title: 'Smart Irrigation Control System',
      category: 'Agriculture',
      matchScore: '91%',
      department: 'Dept of Agriculture',
      description: 'Create a low-cost automated irrigation valve controlled via mobile SMS and soil moisture sensor for remote farming communities.',
      tags: ['Embedded Systems', 'Mobile App', 'Sensors'],
      budget: '₹3,00,000',
      deadline: 'Nov 15, 2026'
    },
    {
      id: 'CH-741',
      title: 'AI Traffic Congestion & Signal Optimizer',
      category: 'Smart Mobility',
      matchScore: '88%',
      department: 'Urban Transport Dept',
      description: 'Computer vision pipeline for real-time traffic signal optimization at busy urban intersections using existing CCTV feeds.',
      tags: ['Computer Vision', 'AI', 'Python'],
      budget: '₹6,00,000',
      deadline: 'Dec 05, 2026'
    },
    {
      id: 'CH-610',
      title: 'Solar Microgrid Remote Diagnostic Platform',
      category: 'Energy',
      matchScore: '85%',
      department: 'Renewable Energy Agency',
      description: 'Decentralized telemetric monitoring unit for village solar microgrids to prevent power outages.',
      tags: ['Solar', 'Telemetry', 'Power Systems'],
      budget: '₹5,50,000',
      deadline: 'Oct 28, 2026'
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 'PRJ-101',
      title: 'Accessible Transport Routing App',
      category: 'Smart Mobility',
      mentor: 'Prof. A. K. Sharma (CS)',
      students: '5 Students (B.Tech Year 4)',
      status: 'On Track',
      statusColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      progress: 65,
      progressColor: 'bg-[#2F36ED]',
      milestone: 'Beta testing with 200 wheelchair users'
    },
    {
      id: 'PRJ-108',
      title: 'Solar Micro-grid Optimization Algorithm',
      category: 'Energy',
      mentor: 'Dr. R. Patel (EE)',
      students: '3 Students (M.Tech Power Systems)',
      status: 'At Risk',
      statusColor: 'bg-[#F36F56]/10 text-[#F36F56] border-[#F36F56]/30',
      progress: 30,
      progressColor: 'bg-[#F36F56]',
      milestone: 'Hardware sensor calibration delayed'
    },
    {
      id: 'PRJ-122',
      title: 'Biodegradable Waste Composter Unit',
      category: 'Environment',
      mentor: 'Dr. S. Verma (Biotech)',
      students: '4 Students (Ph.D Scholars)',
      status: 'On Track',
      statusColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      progress: 85,
      progressColor: 'bg-emerald-500',
      milestone: 'Municipal pilot deployment in Ward 8'
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Research Grant Approved', time: '10m ago', text: '₹5,00,000 released for IoT Water Filtration prototype.' },
    { id: 2, title: 'New Challenge Assigned', time: '1h ago', text: 'Ministry of Jal Shakti matched CH-904 with your department.' },
    { id: 3, title: 'Milestone Review Reminder', time: '3h ago', text: 'Phase 1 Prototype Review due in 3 days for PRJ-101.' }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Challenges', icon: 'warning' },
    { id: 'projects', label: 'Projects', icon: 'assignment' },
    { id: 'institutions', label: 'Institutions', icon: 'account_balance' },
    { id: 'industry', label: 'Industry & Grants', icon: 'factory' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'reports', label: 'Reports', icon: 'description' }
  ];

  const secondaryNavItems = [
    { id: 'users', label: 'Users & Roles', icon: 'group' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const filteredChallenges = challenges.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    setIsTeamModalOpen(false);
    showToast(`Team '${teamForm.teamName}' registered successfully for ${teamForm.department}!`);
    setTeamForm({
      teamName: '',
      department: 'Computer Science',
      leadFaculty: '',
      membersCount: 4,
      targetProject: 'Smart Water Purification'
    });
  };

  const handleGrantSubmit = (e) => {
    e.preventDefault();
    setIsGrantModalOpen(false);
    showToast(`Grant proposal '${grantForm.proposalTitle}' submitted to ABC Industries Review Board!`);
    setGrantForm({
      proposalTitle: '',
      grantType: 'Industry Hackathon (₹5L)',
      department: 'Computer Science',
      estimatedBudget: '500000',
      description: ''
    });
  };

  const handleAssignProposal = (e) => {
    e.preventDefault();
    showToast(`Proposal for '${selectedChallengeModal.title}' submitted to ${selectedChallengeModal.department}!`);
    setSelectedChallengeModal(null);
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
              <span className="text-[10px] text-[#454556] font-medium block -mt-1">Sovereign Innovation Portal</span>
            </div>
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-[#2F36ED]/10 text-[#2F36ED] font-bold uppercase tracking-wider border border-[#2F36ED]/20">
            University Portal
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
            placeholder="Search challenges, projects, grants..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DFE3E8] bg-[#F1F3F5] focus:bg-white focus:border-[#2F36ED] focus:ring-2 focus:ring-[#2F36ED]/20 outline-none transition-all text-xs text-[#0F172A] placeholder-[#767588]"
          />
        </div>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
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
              <div className="w-8.5 h-8.5 rounded-full bg-[#2F36ED]/10 text-[#2F36ED] flex items-center justify-center font-bold text-xs border border-[#2F36ED]/20 shadow-2xs">
                IIT
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-[#0F172A]">IIT Innovation Lab</span>
                <span className="block text-[10px] text-[#454556] font-medium">Faculty Admin</span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-[#DFE3E8] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-[#DFE3E8]">
                  <p className="text-xs font-bold text-[#0F172A]">IIT Innovation Lab</p>
                  <p className="text-[10px] text-[#454556]">faculty@iit.ac.in</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F3F5] rounded-xl flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-base text-[#2F36ED]">admin_panel_settings</span>
                  Switch to Govt View
                </button>
                <button onClick={() => navigate('/login')} className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F3F5] rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#F36F56]">swap_horiz</span>
                  Switch Account
                </button>
                <button onClick={() => navigate('/')} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 border-t border-[#DFE3E8] mt-1 pt-2">
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
              Academic Hub
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
                  {item.label}
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
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[#454556] text-xs font-medium tracking-wide mb-2">
                    <span className="hover:text-[#2F36ED] cursor-pointer transition-colors">Workspace</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-[#0F172A] font-semibold">Overview</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">University Dashboard</h2>
                  <p className="text-sm text-[#454556] mt-1">
                    Discover civic challenges, manage student research teams, and create measurable real-world impact.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('challenges')}
                    className="px-5 py-2.5 rounded-xl border border-[#DFE3E8] bg-white text-[#0F172A] text-xs font-semibold hover:border-[#2F36ED] hover:text-[#2F36ED] transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                  >
                    Explore Challenges
                  </button>
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#F36F56] text-white text-xs font-bold hover:bg-[#d95d46] transition-all shadow-md shadow-[#F36F56]/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Create Student Team
                  </button>
                </div>
              </div>

              {/* 4 Primary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div 
                  onClick={() => setActiveView('challenges')}
                  className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F36ED]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-center gap-3 mb-4 text-[#2F36ED]">
                    <span className="material-symbols-outlined p-2 bg-[#2F36ED]/10 rounded-xl text-[20px]">warning</span>
                    <span className="text-xs font-bold tracking-wide">Assigned Challenges</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F172A] mb-1">126</div>
                  <div className="flex items-center gap-1.5 text-[#F36F56] text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+12 this month</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveView('projects')}
                  className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F36ED]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-center gap-3 mb-4 text-[#2F36ED]">
                    <span className="material-symbols-outlined p-2 bg-[#2F36ED]/10 rounded-xl text-[20px]">assignment</span>
                    <span className="text-xs font-bold tracking-wide">Active Projects</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F172A] mb-1">{projects.length}</div>
                  <div className="text-xs text-[#454556] font-medium">Across 8 academic departments</div>
                </div>

                <div 
                  onClick={() => setActiveView('users')}
                  className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F36ED]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-center gap-3 mb-4 text-[#2F36ED]">
                    <span className="material-symbols-outlined p-2 bg-[#2F36ED]/10 rounded-xl text-[20px]">groups</span>
                    <span className="text-xs font-bold tracking-wide">Students Participating</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F172A] mb-1">182</div>
                  <div className="flex items-center gap-1 text-xs text-[#454556] font-medium">
                    <span className="material-symbols-outlined text-sm text-[#2F36ED]">school</span>
                    <span>42 Faculty Mentors</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveView('analytics')}
                  className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs hover:shadow-md hover:border-[#F36F56] transition-all relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#F36F56]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-center gap-3 mb-4 text-[#F36F56]">
                    <span className="material-symbols-outlined p-2 bg-[#F36F56]/10 rounded-xl text-[20px]">check_circle</span>
                    <span className="text-xs font-bold tracking-wide">Solutions Completed</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F172A] mb-1">17</div>
                  <div className="text-xs text-emerald-600 font-semibold">Impacting 5,000+ citizens</div>
                </div>
              </div>

              {/* Main Dashboard Layout (2 Columns) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Recommended Challenges */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0F172A]">Recommended Challenges for University Matching</h3>
                      <button
                        onClick={() => setActiveView('challenges')}
                        className="text-[#2F36ED] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredChallenges.slice(0, 2).map((ch) => (
                        <div
                          key={ch.id}
                          className="bg-white rounded-2xl border border-[#DFE3E8] p-6 shadow-xs hover:shadow-md transition-all hover:border-[#2F36ED] cursor-pointer group flex flex-col h-full justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="bg-[#2F36ED]/10 text-[#2F36ED] px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border border-[#2F36ED]/20">
                                {ch.category}
                              </span>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-[#2F36ED] leading-none">{ch.matchScore}</span>
                                <span className="block text-[10px] text-[#454556] font-bold uppercase">AI Match</span>
                              </div>
                            </div>
                            <h4 className="text-base font-bold text-[#0F172A] mb-2 group-hover:text-[#2F36ED] transition-colors">
                              {ch.title}
                            </h4>
                            <p className="text-xs text-[#454556] leading-relaxed mb-4 line-clamp-2">
                              {ch.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {ch.tags.map((tag, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-[#F1F3F5] text-[#454556] rounded-md text-[11px] font-medium border border-[#DFE3E8]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#DFE3E8] pt-4 mt-auto">
                            <div className="flex items-center gap-2 text-[#454556] text-xs font-medium">
                              <span className="material-symbols-outlined text-base">domain</span>
                              <span>{ch.department}</span>
                            </div>
                            <button
                              onClick={() => setSelectedChallengeModal(ch)}
                              className="text-[#F36F56] text-xs font-bold hover:underline uppercase tracking-wide cursor-pointer"
                            >
                              Assign Team
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Active Projects List */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0F172A]">Active Departmental Projects</h3>
                      <button 
                        onClick={() => setActiveView('projects')}
                        className="text-xs text-[#2F36ED] font-bold hover:underline cursor-pointer"
                      >
                        Manage Projects Directory &rarr;
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#DFE3E8] shadow-xs overflow-hidden divide-y divide-[#DFE3E8]">
                      {projects.map((prj) => (
                        <div key={prj.id} className="p-5 hover:bg-[#F1F3F5]/60 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-[#0F172A]">{prj.title}</h4>
                                <span className="text-[11px] font-mono text-[#454556]">{prj.id}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[#454556] text-xs font-medium">
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm">school</span> {prj.mentor}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm">group</span> {prj.students}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${prj.statusColor}`}>
                                {prj.status}
                              </span>
                              <button 
                                onClick={() => setSelectedProjectDetail(prj)}
                                className="p-1 text-[#454556] hover:text-[#2F36ED] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[20px]">info</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 bg-[#F1F3F5] h-2.5 rounded-full overflow-hidden border border-[#DFE3E8]">
                              <div className={`${prj.progressColor} h-full rounded-full`} style={{ width: `${prj.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-[#454556] font-bold min-w-[32px]">{prj.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Upcoming Milestone Card */}
                  <section>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-4">Upcoming Work</h3>
                    <div className="relative bg-[#2F36ED] rounded-2xl p-6 shadow-xl text-white overflow-hidden border border-[#2F36ED]/20">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wide mb-3">
                          <span className="material-symbols-outlined text-base">event</span>
                          <span>Milestone Deadline</span>
                        </div>
                        <h4 className="text-xl font-bold mb-1 leading-tight">Phase 1 Prototype Review</h4>
                        <p className="text-xs text-white/90 mb-6">Smart Water Purification Project</p>
                        
                        <div className="flex items-end justify-between border-t border-white/20 pt-4">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#2F36ED] flex items-center justify-center font-bold text-xs">
                              S1
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#2F36ED] flex items-center justify-center font-bold text-xs">
                              S2
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-[#2F36ED] flex items-center justify-center font-bold text-xs">
                              +2
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold leading-none mb-1">3 Days</div>
                            <div className="text-[11px] text-white/80 font-medium">Oct 15, 2026</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Industry Grants */}
                  <section>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-4">Industry Grants &amp; Hackathons</h3>
                    <div className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs hover:border-[#2F36ED] transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-11 h-11 bg-[#2F36ED]/10 rounded-xl flex items-center justify-center text-[#2F36ED] shrink-0 border border-[#2F36ED]/20">
                          <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] leading-snug">ABC Industries Hackathon</h4>
                          <p className="text-xs text-[#454556] mt-1 leading-relaxed">
                            Seeking university teams to build predictive maintenance models for manufacturing lines.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-[#2F36ED]/10 text-[#2F36ED] rounded-md text-xs font-semibold border border-[#2F36ED]/20">
                          ₹5,00,000 Grant
                        </span>
                        <span className="px-2.5 py-1 bg-[#F1F3F5] text-[#454556] rounded-md text-xs font-medium border border-[#DFE3E8]">
                          Hardware Provided
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsGrantModalOpen(true)}
                        className="w-full py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-bold text-[#0F172A] hover:border-[#2F36ED] hover:text-[#2F36ED] transition-colors cursor-pointer"
                      >
                        Apply for Grant Proposal
                      </button>
                    </div>
                  </section>

                  {/* Recent Activity Timeline */}
                  <section>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-4">Recent Research Activity</h3>
                    <div className="bg-white rounded-2xl border border-[#DFE3E8] p-5 shadow-xs space-y-4">
                      <div className="relative border-l-2 border-[#2F36ED] pl-4 pb-2">
                        <div className="absolute w-2.5 h-2.5 bg-[#2F36ED] rounded-full -left-[6px] top-1.5"></div>
                        <p className="text-xs font-bold text-[#0F172A]">Team 'Innovators' submitted report</p>
                        <p className="text-[11px] text-[#454556] mt-0.5">Accessible Transport Routing &bull; 2 hrs ago</p>
                      </div>
                      <div className="relative border-l-2 border-[#DFE3E8] pl-4 pb-2">
                        <div className="absolute w-2.5 h-2.5 bg-[#DFE3E8] rounded-full -left-[6px] top-1.5"></div>
                        <p className="text-xs font-bold text-[#0F172A]">New Challenge Assigned by Ministry</p>
                        <p className="text-[11px] text-[#454556] mt-0.5">Dept of Health &bull; 5 hrs ago</p>
                      </div>
                      <div className="relative border-l-2 border-[#DFE3E8] pl-4">
                        <div className="absolute w-2.5 h-2.5 bg-[#DFE3E8] rounded-full -left-[6px] top-1.5"></div>
                        <p className="text-xs font-bold text-[#0F172A]">Prof. Sharma approved milestone 2</p>
                        <p className="text-[11px] text-[#454556] mt-0.5">Smart Irrigation Control &bull; 1 day ago</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES VIEW */}
          {activeView === 'challenges' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Civic Challenges Directory</h1>
                  <p className="text-sm text-[#454556]">Match government issues with university student labs &amp; faculty mentors</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Civic Infrastructure', 'Agriculture', 'Smart Mobility', 'Energy'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        categoryFilter === cat ? 'bg-[#2F36ED] text-white shadow-xs' : 'bg-white border border-[#DFE3E8] text-[#454556] hover:border-[#2F36ED]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#DFE3E8] shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F3F5] border-b border-[#DFE3E8]">
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">ID</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Challenge Title</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Category</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Government Dept</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Grant Budget</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">AI Match</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE3E8]">
                    {filteredChallenges.map((ch) => (
                      <tr key={ch.id} className="hover:bg-[#F1F3F5]/60 transition-colors">
                        <td className="p-4 text-xs font-mono font-bold text-[#454556]">{ch.id}</td>
                        <td className="p-4 text-xs font-bold text-[#0F172A]">{ch.title}</td>
                        <td className="p-4">
                          <span className="bg-[#F1F3F5] border border-[#DFE3E8] px-2.5 py-1 rounded-md text-xs font-medium">
                            {ch.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#454556]">{ch.department}</td>
                        <td className="p-4 text-xs font-bold text-emerald-600">{ch.budget}</td>
                        <td className="p-4 text-xs font-bold text-[#2F36ED]">{ch.matchScore}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedChallengeModal(ch)}
                            className="bg-[#F36F56] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer shadow-2xs"
                          >
                            Assign Team
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROJECTS VIEW */}
          {activeView === 'projects' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Innovation Projects Pipeline</h1>
                  <p className="text-sm text-[#454556]">Track university research projects from prototype to civic deployment</p>
                </div>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 cursor-pointer shadow-xs"
                >
                  + Add Project Team
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((prj) => (
                  <div key={prj.id} className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${prj.statusColor}`}>
                          {prj.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#454556]">{prj.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mb-2">{prj.title}</h3>
                      <p className="text-xs text-[#454556] mb-4">Mentor: <span className="font-semibold text-[#0F172A]">{prj.mentor}</span></p>
                      
                      <div className="bg-[#F1F3F5] p-3 rounded-xl space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#454556] font-medium">Team Size:</span>
                          <span className="font-bold text-[#0F172A]">{prj.students}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#454556] font-medium">Milestone Goal:</span>
                          <span className="font-bold text-[#2F36ED] text-[11px]">{prj.milestone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1 bg-[#F1F3F5] h-2 rounded-full overflow-hidden border border-[#DFE3E8]">
                          <div className={`${prj.progressColor} h-full rounded-full`} style={{ width: `${prj.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">{prj.progress}%</span>
                      </div>
                      <button 
                        onClick={() => setSelectedProjectDetail(prj)}
                        className="w-full py-2 border border-[#DFE3E8] rounded-xl text-xs font-bold text-[#2F36ED] hover:bg-[#2F36ED]/5 transition-colors cursor-pointer"
                      >
                        View Full Details &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSTITUTIONS VIEW */}
          {activeView === 'institutions' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#0F172A]">Partner Institutions &amp; Government Agencies</h1>
              <p className="text-sm text-[#454556]">Active inter-institutional research agreements and municipal partnerships</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Jal Jeevan Mission', type: 'Government Agency', projects: 12, funding: '₹45,00,000' },
                  { name: 'Dept of Agriculture', type: 'State Department', projects: 8, funding: '₹28,00,000' },
                  { name: 'Urban Transport Authority', type: 'Municipal Board', projects: 15, funding: '₹62,00,000' }
                ].map((inst, i) => (
                  <div key={i} className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-[#2F36ED]/10 text-[#2F36ED] flex items-center justify-center font-bold mb-3">
                      <span className="material-symbols-outlined">domain</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-1">{inst.name}</h3>
                    <p className="text-xs text-[#454556] mb-4">{inst.type}</p>
                    <div className="border-t border-[#DFE3E8] pt-3 flex justify-between text-xs">
                      <span>Active Projects: <strong className="text-[#0F172A]">{inst.projects}</strong></span>
                      <span>Grant Pool: <strong className="text-emerald-600">{inst.funding}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INDUSTRY VIEW */}
          {activeView === 'industry' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Industry Hackathons &amp; Corporate Sponsorships</h1>
                  <p className="text-sm text-[#454556]">Apply for corporate research grants and technology transfer deals</p>
                </div>
                <button
                  onClick={() => setIsGrantModalOpen(true)}
                  className="bg-[#F36F56] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 cursor-pointer shadow-xs"
                >
                  Submit Grant Application
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { company: 'ABC Manufacturing Labs', title: 'Predictive Equipment Maintenance Challenge', grant: '₹5,00,000', deadline: 'Nov 12, 2026' },
                  { company: 'Tata Cleantech Grant', title: 'Decentralized Solar Storage Pilot', grant: '₹8,50,000', deadline: 'Dec 01, 2026' }
                ].map((ind, i) => (
                  <div key={i} className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md">{ind.company}</span>
                      <h3 className="text-lg font-bold text-[#0F172A] mt-3 mb-2">{ind.title}</h3>
                      <p className="text-xs text-[#454556] mb-4">Hardware access &amp; Cloud credits included with sponsorship.</p>
                    </div>
                    <div className="border-t border-[#DFE3E8] pt-4 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-[#454556] block">Grant Amount</span>
                        <span className="text-base font-bold text-emerald-600">{ind.grant}</span>
                      </div>
                      <button
                        onClick={() => setIsGrantModalOpen(true)}
                        className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {activeView === 'analytics' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#0F172A]">Research Output &amp; Impact Analytics</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#DFE3E8] text-center shadow-xs">
                  <div className="text-3xl font-bold text-[#2F36ED] mb-1">87.4%</div>
                  <div className="text-xs text-[#454556] uppercase font-bold">Proposal Match Success Rate</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#DFE3E8] text-center shadow-xs">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">₹1.35 Cr</div>
                  <div className="text-xs text-[#454556] uppercase font-bold">Total Research Grants Disbursed</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#DFE3E8] text-center shadow-xs">
                  <div className="text-3xl font-bold text-[#F36F56] mb-1">17 Solutions</div>
                  <div className="text-xs text-[#454556] uppercase font-bold">Deployed in Sovereign Districts</div>
                </div>
              </div>
            </div>
          )}

          {/* REPORTS VIEW */}
          {activeView === 'reports' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#0F172A]">Institutional Compliance &amp; Impact Reports</h1>
                <button onClick={() => showToast('Quarterly Compliance Report generated & downloaded!')} className="bg-[#2F36ED] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                  Download Q3 Audit PDF
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#DFE3E8] space-y-3">
                <div className="flex justify-between items-center border-b border-[#DFE3E8] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Jal Shakti Ministry Annual Impact Audit</h4>
                    <span className="text-xs text-[#454556]">Generated on Oct 10, 2026</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Smart Cities Mission Milestone Completion Report</h4>
                    <span className="text-xs text-[#454556]">Generated on Oct 02, 2026</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* USERS & ROLES VIEW */}
          {activeView === 'users' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#0F172A]">Faculty Mentors &amp; Student Researchers</h1>
              <div className="bg-white rounded-2xl border border-[#DFE3E8] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F3F5] border-b border-[#DFE3E8]">
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Name</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Role</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Department</th>
                      <th className="p-4 text-xs font-semibold text-[#454556] uppercase">Assigned Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE3E8]">
                    <tr>
                      <td className="p-4 text-xs font-bold text-[#0F172A]">Prof. A. K. Sharma</td>
                      <td className="p-4 text-xs text-[#2F36ED] font-bold">Faculty Mentor</td>
                      <td className="p-4 text-xs">Computer Science</td>
                      <td className="p-4 text-xs font-bold">PRJ-101</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-xs font-bold text-[#0F172A]">Dr. R. Patel</td>
                      <td className="p-4 text-xs text-[#2F36ED] font-bold">Faculty Mentor</td>
                      <td className="p-4 text-xs">Electrical Engineering</td>
                      <td className="p-4 text-xs font-bold">PRJ-108</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === 'settings' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <h1 className="text-2xl font-bold text-[#0F172A]">University System Settings</h1>
              <div className="bg-white p-6 rounded-2xl border border-[#DFE3E8] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#0F172A]">Automated AI Match Threshold</h4>
                    <p className="text-xs text-[#454556]">Minimum match score to automatically notify department heads</p>
                  </div>
                  <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-3 py-1 rounded-lg">80%</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Team Proposal Modal */}
      {selectedChallengeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedChallengeModal(null)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md">{selectedChallengeModal.id}</span>
              <span className="text-xs font-semibold text-[#F36F56] bg-[#F36F56]/10 px-2.5 py-1 rounded-md">{selectedChallengeModal.matchScore} AI Match</span>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-2">{selectedChallengeModal.title}</h3>
            <p className="text-xs text-[#454556] mb-6">{selectedChallengeModal.description}</p>

            <form onSubmit={handleAssignProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Lead Faculty Mentor</label>
                <input
                  type="text"
                  required
                  defaultValue="Prof. A. K. Sharma (CS Dept)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Student Team Name</label>
                  <input
                    type="text"
                    required
                    defaultValue="AquaTech Innovators"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Students Count</label>
                  <input
                    type="number"
                    defaultValue={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeModal(null)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 cursor-pointer"
                >
                  Submit Research Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">Register New Student Research Team</h3>
            <p className="text-xs text-[#454556] mb-6">Create a student team for civic challenge matching and grant applications</p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., EcoSensors Lab"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Department</label>
                  <select
                    value={teamForm.department}
                    onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs bg-white focus:border-[#2F36ED] outline-none"
                  >
                    <option>Computer Science</option>
                    <option>Electrical Engineering</option>
                    <option>Biotechnology</option>
                    <option>Civil &amp; Environmental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Faculty Mentor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Patel"
                    value={teamForm.leadFaculty}
                    onChange={(e) => setTeamForm({ ...teamForm, leadFaculty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2F36ED] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 cursor-pointer"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Application Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsGrantModalOpen(false)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">Industry Research Grant Proposal</h3>
            <p className="text-xs text-[#454556] mb-6">Submit proposal for corporate sponsorships &amp; hardware grants</p>

            <form onSubmit={handleGrantSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Predictive Maintenance Models for Heavy Machinery"
                  value={grantForm.proposalTitle}
                  onChange={(e) => setGrantForm({ ...grantForm, proposalTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Grant Track</label>
                  <select
                    value={grantForm.grantType}
                    onChange={(e) => setGrantForm({ ...grantForm, grantType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs bg-white focus:border-[#2F36ED] outline-none"
                  >
                    <option>Industry Hackathon (₹5L)</option>
                    <option>CleanTech Sponsorship (₹8.5L)</option>
                    <option>AI Infrastructure Grant (₹10L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Budget Request (₹)</label>
                  <input
                    type="number"
                    value={grantForm.estimatedBudget}
                    onChange={(e) => setGrantForm({ ...grantForm, estimatedBudget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Abstract / Methodology</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Briefly describe your research methodology and expected impact..."
                  value={grantForm.description}
                  onChange={(e) => setGrantForm({ ...grantForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 cursor-pointer"
                >
                  Submit Grant Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail Info Modal */}
      {selectedProjectDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedProjectDetail(null)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md">{selectedProjectDetail.id}</span>
              <span className={`text-xs font-semibold border px-2.5 py-1 rounded-md ${selectedProjectDetail.statusColor}`}>{selectedProjectDetail.status}</span>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-2">{selectedProjectDetail.title}</h3>
            <p className="text-xs text-[#454556] mb-4">Mentor: <strong className="text-[#0F172A]">{selectedProjectDetail.mentor}</strong></p>

            <div className="bg-[#F1F3F5] p-4 rounded-xl space-y-2 text-xs mb-6 border border-[#DFE3E8]">
              <div className="flex justify-between">
                <span className="text-[#454556] font-medium">Students:</span>
                <span className="font-bold text-[#0F172A]">{selectedProjectDetail.students}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#454556] font-medium">Milestone Goal:</span>
                <span className="font-bold text-[#2F36ED]">{selectedProjectDetail.milestone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#454556] font-medium">Current Progress:</span>
                <span className="font-bold text-emerald-600">{selectedProjectDetail.progress}%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProjectDetail(null)}
                className="w-full py-2.5 bg-[#2F36ED] text-white rounded-xl text-xs font-bold hover:bg-opacity-90 cursor-pointer"
              >
                Close Project Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityDashboardPage;
