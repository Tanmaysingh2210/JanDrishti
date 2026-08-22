import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CitizenHomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // New Issue Form State
  const [newIssue, setNewIssue] = useState({
    title: '',
    category: 'Pothole & Roads',
    description: '',
    district: 'Ranchi',
    address: '',
  });

  useEffect(() => {
    // Check logged in user session
    const storedUser = localStorage.getItem('jandrishti_user_info');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setUser({ fullName: 'Aarav Sharma', role: 'citizen' });
      }
    } else {
      setUser({ fullName: 'Aarav Sharma', role: 'citizen' });
    }

    // Fetch citizen issues
    fetchCitizenIssues();
  }, []);

  const fetchCitizenIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await fetch('http://localhost:3000/api/citizen/issues', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.issues) {
        setIssues(data.issues);
      } else {
        // Mock fallback issues for demo
        setIssues(mockIssues);
      }
    } catch (err) {
      setIssues(mockIssues);
    } finally {
      setLoadingIssues(false);
    }
  };

  const mockIssues = [
    {
      id: 'ISS-101',
      title: 'Deep Potholes on Main Road',
      category: 'Roads & Infrastructure',
      status: 'In Progress',
      date: '22 Aug 2026',
      location: 'Namkum, Ranchi',
      upvotes: 42,
    },
    {
      id: 'ISS-102',
      title: 'Streetlights Not Working in Sector 4',
      category: 'Electrical & Lighting',
      status: 'Under Review',
      date: '20 Aug 2026',
      location: 'Doranda, Ranchi',
      upvotes: 19,
    },
    {
      id: 'ISS-103',
      title: 'Water Pipe Leakage near Community Center',
      category: 'Water & Sanitation',
      status: 'Resolved',
      date: '18 Aug 2026',
      location: 'Kanke Road, Ranchi',
      upvotes: 65,
    },
  ];

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!newIssue.title || !newIssue.description) return;

    try {
      const res = await fetch('http://localhost:3000/api/citizen/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newIssue),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowReportModal(false);
        fetchCitizenIssues();
      } else {
        // Fallback mock addition
        setIssues([
          {
            id: `ISS-${Math.floor(100 + Math.random() * 900)}`,
            title: newIssue.title,
            category: newIssue.category,
            status: 'Under Review',
            date: 'Today',
            location: `${newIssue.district}, Jharkhand`,
            upvotes: 1,
          },
          ...issues,
        ]);
        setShowReportModal(false);
      }
    } catch (err) {
      setShowReportModal(false);
    }
  };

  return (
    <div className="bg-[#f1f3f5] text-[#191c1e] font-sans antialiased flex h-screen overflow-hidden">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 bg-white h-full flex flex-col border-r border-[#e0e3e5] shrink-0 hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[#e0e3e5]">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f36f56] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility
            </span>
            <span className="text-xl font-extrabold text-[#f36f56] tracking-tight">JanDrishti</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${activeTab === 'home' || activeTab === 'all' ? 'bg-[#ffdad3] text-[#a83824]' : 'text-[#58423d] hover:bg-[#f2f4f6]'}`}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('my_issues')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${activeTab === 'my_issues' ? 'bg-[#ffdad3] text-[#a83824]' : 'text-[#58423d] hover:bg-[#f2f4f6]'}`}
          >
            <span className="material-symbols-outlined text-xl">folder_open</span>
            <span>My Issues</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-[#58423d] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl text-[#f36f56]">add_circle</span>
            <span>Report an Issue</span>
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-[#58423d] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span>Notifications</span>
          </button>

          <Link
            to="/login"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-[#58423d] hover:bg-[#f2f4f6] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">person</span>
            <span>Profile & Account</span>
          </Link>
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-[#e0e3e5]">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-[#f36f56]/10 text-[#f36f56] flex items-center justify-center font-bold text-sm">
              {user?.fullName ? user.fullName[0] : 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-[#191c1e] truncate">{user?.fullName || 'Aarav Sharma'}</p>
              <p className="text-[11px] text-[#58423d] truncate">Citizen Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* TOP BAR */}
        <header className="bg-white h-20 flex justify-between items-center px-6 w-full shrink-0 z-10 border-b border-[#e0e3e5]">
          {/* Mobile Menu & Logo */}
          <div className="md:hidden flex items-center gap-3">
            <button className="text-[#58423d]">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-lg font-bold text-[#f36f56]">JanDrishti</span>
          </div>

          {/* Desktop Greeting */}
          <div className="hidden md:block">
            <h1 className="text-xl font-extrabold text-[#191c1e]">
              Good morning, {user?.fullName?.split(' ')[0] || 'Aarav'}
            </h1>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-4">
            <button className="text-[#58423d] hover:text-[#f36f56] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer">
              <span className="material-symbols-outlined text-lg">language</span>
              <span className="hidden sm:inline">English</span>
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-[#58423d] hover:text-[#f36f56] transition-colors relative cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#f36f56] rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CANVAS */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="max-w-[1280px] mx-auto space-y-8">
            {/* HERO SECTION */}
            <section className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #f36f56 0%, transparent 40%)' }}></div>
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-black text-[#191c1e] leading-tight">
                    Make your community <span className="text-[#f36f56]">better.</span>
                  </h2>
                  <p className="text-sm md:text-base text-[#58423d] max-w-2xl">
                    Join thousands of citizens actively improving their neighborhoods. Report issues directly to local authorities and track the progress in real-time.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="h-[52px] px-6 bg-[#f36f56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Report an Issue
                    </button>
                    <button
                      onClick={() => setActiveTab('my_issues')}
                      className="h-[52px] px-6 bg-white border border-[#e0e3e5] text-[#191c1e] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#f2f4f6] transition-colors shadow-sm cursor-pointer"
                    >
                      View My Issues
                    </button>
                  </div>
                </div>

                {/* Hero Illustration Graphic */}
                <div className="w-full md:w-1/3 max-w-[260px] aspect-square bg-[#f8f9fb] rounded-full overflow-hidden shrink-0 border-8 border-white shadow-md flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#f36f56] mb-2">location_city</span>
                    <span className="text-xs font-bold text-[#191c1e]">Smart Civic Portal</span>
                  </div>
                </div>
              </div>
            </section>

            {/* STATS GRID (4 KPI Cards) */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Reported */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#f36f56]">
                <div className="flex items-center gap-2 text-[#58423d]">
                  <span className="material-symbols-outlined text-[#f36f56] text-xl">report</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Reported</span>
                </div>
                <span className="text-3xl font-extrabold text-[#191c1e]">12</span>
              </div>

              {/* Card 2: Under Review */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#262ce7]">
                <div className="flex items-center gap-2 text-[#58423d]">
                  <span className="material-symbols-outlined text-[#262ce7] text-xl">pending_actions</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
                </div>
                <span className="text-3xl font-extrabold text-[#191c1e]">3</span>
              </div>

              {/* Card 3: In Progress */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#454eff]">
                <div className="flex items-center gap-2 text-[#58423d]">
                  <span className="material-symbols-outlined text-[#454eff] text-xl">construction</span>
                  <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                </div>
                <span className="text-3xl font-extrabold text-[#191c1e]">1</span>
              </div>

              {/* Card 4: Resolved */}
              <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#10B981]">
                <div className="flex items-center gap-2 text-[#58423d]">
                  <span className="material-symbols-outlined text-[#10B981] text-xl">check_circle</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                </div>
                <span className="text-3xl font-extrabold text-[#191c1e]">8</span>
              </div>
            </section>

            {/* MAIN TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* RECENT ISSUES LIST (2 Columns) */}
              <section className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#191c1e]">Recent Civic Issues</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filterCategory === 'all' ? 'bg-[#f36f56] text-white' : 'bg-white border border-[#e0e3e5] text-[#58423d]'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterCategory('Roads & Infrastructure')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filterCategory === 'Roads & Infrastructure' ? 'bg-[#f36f56] text-white' : 'bg-white border border-[#e0e3e5] text-[#58423d]'}`}
                    >
                      Roads
                    </button>
                  </div>
                </div>

                {issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.map((issue, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-sm flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#f36f56] uppercase tracking-wider">{issue.category}</span>
                            <span className="text-xs text-[#58423d]">• {issue.date}</span>
                          </div>
                          <h4 className="text-base font-bold text-[#191c1e]">{issue.title}</h4>
                          <p className="text-xs text-[#58423d] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {issue.location}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              issue.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : issue.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {issue.status}
                          </span>
                          <span className="text-xs text-[#58423d] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-[#f36f56]">thumb_up</span>
                            {issue.upvotes} Upvotes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-[#e0e3e5] border-dashed flex flex-col items-center justify-center text-center min-h-[280px]">
                    <span className="material-symbols-outlined text-5xl text-[#f36f56] mb-3">markunread_mailbox</span>
                    <h4 className="text-base font-semibold text-[#191c1e] mb-1">No issues reported yet</h4>
                    <p className="text-xs text-[#58423d] max-w-md mb-4">
                      Your neighborhood looks clear. If you spot a pothole, broken streetlight, or civic issue, let us know.
                    </p>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="h-[44px] px-6 border border-[#f36f56] text-[#f36f56] font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-[#ffdad3] transition-colors cursor-pointer"
                    >
                      Report your first issue
                    </button>
                  </div>
                )}
              </section>

              {/* QUICK ACTION CARD (1 Column) */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-[#191c1e]">Quick Action</h3>
                <div className="bg-[#ffdad3] rounded-2xl p-6 relative overflow-hidden shadow-sm border border-[#dfc0b9]">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#f36f56] opacity-10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <span className="material-symbols-outlined text-[#f36f56] text-2xl">visibility</span>
                      </div>
                      <h4 className="text-xl font-bold text-[#3f0400] mb-1">See a problem?</h4>
                      <p className="text-xs text-[#58423d] leading-relaxed">
                        Quickly log location-based issues to help local authorities and university teams act faster.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full h-[52px] bg-[#f36f56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer"
                    >
                      Report an Issue
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden bg-white border-t border-[#e0e3e5] h-[72px] flex justify-around items-center px-2 shrink-0 z-20">
          <button onClick={() => setActiveTab('home')} className="flex flex-col items-center justify-center w-16 h-full text-[#f36f56]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>

          <button onClick={() => setActiveTab('my_issues')} className="flex flex-col items-center justify-center w-16 h-full text-[#58423d]">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="text-[10px] mt-0.5">Issues</span>
          </button>

          <div className="relative -top-5">
            <button
              onClick={() => setShowReportModal(true)}
              className="w-14 h-14 bg-[#f36f56] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl">add</span>
            </button>
          </div>

          <button onClick={() => setShowNotifications(!showNotifications)} className="flex flex-col items-center justify-center w-16 h-full text-[#58423d]">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[10px] mt-0.5">Alerts</span>
          </button>

          <Link to="/login" className="flex flex-col items-center justify-center w-16 h-full text-[#58423d]">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        </nav>
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0e3e5] pb-3">
              <h3 className="text-lg font-bold text-[#191c1e]">Report Civic Issue</h3>
              <button onClick={() => setShowReportModal(false)} className="text-[#58423d] hover:text-[#191c1e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  placeholder="e.g. Broken Streetlight on Main St"
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Category</label>
                <select
                  value={newIssue.category}
                  onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl text-sm outline-none bg-white"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Electrical & Lighting">Electrical & Lighting</option>
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Waste Management">Waste Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  placeholder="Provide details about the location and problem..."
                  className="w-full p-3 border border-[#e0e3e5] rounded-xl text-sm outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#e0e3e5] text-xs font-bold text-[#58423d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#f36f56] text-white text-xs font-bold hover:bg-[#a83824] transition-colors"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitizenHomePage;
