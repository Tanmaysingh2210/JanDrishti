import React, { useState } from 'react';

function GovtDashboard({ onBackToLanding }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [heatmapMode, setHeatmapMode] = useState('volume');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const challengesList = [
    {
      id: '#C-8892',
      title: 'Potable Water Contamination in East Zone',
      domain: 'Public Health',
      location: 'East Zone, Ward 14',
      status: 'Attention Needed',
      statusType: 'warning',
      reported: '2h ago',
      description: 'Multiple reports of high TDS levels and chemical odor in drinking water supply across Ward 14.'
    },
    {
      id: '#C-8891',
      title: 'Urban Flooding & Drainage Blockage',
      domain: 'Infrastructure',
      location: 'Central, Sector 8',
      status: 'In Review',
      statusType: 'primary',
      reported: '5h ago',
      description: 'Stormwater drains blocked by construction debris causing waterlogging during peak monsoon.'
    },
    {
      id: '#C-8890',
      title: 'Street Light Outages in Sector 12',
      domain: 'Utilities',
      location: 'Sector 12 Main Road',
      status: 'Resolved',
      statusType: 'success',
      reported: '1d ago',
      description: '35 streetlights repaired and connected to central automated grid.'
    },
    {
      id: '#C-8889',
      title: 'Illegal Dumping Site Near Riverbank',
      domain: 'Environment',
      location: 'North District, Yamuna Bank',
      status: 'Critical',
      statusType: 'danger',
      reported: '3h ago',
      description: 'Industrial waste dumping observed during nighttime hours. Immediate site inspection required.'
    }
  ];

  const projectsList = [
    {
      id: 'PRJ-402',
      title: 'Smart Traffic Light Pilot',
      domain: 'Infrastructure',
      phase: 'Prototype',
      desc: 'AI-driven traffic light optimization using camera feeds to reduce congestion in Central Zone.',
      team: ['IT', 'RT', 'GO']
    },
    {
      id: 'PRJ-398',
      title: 'Digital Civic Grievance App',
      domain: 'Governance',
      phase: 'Deployed',
      desc: 'Mobile application for citizens to directly report local issues with automated geotagging.',
      team: ['ND', 'KA']
    },
    {
      id: 'PRJ-415',
      title: 'Solar Microgrid for Rural Schools',
      domain: 'Energy',
      phase: 'Development',
      desc: 'Decentralized solar power setup with battery storage for 12 primary schools in North District.',
      team: ['EE', 'RE']
    }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'challenges', label: 'Challenges', icon: 'warning' },
    { id: 'projects', label: 'Projects', icon: 'assignment' },
    { id: 'institutions', label: 'Institutions', icon: 'account_balance' },
    { id: 'industry', label: 'Industry', icon: 'factory' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
    { id: 'reports', label: 'Reports', icon: 'description' }
  ];

  const secondaryNavItems = [
    { id: 'users', label: 'Users & Roles', icon: 'group' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  const filteredChallenges = challengesList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface text-on-surface flex flex-col h-screen overflow-hidden font-body-md">
      {/* Notification Toast */}
      {showNotificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-sovereign-navy text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-primary/30 animate-fade-in">
          <span className="material-symbols-outlined text-action-orange">notifications_active</span>
          <div>
            <div className="text-xs font-bold">New SLA Escalation Alert</div>
            <div className="text-caption text-surface-variant">Sector 42 Water Supply report assigned to Jal Nigam.</div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-margin-desktop h-16 shadow-sm">
        <div className="flex items-center gap-3 w-1/3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <span className="material-symbols-outlined text-secondary text-2xl">visibility</span>
            <span className="font-headline-md text-xl font-bold text-secondary tracking-tight">JanDrishti</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold uppercase tracking-wider">
            Command Center
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges, projects, users..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center justify-end gap-5 w-1/3">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <button
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              className="hover:bg-surface-container-low p-2 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full animate-ping"></span>
            </button>
            <button
              onClick={onBackToLanding}
              className="hover:bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Exit Portal
            </button>
          </div>

          <div className="flex items-center gap-3 border-l border-outline-variant pl-5">
            <div className="flex flex-col items-end">
              <span className="text-xs text-on-surface font-bold">District Officer</span>
              <span className="text-[10px] uppercase font-semibold text-primary">Admin Access</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shadow-md">
              DO
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Side Navigation Bar */}
        <nav className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between py-6 px-4 shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Main Operations
            </div>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
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

          <div className="flex flex-col gap-1 border-t border-outline-variant pt-4">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
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
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
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

        {/* Main Content View */}
        <main className="flex-1 p-8 overflow-y-auto bg-surface-container-low">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="space-y-8 max-w-container-max mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-sovereign-navy">Command Center Overview</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Real-time monitoring of civic challenges, research pipelines, and local deployments.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveView('challenges')}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-opacity-90 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Log New Challenge
                </button>
              </div>

              {/* 4 Key Performance Indicator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Reported</span>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-xl">campaign</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sovereign-navy">1,492</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-green flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    +12% from last month
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Verified Challenges</span>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-xl">fact_check</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sovereign-navy">843</div>
                  <div className="mt-2 text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-action-orange"></span>
                    Awaiting institutional assignment
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Active Projects</span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">rocket_launch</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sovereign-navy">156</div>
                  <div className="mt-2 text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    In development &amp; pilot phase
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Deployed Solutions</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-green/10 flex items-center justify-center text-emerald-green">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-sovereign-navy">42</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-green flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Impacting 1.2M citizens
                  </div>
                </div>
              </div>

              {/* Bento Grid: Map Heatmap & Urgent Attention */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* District Heatmap Card */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs flex flex-col h-[480px]">
                  <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-sovereign-navy">District Spatial Heatmap</h2>
                      <p className="text-xs text-on-surface-variant">Geographic concentration of reported challenges across 85 districts</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHeatmapMode('volume')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          heatmapMode === 'volume' ? 'bg-primary text-white' : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        Volume
                      </button>
                      <button
                        onClick={() => setHeatmapMode('severity')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          heatmapMode === 'severity' ? 'bg-action-orange text-white' : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        Severity
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-surface-container-low relative rounded-b-2xl overflow-hidden flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-85 mix-blend-multiply"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDq5aWwAezYxo9KlKGncZNz88VMvTlmCks9au7hKyb7_S5rYD50Juk42QkF_poA734gLKx3xkxrm5XG_53qTVEipcl2kCeRrv1CZXDXMKniuJBIveSLsAxHTFt0Ss3mKX1c_nqIcglbsDCUkHb01XE300iQxrQ6GfZiIAaFvh18LTsVW0OeEhAw5JAzBFUJrYwUjfNnZJO0BbkZixSjyr8zkV3EXF2HyOVaOJQ0RhpPgDxv3BL1wBL5')`
                      }}
                    ></div>
                    
                    {/* Floating Overlay Badge */}
                    <div className="absolute bottom-5 right-5 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-lg backdrop-blur-md">
                      <div className="text-xs font-bold text-sovereign-navy mb-2">High Density Zones</div>
                      <div className="space-y-1.5 text-xs text-on-surface-variant">
                        <div className="flex items-center justify-between gap-6">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-action-orange"></span> North District
                          </span>
                          <span className="font-bold text-sovereign-navy">320 issues</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Central Zone
                          </span>
                          <span className="font-bold text-sovereign-navy">215 issues</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Needs Attention Panel */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs flex flex-col h-[480px]">
                  <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                    <h2 className="text-lg font-bold text-sovereign-navy flex items-center gap-2">
                      <span className="material-symbols-outlined text-action-orange">warning</span>
                      Needs Urgent Attention
                    </h2>
                    <span className="text-xs font-bold text-action-orange px-2 py-0.5 rounded bg-action-orange/10">3 Escalations</span>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    <div 
                      onClick={() => setSelectedChallenge(challengesList[0])}
                      className="p-4 rounded-xl border border-action-orange/30 bg-action-orange/5 flex flex-col gap-2 hover:border-action-orange transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="bg-action-orange text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                          Critical SLA
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">2h ago</span>
                      </div>
                      <h3 className="text-xs font-bold text-sovereign-navy">Water Supply Contamination</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2">
                        Multiple reports of high TDS levels and chemical odor in drinking water across Ward 14.
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedChallenge(challengesList[1])}
                      className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col gap-2 hover:border-primary transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                          Stalled Project
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">1d ago</span>
                      </div>
                      <h3 className="text-xs font-bold text-sovereign-navy">Smart Traffic Light Pilot</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2">
                        University research team awaiting dataset access approval from Regional Transport Office.
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedChallenge(challengesList[3])}
                      className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col gap-2 hover:border-primary transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                          Environmental Threat
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">3h ago</span>
                      </div>
                      <h3 className="text-xs font-bold text-sovereign-navy">Illegal Dump Site Inspection</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2">
                        Nighttime chemical dumping reported near riverbank. Needs immediate municipal audit.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-outline-variant text-center bg-surface-container-lowest rounded-b-2xl">
                    <button 
                      onClick={() => setActiveView('challenges')}
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      View All Alerts &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                  <h2 className="text-lg font-bold text-sovereign-navy">Recent Challenge Submissions</h2>
                  <button 
                    onClick={() => setActiveView('challenges')}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    View Directory &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID</th>
                        <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Challenge Title</th>
                        <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Domain</th>
                        <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                      {filteredChallenges.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="p-4 text-xs font-bold text-on-surface-variant">{item.id}</td>
                          <td className="p-4 text-xs font-semibold text-sovereign-navy">{item.title}</td>
                          <td className="p-4">
                            <span className="bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded-md text-xs font-medium text-on-surface-variant">
                              {item.domain}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              item.statusType === 'danger' ? 'text-error' :
                              item.statusType === 'warning' ? 'text-action-orange' :
                              item.statusType === 'success' ? 'text-emerald-green' : 'text-primary'
                            }`}>
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedChallenge(item)}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              Open Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Challenges Directory View */}
          {activeView === 'challenges' && (
            <div className="space-y-6 max-w-container-max mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-sovereign-navy">Challenge Directory</h1>
                  <p className="text-sm text-on-surface-variant">Filter, triage, and assign citizen reported challenges</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Filter challenges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-xs border border-outline-variant rounded-xl bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ID</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Title</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Domain</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Location</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredChallenges.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-4 text-xs font-bold text-on-surface-variant">{item.id}</td>
                        <td className="p-4 text-xs font-semibold text-sovereign-navy">{item.title}</td>
                        <td className="p-4">
                          <span className="bg-surface-container-low border border-outline-variant px-2 py-0.5 rounded text-xs font-medium">
                            {item.domain}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-on-surface-variant">{item.location}</td>
                        <td className="p-4 text-xs font-semibold text-primary">{item.status}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedChallenge(item)}
                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeView === 'projects' && (
            <div className="space-y-6 max-w-container-max mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-sovereign-navy">Innovation Projects Pipeline</h1>
                <p className="text-sm text-on-surface-variant">Track government-funded university &amp; industry projects</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projectsList.map((prj) => (
                  <div key={prj.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-primary transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                          {prj.phase}
                        </span>
                        <span className="text-xs font-mono text-on-surface-variant">{prj.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-sovereign-navy mb-2">{prj.title}</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{prj.desc}</p>
                    </div>
                    <div className="border-t border-outline-variant pt-3 flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {prj.team.map((t, idx) => (
                          <div key={idx} className="w-7 h-7 rounded-full bg-surface-container-highest border-2 border-white flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                            {t}
                          </div>
                        ))}
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
                        View Progress &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Modules Placeholder */}
          {['institutions', 'industry', 'analytics', 'reports', 'users', 'settings'].includes(activeView) && (
            <div className="space-y-6 max-w-container-max mx-auto">
              <h1 className="text-2xl font-bold text-sovereign-navy capitalize">{activeView} Management</h1>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant shadow-xs">
                <span className="material-symbols-outlined text-5xl text-primary mb-3">verified_user</span>
                <h3 className="text-lg font-bold text-sovereign-navy mb-1">
                  Active Sovereign {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module
                </h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Authorized access granted for District Officer. System synchronized with central database.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-surface-variant relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-sovereign-navy cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">{selectedChallenge.id}</span>
              <span className="text-xs font-semibold text-on-surface-variant">{selectedChallenge.domain}</span>
            </div>
            <h3 className="text-xl font-bold text-sovereign-navy mb-2">{selectedChallenge.title}</h3>
            <p className="text-xs text-on-surface-variant mb-6">{selectedChallenge.description}</p>
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Location:</span>
                <span className="font-bold text-sovereign-navy">{selectedChallenge.location}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Status:</span>
                <span className="font-bold text-action-orange">{selectedChallenge.status}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Reported:</span>
                <span className="font-bold text-sovereign-navy">{selectedChallenge.reported}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Close
              </button>
              <button
                onClick={() => { setSelectedChallenge(null); setShowNotificationToast(true); }}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-opacity-90"
              >
                Assign to University
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovtDashboard;
