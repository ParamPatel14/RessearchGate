import React, { useState, useEffect } from 'react';
import { getMentorApplications, updateApplicationStatus, getMentorImprovementPlans } from '../api';
import { FaTimes } from 'react-icons/fa';
import { FiUser, FiMail, FiMapPin, FiLinkedin, FiGithub, FiGlobe, FiFileText } from 'react-icons/fi';

const MentorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [improvementPlans, setImprovementPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('applications'); // 'applications' or 'plans'
  const [statusUpdating, setStatusUpdating] = useState(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

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
  
  const handleViewApplication = (app) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
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
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto mt-8">
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
                                onClick={() => handleViewApplication(app)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                            >
                                View Application
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
                    <div className="flex items-center gap-3">
                      <p className="text-gray-900 whitespace-nowrap truncate max-w-[220px]" title={app.cover_letter}>
                        {app.cover_letter}
                      </p>
                      <button
                        onClick={() => handleViewApplication(app)}
                        className="text-gray-700 hover:text-gray-900 text-xs font-semibold inline-flex items-center gap-1"
                        title="View Cover Letter"
                      >
                        <FiFileText className="inline-block" /> View
                      </button>
                    </div>
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(app.id, 'reviewing')}
                              className="text-yellow-600 hover:text-yellow-900 text-xs font-bold border border-yellow-200 px-2 py-1 rounded bg-yellow-50"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-2 py-1 rounded bg-green-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-2 py-1 rounded bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
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

      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800">Application Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold mb-4">
                      {selectedApplication.student?.name ? selectedApplication.student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <h4 className="text-xl font-bold text-center">{selectedApplication.student?.name}</h4>
                    <p className="text-gray-500 text-sm text-center mb-1">{selectedApplication.student?.email}</p>
                    {selectedApplication.student?.student_profile && (
                      <>
                        {(selectedApplication.student.student_profile.city || selectedApplication.student.student_profile.country) && (
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
                            <FiMapPin size={14} />
                            <span>
                              {[selectedApplication.student.student_profile.city, selectedApplication.student.student_profile.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-4 mb-6 justify-center">
                          {selectedApplication.student.student_profile.github_url && (
                            <a href={selectedApplication.student.student_profile.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors" title="GitHub">
                              <FiGithub size={20} />
                            </a>
                          )}
                          {selectedApplication.student.student_profile.linkedin_url && (
                            <a href={selectedApplication.student.student_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors" title="LinkedIn">
                              <FiLinkedin size={20} />
                            </a>
                          )}
                          {selectedApplication.student.student_profile.website_url && (
                            <a href={selectedApplication.student.student_profile.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors" title="Portfolio">
                              <FiGlobe size={20} />
                            </a>
                          )}
                        </div>
                        <div className="w-full space-y-2 text-sm text-gray-600">
                          {selectedApplication.student.student_profile.university && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Uni:</span> {selectedApplication.student.student_profile.university}
                            </div>
                          )}
                          {selectedApplication.student.student_profile.major && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Major:</span> {selectedApplication.student.student_profile.major}
                            </div>
                          )}
                          {selectedApplication.student.student_profile.gpa && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">GPA:</span> {selectedApplication.student.student_profile.gpa}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                  {/* Application Specifics */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h5 className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1 flex items-center gap-2">
                      <FiFileText /> Cover Letter
                    </h5>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.cover_letter || "No cover letter provided."}
                    </p>
                    
                    <div className="mt-6 flex gap-3 pt-4 border-t border-blue-200">
                       {statusUpdating === selectedApplication.id ? (
                          <span className="text-gray-500 text-sm font-medium">Updating status...</span>
                       ) : (
                          <>
                            <button
                              onClick={() => handleStatusChange(selectedApplication.id, 'reviewing')}
                              className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${
                                selectedApplication.status === 'reviewing' 
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-2 ring-yellow-400' 
                                  : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                              }`}
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                              className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${
                                selectedApplication.status === 'accepted' 
                                  ? 'bg-green-100 text-green-700 border-green-300 ring-2 ring-green-400' 
                                  : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
                              }`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                              className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${
                                selectedApplication.status === 'rejected' 
                                  ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400' 
                                  : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                              }`}
                            >
                              Reject
                            </button>
                          </>
                       )}
                    </div>
                  </div>

                  {selectedApplication.student?.student_profile ? (
                    <>
                      {selectedApplication.student.student_profile.bio && (
                        <div>
                          <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Bio</h5>
                          <p className="text-gray-600 text-sm leading-relaxed">{selectedApplication.student.student_profile.bio}</p>
                        </div>
                      )}
                      {selectedApplication.student.student_profile.primary_skills && (
                        <div>
                          <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedApplication.student.student_profile.primary_skills.split(',').map((skill, i) => (
                              <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedApplication.student.student_profile.educations && selectedApplication.student.student_profile.educations.length > 0 && (
                        <div>
                          <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Education</h5>
                          <div className="space-y-2">
                            {selectedApplication.student.student_profile.educations.map((edu) => (
                              <div key={edu.id} className="text-sm text-gray-700">
                                <div className="font-semibold">{edu.institution}</div>
                                <div className="text-gray-600">{edu.degree} {edu.start_year && edu.end_year ? `(${edu.start_year} - ${edu.end_year})` : ''}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedApplication.student.student_profile.projects && selectedApplication.student.student_profile.projects.length > 0 && (
                        <div>
                          <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Projects</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedApplication.student.student_profile.projects.map((proj) => (
                              <div key={proj.id} className="p-4 border rounded-lg">
                                <div className="font-semibold text-gray-800">{proj.title}</div>
                                {proj.tech_stack && <div className="text-xs text-indigo-600 mt-1">{proj.tech_stack}</div>}
                                {proj.description && <div className="text-sm text-gray-700 mt-2">{proj.description}</div>}
                                {proj.url && (
                                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-indigo-600 text-xs font-semibold">
                                    View Project
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedApplication.student.student_profile.publications && selectedApplication.student.student_profile.publications.length > 0 && (
                        <div>
                          <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Publications</h5>
                          <div className="space-y-2">
                            {selectedApplication.student.student_profile.publications.map((pub) => (
                              <div key={pub.id} className="text-sm text-gray-700">
                                <div className="font-semibold">{pub.title}</div>
                                {pub.journal_conference && <div className="text-gray-600">{pub.journal_conference}</div>}
                                {pub.url && (
                                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-semibold">
                                    Link
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                      No detailed profile information available.
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">Cover Letter</h5>
                    {selectedApplication.cover_letter ? (
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No cover letter submitted.</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => handleStatusChange(selectedApplication.id, 'reviewing')}
                  className="px-4 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700 font-semibold"
                >
                  Mark Reviewing
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                  className="px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 font-semibold"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                  className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 font-semibold"
                >
                  Reject
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
