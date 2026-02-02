import { useState, useEffect } from "react";
import { getResearchGaps, saveResearchGap } from "../api";
import { FaLightbulb, FaRobot } from "react-icons/fa";
import ProposalGuidance from "./ProposalGuidance";
import { 
  FiBookOpen, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiUser, 
  FiBriefcase, 
  FiBookmark,
  FiArrowRight,
  FiActivity,
  FiCheck,
  FiSearch,
  FiMinus,
  FiPlus
} from "react-icons/fi";

const ResearchGapList = ({ mentorId, studentId, mentorName }) => {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedGaps, setSavedGaps] = useState(new Set());
  const [selectedGap, setSelectedGap] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [savingGap, setSavingGap] = useState(null);

  useEffect(() => {
    const fetchGaps = async () => {
      if (!mentorId || !studentId) return;
      
      try {
        setLoading(true);
        const data = await getResearchGaps(mentorId, studentId);
        setGaps(data);
      } catch (err) {
        console.error("Error fetching research gaps:", err);
        setError("Failed to generate research gaps. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGaps();
  }, [mentorId, studentId]);

  const toggleSave = async (index) => {
    if (savedGaps.has(index)) return; // Already saved
    
    const gapToSave = gaps[index];
    setSavingGap(index);
    
    try {
      await saveResearchGap({
        mentor_id: parseInt(mentorId),
        title: gapToSave.title,
        description: gapToSave.description,
        type: gapToSave.type,
        why_gap: gapToSave.why_gap,
        reason_student: gapToSave.reason_student,
        reason_mentor: gapToSave.reason_mentor,
        feasibility_score: gapToSave.feasibility_score,
        confidence_score: gapToSave.confidence_score,
        related_papers: JSON.stringify(gapToSave.related_papers || [])
      });
      
      setSavedGaps(prev => {
        const newSaved = new Set(prev);
        newSaved.add(index);
        return newSaved;
      });
    } catch (err) {
      console.error("Error saving gap:", err);
    } finally {
      setSavingGap(null);
    }
  };

  const handleExplore = (title) => {
    window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-2">
        <div className="flex items-center justify-between mb-4">
           <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
           <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse hidden sm:block"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-indigo-50 shadow-sm p-6 relative overflow-hidden">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="space-y-3 w-full">
                <div className="flex gap-2">
                   <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                   <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-14 w-14 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
            </div>
            <div className="h-16 w-full bg-gray-50 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
               <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
               <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
               <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
               <div className="flex gap-2">
                  <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
               </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex flex-col items-center text-center">
        <FiAlertCircle className="text-3xl mb-2" />
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-sm text-red-600 underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <FiBookOpen className="text-3xl text-gray-400 mx-auto mb-3" />
        <h4 className="text-gray-600 font-bold">No Specific Gaps Found</h4>
        <p className="text-gray-500 text-sm mt-1">
          Try updating your skills or checking back later as the mentor publishes new work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-sm text-white">
            <FaLightbulb className="text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Research Gap Discovery</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Powered by Method-Domain Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-indigo-600">{gaps.length} Potential Directions</div>
            <div className="text-xs text-gray-400">Personalized for your profile</div>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <FiPlus size={20} /> : <FiMinus size={20} />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="grid grid-cols-1 gap-6">
          {gaps.map((gap, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-xl border border-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Top Border Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                     <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                          {gap.type.replace(/_/g, ' ')}
                        </span>
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 cursor-help"
                          title="AI Confidence based on data quality and match strength"
                        >
                          <FiActivity className="text-[9px]" /> {gap.confidence_score}% Confidence
                        </span>
                     </div>
                     <h4 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">
                       {gap.title}
                     </h4>
                  </div>
                  
                  {/* Feasibility Circle */}
                  <div className="flex flex-col items-center group/circle cursor-help" title={`Feasibility Score: ${gap.feasibility_score}% - Based on your skills and topic complexity`}>
                    <div className="relative w-14 h-14 flex items-center justify-center transform group-hover/circle:scale-110 transition-transform">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                        <circle 
                          cx="28" cy="28" r="24" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={150} 
                          strokeDashoffset={150 - (150 * gap.feasibility_score) / 100} 
                          className={`${gap.feasibility_score > 75 ? 'text-green-500' : gap.feasibility_score > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-gray-700">{gap.feasibility_score}%</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mt-1">Feasibility</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-sm border-l-2 border-indigo-100 pl-4 italic bg-gray-50/50 py-2 rounded-r-lg">
                  "{gap.description}"
                </p>
                
                {/* 3-Column Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Why Gap */}
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 hover:bg-orange-50 transition-colors hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold text-xs uppercase tracking-wide">
                      <FiTrendingUp className="text-lg" /> The Opportunity
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{gap.why_gap}</p>
                  </div>
                  
                  {/* Why Student */}
                  <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50 hover:bg-green-50 transition-colors hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-xs uppercase tracking-wide">
                      <FiUser className="text-lg" /> Your Fit
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{gap.reason_student}</p>
                  </div>

                  {/* Why Mentor */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition-colors hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-xs uppercase tracking-wide">
                      <FiBriefcase className="text-lg" /> Lab Alignment
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{gap.reason_mentor}</p>
                  </div>
                </div>
                
                {/* Footer: Papers & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-gray-100">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-2">
                      <FiBookOpen /> Contextual Papers
                    </div>
                    <div className="space-y-1.5">
                      {gap.related_papers.map((paper, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer group/paper" onClick={() => handleExplore(paper)}>
                          <span className="mt-1.5 w-1 h-1 bg-gray-300 rounded-full group-hover/paper:bg-indigo-400"></span>
                          <span className="line-clamp-1 group-hover/paper:line-clamp-none transition-all">{paper}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                     <button 
                      onClick={() => toggleSave(index)}
                      disabled={savingGap === index || savedGaps.has(index)}
                      className={`flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all shadow-sm flex ${
                        savedGaps.has(index) 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 cursor-default' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                     >
                        {savingGap === index ? (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                        ) : savedGaps.has(index) ? (
                          <><FiCheck /> Saved</>
                        ) : (
                          <><FiBookmark /> Save</>
                        )}
                     </button>
                     <button 
                      onClick={() => setSelectedGap(gap)}
                      className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex"
                     >
                        <FaRobot /> Plan Proposal
                     </button>
                     <button 
                      onClick={() => handleExplore(gap.title)}
                      className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm flex"
                     >
                        <FiSearch /> Explore
                     </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedGap && (
        <ProposalGuidance 
            mentorId={mentorId} 
            mentorName={mentorName}
            gap={selectedGap} 
            onClose={() => setSelectedGap(null)} 
        />
      )}
    </div>
  );
};

export default ResearchGapList;