import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import DarkModeToggle from '../components/DarkModeToggle';

function CitizenHomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // Report form state
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    district: 'Ranchi',
    address: '',
  });
  const { uploading: uploadingPhoto, photos: uploadedPhotos, uploadFile, removePhoto, reset: resetPhotos, error: uploadError } = useCloudinaryUpload();
  const [classifying, setClassifying] = useState(false);
  const [aiCategory, setAiCategory] = useState(null);  // { rawLabel, category }
  const [manualCategory, setManualCategory] = useState('');
  const [userOverridden, setUserOverridden] = useState(false);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const CATEGORY_OPTIONS = [
    { value: 'accessibility',         label: '♿ Accessibility' },
    { value: 'agriculture',           label: '🌾 Agriculture' },
    { value: 'education',             label: '📚 Education' },
    { value: 'energy',                label: '⚡ Electricity / Solar energy' },
    { value: 'environment',           label: '🌿 Environment' },
    { value: 'healthcare',            label: '🏥 Healthcare' },
    { value: 'public administration', label: '🏛️ Public Administration' },
    { value: 'rural livelihood',      label: '🚜 Rural Livelihood' },
    { value: 'urban development',     label: '🏙️ Urban Development' },
    { value: 'water related',         label: '💧 Water Related' },
    { value: 'other',                 label: '📋 Other' },
  ];

  const resetModal = () => {
    setNewIssue({ title: '', description: '', district: 'Ranchi', address: '' });
    resetPhotos();
    setAiCategory(null);
    setManualCategory('');
    setUserOverridden(false);
    setShowManualSelect(false);
    setShowReportModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/citizen/issues/my', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.issues) {
        setIssues(data.issues);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('https://jandrishti-em1u.onrender.com/api/citizen/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    navigate('/login');
  };

  // Upload photo directly to Cloudinary via hook
  const handlePhotoFile = (file) => {
    if (file) uploadFile(file);
  };

  // Call backend → predict.py / api.py model
  const handleClassify = async (textOverride) => {
    const titleVal = newIssue.title || '';
    const descVal = typeof textOverride === 'string' ? textOverride : (newIssue.description || '');
    const text = `${titleVal} ${descVal}`.trim();
    if (!text || text.length < 4) return;
    setClassifying(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/citizen/issues/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: titleVal, description: descVal }),
      });
      const data = await res.json();
      if (data.success && data.category) {
        setAiCategory({ rawLabel: data.rawLabel, category: data.category });
        if (!userOverridden) {
          setManualCategory(data.category);
        }
      }
    } catch (err) {
      console.error('Classify error:', err);
    } finally {
      setClassifying(false);
    }
  };

  // Auto-detect category as user types description or title
  useEffect(() => {
    const text = `${newIssue.title} ${newIssue.description}`.trim();
    if (text.length >= 5 && showReportModal) {
      const timer = setTimeout(() => {
        handleClassify();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [newIssue.title, newIssue.description, showReportModal]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!newIssue.title || !newIssue.description) return;
    const finalCategory = manualCategory || aiCategory?.category || 'other';
    setSubmitting(true);
    try {
      const res = await fetch('https://jandrishti-em1u.onrender.com/api/citizen/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newIssue.title,
          description: newIssue.description,
          category: finalCategory,
          photos: uploadedPhotos.map(p => ({ url: p.url, publicId: p.publicId })),
          location: { district: newIssue.district, address: newIssue.address, state: 'Jharkhand' },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        resetModal();
        fetchCitizenIssues();
      } else {
        setIssues([
          {
            id: `ISS-${Math.floor(100 + Math.random() * 900)}`,
            title: newIssue.title,
            category: finalCategory,
            status: 'Under Review',
            date: 'Today',
            location: `${newIssue.district}, Jharkhand`,
            upvotes: 1,
          },
          ...issues,
        ]);
        resetModal();
      }
    } catch (err) {
      resetModal();
    } finally {
      setSubmitting(false);
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

        {/* Nav Links (Without bottom profile button as requested) */}
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
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* TOP BAR */}
        <header className="bg-white h-20 flex justify-between items-center px-6 w-full shrink-0 relative z-50 border-b border-[#e0e3e5]">
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

          {/* Top Right Profile Dropdown */}
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <div className="relative z-50" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2.5 hover:bg-[#f8f9fb] p-1.5 rounded-xl border border-[#e0e3e5] cursor-pointer transition-all shadow-xs"
              >
                <div className="w-8.5 h-8.5 rounded-full bg-[#f36f56]/10 text-[#f36f56] flex items-center justify-center font-bold text-xs border border-[#f36f56]/20 shadow-2xs">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs text-[#191c1e] font-bold">
                    {user?.fullName || 'Aarav Sharma'}
                  </span>
                  <span className="text-[10px] text-[#58423d] font-semibold">
                    Citizen Account
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#58423d] text-base pr-1">
                  {showProfileMenu ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl z-[100] py-2 divide-y divide-[#e0e3e5] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 bg-[#f8f9fb] rounded-t-2xl">
                    <p className="text-xs font-extrabold text-[#191c1e]">
                      {user?.fullName || 'Aarav Sharma'}
                    </p>
                    <p className="text-[11px] text-[#58423d]">
                      {user?.email || 'citizen@jandrishti.gov.in'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#f36f56]/10 text-[#f36f56] text-[10px] font-bold">
                      Verified Citizen
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

        {/* SCROLLABLE CANVAS */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="max-w-[1280px] mx-auto space-y-8">

            {activeTab === 'my_issues' ? (
              /* ========================================================= */
              /* DEDICATED MY ISSUES PAGE VIEW                            */
              /* ========================================================= */
              <div className="space-y-6">
                {/* Page Title & Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f36f56]">folder_open</span>
                      My Reported Issues
                    </h2>
                    <p className="text-xs text-[#58423d] mt-1">
                      Track the real-time status, government review, and university assignment for all your reported civic complaints.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-5 py-2.5 bg-[#f36f56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Report New Issue
                  </button>
                </div>

                {/* 4 Dynamic Status KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setStatusFilter('All')}
                    className={`bg-white p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                      statusFilter === 'All' ? 'border-[#f36f56] ring-2 ring-[#f36f56]/20' : 'border-[#e0e3e5] hover:border-[#f36f56]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#58423d] mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">All Issues</span>
                      <span className="material-symbols-outlined text-[#f36f56] text-xl">dataset</span>
                    </div>
                    <div className="text-3xl font-black text-[#191c1e]">{issues.length}</div>
                    <div className="text-[10px] text-[#58423d] font-medium mt-1">Total Logged</div>
                  </button>

                  <button
                    onClick={() => setStatusFilter('submitted')}
                    className={`bg-white p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                      statusFilter === 'submitted' ? 'border-[#262ce7] ring-2 ring-[#262ce7]/20' : 'border-[#e0e3e5] hover:border-[#262ce7]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#58423d] mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Under Review</span>
                      <span className="material-symbols-outlined text-[#262ce7] text-xl">pending_actions</span>
                    </div>
                    <div className="text-3xl font-black text-[#191c1e]">
                      {issues.filter(i => i.status === 'submitted' || i.status === 'under_review' || i.status === 'Under Review').length}
                    </div>
                    <div className="text-[10px] text-[#262ce7] font-medium mt-1">Awaiting Govt Triage</div>
                  </button>

                  <button
                    onClick={() => setStatusFilter('in_progress')}
                    className={`bg-white p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                      statusFilter === 'in_progress' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[#e0e3e5] hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#58423d] mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
                      <span className="material-symbols-outlined text-amber-500 text-xl">engineering</span>
                    </div>
                    <div className="text-3xl font-black text-[#191c1e]">
                      {issues.filter(i => i.status === 'in_progress' || i.status === 'In Progress').length}
                    </div>
                    <div className="text-[10px] text-amber-600 font-medium mt-1">R&amp;D Team Active</div>
                  </button>

                  <button
                    onClick={() => setStatusFilter('resolved')}
                    className={`bg-white p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                      statusFilter === 'resolved' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#e0e3e5] hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#58423d] mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                    </div>
                    <div className="text-3xl font-black text-[#191c1e]">
                      {issues.filter(i => i.status === 'resolved' || i.status === 'Resolved').length}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1">Fix Deployed</div>
                  </button>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search input */}
                  <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#58423d] text-lg">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by issue title, description, or location..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fb] border border-[#e0e3e5] rounded-xl text-xs text-[#191c1e] focus:border-[#f36f56] outline-none"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                      { id: 'all', label: 'All Categories' },
                      { id: 'roads', label: 'Roads' },
                      { id: 'water', label: 'Water' },
                      { id: 'sanitation', label: 'Sanitation' },
                      { id: 'electricity', label: 'Electricity' },
                      { id: 'health', label: 'Health' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          filterCategory === cat.id ? 'bg-[#f36f56] text-white' : 'bg-[#f8f9fb] border border-[#e0e3e5] text-[#58423d] hover:bg-[#e0e3e5]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issues Grid / List */}
                {loadingIssues ? (
                  <div className="bg-white p-12 rounded-2xl border border-[#e0e3e5] text-center text-[#58423d]">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[#f36f56] mb-2">progress_activity</span>
                    <p className="text-xs font-bold text-[#191c1e]">Fetching your reported issues...</p>
                  </div>
                ) : issues.filter((issue) => {
                    const s = (issue.status || '').toLowerCase();
                    let matchStatus = true;
                    if (statusFilter === 'submitted') matchStatus = s === 'submitted' || s === 'under review' || s === 'under_review';
                    else if (statusFilter === 'in_progress') matchStatus = s === 'in_progress' || s === 'in progress';
                    else if (statusFilter === 'resolved') matchStatus = s === 'resolved';

                    let matchCat = true;
                    if (filterCategory !== 'all') matchCat = (issue.category || '').toLowerCase().includes(filterCategory.toLowerCase());

                    let matchSearch = true;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const locStr = typeof issue.location === 'object' && issue.location !== null
                        ? `${issue.location.address || ''} ${issue.location.district || ''}`.toLowerCase()
                        : String(issue.location || '').toLowerCase();
                      matchSearch = (issue.title || '').toLowerCase().includes(q) || (issue.description || '').toLowerCase().includes(q) || locStr.includes(q);
                    }
                    return matchStatus && matchCat && matchSearch;
                  }).length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-[#e0e3e5] border-dashed text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-[#58423d] mb-3">folder_off</span>
                    <h4 className="text-base font-bold text-[#191c1e] mb-1">No issues found</h4>
                    <p className="text-xs text-[#58423d] max-w-sm mb-4">
                      No issues match your current status or search filter. Try clearing filters or submit a new issue report.
                    </p>
                    <button
                      onClick={() => { setStatusFilter('All'); setFilterCategory('all'); setSearchQuery(''); }}
                      className="px-4 py-2 border border-[#e0e3e5] text-xs font-bold text-[#191c1e] rounded-xl hover:bg-[#f8f9fb]"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.filter((issue) => {
                      const s = (issue.status || '').toLowerCase();
                      let matchStatus = true;
                      if (statusFilter === 'submitted') matchStatus = s === 'submitted' || s === 'under review' || s === 'under_review';
                      else if (statusFilter === 'in_progress') matchStatus = s === 'in_progress' || s === 'in progress';
                      else if (statusFilter === 'resolved') matchStatus = s === 'resolved';

                      let matchCat = true;
                      if (filterCategory !== 'all') matchCat = (issue.category || '').toLowerCase().includes(filterCategory.toLowerCase());

                      let matchSearch = true;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        const locStr = typeof issue.location === 'object' && issue.location !== null
                          ? `${issue.location.address || ''} ${issue.location.district || ''}`.toLowerCase()
                          : String(issue.location || '').toLowerCase();
                        matchSearch = (issue.title || '').toLowerCase().includes(q) || (issue.description || '').toLowerCase().includes(q) || locStr.includes(q);
                      }
                      return matchStatus && matchCat && matchSearch;
                    }).map((issue, idx) => (
                      <div key={issue._id || idx} className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm space-y-4 hover:border-[#f36f56] transition-all">
                        {/* Header: Category + Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e0e3e5] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-[#f36f56]/10 text-[#f36f56] text-[10px] font-extrabold uppercase tracking-wider">
                              {issue.category}
                            </span>
                            <span className="text-xs text-[#58423d]">
                              • Reported on {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                            </span>
                          </div>

                          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                            issue.status === 'resolved' || issue.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : issue.status === 'in_progress' || issue.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : issue.status === 'assigned' || issue.status === 'Assigned'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {issue.status === 'submitted' || issue.status === 'under_review'
                              ? 'Under Review'
                              : issue.status === 'assigned'
                              ? 'Assigned'
                              : issue.status}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-lg font-bold text-[#191c1e] mb-1">{issue.title}</h3>
                          <p className="text-xs text-[#58423d] leading-relaxed">{issue.description}</p>
                        </div>

                        {/* Location & Photos Preview */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f9fb] p-3 rounded-xl border border-[#e0e3e5] text-xs">
                          <div className="flex items-center gap-1.5 text-[#58423d]">
                            <span className="material-symbols-outlined text-sm text-[#f36f56]">location_on</span>
                            <span className="font-semibold text-[#191c1e]">
                              {typeof issue.location === 'object' && issue.location !== null
                                ? [issue.location.address, issue.location.district, issue.location.state].filter(Boolean).join(', ') || 'Ranchi, Jharkhand'
                                : (issue.location || 'Ranchi, Jharkhand')}
                            </span>
                          </div>

                          {/* Photos thumbnail preview */}
                          {issue.photos?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#58423d] font-semibold">{issue.photos.length} Photo(s):</span>
                              <div className="flex gap-1.5">
                                {issue.photos.map((p, pIdx) => (
                                  <a key={pIdx} href={p.url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={p.url} alt="evidence" className="w-8 h-8 rounded object-cover border border-[#e0e3e5] hover:opacity-80 transition-opacity" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Real-time Resolution Progress Stepper */}
                        <div className="pt-2 border-t border-[#e0e3e5]">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#58423d] mb-2">Resolution Progress</div>
                          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                            <div className={`p-2 rounded-lg border font-semibold ${
                              ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'].includes(issue.status?.toLowerCase())
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-[#f8f9fb] border-[#e0e3e5] text-[#58423d]'
                            }`}>
                              1. Submitted
                            </div>
                            <div className={`p-2 rounded-lg border font-semibold ${
                              ['under_review', 'assigned', 'in_progress', 'resolved'].includes(issue.status?.toLowerCase())
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-[#f8f9fb] border-[#e0e3e5] text-[#58423d]'
                            }`}>
                              2. Govt Triage
                            </div>
                            <div className={`p-2 rounded-lg border font-semibold ${
                              ['assigned', 'in_progress', 'resolved'].includes(issue.status?.toLowerCase())
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-[#f8f9fb] border-[#e0e3e5] text-[#58423d]'
                            }`}>
                              3. R&amp;D Assigned
                            </div>
                            <div className={`p-2 rounded-lg border font-semibold ${
                              issue.status?.toLowerCase() === 'resolved'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-[#f8f9fb] border-[#e0e3e5] text-[#58423d]'
                            }`}>
                              4. Resolved
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ========================================================= */
              /* HOME VIEW (HERO + STATS + RECENT ISSUES)                  */
              /* ========================================================= */
              <>
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
                    <span className="text-3xl font-extrabold text-[#191c1e]">{issues.length}</span>
                  </div>

                  {/* Card 2: Under Review */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#262ce7]">
                    <div className="flex items-center gap-2 text-[#58423d]">
                      <span className="material-symbols-outlined text-[#262ce7] text-xl">pending_actions</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#191c1e]">
                      {issues.filter(i => i.status === 'submitted' || i.status === 'under_review' || i.status === 'Under Review').length}
                    </span>
                  </div>

                  {/* Card 3: In Progress */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#454eff]">
                    <div className="flex items-center gap-2 text-[#58423d]">
                      <span className="material-symbols-outlined text-[#454eff] text-xl">construction</span>
                      <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#191c1e]">
                      {issues.filter(i => i.status === 'in_progress' || i.status === 'In Progress').length}
                    </span>
                  </div>

                  {/* Card 4: Resolved */}
                  <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2 border-t-4 border-t-[#10B981]">
                    <div className="flex items-center gap-2 text-[#58423d]">
                      <span className="material-symbols-outlined text-[#10B981] text-xl">check_circle</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#191c1e]">
                      {issues.filter(i => i.status === 'resolved' || i.status === 'Resolved').length}
                    </span>
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
                                <span className="text-xs text-[#58423d]">• {issue.date || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently')}</span>
                              </div>
                              <h4 className="text-base font-bold text-[#191c1e]">{issue.title}</h4>
                              <p className="text-xs text-[#58423d] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {typeof issue.location === 'object' && issue.location !== null
                                  ? [issue.location.address, issue.location.district, issue.location.state].filter(Boolean).join(', ')
                                  : (issue.location || 'Location not specified')}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  issue.status === 'Resolved' || issue.status === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : issue.status === 'In Progress' || issue.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : issue.status === 'assigned' || issue.status === 'Assigned'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                                }`}
                              >
                                {issue.status === 'submitted' || issue.status === 'under_review' ? 'Under Review' : issue.status}
                              </span>
                              <span className="text-xs text-[#58423d] font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-[#f36f56]">thumb_up</span>
                                {issue.upvotes || 0} Upvotes
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
                            Quickly log location-based issues to initiate local government triage and university R&amp;D solutions.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="w-full h-[48px] bg-[#f36f56] text-white font-bold text-xs rounded-xl hover:bg-[#a83824] transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">add_a_photo</span>
                          Report Issue Now
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
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
        </nav>
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" style={{backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e0e3e5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f36f56] text-xl">add_circle</span>
                <h3 className="text-lg font-bold text-[#191c1e]">Report Civic Issue</h3>
              </div>
              <button onClick={resetModal} className="text-[#58423d] hover:text-[#191c1e] transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-5">

              {/* --- PHOTO UPLOAD --- */}
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-2">📷 Upload Evidence (optional)</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex-1 h-[44px] flex items-center justify-center gap-2 border-2 border-dashed border-[#e0e3e5] rounded-xl text-xs font-semibold text-[#58423d] hover:border-[#f36f56] hover:text-[#f36f56] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex-1 h-[44px] flex items-center justify-center gap-2 border-2 border-dashed border-[#e0e3e5] rounded-xl text-xs font-semibold text-[#58423d] hover:border-[#f36f56] hover:text-[#f36f56] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                    Open Camera
                  </button>
                </div>
                {/* Hidden inputs */}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ''; }}
                />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ''; }}
                />
                {/* Photo previews */}
                {uploadingPhoto && (
                  <div className="flex items-center gap-2 text-xs text-[#58423d] py-2">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Uploading to Cloudinary...
                  </div>
                )}
                {uploadError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {uploadError}
                  </div>
                )}
                {uploadedPhotos.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {uploadedPhotos.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={p.preview || p.url} alt="evidence" className="w-20 h-20 object-cover rounded-xl border border-[#e0e3e5]" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#f36f56] text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- TITLE --- */}
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">Issue Title *</label>
                <input
                  type="text" required
                  value={newIssue.title}
                  onChange={e => setNewIssue({ ...newIssue, title: e.target.value })}
                  placeholder="e.g. Broken Streetlight on Main St"
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl text-sm outline-none focus:border-[#f36f56] transition-colors"
                />
              </div>

              {/* --- DESCRIPTION --- */}
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">Description *</label>
                <textarea
                  required rows={3}
                  value={newIssue.description}
                  onChange={e => setNewIssue({ ...newIssue, description: e.target.value })}
                  placeholder="Describe the problem in detail — location, severity, since when..."
                  className="w-full p-3 border border-[#e0e3e5] rounded-xl text-sm outline-none resize-none focus:border-[#f36f56] transition-colors"
                />
              </div>

              {/* --- AI CATEGORY DETECTION & SELECTOR --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#191c1e]">
                    Category {aiCategory ? '(AI Auto-Selected)' : '*'}
                  </label>
                  {classifying && (
                    <span className="flex items-center gap-1.5 text-[11px] text-[#f36f56] font-semibold">
                      <span className="material-symbols-outlined text-sm animate-spin">smart_toy</span>
                      AI Detecting...
                    </span>
                  )}
                </div>

                {/* AI Detected Badge */}
                {aiCategory && !classifying && (
                  <div className="bg-gradient-to-r from-[#fff4f2] to-[#ffecea] border border-[#f36f56]/30 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#f36f56]/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#f36f56] text-base">smart_toy</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#58423d] font-semibold uppercase tracking-wider block">AI Detected Domain</span>
                        <span className="text-xs font-extrabold text-[#191c1e] capitalize">
                          {CATEGORY_OPTIONS.find(c => c.value === (manualCategory || aiCategory.category))?.label || aiCategory.category}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowManualSelect(s => !s)}
                      className="text-[11px] bg-white px-3 py-1.5 rounded-lg text-[#f36f56] font-bold border border-[#f36f56]/30 hover:bg-[#fff4f2] transition-colors cursor-pointer shrink-0"
                    >
                      {showManualSelect ? 'Hide Options' : 'Not satisfied? Change'}
                    </button>
                  </div>
                )}

                {/* Category Options Grid (Shown when no AI category or when user clicks "Not satisfied? Change") */}
                {(!aiCategory || showManualSelect) && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {CATEGORY_OPTIONS.map(opt => {
                      const active = (manualCategory || aiCategory?.category || 'other') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setManualCategory(opt.value);
                            setUserOverridden(true);
                          }}
                          className={`h-[42px] px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                            active
                              ? 'border-[#f36f56] bg-[#fff4f2] text-[#a83824] ring-2 ring-[#f36f56]/20 font-bold'
                              : 'border-[#e0e3e5] text-[#58423d] hover:border-[#f36f56] hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {active && (
                            <span className="material-symbols-outlined text-sm text-[#f36f56]">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* --- DISTRICT --- */}
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1">District</label>
                <select
                  value={newIssue.district}
                  onChange={e => setNewIssue({ ...newIssue, district: e.target.value })}
                  className="w-full h-[48px] px-4 border border-[#e0e3e5] rounded-xl text-sm outline-none bg-white focus:border-[#f36f56] transition-colors"
                >
                  {['Ranchi','Dhanbad','Jamshedpur','Bokaro','Hazaribagh','Giridih','Deoghar','Dumka','Chaibasa','Lohardaga'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* --- ACTIONS --- */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 h-[48px] rounded-xl border border-[#e0e3e5] text-xs font-bold text-[#58423d] hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPhoto}
                  className="flex-1 h-[48px] rounded-xl bg-[#f36f56] text-white text-xs font-bold hover:bg-[#a83824] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Submitting...</>
                  ) : 'Submit Issue'}
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