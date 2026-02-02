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
import { FiLogOut, FiActivity, FiBook, FiUser, FiPlusCircle, FiList, FiBriefcase, FiCpu } from "react-icons/fi";

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">ResearchMatch</h1>
              {/* Role Badge */}
              {displayRole && displayRole !== 'user' && (
                 <span className="ml-3 px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 capitalize">
                   {displayRole} Portal
                 </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Tabs Navigation */}
              {displayRole === "student" && (
                <div className="hidden md:flex space-x-4 mr-8">
                  <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'profile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Profile</button>
                  <button onClick={() => setActiveTab('smart-match')} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'smart-match' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>
                    <FiCpu className={activeTab === 'smart-match' ? 'text-indigo-600' : 'text-gray-500'} /> Smart Match
                  </button>
                  <button onClick={() => setActiveTab('browse')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'browse' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Browse Opportunities</button>
                  <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'applications' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>My Applications</button>
                  <button onClick={() => setActiveTab('lab')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'lab' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Research Lab</button>
                </div>
              )}
              {displayRole === "mentor" && (
                <div className="hidden md:flex space-x-4 mr-8">
                  <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'profile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Profile</button>
                  <button onClick={() => setActiveTab('post-opp')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'post-opp' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Post Opportunity</button>
                  <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'applications' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Manage Applications</button>
                  <button onClick={() => setActiveTab('lab')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'lab' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Research Lab</button>
                  <button onClick={() => setActiveTab('analytics')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'analytics' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</button>
                  <button onClick={() => setActiveTab('tools')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'tools' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}>Tools</button>
                </div>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ResearchMatch!</h2>
            <p className="text-xl text-gray-600 mb-12">To get started, please tell us how you plan to use the platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 group transform hover:-translate-y-1" 
                onClick={() => setSelectedRole("student")}
              >
                <div className="bg-indigo-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors">
                  <FiBook className="text-indigo-600 text-4xl group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I am a Student</h3>
                <p className="text-gray-500">I'm looking for research opportunities, mentors, and lab positions to advance my academic career.</p>
              </div>

              <div 
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 group transform hover:-translate-y-1" 
                onClick={() => setSelectedRole("mentor")}
              >
                <div className="bg-indigo-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors">
                  <FiUser className="text-indigo-600 text-4xl group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I am a Mentor</h3>
                <p className="text-gray-500">I'm a professor or researcher looking for talented students to join my lab and research projects.</p>
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="profile">My Profile</option>
                <option value="browse">Browse Opportunities</option>
                <option value="applications">My Applications</option>
              </select>
            </div>

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile */}
                <div className="lg:col-span-2 space-y-8">
                   {/* Completeness Card */}
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {displayRole === 'student' ? 'Readiness Score' : 'Profile Completeness'}
                      </h3>
                      <span className={`font-bold ${
                        completeness.score >= 80 ? 'text-green-600' : 
                        completeness.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {completeness.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                            completeness.score >= 80 ? 'bg-green-600' : 
                            completeness.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${completeness.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {completeness.score < 80 
                        ? "Increase your readiness score to match with top opportunities." 
                        : "Your readiness score is excellent! You are well-positioned for applications."}
                    </p>
                  </div>

                  <StudentProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
                </div>

                {/* Right Column: Status/Matches (Placeholder) */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FiActivity className="mr-2" /> Quick Stats
                    </h3>
                    <div className="text-center py-4 text-gray-500">
                      <p>Complete your profile to unlock more stats.</p>
                    </div>
                  </div>

                  {/* PhD Matcher CTA */}
                  {!currentUser?.student_profile?.is_phd_seeker && (
                    <div 
                      onClick={() => window.dispatchEvent(new Event('open-profile-edit'))}
                      className="bg-white p-6 rounded-xl shadow-md cursor-pointer border-2 border-transparent hover:border-purple-500 transition group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-600 transition-colors">
                          <FiBook className="text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-gray-800 group-hover:text-purple-700">PhD Matcher</h3>
                      </div>
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={false} 
                          readOnly 
                          className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 cursor-pointer pointer-events-none" 
                        />
                        <p className="text-sm text-gray-600">
                          I am looking for a PhD Supervisor. <span className="text-purple-600 font-medium underline">Complete Profile &rarr;</span>
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
            
            {activeTab === 'lab' && <ResearchLab />}

            {activeTab === 'tools' && <LanguageTool />}
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="profile">My Profile</option>
                <option value="post-opp">Post Opportunity</option>
                <option value="applications">Manage Applications</option>
              </select>
            </div>

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Verification Status Card */}
                  <div className={`p-6 rounded-xl shadow-md ${currentUser.mentor_profile?.is_verified ? 'bg-green-50 border-l-4 border-green-500' : 'bg-yellow-50 border-l-4 border-yellow-500'}`}>
                    <h3 className={`text-lg font-semibold ${currentUser.mentor_profile?.is_verified ? 'text-green-800' : 'text-yellow-800'}`}>
                      {currentUser.mentor_profile?.is_verified ? 'Verified Account' : 'Verification Pending'}
                    </h3>
                    <p className={`text-sm mt-1 ${currentUser.mentor_profile?.is_verified ? 'text-green-700' : 'text-yellow-700'}`}>
                      {currentUser.mentor_profile?.is_verified 
                        ? "Your account is verified. Students can now apply to your lab." 
                        : "Your profile is under review by the administrators. You can update your details in the meantime."}
                    </p>
                  </div>

                  <MentorProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <button 
                      onClick={() => setActiveTab('post-opp')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
                    >
                      <FiPlusCircle className="mr-2" /> Post New Opportunity
                    </button>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      className="w-full mt-3 bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition flex items-center justify-center"
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

            {activeTab === 'applications' && <MentorApplications />}

            {activeTab === 'lab' && <ResearchLab />}

            {activeTab === 'analytics' && <AnalyticsDashboard title="My Engagement Analytics" />}
          </>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
