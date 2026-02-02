import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../api';
import { 
  FiFileText, FiCalendar, FiClock, FiCheckCircle, FiXCircle, 
  FiAlertCircle, FiChevronRight, FiBriefcase, FiHash, FiTarget 
} from 'react-icons/fi';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted': 
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: <FiCheckCircle /> };
      case 'rejected': 
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: <FiXCircle /> };
      case 'reviewing': 
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <FiClock /> };
      default: 
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <FiAlertCircle /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
          <p className="text-gray-500 mt-2">Track the status of your internship applications</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
          Total Applications: <span className="text-indigo-600 font-bold">{applications.length}</span>
        </div>
      </div>
      
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
            <FiFileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't applied to any opportunities yet. Browse available internships and start your journey!
          </p>
          <a href="/opportunities" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm">
            Browse Opportunities
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const opportunity = app.opportunity || {};
            
            return (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {app.status}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                      <FiCalendar size={12} />
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {opportunity.title || `Opportunity #${app.opportunity_id}`}
                  </h3>
                  
                  {opportunity.mentor && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                        {opportunity.mentor.name ? opportunity.mentor.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <span className="truncate">{opportunity.mentor.name || 'Unknown Mentor'}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <FiBriefcase className="flex-shrink-0" />
                    <span className="truncate">{opportunity.type ? opportunity.type.replace('_', ' ') : 'Internship'}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <FiTarget className="text-indigo-500" />
                        <span className="font-medium">Match: {Math.round(app.match_score)}%</span>
                    </div>
                    <span className="text-indigo-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details <FiChevronRight />
                    </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedApp.opportunity?.title || 'Application Details'}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <FiHash /> ID: {selectedApp.id}
                    </span>
                    <span>•</span>
                    <span>Applied: {new Date(selectedApp.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Status Section */}
              <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Current Status</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusConfig(selectedApp.status).color}`}>
                        {getStatusConfig(selectedApp.status).icon}
                        {selectedApp.status}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Match Score</p>
                    <div className="text-2xl font-bold text-indigo-600">{Math.round(selectedApp.match_score)}%</div>
                </div>
              </div>

              {/* Cover Letter Section */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText className="text-indigo-500" />
                    Cover Letter
                </h4>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap font-serif text-base">
                  {selectedApp.cover_letter}
                </div>
              </div>

              {/* Additional Details (Future placeholder) */}
              {selectedApp.opportunity && (
                 <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiTarget className="text-indigo-500" />
                        Opportunity Summary
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        {selectedApp.opportunity.mentor && (
                            <p className="text-gray-700 mb-2 flex items-center gap-2">
                                <span className="font-semibold">Mentor:</span> 
                                <span className="bg-white px-2 py-0.5 rounded text-sm border border-blue-100">{selectedApp.opportunity.mentor.name}</span>
                            </p>
                        )}
                        <p className="text-gray-700 mb-2">
                            <span className="font-semibold">Type:</span> {selectedApp.opportunity.type}
                        </p>
                         <p className="text-gray-700 line-clamp-3">
                            <span className="font-semibold">Description:</span> {selectedApp.opportunity.description}
                        </p>
                    </div>
                 </div>
              )}

              {/* Curriculum Section (Only if Accepted) */}
              {selectedApp.status === 'accepted' && selectedApp.opportunity && selectedApp.opportunity.curriculum && (
                 <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FiBriefcase className="text-indigo-500" />
                        Course Curriculum
                    </h4>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApp.opportunity.curriculum}
                    </div>
                 </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
