import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

function LandingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Solutions');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form state for Challenge reporting
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    category: 'Infrastructure',
    location: '',
    description: '',
    stakeholder: 'Citizen'
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDashboardPath, setUserDashboardPath] = useState('/login');

  React.useEffect(() => {
    const role = localStorage.getItem('jandrishti_user_role');
    const token = localStorage.getItem('jandrishti_token') || localStorage.getItem('government_token') || localStorage.getItem('university_token');
    const userInfo = localStorage.getItem('jandrishti_user_info');
    if (role || token || userInfo) {
      setIsLoggedIn(true);
      if (role === 'govt') setUserDashboardPath('/dashboard');
      else if (role === 'univ') setUserDashboardPath('/university-dashboard');
      else if (role === 'industry') setUserDashboardPath('/industry-dashboard');
      else setUserDashboardPath('/citizen-dashboard');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleChallengeSubmit = (e) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    showToast('Challenge submitted successfully! Our AI system is triaging your report.');
    setChallengeForm({
      title: '',
      category: 'Infrastructure',
      location: '',
      description: '',
      stakeholder: 'Citizen'
    });
  };

  return (
    <div className="bg-slate-bg text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sovereign-navy text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-primary/30 animate-bounce">
          <span className="material-symbols-outlined text-emerald-green">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="bg-surface border-b border-outline-variant docked full-width top-0 sticky z-40">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
            <div className="text-headline-md font-headline-md font-bold text-primary tracking-tight">JanDrishti</div>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            {['Solutions', 'Policies', 'Innovation', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setActiveNav(item)}
                className={`text-label-sm font-label-sm transition-colors py-1 ${activeNav === item
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                  }`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <DarkModeToggle />
            {isLoggedIn ? (
              <button 
                onClick={() => navigate(userDashboardPath)}
                className="bg-action-orange text-white hover:bg-opacity-90 transition-all px-5 py-2.5 rounded-xl text-label-sm font-label-sm font-bold shadow-md shadow-action-orange/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-primary hover:bg-surface-container-low transition-all px-4 py-2 rounded-xl text-label-sm font-label-sm border border-primary hidden md:block font-medium cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-action-orange text-white hover:bg-opacity-90 transition-all px-4 py-2 rounded-xl text-label-sm font-label-sm font-semibold shadow-md shadow-action-orange/20 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center md:text-left flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              Sovereign Governance &amp; Civic Innovation
            </div>

            <h1 className="text-4xl md:text-headline-xl font-headline-xl text-sovereign-navy leading-tight">
              REAL PROBLEMS.<br />
              <span className="text-primary">REAL PEOPLE.</span><br />
              REAL SOLUTIONS.
            </h1>

            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
              JanDrishti bridges the gap between civic challenges and innovative solutions. A transparent, sovereign engine powering the next generation of government-backed digital infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-action-orange text-white px-8 py-3.5 rounded-xl text-label-sm font-label-sm hover:scale-95 transition-all duration-150 ease-in-out shadow-lg shadow-action-orange/25 font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add_alert</span>
                Report a Challenge
              </button>
              <a
                href="#impact"
                className="bg-surface text-primary border border-primary px-8 py-3.5 rounded-xl text-label-sm font-label-sm hover:bg-surface-container-low transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">explore</span>
                Explore Solutions
              </a>
            </div>
          </div>

            {/* 4 Stakeholder Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                {
                  id: 'citizens',
                  icon: 'groups',
                  title: 'Citizens',
                  desc: 'Voice localized challenges directly to problem solvers and track progress transparently.'
                },
                {
                  id: 'universities',
                  icon: 'school',
                  title: 'Universities',
                  desc: 'Turn academic research into practical civic deployment with dedicated government grants.'
                },
                {
                  id: 'industry',
                  icon: 'factory',
                  title: 'Industry',
                  desc: 'Scale innovations, offer expertise, and secure official government partnerships.'
                },
                {
                  id: 'government',
                  icon: 'account_balance',
                  title: 'Government',
                  desc: 'Oversee, fund, and validate impactful deployments across sovereign territories.'
                }
              ].map((card) => (
                <div
                  key={card.id}
                  className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-surface-variant"
                >
                  <span className="material-symbols-outlined text-4xl text-sovereign-navy mb-4 block" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {card.icon}
                  </span>
                  <h3 className="text-headline-md font-headline-md mb-2 text-sovereign-navy">
                    {card.title}
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
        </section>

        {/* Impact at a Glance Section */}
        <section id="impact" className="bg-surface-container-low py-20 border-y border-outline-variant">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Metrics &amp; Performance</span>
                <h2 className="text-headline-lg font-headline-lg text-sovereign-navy mt-1">Systematic Impact</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant mt-2">Real-time metrics from the JanDrishti ecosystem.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center gap-2 text-primary hover:underline text-label-sm font-label-sm font-medium bg-surface px-4 py-2 rounded-xl border border-outline-variant shadow-sm cursor-pointer"
              >
                Live Impact Dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { count: '12,450', label: 'Challenges Logged', color: 'text-sovereign-navy' },
                { count: '8,920', label: 'Verified Issues', color: 'text-primary' },
                { count: '3,210', label: 'Active Projects', color: 'text-emerald-green' },
                { count: '1,845', label: 'Solutions Deployed', color: 'text-action-orange' },
                { count: '450+', label: 'Institutions', color: 'text-sovereign-navy' },
                { count: '1,200+', label: 'Industry Partners', color: 'text-primary' },
                { count: '85', label: 'Districts Covered', color: 'text-emerald-green' },
                { count: '5M+', label: 'Beneficiaries', color: 'text-action-orange' }
              ].map((stat, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-surface-variant text-center hover:scale-[1.02] transition-transform">
                  <div className={`text-3xl md:text-4xl font-headline-xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
                  <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why JanDrishti? Section */}
        <section id="policies" className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Transformation Model</span>
            <h2 className="text-headline-lg font-headline-lg text-sovereign-navy mt-1">Why JanDrishti?</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">Replacing bureaucratic bottlenecks with a transparent, collaborative innovation engine.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl custom-shadow border border-surface-variant">
              <h3 className="text-headline-md font-headline-md text-on-surface-variant mb-6 flex items-center gap-3 border-b border-surface-variant pb-4">
                <span className="material-symbols-outlined text-error bg-error-container p-2 rounded-full text-xl">close</span>
                Traditional Flow
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-outline p-2 bg-surface-container rounded-lg">description</span>
                  <div>
                    <h4 className="font-bold text-sovereign-navy">Siloed Data</h4>
                    <p className="text-body-md text-on-surface-variant">Challenges get stuck in departmental paperwork without cross-agency visibility.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-outline p-2 bg-surface-container rounded-lg">timer</span>
                  <div>
                    <h4 className="font-bold text-sovereign-navy">Slow Response</h4>
                    <p className="text-body-md text-on-surface-variant">Years pass between initial problem identification and actual ground deployment.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-outline p-2 bg-surface-container rounded-lg">visibility_off</span>
                  <div>
                    <h4 className="font-bold text-sovereign-navy">Opaque Process</h4>
                    <p className="text-body-md text-on-surface-variant">Citizens and researchers have no visibility into status or funding allocations.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex-1 bg-primary-fixed p-8 rounded-xl custom-shadow border border-primary/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-primary opacity-10 pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: '220px' }}>verified</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-primary mb-6 flex items-center gap-3 relative z-10 border-b border-primary/10 pb-4">
                <span className="material-symbols-outlined text-white bg-primary p-2 rounded-full text-xl">check_circle</span>
                The JanDrishti Flow
              </h3>
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary p-2 bg-white/70 rounded-lg">hub</span>
                  <div>
                    <h4 className="font-bold text-on-primary-fixed">Unified Platform</h4>
                    <p className="text-body-md text-on-primary-fixed-variant">All stakeholders converge on a single transparent and verifiable ecosystem.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary p-2 bg-white/70 rounded-lg">bolt</span>
                  <div>
                    <h4 className="font-bold text-on-primary-fixed">Agile Innovation</h4>
                    <p className="text-body-md text-on-primary-fixed-variant">Direct matching of verified problems to active researchers and industry solvers.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary p-2 bg-white/70 rounded-lg">visibility</span>
                  <div>
                    <h4 className="font-bold text-on-primary-fixed">Radical Transparency</h4>
                    <p className="text-body-md text-on-primary-fixed-variant">Track progress end-to-end from initial report to verified local impact metrics.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* AI & Governance Section */}
        <section id="innovation" className="bg-sovereign-navy text-white py-20 px-margin-mobile md:px-margin-desktop text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="w-16 h-16 bg-action-orange/20 rounded-2xl flex items-center justify-center mx-auto border border-action-orange/30">
              <span className="material-symbols-outlined text-4xl text-action-orange">psychology</span>
            </div>
            <h2 className="text-headline-lg md:text-headline-xl font-headline-lg font-bold">AI That Assists. People Decide.</h2>
            <p className="text-body-lg font-body-lg text-outline-variant leading-relaxed">
              JanDrishti utilizes advanced AI to triage challenges, suggest matches, and track metrics in real time. But critical funding, verification, and deployment decisions are always governed by human leaders to ensure accountability, security, and empathy.
            </p>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop text-center bg-surface-bright border-b border-outline-variant">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-headline-xl font-headline-xl text-sovereign-navy">Your Problem Can Start Something.</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant">
              Don't just observe the challenge. Be the catalyst for the solution. Join the JanDrishti network today.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-action-orange text-white px-8 py-4 rounded-xl text-label-sm font-label-sm hover:scale-95 transition-transform shadow-lg shadow-action-orange/20 font-bold text-lg flex items-center gap-3 cursor-pointer"
              >
                <span className="material-symbols-outlined">campaign</span>
                Report a Challenge Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="bg-surface-container-highest flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto gap-gutter border-t border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
          <div className="text-headline-md font-headline-md font-bold text-primary">JanDrishti</div>
        </div>
        <div className="text-body-md font-body-md text-on-surface text-center md:text-left text-sm text-on-surface-variant">
          © 2026 JanDrishti. Digital Sovereignty &amp; Transparency Initiative.
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          <a className="text-on-surface-variant hover:text-secondary transition-all text-body-md font-body-md text-sm hover:underline" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant hover:text-secondary transition-all text-body-md font-body-md text-sm hover:underline" href="#">Terms of Service</a>
          <a className="text-on-surface-variant hover:text-secondary transition-all text-body-md font-body-md text-sm hover:underline" href="#">Help Desk</a>
          <a className="text-on-surface-variant hover:text-secondary transition-all text-body-md font-body-md text-sm hover:underline" href="#">Contact Us</a>
        </div>
      </footer>

      {/* Report Challenge Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-surface-variant relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-sovereign-navy cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-action-orange/10 rounded-xl flex items-center justify-center text-action-orange font-bold">
                <span className="material-symbols-outlined">report_problem</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-sovereign-navy">Report a Challenge</h3>
                <p className="text-xs text-on-surface-variant">Submit local issues for verification &amp; solution matching</p>
              </div>
            </div>

            <form onSubmit={handleChallengeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sovereign-navy mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Water Quality Monitoring in Sector 4"
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sovereign-navy mb-1">Category</label>
                  <select
                    value={challengeForm.category}
                    onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-sm bg-white"
                  >
                    <option>Infrastructure</option>
                    <option>Public Health</option>
                    <option>Education</option>
                    <option>Environment</option>
                    <option>Governance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sovereign-navy mb-1">District / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lucknow District"
                    value={challengeForm.location}
                    onChange={(e) => setChallengeForm({ ...challengeForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sovereign-navy mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide detailed description of the problem..."
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-sm"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-action-orange text-white rounded-xl text-sm font-bold shadow-md shadow-action-orange/20 hover:bg-opacity-90 cursor-pointer"
                >
                  Submit Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
