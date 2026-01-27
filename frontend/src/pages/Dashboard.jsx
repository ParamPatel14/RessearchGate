import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCompleteness, getMe } from "../api";
import StudentProfileForm from "../components/StudentProfileForm";
import MentorProfileForm from "../components/MentorProfileForm";
import AdminDashboard from "../components/AdminDashboard";
import { FiLogOut, FiActivity, FiBook, FiUser } from "react-icons/fi";

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [completeness, setCompleteness] = useState({ score: 0, role: "" });
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">ResearchMatch</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile */}
            <div className="lg:col-span-2 space-y-8">
               {/* Completeness Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Profile Completeness</h3>
                  <span className="text-indigo-600 font-bold">{completeness.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${completeness.score}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {completeness.score < 100 
                    ? "Complete your profile to increase your chances of finding a mentor." 
                    : "Your profile is complete! You are ready to apply for positions."}
                </p>
              </div>

              <StudentProfileForm user={currentUser} onUpdate={handleProfileUpdate} />
            </div>

            {/* Right Column: Status/Matches (Placeholder) */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiActivity className="mr-2" /> Application Status
                </h3>
                <div className="text-center py-8 text-gray-500">
                  <p>No active applications.</p>
                  <p className="text-sm mt-2">Browse mentors to start applying.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mentor View */}
        {displayRole === "mentor" && (
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

            {/* Right Column: Requests (Placeholder) */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiActivity className="mr-2" /> Student Requests
                </h3>
                <div className="text-center py-8 text-gray-500">
                  <p>No new requests.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
