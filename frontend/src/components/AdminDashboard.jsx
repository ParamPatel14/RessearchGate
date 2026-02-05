import { useState, useEffect } from "react";
import { getPendingMentors, verifyMentor, getAllStudents, getAllMentors, getOpportunities, createAdminOpportunity, getAllApplications } from "../api";
import { FiCheck, FiX, FiShield, FiUsers, FiBriefcase, FiPlus, FiFileText, FiDownload, FiExternalLink, FiCpu, FiBarChart2, FiHexagon, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import OpportunityForm from "./OpportunityForm";
import AnalyticsDashboard from "./AnalyticsDashboard";
import BeehiveEventList from "./BeehiveEventList";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingMentors, setPendingMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
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
        const data = await getOpportunities(); 
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiShield },
    { id: 'students', label: 'Students', icon: FiUsers },
    { id: 'mentors', label: 'Mentors', icon: FiBriefcase },
    { id: 'internships', label: 'Internships', icon: FiCpu },
    { id: 'applications', label: 'Applications', icon: FiFileText },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'beehive', label: 'Beehive Events', icon: FiHexagon },
  ];

  const filterData = (data, field = 'name') => {
    if (!searchTerm) return data;
    return data.filter(item => {
      const val = field.split('.').reduce((o, i) => o ? o[i] : null, item) || item[field];
      return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-[var(--color-academia-charcoal)] p-8 rounded-sm shadow-xl border border-[var(--color-academia-gold)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-academia-gold)] rounded-full opacity-10 blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-academia-cream)] rounded-full opacity-5 blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[var(--color-academia-cream)] flex items-center mb-2">
              <FiShield className="mr-3 text-[var(--color-academia-gold)]" /> Admin Portal
            </h2>
            <p className="text-[var(--color-academia-gold)] font-light text-lg tracking-wide opacity-90">Platform Management & Intelligence Center</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-sm p-4 border border-white/10 hidden md:block">
            <div className="text-[var(--color-academia-cream)] text-xs uppercase tracking-widest font-bold mb-1">System Status</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-mono text-sm">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-sm shadow-sm border border-stone-200 sticky top-4 z-30">
        <div className="border-b border-stone-200 overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-1 p-2 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative group flex items-center px-6 py-3 font-serif font-bold text-sm rounded-sm transition-all duration-300
                  ${activeTab === tab.id
                    ? 'text-[var(--color-academia-charcoal)]'
                    : 'text-stone-500 hover:text-[var(--color-academia-charcoal)] hover:bg-stone-50'
                  }
                `}
              >
                <tab.icon className={`mr-2 h-4 w-4 relative z-10 transition-colors ${activeTab === tab.id ? 'text-[var(--color-academia-gold)]' : 'text-stone-400 group-hover:text-[var(--color-academia-charcoal)]'}`} />
                <span className="relative z-10">{tab.label}</span>
                
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--color-academia-cream)] border-b-2 border-[var(--color-academia-gold)] rounded-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-[var(--color-academia-gold)] mb-4"></div>
            <p className="text-stone-400 font-serif animate-pulse">Accessing Secure Data...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && (
                <div className="p-2">
                  <AnalyticsDashboard title="Platform Analytics" />
                </div>
              )}

              {/* BEEHIVE TAB */}
              {activeTab === 'beehive' && (
                <div className="p-6 bg-white rounded-sm border border-stone-200 shadow-sm">
                  <BeehiveEventList />
                </div>
              )}

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-serif font-bold text-[var(--color-academia-charcoal)] flex items-center">
                         <span className="w-2 h-8 bg-[var(--color-academia-gold)] mr-3 rounded-sm"></span>
                         Pending Verifications
                       </h3>
                       <span className="bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] text-xs font-bold px-3 py-1 rounded-full">
                         {pendingMentors.length} Pending
                       </span>
                    </div>

                    {pendingMentors.length === 0 ? (
                      <div className="bg-white rounded-sm p-12 text-center border border-dashed border-stone-300 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[var(--color-academia-cream)] rounded-full flex items-center justify-center mb-4">
                            <FiCheck className="text-[var(--color-academia-gold)] text-2xl" />
                        </div>
                        <h4 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)]">All Clear!</h4>
                        <p className="text-stone-500 mt-2 max-w-md">There are no pending mentor verifications at this time. Great job keeping up!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {pendingMentors.map((mentor) => (
                          <div key={mentor.id} className="bg-white border-l-4 border-l-[var(--color-academia-gold)] border-y border-r border-stone-200 rounded-r-sm p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                              <div>
                                <h4 className="font-serif font-bold text-xl text-[var(--color-academia-charcoal)]">{mentor.lab_name}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-600">
                                  <span className="flex items-center gap-1"><FiUsers className="text-[var(--color-academia-gold)]" /> {mentor.university}</span>
                                  <span className="text-stone-300">|</span>
                                  <span className="font-medium italic">{mentor.position}</span>
                                </div>
                                <p className="text-xs text-stone-400 mt-2 font-mono bg-stone-50 inline-block px-2 py-1 rounded-sm border border-stone-100">{mentor.email}</p>
                              </div>
                              <button
                                onClick={() => handleVerify(mentor.user_id)}
                                className="w-full md:w-auto flex items-center justify-center bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] px-6 py-3 rounded-sm hover:bg-black transition-all shadow-md hover:shadow-[var(--color-academia-gold)]/20 font-bold tracking-wide border border-transparent hover:border-[var(--color-academia-gold)] group-hover:translate-x-1"
                              >
                                <FiCheck className="mr-2 text-[var(--color-academia-gold)]" /> Approve & Verify
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Stats / Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-[var(--color-academia-cream)] p-6 rounded-sm border border-[var(--color-academia-gold)]">
                        <h4 className="font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 uppercase tracking-wider text-sm">Quick Actions</h4>
                        <div className="space-y-3">
                            <button onClick={() => setActiveTab('internships')} className="w-full text-left px-4 py-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-sm transition-colors flex items-center justify-between group">
                                <span className="font-medium text-stone-700">Manage Internships</span>
                                <FiExternalLink className="text-stone-400 group-hover:text-[var(--color-academia-gold)]" />
                            </button>
                            <button onClick={() => setActiveTab('students')} className="w-full text-left px-4 py-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-sm transition-colors flex items-center justify-between group">
                                <span className="font-medium text-stone-700">View Students</span>
                                <FiExternalLink className="text-stone-400 group-hover:text-[var(--color-academia-gold)]" />
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
                  <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                    <div className="relative max-w-md w-full">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-sm focus:outline-none focus:border-[var(--color-academia-gold)] font-serif"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-[var(--color-academia-cream)]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">University</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Major</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Readiness</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-stone-100">
                        {filterData(students).map((student) => (
                          <tr key={student.id} className="hover:bg-stone-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] flex items-center justify-center font-serif font-bold mr-3">
                                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[var(--color-academia-charcoal)]">{student.name || "N/A"}</div>
                                        <div className="text-xs text-stone-500">{student.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{student.student_profile?.university || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{student.student_profile?.major || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                              {student.student_profile?.readiness_score ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-[var(--color-academia-gold)] h-full" style={{ width: `${student.student_profile.readiness_score}%` }}></div>
                                    </div>
                                    <span className="font-bold text-xs">{student.student_profile.readiness_score}%</span>
                                </div>
                              ) : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                <button 
                                    onClick={() => handleViewProfile(student)}
                                    className="text-[var(--color-academia-charcoal)] hover:text-[var(--color-academia-gold)] font-medium transition-colors text-xs uppercase tracking-wide border-b border-transparent hover:border-[var(--color-academia-gold)]"
                                >
                                    View Profile
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MENTORS TAB */}
              {activeTab === 'mentors' && (
                <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-[var(--color-academia-cream)]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Mentor</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-stone-100">
                        {mentors.map((mentor) => (
                          <tr key={mentor.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-white border border-[var(--color-academia-gold)] text-[var(--color-academia-charcoal)] flex items-center justify-center font-serif font-bold mr-3">
                                        {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[var(--color-academia-charcoal)]">{mentor.name || "N/A"}</div>
                                        <div className="text-xs text-stone-500">{mentor.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                              {mentor.mentor_profile ? mentor.mentor_profile.university || "-" : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 italic">
                                {mentor.mentor_profile ? mentor.mentor_profile.position || "-" : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                              {mentor.mentor_profile?.is_verified ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-sm bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] items-center gap-1 shadow-sm">
                                  <FiCheck size={10} /> Verified
                                </span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-sm bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] border border-[var(--color-academia-gold)] items-center gap-1">
                                  <FiX size={10} /> Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* INTERNSHIPS TAB */}
              {activeTab === 'internships' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-sm border border-stone-200 shadow-sm">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-[var(--color-academia-charcoal)] flex items-center">
                        <span className="w-2 h-8 bg-[var(--color-academia-gold)] mr-3 rounded-sm"></span>
                        Opportunity Management
                        </h3>
                        <p className="text-stone-500 text-sm mt-1">Create and manage research positions</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowOppModal(true)}
                      className="flex items-center bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] px-6 py-3 rounded-sm hover:bg-black transition-all shadow-md hover:shadow-lg font-bold text-sm border border-transparent hover:border-[var(--color-academia-gold)] group"
                    >
                      <FiPlus className="mr-2 text-[var(--color-academia-gold)] group-hover:rotate-90 transition-transform" /> Add New Opportunity
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="bg-white border border-stone-200 rounded-sm p-6 hover:border-[var(--color-academia-gold)] hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-academia-charcoal)] to-[var(--color-academia-gold)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                           <span className={`inline-block px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border ${
                               opp.type === 'grant' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
                               'bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] border-[var(--color-academia-gold)]'
                           }`}>
                            {opp.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">{new Date(opp.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <h4 className="font-serif font-bold text-lg text-[var(--color-academia-charcoal)] mb-3 group-hover:text-[var(--color-academia-gold)] transition-colors leading-tight">{opp.title}</h4>
                        <p className="text-sm text-stone-600 mb-4 line-clamp-3 flex-grow font-light leading-relaxed">{opp.description}</p>
                        
                        <div className="pt-4 border-t border-stone-100 flex justify-between items-center mt-auto">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-stone-300 border-2 border-white"></div>
                            </div>
                           <span className="text-xs font-bold text-[var(--color-academia-gold)] flex items-center group-hover:underline cursor-pointer">
                             View Details <FiExternalLink className="ml-1" />
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPLICATIONS TAB */}
              {activeTab === 'applications' && (
                <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-[var(--color-academia-cream)]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Applicant</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Opportunity</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Match Score</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-serif font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-stone-100">
                        {applications.map((app) => (
                          <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[var(--color-academia-charcoal)] font-bold font-serif text-xs mr-3 border border-stone-200">
                                    {app.student?.name ? app.student.name.charAt(0) : 'S'}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-[var(--color-academia-charcoal)]">{app.student?.name || "Unknown Student"}</div>
                                  <div className="text-xs text-stone-500">{app.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[var(--color-academia-charcoal)] max-w-xs truncate" title={app.opportunity?.title}>{app.opportunity?.title || "Unknown Opportunity"}</div>
                              <div className="text-xs text-stone-500 capitalize">{app.opportunity?.type?.replace('_', ' ')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-sm border ${
                                app.match_score >= 80 ? 'bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] border-[var(--color-academia-charcoal)]' :
                                app.match_score >= 50 ? 'bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] border-[var(--color-academia-gold)]' :
                                'bg-stone-100 text-stone-500 border-stone-300'
                              }`}>
                                {app.match_score}% Match
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-sm ${
                                app.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                app.status === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                                'bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] border border-[var(--color-academia-gold)]'
                              }`}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                              <div className="flex space-x-3">
                                 {app.student?.student_profile?.resume_url && (
                                    <a 
                                      href={getResumeUrl(app.student.student_profile.resume_url)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-stone-500 hover:text-[var(--color-academia-gold)] transition-colors"
                                      title="View Resume"
                                    >
                                      <FiDownload size={16} />
                                    </a>
                                 )}
                                 <button 
                                   onClick={() => handleViewProfile(app.student)}
                                   className="text-stone-500 hover:text-[var(--color-academia-charcoal)] transition-colors" 
                                   title="View Full Profile"
                                 >
                                   <FiExternalLink size={16} />
                                 </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-stone-500 font-light italic bg-stone-50/50">
                                    No applications found.
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Add Internship Modal */}
      <AnimatePresence>
        {showOppModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-academia-charcoal)]/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-sm shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4 border-2 border-[var(--color-academia-gold)]"
            >
              <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[var(--color-academia-cream)]">
                <h3 className="text-2xl font-serif font-bold text-[var(--color-academia-charcoal)] flex items-center gap-2">
                  <FiBriefcase className="text-[var(--color-academia-gold)]"/> 
                  New Opportunity
                </h3>
                <button onClick={() => setShowOppModal(false)} className="text-stone-400 hover:text-[var(--color-academia-charcoal)] transition-colors p-2 hover:bg-stone-200 rounded-full">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-0">
                <OpportunityForm 
                  onSuccess={() => {
                    setShowOppModal(false);
                    fetchData();
                  }} 
                  customSubmitFunction={createAdminOpportunity}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-academia-charcoal)]/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-sm max-w-2xl w-full mx-4 shadow-2xl overflow-hidden border border-[var(--color-academia-gold)] max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-[var(--color-academia-charcoal)] p-8 text-[var(--color-academia-cream)] flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-academia-gold)] rounded-full opacity-10 transform translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-bold">{selectedStudent.name}</h3>
                  <p className="text-[var(--color-academia-gold)] opacity-90 mt-1 font-mono text-sm">{selectedStudent.email}</p>
                  <div className="mt-4 flex gap-2">
                      {selectedStudent.student_profile?.university && <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-medium tracking-wide">{selectedStudent.student_profile.university}</span>}
                      {selectedStudent.student_profile?.major && <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-sm text-xs font-medium tracking-wide">{selectedStudent.student_profile.major}</span>}
                  </div>
                </div>
                 <button onClick={() => setShowProfileModal(false)} className="text-white/70 hover:text-white transition-colors relative z-10 p-2 hover:bg-white/10 rounded-full">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                  <div>
                      <h4 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-3 flex items-center">
                          <span className="w-1.5 h-1.5 bg-[var(--color-academia-gold)] rounded-full mr-2"></span>
                          About Candidate
                      </h4>
                      <p className="text-stone-600 leading-relaxed font-light text-lg">{selectedStudent.student_profile?.bio || "No bio available."}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 bg-stone-50 p-6 rounded-sm border border-stone-100">
                      <div>
                          <h4 className="text-xs font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider mb-2 opacity-70">GPA / Performance</h4>
                          <p className="text-3xl font-serif font-bold text-[var(--color-academia-gold)]">{selectedStudent.student_profile?.gpa || "N/A"}</p>
                      </div>
                      <div>
                          <h4 className="text-xs font-bold text-[var(--color-academia-charcoal)] uppercase tracking-wider mb-2 opacity-70">Graduation</h4>
                          <p className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)]">{selectedStudent.student_profile?.graduation_year || "N/A"}</p>
                      </div>
                  </div>

                  {selectedStudent.student_profile?.skills && (
                      <div>
                           <h4 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 flex items-center">
                              <span className="w-1.5 h-1.5 bg-[var(--color-academia-gold)] rounded-full mr-2"></span>
                              Skills & Competencies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {selectedStudent.student_profile.skills.split(',').map((skill, i) => (
                                  <span key={i} className="bg-white text-[var(--color-academia-charcoal)] border border-stone-200 px-3 py-1.5 rounded-sm text-sm font-medium shadow-sm hover:border-[var(--color-academia-gold)] transition-colors">
                                      {skill.trim()}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}
                  
                  <div className="pt-6 border-t border-stone-200 flex justify-end">
                       {selectedStudent.student_profile?.resume_url && (
                          <a 
                            href={getResumeUrl(selectedStudent.student_profile.resume_url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] px-6 py-3 rounded-sm hover:bg-black transition-all shadow-md font-bold tracking-wide border border-transparent hover:border-[var(--color-academia-gold)]"
                          >
                            <FiDownload className="mr-2 text-[var(--color-academia-gold)]" /> Download Resume
                          </a>
                       )}
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
