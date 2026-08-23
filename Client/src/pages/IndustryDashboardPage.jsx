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

  // Dynamic state
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

  const [opportunities, setOpportunities] = useState([
    {
      id: 'OPP-301',
      title: 'Smart Irrigation & Water Management Pilot',
      category: 'Agriculture & Water',
      priority: 'High Priority',
      priorityColor: 'bg-[#2F36ED]/10 text-[#2F36ED] border-[#2F36ED]/20',
      location: 'Northern District',
      budget: '₹15,00,00,000',
      description: 'Implementation of AI-driven IoT water management systems across northern agricultural districts to optimize crop yield and conserve groundwater.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXFmR9DRih1w52v1dj3WyZgtivDAyjWMhEGDhK5rts2vQbYltDdi6L0gsYM4V0mkL25uGSil3xxjteiB7YMREk2w4WPxZFO2MQHU-sOlELwg6zphE86R4PiHKofRqQtmoCi4WsRRPIZq4Xp4LDGFSyhLBAFU4hjcZN_mc_i3xNiUyMzrGeinPQ17aiamR9CUDz-bPprZ1qwwi8pkNaQ7q-rH7E2OTbXq7SzqHkssEJwGjDzA7f-gb0'
    },
    {
      id: 'OPP-304',
      title: 'Clean Drinking Water Access Infrastructure',
      category: 'Public Health',
      priority: 'Medium Priority',
      priorityColor: 'bg-[#F1F3F5] text-[#454556] border-[#DFE3E8]',
      location: 'Eastern Rural Belt',
      budget: '₹32,00,00,000',
      description: 'Development of robust water purification plants and rural distribution networks targeting underserved communities without basic access.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClV8wmJgvhazj78Rf9VeZOFAdBz0un09ZMid9JcsN6SIH4jd634-ORMWRbHoxC6qgCaEh8fgRGqjPoI6FQRnBtyKbt5jbXhxpQOq4de-kpOUCkIPpD3vj4wRJO3FGvnv-XtySmDowbVutz1ug8Dr-a7YH5S_TpnAKhCFyjjB9XitElpk327YLCSY3pVD-Gxnuk_9PiDfJxFvRxV57e9bF3dHvaLUYXpRcNCYtCXSlneD9HLsQ8ERPQ'
    },
    {
      id: 'OPP-312',
      title: 'Solar Powered Microgrid Grid Storage Extension',
      category: 'Renewable Energy',
      priority: 'High Priority',
      priorityColor: 'bg-[#2F36ED]/10 text-[#2F36ED] border-[#2F36ED]/20',
      location: 'Central Tribal Zone',
      budget: '₹22,50,00,000',
      description: 'Deploying lithium-ferro battery banks to support solar microgrids in 45 off-grid tribal hamlets.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq5aWwAezYxo9KlKGncZNz88VMvTlmCks9au7hKyb7_S5rYD50Juk42QkF_poA734gLKx3xkxrm5XG_53qTVEipcl2kCeRrv1CZXDXMKniuJBIveSLsAxHTFt0Ss3mKX1c_nqIcglbsDCUkHb01XE300iQxrQ6GfZiIAaFvh18LTsVW0OeEhAw5JAzBFUJrYwUjfNnZJO0BbkZixSjyr8zkV3EXF2HyOVaOJQ0RhpPgDxv3BL1wBL5'
    }
  ]);

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
    { id: 'challenges', label: 'Opportunities', icon: 'warning' },
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
                <button onClick={() => navigate('/dashboard')} className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F3F5] rounded-xl flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-base text-[#2F36ED]">admin_panel_settings</span>
                  Switch to Govt View
                </button>
                <button onClick={() => navigate('/university-dashboard')} className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F3F5] rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-emerald-600">school</span>
                  Switch to Univ View
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
                  onClick={() => setActiveView('industry')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Active Partnerships</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">handshake</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">142</h3>
                  <div className="flex items-center text-xs font-semibold text-[#F36F56]">
                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                    <span>+12% this quarter</span>
                  </div>
                </div>

                {/* KPI Card 2 */}
                <div 
                  onClick={() => setActiveView('projects')}
                  className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#2F36ED] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-[#454556] uppercase tracking-wider">Total Funds Deployed</p>
                    <span className="material-symbols-outlined text-[#2F36ED] text-[22px] group-hover:scale-110 transition-transform">payments</span>
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-2">₹4.2B</h3>
                  <div className="flex items-center text-xs font-semibold text-[#F36F56]">
                    <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                    <span>+8.4% this quarter</span>
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

          {/* OPPORTUNITIES VIEW */}
          {activeView === 'challenges' && (
            <div className="max-w-[1280px] mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">Civic Impact Opportunities</h1>
                  <p className="text-sm text-[#454556]">High-impact state challenges ready for corporate sponsorship and CSR funding</p>
                </div>
                <input
                  type="text"
                  placeholder="Filter opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-xs border border-[#DFE3E8] rounded-xl bg-white focus:outline-none focus:border-[#2F36ED]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="bg-white border border-[#DFE3E8] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F36ED] transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md">{opp.category}</span>
                        <span className="text-xs font-mono font-bold text-[#454556]">{opp.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#0F172A] mb-2">{opp.title}</h3>
                      <p className="text-xs text-[#454556] mb-4 leading-relaxed">{opp.description}</p>
                    </div>
                    <div className="border-t border-[#DFE3E8] pt-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#454556] block">Required Funding</span>
                        <span className="text-base font-bold text-emerald-600">{opp.budget}</span>
                      </div>
                      <button
                        onClick={() => setSelectedOpportunityModal(opp)}
                        className="bg-[#F36F56] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer shadow-2xs"
                      >
                        Pledge Funding
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Pledge Funding Modal */}
      {selectedOpportunityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#DFE3E8] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedOpportunityModal(null)}
              className="absolute top-4 right-4 text-[#454556] hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[#2F36ED] bg-[#2F36ED]/10 px-2.5 py-1 rounded-md">{selectedOpportunityModal.id}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">Est. {selectedOpportunityModal.budget}</span>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-2">{selectedOpportunityModal.title}</h3>
            <p className="text-xs text-[#454556] mb-6">{selectedOpportunityModal.description}</p>

            <form onSubmit={handlePledgeFunding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Corporate Entity</label>
                <input
                  type="text"
                  required
                  defaultValue="TechCorp CSR Foundation"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Pledged Amount (₹)</label>
                  <input
                    type="text"
                    required
                    defaultValue={selectedOpportunityModal.budget}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] mb-1">Target Completion</label>
                  <input
                    type="text"
                    defaultValue="Q4 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE3E8] text-xs focus:border-[#2F36ED] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunityModal(null)}
                  className="flex-1 py-2.5 border border-[#DFE3E8] rounded-xl text-xs font-semibold text-[#454556] hover:bg-[#F1F3F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F36F56] text-white rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 cursor-pointer"
                >
                  Confirm Funding Pledge
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
