import { useState, useEffect } from "react";
import { getPendingMentors, verifyMentor, getAllStudents, getAllMentors, getOpportunities, createAdminOpportunity } from "../api";
import { FiCheck, FiX, FiShield, FiUsers, FiBriefcase, FiPlus } from "react-icons/fi";
import OpportunityForm from "./OpportunityForm";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingMentors, setPendingMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showOppModal, setShowOppModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await getPendingMentors();
        setPendingMentors(data);
      } else if (activeTab === 'students') {
        const data = await getAllStudents();
        setStudents(data);
      } else if (activeTab === 'mentors') {
        const data = await getAllMentors();
        setMentors(data);
      } else if (activeTab === 'internships') {
        const data = await getOpportunities(); // Reuse public getOpportunities, admin can see all
        setOpportunities(data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} data`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await verifyMentor(userId);
      setPendingMentors(pendingMentors.filter(m => m.user_id !== userId));
    } catch (error) {
      console.error("Failed to verify mentor", error);
      alert("Failed to verify mentor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiShield className="mr-2" /> Admin Portal
        </h2>
        <p className="text-gray-600 mt-2">Platform Management & Monitoring</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Overview (Pending)
        </button>
        <button 
          onClick={() => setActiveTab('students')} 
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'students' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Students
        </button>
        <button 
          onClick={() => setActiveTab('mentors')} 
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'mentors' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Mentors
        </button>
        <button 
          onClick={() => setActiveTab('internships')} 
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'internships' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Internships
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Mentor Verifications</h3>
                 {pendingMentors.length === 0 ? (
                  <p className="text-gray-500">No pending verifications.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {pendingMentors.map((mentor) => (
                      <li key={mentor.id} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{mentor.lab_name}</p>
                            <p className="text-sm text-gray-600">{mentor.university} - {mentor.position}</p>
                          </div>
                          <button
                            onClick={() => handleVerify(mentor.user_id)}
                            className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                          >
                            <FiCheck className="mr-1" /> Verify
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student_profile?.university || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student_profile?.major || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.student_profile?.readiness_score ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {student.student_profile.readiness_score}%
                            </span>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MENTORS TAB */}
            {activeTab === 'mentors' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab / Institution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mentor.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mentor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mentor.mentor_profile ? `${mentor.mentor_profile.lab_name || ""} (${mentor.mentor_profile.university || ""})` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mentor.mentor_profile?.is_verified ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* INTERNSHIPS TAB */}
            {activeTab === 'internships' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">All Opportunities</h3>
                  <button 
                    onClick={() => setShowOppModal(true)}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                  >
                    <FiPlus className="mr-2" /> Add Internship
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <h4 className="font-bold text-indigo-600">{opp.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{opp.description}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded capitalize">{opp.type.replace('_', ' ')}</span>
                        <span>{new Date(opp.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Internship Modal */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Add New Internship (Admin)</h3>
              <button onClick={() => setShowOppModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4">
              <OpportunityForm 
                onSuccess={() => {
                  setShowOppModal(false);
                  fetchData(); // Refresh list
                }} 
                customSubmitFunction={createAdminOpportunity}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
