import { useState, useEffect } from "react";
import { getSmartMatches, getProfile, getOpportunities, applyForOpportunity } from "../api";
import ResearchGapList from "./ResearchGapList";
import SavedResearchGapList from "./SavedResearchGapList";
import { FaLightbulb, FaTimes } from "react-icons/fa";
import { FiCpu, FiUser, FiBriefcase, FiAward, FiCheckCircle, FiBook, FiArrowRight, FiActivity, FiTrendingUp, FiMinus, FiBookmark, FiSend } from "react-icons/fi";

const SmartMatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [expandedMentorId, setExpandedMentorId] = useState(null);
  const [activeTab, setActiveTab] = useState("matches"); // "matches" or "saved"
  
  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorOpportunities, setMentorOpportunities] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const [matchesData, profileData] = await Promise.all([
          getSmartMatches(),
          getProfile()
        ]);
        setMatches(matchesData);
        if (profileData.student_profile) {
          setStudentId(profileData.student_profile.id);
        }
      } catch (err) {
        setError("Failed to load smart matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const toggleGaps = (mentorId) => {
    if (expandedMentorId === mentorId) {
      setExpandedMentorId(null);
    } else {
      setExpandedMentorId(mentorId);
    }
  };

  const handleApplyClick = async (mentor) => {
    setSelectedMentor(mentor);
    setShowApplyModal(true);
    setLoadingOpportunities(true);
    setMentorOpportunities([]);
    setSelectedOpportunityId(null);
    setCoverLetter("");
    setApplySuccess(false);
    
    try {
      console.log("Fetching opportunities for mentor:", mentor.mentor_id); // Debug log
      const opportunities = await getOpportunities({ mentor_id: mentor.mentor_id });
      console.log("Fetched opportunities:", opportunities); // Debug log
      
      // Filter only open opportunities
      const openOpportunities = opportunities.filter(op => op.is_open);
      setMentorOpportunities(openOpportunities);
      if (openOpportunities.length > 0) {
        setSelectedOpportunityId(openOpportunities[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch opportunities", err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedOpportunityId) return;
    
    setApplying(true);
    try {
      await applyForOpportunity(selectedOpportunityId, coverLetter, selectedMentor.match_score);
      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      // Check if error message indicates duplicate application
      if (err.response && err.response.status === 400 && err.response.data.detail === "You have already applied to this opportunity") {
          alert("You have already applied to this opportunity.");
      } else {
          alert("Failed to submit application. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <FiCpu className="text-indigo-600 text-2xl animate-pulse"/>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Finding Your Best Matches...</h3>
        <p className="text-gray-500 mt-2">Analyzing research interests, skills, and lab requirements.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
        <FiActivity className="mx-auto text-4xl mb-4" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiCpu className="text-indigo-600" /> Research Intelligence
            </h2>
            <p className="text-gray-500 mt-1">AI-powered matching and research gap discovery.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "matches" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiUser /> Smart Matches
            {matches.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px]">
                {matches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "saved" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiBookmark /> Saved Gaps
          </button>
        </div>
      </div>

      {activeTab === "saved" ? (
        <SavedResearchGapList />
      ) : (
        <>
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-indigo-500 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Perfect Matches Found Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                Try updating your profile with more detailed research interests and skills to help our AI find better connections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {matches.map((match, index) => (
                <div 
                  key={match.mentor_id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Score Panel */}
                    <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 p-6 flex flex-col items-center justify-center text-white min-w-[140px] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 mix-blend-overlay"></div>
                      <div className="relative z-10 text-center">
                          <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Match Score</span>
                          <div className="text-5xl font-bold my-2">{match.match_score}%</div>
                          
                          <div className="mt-4 space-y-2 w-full">
                              <div className="flex justify-between text-xs opacity-90">
                                  <span>Semantic</span>
                                  <span>{match.semantic_score}%</span>
                              </div>
                              <div className="w-full bg-indigo-900/50 rounded-full h-1.5">
                                  <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${match.semantic_score}%` }}></div>
                              </div>
                              
                              <div className="flex justify-between text-xs opacity-90 mt-2">
                                  <span>Profile</span>
                                  <span>{match.alignment_score}%</span>
                              </div>
                               <div className="w-full bg-indigo-900/50 rounded-full h-1.5">
                                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${match.alignment_score}%` }}></div>
                              </div>
                          </div>
                      </div>
                    </div>

                    {/* Right: Content Panel */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                              <div>
                                  <h3 className="text-xl font-bold text-gray-800">{match.mentor_name}</h3>
                                  <div className="text-indigo-600 font-medium flex items-center gap-2">
                                      <FiBriefcase className="text-sm" />
                                      {match.position} at {match.institution}
                                  </div>
                              </div>
                              {match.accepting_students === 'Yes' && (
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                      <FiCheckCircle /> Hiring
                                  </span>
                              )}
                          </div>

                          {/* Research Areas Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                              {match.research_areas && match.research_areas.split(',').slice(0, 3).map((area, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                      {area.trim()}
                                  </span>
                              ))}
                              {match.research_areas && match.research_areas.split(',').length > 3 && (
                                  <span className="text-xs text-gray-400 flex items-center">+{match.research_areas.split(',').length - 3} more</span>
                              )}
                          </div>

                          {/* Research Trends (Phase 3) */}
                          {match.trends && match.trends.length > 0 && (
                              <div className="mb-4">
                                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center gap-1">
                                      <FiActivity className="text-indigo-500" /> Recent Research Focus
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                      {match.trends.map((trend, idx) => (
                                          <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                                              trend.status === 'Rising' 
                                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                                          }`}>
                                              {trend.status === 'Rising' ? <FiTrendingUp /> : <FiMinus className="rotate-90" />}
                                              <span>{trend.topic}</span>
                                              {trend.status === 'Rising' && <span className="ml-1 text-[10px] bg-green-200 px-1 rounded-full">Rising</span>}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {/* AI Explanation Box */}
                          <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100 mb-4">
                              <div className="flex gap-3">
                                  <div className="mt-1">
                                      <FiCpu className="text-indigo-500" />
                                  </div>
                                  <div>
                                      <h4 className="text-sm font-bold text-indigo-900 mb-1">Why this match?</h4>
                                      <p className="text-sm text-indigo-800/80 leading-relaxed">
                                          {match.explanation}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-2">
                          <button 
                              onClick={() => toggleGaps(match.mentor_id)}
                              className={`text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all border ${
                                  expandedMentorId === match.mentor_id 
                                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner" 
                                      : "bg-white border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm"
                              }`}
                          >
                              <FaLightbulb className={expandedMentorId === match.mentor_id ? "fill-current" : ""} />
                              {expandedMentorId === match.mentor_id ? "Hide Gaps" : "Discover Gaps"}
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2">
                              View Profile
                          </button>
                          <button 
                            onClick={() => handleApplyClick(match)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                          >
                              Apply Now <FiArrowRight />
                          </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedMentorId === match.mentor_id && studentId && (
                      <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                          <ResearchGapList mentorId={match.mentor_id} studentId={studentId} />
                      </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Apply to Lab</h3>
                  <p className="text-indigo-600 font-medium">{selectedMentor.mentor_name}</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {loadingOpportunities ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : mentorOpportunities.length === 0 ? (
                 <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">This mentor has no open opportunities at the moment.</p>
                    <button onClick={() => setShowApplyModal(false)} className="text-indigo-600 font-bold hover:underline">
                      Close
                    </button>
                 </div>
              ) : applySuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-3xl" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Application Sent!</h4>
                  <p className="text-gray-500">Your application has been successfully submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Opportunity</label>
                    <div className="space-y-3">
                      {mentorOpportunities.map((op) => (
                        <div 
                          key={op.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOpportunityId === op.id 
                              ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                          onClick={() => setSelectedOpportunityId(op.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedOpportunityId === op.id ? "border-indigo-600" : "border-gray-400"
                            }`}>
                              {selectedOpportunityId === op.id && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{op.title}</p>
                              <p className="text-xs text-gray-500">{op.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                    <textarea
                      required
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Introduce yourself and explain why you're a good fit..."
                      className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying || !selectedOpportunityId}
                      className={`px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-2 ${
                        (applying || !selectedOpportunityId) ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {applying ? "Sending..." : "Submit Application"}
                      {!applying && <FiSend />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMatchList;