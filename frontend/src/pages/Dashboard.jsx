import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCompleteness, getMe } from "../api";
import StudentProfileForm from "../components/StudentProfileForm";
import MentorProfileForm from "../components/MentorProfileForm";
import AdminDashboard from "../components/AdminDashboard";
import OpportunityForm from "../components/OpportunityForm";
import OpportunityList from "../components/OpportunityList";
import MentorApplications from "../components/MentorApplications";
import StudentApplications from "../components/StudentApplications";
import ResearchLab from "../components/ResearchLab";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import SmartMatchList from "../components/SmartMatchList";
import RealWorldDashboard from "../components/RealWorldDashboard";
import ErrorBoundary from "../components/ErrorBoundary";
import { FiLogOut, FiActivity, FiBook, FiUser, FiPlusCircle, FiList, FiBriefcase, FiCpu, FiGlobe } from "react-icons/fi";

const Dashboard = () => {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const [completeness, setCompleteness] = useState({ score: 0, role: "" });
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Mentor Tabs: 'profile', 'post-opp', 'applications'
  // Student Tabs: 'profile', 'browse', 'applications'
  const [activeTab, setActiveTab] = useState('profile');
  
  // We need a local user state that can be updated when profile changes
  // without waiting for the global AuthContext to refresh (though we should trigger that too)
  const [currentUser, setCurrentUser] = useState(user);

  const fetchData = async () => {
    try {
      const [completenessData, userData] = await Promise.all([
        getCompleteness(),
        getMe()
      ]);
      setCompleteness(completenessData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    await Promise.all([fetchData(), refreshUser()]);
    setSelectedRole(null); // Clear selection as role should be updated in backend now
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Determine which role view to show
  // If user has explicit role, use it. If "user" (OAuth default), check if they selected one locally.
  const displayRole = (currentUser?.role === "user" && selectedRole) ? selectedRole : currentUser?.role;

  return (
    <div className="min-h-screen bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)]">
      {/* Navbar */}
      <nav className="bg-[var(--color-academia-cream)]/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-serif font-bold text-[var(--color-academia-charcoal)]">ResearchMatch</h1>
              {/* Role Badge */}
              {displayRole && displayRole !== 'user' && (
                 <span className="ml-3 px-2 py-1 rounded-sm text-xs font-semibold bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] capitalize tracking-wide">
                   {displayRole} Portal
                 </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Tabs Navigation */}
              {displayRole === "student" && (
                <div className="hidden lg:flex space-x-1 mr-4 overflow-x-auto">
                  {[
                    { id: 'profile', label: 'Profile', icon: null },
                    { id: 'smart-match', label: 'Smart Match', icon: FiCpu },
                    { id: 'browse', label: 'Browse Opportunities', icon: null },
                    { id: 'applications', label: 'My Applications', icon: null },
                    { id: 'real-world', label: 'Real World Opportunities', icon: FiGlobe }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-sm text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === tab.id 
                          ? 'bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] shadow-md' 
                          : 'text-stone-600 hover:text-[var(--color-academia-charcoal)] hover:bg-stone-100'
                      }`}
                    >
                      {tab.icon && <tab.icon className={activeTab === tab.id ? 'text-[var(--color-academia-gold)]' : 'text-stone-400'} />}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {displayRole === "mentor" && (
                <div className="hidden lg:flex space-x-1 mr-4 overflow-x-auto">
                  {[
                    { id: 'profile', label: 'Profile' },
                    { id: 'post-opp', label: 'Post Opportunity' },
                    { id: 'my-opportunities', label: 'My Opportunities' },
                    { id: 'applications', label: 'Manage Applications' },
                    { id: 'analytics', label: 'Analytics' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? 'bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] shadow-md' 
                          : 'text-stone-600 hover:text-[var(--color-academia-charcoal)] hover:bg-stone-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[var(--color-academia-charcoal)]">{currentUser?.name}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full text-stone-400 hover:text-[var(--color-academia-gold)] hover:bg-stone-100 transition-colors"
                title="Logout"
              >
                <FiLogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Role Selection for New Users (OAuth) */}
        {currentUser?.role === "user" && !selectedRole && (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)] mb-4">Welcome to ResearchMatch!</h2>
            <p className="text-xl text-stone-600 mb-12">To get started, please tell us how you plan to use the platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                className="bg-white p-8 rounded-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[var(--color-academia-gold)] group transform hover:-translate-y-1" 
                onClick={() => setSelectedRole("student")}
              >
                <div className="bg-[var(--color-academia-gold)]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:bg-[var(--color-academia-gold)] transition-colors">
                  <FiBook className="text-[var(--color-academia-gold)] text-4xl group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-academia-charcoal)] mb-3">I am a Student</h3>
                <p className="text-stone-500">I'm looking for research opportunities, mentors, and lab positions to advance my academic career.</p>
              </div>

              <div 
                className="bg-white p-8 rounded-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[var(--color-academia-gold)] group transform hover:-translate-y-1" 
                onClick={() => setSelectedRole("mentor")}
              >
                <div className="bg-[var(--color-academia-gold)]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:bg-[var(--color-academia-gold)] transition-colors">
                  <FiUser className="text-[var(--color-academia-gold)] text-4xl group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-academia-charcoal)] mb-3">I am a Mentor</h3>
                <p className="text-stone-500">I'm a professor or researcher looking for talented students to join my lab and research projects.</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin View */}
        {displayRole === "admin" && <AdminDashboard />}

        {/* Student View */}
        {displayRole === "student" && (
          <>
            {/* Mobile Tab Selector */}
            <div className="md:hidden mb-6">
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full rounded-sm border-stone-200 shadow-sm focus:border-[var(--color-academia-gold)] focus:ring-[var(--color-academia-gold)] bg-white text-[var(--color-academia-charcoal)]"
              >
                <option value="profile">My Profile</option>
                <option value="smart-match">Smart Match</option>
                <option value="browse">Browse Opportunities</option>
                <option value="applications">My Applications</option>
                <option value="real-world">Real World Opportunities</option>
              </select>
            </div>

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile */}
                <div className="lg:col-span-2 space-y-8">
                   {/* Completeness Card */}
                  <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-[var(--color-academia-gold)]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)]">
                        {displayRole === 'student' ? 'Readiness Score' : 'Profile Completeness'}
                      </h3>
                      <span className={`font-bold ${
                        completeness.score >= 80 ? 'text-green-600' : 
                        completeness.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {completeness.score}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                            completeness.score >= 80 ? 'bg-green-600' : 
                            completeness.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${completeness.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-stone-500 mt-2">
                      {completeness.score < 80 
                        ? "Increase your readiness score to match with top opportunities." 
                        : "Your readiness score is excellent! You are well-positioned for applications."}
                    </p>
                  </div>

                  <StudentProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
                </div>

                {/* Right Column: Status/Matches (Placeholder) */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-[var(--color-academia-charcoal)]">
                    <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 flex items-center">
                      <FiActivity className="mr-2" /> Quick Stats
                    </h3>
                    <div className="text-center py-4 text-stone-500">
                      <p>Complete your profile to unlock more stats.</p>
                    </div>
                  </div>

                  {/* PhD Matcher CTA */}
                  {!currentUser?.student_profile?.is_phd_seeker && (
                    <div 
                      onClick={() => window.dispatchEvent(new Event('open-profile-edit'))}
                      className="bg-white p-6 rounded-sm shadow-md cursor-pointer border-2 border-transparent hover:border-[var(--color-academia-gold)] transition group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[var(--color-academia-gold)]/10 p-2 rounded-sm group-hover:bg-[var(--color-academia-gold)] transition-colors">
                          <FiBook className="text-[var(--color-academia-gold)] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-[var(--color-academia-charcoal)]">PhD Matcher</h3>
                      </div>
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={false} 
                          readOnly 
                          className="mt-1 w-5 h-5 text-[var(--color-academia-charcoal)] rounded border-stone-300 cursor-pointer pointer-events-none" 
                        />
                        <p className="text-sm text-stone-600">
                          I am looking for a PhD Supervisor. <span className="text-[var(--color-academia-gold)] font-medium underline">Complete Profile &rarr;</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'smart-match' && <SmartMatchList />}

            {activeTab === 'browse' && <OpportunityList />}
            
            {activeTab === 'applications' && <StudentApplications />}
            
            {activeTab === 'real-world' && <RealWorldDashboard />}



          </>
        )}

        {/* Mentor View */}
        {displayRole === "mentor" && (
          <>
             {/* Mobile Tab Selector */}
            <div className="md:hidden mb-6">
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full rounded-sm border-stone-300 shadow-sm focus:border-[var(--color-academia-gold)] focus:ring-[var(--color-academia-gold)]"
              >
                <option value="profile">My Profile</option>
                <option value="post-opp">Post Opportunity</option>
                <option value="my-opportunities">My Opportunities</option>
                <option value="applications">Manage Applications</option>
              </select>
            </div>

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Verification Status Card */}
                  <div className={`p-6 rounded-sm shadow-md border-l-4 ${currentUser.mentor_profile?.is_verified ? 'bg-green-50 border-green-500' : 'bg-[var(--color-academia-cream)] border-[var(--color-academia-gold)]'}`}>
                    <h3 className={`text-lg font-serif font-bold ${currentUser.mentor_profile?.is_verified ? 'text-green-800' : 'text-[var(--color-academia-charcoal)]'}`}>
                      {currentUser.mentor_profile?.is_verified ? 'Verified Account' : 'Verification Pending'}
                    </h3>
                    <p className={`text-sm mt-1 ${currentUser.mentor_profile?.is_verified ? 'text-green-700' : 'text-stone-600'}`}>
                      {currentUser.mentor_profile?.is_verified 
                        ? "Your account is verified. Students can now apply to your lab." 
                        : "Your profile is under review by the administrators. You can update your details in the meantime."}
                    </p>
                  </div>

                  <MentorProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-[var(--color-academia-charcoal)]">
                    <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4">Quick Actions</h3>
                    <button 
                      onClick={() => setActiveTab('post-opp')}
                      className="w-full bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] px-4 py-2 rounded-sm hover:opacity-90 transition flex items-center justify-center shadow-sm"
                    >
                      <FiPlusCircle className="mr-2" /> Post New Opportunity
                    </button>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      className="w-full mt-3 bg-white text-[var(--color-academia-charcoal)] border border-[var(--color-academia-charcoal)] px-4 py-2 rounded-sm hover:bg-stone-50 transition flex items-center justify-center shadow-sm"
                    >
                      <FiList className="mr-2" /> View Applications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'post-opp' && (
              <OpportunityForm onSuccess={() => setActiveTab('applications')} />
            )}

            {activeTab === 'my-opportunities' && currentUser && (
              <OpportunityList initialFilters={{ mentor_id: currentUser.id }} />
            )}

            {activeTab === 'applications' && (
              <ErrorBoundary>
                <MentorApplications />
              </ErrorBoundary>
            )}

            {activeTab === 'lab' && <ResearchLab />}

            {activeTab === 'analytics' && <AnalyticsDashboard title="My Engagement Analytics" />}
          </>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
