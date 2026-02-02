import { useState, useEffect } from "react";
import { getSavedResearchGaps, deleteSavedResearchGap } from "../api";
import { 
  FiBookmark, 
  FiTrash2, 
  FiSearch, 
  FiBookOpen, 
  FiAlertCircle, 
  FiUser, 
  FiBriefcase,
  FiActivity,
  FiTrendingUp
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import ProposalGuidance from "./ProposalGuidance";

const SavedResearchGapList = () => {
  const [savedGaps, setSavedGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSavedGaps();
  }, []);

  const fetchSavedGaps = async () => {
    try {
      setLoading(true);
      const data = await getSavedResearchGaps();
      // Parse related_papers if it's a string
      const parsedData = data.map(gap => ({
        ...gap,
        related_papers: typeof gap.related_papers === 'string' 
          ? JSON.parse(gap.related_papers) 
          : gap.related_papers
      }));
      setSavedGaps(parsedData);
    } catch (err) {
      console.error("Error fetching saved gaps:", err);
      setError("Failed to load saved research gaps.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this saved gap?")) return;
    
    try {
      setDeletingId(id);
      await deleteSavedResearchGap(id);
      setSavedGaps(prev => prev.filter(gap => gap.id !== id));
    } catch (err) {
      console.error("Error deleting gap:", err);
      alert("Failed to delete saved gap");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExplore = (title) => {
    window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-gray-500">Loading your saved discoveries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
        <FiAlertCircle className="text-3xl mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (savedGaps.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FiBookmark className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">No Saved Gaps Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
          Explore mentors and use the "Save" button on interesting research gaps to collect them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiBookmark className="text-indigo-600" /> Saved Research Gaps
        </h2>
        <span className="text-sm text-gray-500">{savedGaps.length} items saved</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {savedGaps.map((gap) => (
          <div 
            key={gap.id} 
            className="group bg-white rounded-xl border border-indigo-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            
            <div className="p-6 pl-8">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                   <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                        {gap.type.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <FiActivity className="text-[9px]" /> {gap.confidence_score}% Confidence
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        Saved on {new Date(gap.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   <h4 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                     {gap.title}
                   </h4>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle 
                        cx="24" cy="24" r="20" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={125} 
                        strokeDashoffset={125 - (125 * gap.feasibility_score) / 100} 
                        className={`${gap.feasibility_score > 75 ? 'text-green-500' : gap.feasibility_score > 50 ? 'text-yellow-500' : 'text-red-500'}`} 
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-gray-700">{gap.feasibility_score}%</span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase mt-1">Feasibility</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm italic border-l-2 border-indigo-100 pl-3">
                "{gap.description}"
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1 text-gray-700 font-bold text-[10px] uppercase tracking-wide">
                       <FiTrendingUp /> Opportunity
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">{gap.why_gap}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1 text-gray-700 font-bold text-[10px] uppercase tracking-wide">
                       <FiUser /> Your Fit
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">{gap.reason_student}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1 text-gray-700 font-bold text-[10px] uppercase tracking-wide">
                       <FiBriefcase /> Lab Fit
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">{gap.reason_mentor}</p>
                 </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleExplore(gap.title)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                 >
                    <FiSearch /> Explore on Google Scholar
                 </button>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(gap.id)}
                      disabled={deletingId === gap.id}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-1"
                    >
                       {deletingId === gap.id ? (
                         <div className="animate-spin h-3 w-3 border-2 border-red-600 rounded-full border-t-transparent"></div>
                       ) : (
                         <><FiTrash2 /> Remove</>
                       )}
                    </button>
                    <button 
                      onClick={() => setSelectedGap(gap)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                       <FaRobot /> Plan Proposal
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGap && (
        <ProposalGuidance 
            mentorId={selectedGap.mentor_id} 
            gap={selectedGap} 
            onClose={() => setSelectedGap(null)} 
        />
      )}
    </div>
  );
};

export default SavedResearchGapList;