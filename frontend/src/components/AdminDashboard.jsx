import { useState, useEffect } from "react";
import { getPendingMentors, verifyMentor, getAllStudents, getAllMentors, getOpportunities, createAdminOpportunity, getAllApplications } from "../api";
import { FiCheck, FiX, FiShield, FiUsers, FiBriefcase, FiPlus, FiFileText, FiDownload, FiExternalLink, FiCpu } from "react-icons/fi";
import OpportunityForm from "./OpportunityForm";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingMentors, setPendingMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showOppModal, setShowOppModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      } else if (activeTab === 'applications') {
        const data = await getAllApplications();
        setApplications(data);
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

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const getResumeUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000/${url}`;
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
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === 'applications' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Applications
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

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{app.student?.name || "Unknown Student"}</div>
                              <div className="text-sm text-gray-500">{app.student?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.opportunity?.title || "Unknown Opportunity"}</div>
                          <div className="text-xs text-gray-500 capitalize">{app.opportunity?.type?.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            app.match_score >= 80 ? 'bg-green-100 text-green-800' :
                            app.match_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.match_score}% Match
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-3">
                             {app.student?.student_profile?.resume_url && (
                                <a 
                                  href={getResumeUrl(app.student.student_profile.resume_url)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                  title="View Resume"
                                >
                                  <FiDownload className="mr-1" /> Resume
                                </a>
                             )}
                             <button 
                               onClick={() => handleViewProfile(app.student)}
                               className="text-gray-600 hover:text-gray-900 flex items-center" 
                               title="View Full Profile"
                             >
                               <FiExternalLink className="mr-1" /> Profile
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                No applications found.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Internship Modal */}
      {showOppModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiBriefcase className="text-blue-600"/> 
                Add New Internship
              </h3>
              <button onClick={() => setShowOppModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-0">
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
      {/* Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                <p className="text-indigo-100">{selectedStudent.email}</p>
                <div className="mt-2 flex gap-2">
                    {selectedStudent.student_profile?.university && <span className="bg-white/20 px-2 py-1 rounded text-xs">{selectedStudent.student_profile.university}</span>}
                    {selectedStudent.student_profile?.major && <span className="bg-white/20 px-2 py-1 rounded text-xs">{selectedStudent.student_profile.major}</span>}
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
                {/* About */}
                {selectedStudent.student_profile?.bio && (
                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><FiUsers className="mr-2 text-indigo-500"/> About</h4>
                        <p className="text-gray-600 leading-relaxed">{selectedStudent.student_profile.bio}</p>
                    </section>
                )}

                {/* Skills */}
                {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><FiCheck className="mr-2 text-green-500"/> Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedStudent.skills.map(skill => (
                                <span key={skill.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {selectedStudent.student_profile?.work_experiences?.length > 0 && (
                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><FiBriefcase className="mr-2 text-blue-500"/> Experience</h4>
                        <div className="space-y-4">
                            {selectedStudent.student_profile.work_experiences.map((exp, i) => (
                                <div key={i} className="border-l-2 border-gray-200 pl-4 pb-2">
                                    <h5 className="font-bold text-gray-900">{exp.title}</h5>
                                    <p className="text-indigo-600 text-sm font-medium">{exp.company}</p>
                                    <p className="text-gray-500 text-xs mb-1">{exp.start_date} - {exp.end_date || 'Present'}</p>
                                    {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {selectedStudent.student_profile?.projects?.length > 0 && (
                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><FiCpu className="mr-2 text-purple-500"/> Projects</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {selectedStudent.student_profile.projects.map((proj, i) => (
                                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <h5 className="font-bold text-gray-900">{proj.title}</h5>
                                        {proj.url && (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
                                                <FiExternalLink className="mr-1"/> Link
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">{proj.description}</p>
                                    {proj.tech_stack && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {proj.tech_stack.split(',').map((tech, j) => (
                                                <span key={j} className="text-xs bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-600">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {selectedStudent.student_profile?.educations?.length > 0 && (
                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><FiFileText className="mr-2 text-yellow-600"/> Education</h4>
                        <div className="space-y-3">
                            {selectedStudent.student_profile.educations.map((edu, i) => (
                                <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                                    <div>
                                        <h5 className="font-bold text-gray-900">{edu.institution}</h5>
                                        <p className="text-gray-600 text-sm">{edu.degree}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs">{edu.start_year} - {edu.end_year}</p>
                                        {edu.grade && <p className="text-indigo-600 text-xs font-semibold">Grade: {edu.grade}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Readiness */}
                <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800">Readiness Score</h4>
                        <span className="text-2xl font-bold text-indigo-600">{selectedStudent.student_profile?.readiness_score || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${selectedStudent.student_profile?.readiness_score || 0}%` }}
                        ></div>
                    </div>
                </section>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    {selectedStudent.student_profile?.resume_url && (
                        <a 
                            href={getResumeUrl(selectedStudent.student_profile.resume_url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
                        >
                            <FiDownload className="mr-2" /> Download Resume
                        </a>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
