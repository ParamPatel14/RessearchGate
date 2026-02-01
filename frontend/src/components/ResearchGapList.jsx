import { useState, useEffect } from "react";
import { getResearchGaps } from "../api";
import { FiLightbulb, FiBookOpen, FiTarget, FiTrendingUp, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ResearchGapList = ({ mentorId, studentId }) => {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="p-6 bg-indigo-50/50 rounded-lg border border-indigo-100 flex flex-col items-center justify-center text-center animate-pulse">
        <FiLightbulb className="text-3xl text-indigo-400 mb-3" />
        <p className="text-indigo-800 font-medium">Analyzing research landscape...</p>
        <p className="text-indigo-600/70 text-sm mt-1">Identifying high-potential gaps for you</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm flex items-start gap-2">
        <FiAlertCircle className="mt-0.5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No specific research gaps identified yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <FiLightbulb className="text-yellow-500" />
        <h3 className="font-bold text-gray-800">Research Gap Opportunities</h3>
      </div>
      
      {gaps.map((gap, index) => (
        <div key={index} className="bg-white rounded-lg border border-indigo-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-indigo-900 text-lg">{gap.title}</h4>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium border border-indigo-200">
              {gap.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed text-sm">{gap.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <div className="flex items-center gap-2 mb-1 text-blue-800 font-semibold text-xs uppercase tracking-wide">
                <FiTrendingUp /> Why it's a gap
              </div>
              <p className="text-blue-900/80 text-sm">{gap.why_gap}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-md border border-green-100">
              <div className="flex items-center gap-2 mb-1 text-green-800 font-semibold text-xs uppercase tracking-wide">
                <FiCheckCircle /> Feasibility
              </div>
              <div className="flex items-center justify-between">
                 <p className="text-green-900/80 text-sm">{gap.reason_student}</p>
                 <span className="font-bold text-green-700">{gap.feasibility_score}%</span>
              </div>
            </div>
          </div>
          
          {gap.related_papers && gap.related_papers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                <FiBookOpen /> Related Papers
              </div>
              <ul className="space-y-1">
                {gap.related_papers.map((paper, idx) => (
                  <li key={idx} className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                    {paper}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResearchGapList;
