import React, { useState, useEffect } from 'react';
import { getMentorApplications, updateApplicationStatus } from '../api';
import { FaTimes, FaCheck, FaBan, FaSearch, FaFilter } from 'react-icons/fa';
import { FiUser, FiMail, FiMapPin, FiLinkedin, FiGithub, FiGlobe, FiFileText, FiBriefcase, FiBookOpen, FiAward, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MentorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('applications'); // 'applications' or 'plans'
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
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
    setActiveTab('profile');
  };

  const handleStatusChange = async (appId, newStatus) => {
    setStatusUpdating(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      if (selectedApplication && selectedApplication.id === appId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-800 bg-green-100 border-green-300';
      case 'rejected': return 'text-red-800 bg-red-100 border-red-300';
      case 'reviewing': return 'text-amber-800 bg-amber-100 border-amber-300';
      default: return 'text-stone-600 bg-stone-100 border-stone-300';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-[var(--color-academia-charcoal)] font-serif text-xl animate-pulse">Loading Intelligence...</div>
    </div>
  );

  return (
    <div className="bg-stone-50 min-h-screen p-8 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-[var(--color-academia-gold)] pb-6">
          <h1 className="text-4xl font-bold font-serif text-[var(--color-academia-charcoal)] mb-2">Talent Identification</h1>
          <p className="text-stone-600 max-w-2xl text-lg">Review and align with high-potential candidates for your research opportunities.</p>
        </header>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2">
            {['all', 'pending', 'reviewing', 'accepted', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-all capitalize ${
                  filterStatus === status 
                    ? 'bg-[var(--color-academia-charcoal)] text-white shadow-md' 
                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="text-stone-500 font-serif italic">
            Showing {filteredApplications.length} candidates
          </div>
        </div>

        {/* Grid Layout */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-sm shadow-sm border border-stone-200">
            <p className="text-stone-400 text-xl font-serif">No candidates found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-sm border-t-4 border-[var(--color-academia-gold)] shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-academia-cream)] border border-[var(--color-academia-gold)] flex items-center justify-center text-[var(--color-academia-charcoal)] font-bold font-serif text-lg">
                        {app.student?.name ? app.student.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-academia-charcoal)] font-serif text-lg leading-tight">
                          {app.student?.name || "Unknown Candidate"}
                        </h3>
                        <p className="text-xs text-stone-500 uppercase tracking-wider">
                          {app.student?.student_profile?.university || "University N/A"}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-sm text-xs font-bold border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </div>
                  </div>

                  <div className="mb-4 bg-stone-50 p-3 rounded-sm border border-stone-100">
                    <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Applying For</p>
                    <p className="text-sm font-semibold text-[var(--color-academia-charcoal)] line-clamp-1">
                      {app.opportunity?.title || "Unknown Opportunity"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                     <div className="text-center">
                        <span className="block text-2xl font-bold text-[var(--color-academia-gold)] font-serif">
                          {app.match_score}%
                        </span>
                        <span className="text-xs text-stone-400 uppercase">Match</span>
                     </div>
                     <div className="text-right">
                        <span className="block text-sm font-semibold text-stone-600">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-stone-400 uppercase">Date</span>
                     </div>
                  </div>

                  <button
                    onClick={() => handleViewApplication(app)}
                    className="mt-auto w-full py-3 bg-[var(--color-academia-charcoal)] text-white text-sm font-medium tracking-wide hover:bg-stone-800 transition-colors rounded-sm flex items-center justify-center gap-2"
                  >
                    <FiSearch /> Review Profile
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-sm w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[var(--color-academia-charcoal)] text-white p-6 flex justify-between items-start shrink-0">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-white rounded-full border-4 border-[var(--color-academia-gold)] flex items-center justify-center text-[var(--color-academia-charcoal)] text-3xl font-bold font-serif">
                    {selectedApplication.student?.name ? selectedApplication.student.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-serif mb-1">{selectedApplication.student?.name}</h2>
                    <div className="flex gap-4 text-stone-300 text-sm">
                      <span className="flex items-center gap-1"><FiMail /> {selectedApplication.student?.email}</span>
                      {selectedApplication.student?.student_profile?.city && (
                        <span className="flex items-center gap-1"><FiMapPin /> {selectedApplication.student.student_profile.city}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-stone-100 border-b border-stone-200 px-6 flex gap-6 shrink-0 overflow-x-auto">
                {['profile', 'projects', 'experience', 'cover_letter'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === tab 
                        ? 'border-[var(--color-academia-gold)] text-[var(--color-academia-charcoal)]' 
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto grow bg-white">
                
                {activeTab === 'profile' && (
                  <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className="p-4 bg-[var(--color-academia-cream)] border border-[var(--color-academia-gold)] rounded-sm text-center">
                          <div className="text-2xl font-bold text-[var(--color-academia-charcoal)] font-serif">{selectedApplication.match_score}%</div>
                          <div className="text-xs text-stone-500 uppercase">Match Score</div>
                       </div>
                       <div className="p-4 bg-stone-50 border border-stone-200 rounded-sm text-center">
                          <div className="text-lg font-bold text-[var(--color-academia-charcoal)]">
                            {selectedApplication.student?.student_profile?.gpa || "N/A"}
                          </div>
                          <div className="text-xs text-stone-500 uppercase">GPA</div>
                       </div>
                       <div className="p-4 bg-stone-50 border border-stone-200 rounded-sm text-center">
                          <div className="text-lg font-bold text-[var(--color-academia-charcoal)] line-clamp-1">
                            {selectedApplication.student?.student_profile?.major || "N/A"}
                          </div>
                          <div className="text-xs text-stone-500 uppercase">Major</div>
                       </div>
                    </div>

                    <div className="prose max-w-none">
                      <h3 className="font-serif text-[var(--color-academia-charcoal)] border-b border-[var(--color-academia-gold)] pb-2 mb-4">About</h3>
                      <p className="text-stone-700 leading-relaxed">
                        {selectedApplication.student?.student_profile?.bio || "No bio available."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-serif text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-2 mb-4">Education</h3>
                        {selectedApplication.student?.student_profile?.educations?.length > 0 ? (
                           selectedApplication.student.student_profile.educations.map((edu, i) => (
                             <div key={i} className="mb-4 last:mb-0">
                               <div className="font-bold text-[var(--color-academia-charcoal)]">{edu.institution}</div>
                               <div className="text-stone-600">{edu.degree}</div>
                               <div className="text-xs text-stone-400">{edu.start_year} - {edu.end_year}</div>
                             </div>
                           ))
                        ) : (
                          <div className="mb-4">
                             <div className="font-bold text-[var(--color-academia-charcoal)]">
                                {selectedApplication.student?.student_profile?.university || "University not listed"}
                             </div>
                             <div className="text-stone-600">
                                {selectedApplication.student?.student_profile?.degree}
                             </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-serif text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-2 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.student?.student_profile?.primary_skills ? (
                            selectedApplication.student.student_profile.primary_skills.split(',').map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-stone-100 text-stone-700 text-sm rounded-full border border-stone-200">
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-500 italic">No skills listed.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4 pt-4">
                        {selectedApplication.student?.student_profile?.github_url && (
                            <a href={selectedApplication.student.student_profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-[var(--color-academia-charcoal)]">
                              <FiGithub /> GitHub
                            </a>
                        )}
                        {selectedApplication.student?.student_profile?.linkedin_url && (
                            <a href={selectedApplication.student.student_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-[#0077b5]">
                              <FiLinkedin /> LinkedIn
                            </a>
                        )}
                        {selectedApplication.student?.student_profile?.website_url && (
                            <a href={selectedApplication.student.student_profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-[var(--color-academia-gold)]">
                              <FiGlobe /> Portfolio
                            </a>
                        )}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
                    {selectedApplication.student?.student_profile?.projects?.length > 0 ? (
                      selectedApplication.student.student_profile.projects.map((project, i) => (
                        <div key={i} className="bg-stone-50 border border-stone-200 p-6 rounded-sm hover:border-[var(--color-academia-gold)] transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-bold font-serif text-[var(--color-academia-charcoal)]">{project.title}</h4>
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-academia-gold)] hover:underline text-sm flex items-center gap-1">
                                View Project <FiGlobe />
                              </a>
                            )}
                          </div>
                          <p className="text-stone-600 mb-4">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack && project.tech_stack.split(',').map((tech, j) => (
                              <span key={j} className="text-xs font-mono bg-white border border-stone-200 px-2 py-1 text-stone-500 rounded-sm">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-stone-400 italic">
                        No projects listed in this profile.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
                    {selectedApplication.student?.student_profile?.work_experiences?.length > 0 ? (
                      selectedApplication.student.student_profile.work_experiences.map((exp, i) => (
                        <div key={i} className="relative pl-8 border-l-2 border-stone-200 last:border-0 pb-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--color-academia-gold)] border-2 border-white"></div>
                           <h4 className="text-lg font-bold text-[var(--color-academia-charcoal)]">{exp.title}</h4>
                           <div className="text-stone-600 font-medium mb-1">{exp.company}</div>
                           <div className="text-xs text-stone-400 uppercase mb-3">{exp.start_date} - {exp.end_date}</div>
                           <p className="text-stone-600 text-sm leading-relaxed">{exp.description}</p>
                        </div>
                      ))
                    ) : (
                       <div className="text-center py-12 text-stone-400 italic">
                        No work experience listed.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'cover_letter' && (
                  <div className="max-w-3xl mx-auto animate-fade-in">
                    <div className="bg-[var(--color-academia-cream)] p-8 rounded-sm border border-[var(--color-academia-gold)] shadow-inner">
                      <h3 className="font-serif text-2xl mb-6 text-[var(--color-academia-charcoal)]">Statement of Purpose</h3>
                      <div className="prose prose-stone font-serif leading-loose text-stone-800 whitespace-pre-wrap">
                        {selectedApplication.cover_letter || "No cover letter provided."}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="bg-stone-50 border-t border-stone-200 p-6 shrink-0 flex justify-between items-center">
                <div className="text-stone-500 text-sm">
                  Status: <span className={`font-bold uppercase ${
                    selectedApplication.status === 'accepted' ? 'text-green-700' :
                    selectedApplication.status === 'rejected' ? 'text-red-700' : 'text-stone-700'
                  }`}>{selectedApplication.status}</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                    disabled={statusUpdating === selectedApplication.id}
                    className="px-6 py-2 border border-red-300 text-red-700 hover:bg-red-50 font-bold rounded-sm transition-colors flex items-center gap-2"
                  >
                    <FaTimes /> Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                    disabled={statusUpdating === selectedApplication.id}
                    className="px-8 py-2 bg-[var(--color-academia-charcoal)] text-white hover:bg-stone-800 font-bold rounded-sm transition-colors shadow-lg flex items-center gap-2"
                  >
                    {statusUpdating === selectedApplication.id ? 'Processing...' : <><FaCheck /> Accept Candidate</>}
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorApplications;