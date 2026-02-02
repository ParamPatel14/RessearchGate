import React, { useState, useEffect } from 'react';
import { getMentorApplications, updateApplicationStatus, getMentorImprovementPlans } from '../api';
import { FaTimes } from 'react-icons/fa';
import { FiUser, FiMail, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

const MentorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [improvementPlans, setImprovementPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('applications'); // 'applications' or 'plans'
  const [statusUpdating, setStatusUpdating] = useState(null);
  
  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch could be better but sticking to simple for now
      const appsData = await getMentorApplications();
      setApplications(appsData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleStatusChange = async (appId, newStatus) => {
    setStatusUpdating(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      // Update local state
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'reviewing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
      if (!score) return 'text-gray-500';
      if (score >= 80) return 'text-green-600 font-bold';
      if (score >= 50) return 'text-yellow-600 font-bold';
      return 'text-red-600';
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Applications</h2>

      {/* Basic Tab Switcher */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
            className={`py-2 px-4 ${view === 'applications' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500'}`}
            onClick={() => setView('applications')}
        >
            Applications
        </button>
        <button 
            className={`py-2 px-4 ${view === 'plans' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500'}`}
            onClick={() => setView('plans')}
        >
            Improvement Plans (Candidate Progress)
        </button>
      </div>
      
      {view === 'plans' && (
          <div className="p-4 bg-gray-50 rounded text-center text-gray-600">
              <p>Select an opportunity to view active improvement plans.</p>
              {/* This is a placeholder. A real implementation would list opportunities and let the mentor click to see plans. */}
              {/* Since we don't have a "get all my opportunities" call here yet, we'll skip the full implementation for now 
                  to focus on the student side which is the core of Phase 4. */}
              <p className="mt-2 text-sm">(Feature coming in next update: Full dashboard for tracking candidate improvement plans)</p>
          </div>
      )}

      {view === 'applications' && (
      <>
      {applications.length === 0 ? (
        <p className="text-gray-500">No applications received yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Opportunity
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cover Letter
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={app.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className="font-bold text-gray-700">#{index + 1}</span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={getScoreColor(app.match_score)}>
                        {app.match_score ? `${app.match_score}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                {app.student?.name ? app.student.name.charAt(0).toUpperCase() : 'S'}
                             </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-semibold">
                                {app.student?.name || `Student ID: ${app.student_id}`}
                            </p>
                            <button 
                                onClick={() => handleViewProfile(app.student)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            {app.opportunity?.title || `Opp ID: ${app.opportunity_id}`}
                        </span>
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap truncate max-w-xs" title={app.cover_letter}>
                      {app.cover_letter}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${getStatusColor(app.status)}`}
                    >
                      <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                      <span className="relative capitalize">{app.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex flex-col gap-2">
                      {statusUpdating === app.id ? (
                        <span className="text-gray-500">Updating...</span>
                      ) : (
                        <>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(app.id, 'reviewing')}
                                className="text-yellow-600 hover:text-yellow-900 text-xs font-bold border border-yellow-200 px-2 py-1 rounded bg-yellow-50"
                              >
                                Review
                              </button>
                            </>
                          )}
                          {app.status === 'reviewing' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusChange(app.id, 'accepted')}
                                className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-2 py-1 rounded bg-green-50"
                              >
                                Pass (Accept)
                              </button>
                              <button
                                onClick={() => handleStatusChange(app.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-2 py-1 rounded bg-red-50"
                              >
                                Fail (Reject)
                              </button>
                            </div>
                          )}
                          {(app.status === 'accepted' || app.status === 'rejected') && (
                              <span className="text-xs text-gray-400">Decision made</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Student Profile</h3>
                        <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                            <FaTimes size={24} />
                        </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 flex flex-col items-center">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold mb-4">
                                {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <h4 className="text-xl font-bold text-center">{selectedStudent.name}</h4>
                            <p className="text-gray-500 text-sm text-center mb-4">{selectedStudent.email}</p>
                            
                            {selectedStudent.student_profile && (
                                <div className="w-full space-y-2 text-sm text-gray-600">
                                    {selectedStudent.student_profile.university && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Uni:</span> {selectedStudent.student_profile.university}
                                        </div>
                                    )}
                                    {selectedStudent.student_profile.major && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Major:</span> {selectedStudent.student_profile.major}
                                        </div>
                                    )}
                                    {selectedStudent.student_profile.gpa && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">GPA:</span> {selectedStudent.student_profile.gpa}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="md:w-2/3 space-y-6">
                            {selectedStudent.student_profile ? (
                                <>
                                    {selectedStudent.student_profile.bio && (
                                        <div>
                                            <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Bio</h5>
                                            <p className="text-gray-600 text-sm leading-relaxed">{selectedStudent.student_profile.bio}</p>
                                        </div>
                                    )}
                                    
                                    {selectedStudent.student_profile.primary_skills && (
                                        <div>
                                            <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Skills</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudent.student_profile.primary_skills.split(',').map((skill, i) => (
                                                    <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedStudent.student_profile.research_interests && (
                                        <div>
                                            <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Research Interests</h5>
                                            <p className="text-gray-600 text-sm">{selectedStudent.student_profile.research_interests}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">
                                    No detailed profile information available.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={() => setShowProfileModal(false)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MentorApplications;
