import { useState, useEffect } from "react";
import { getSmartMatches } from "../api";
import { FiCpu, FiUser, FiBriefcase, FiAward, FiCheckCircle, FiBook, FiArrowRight, FiActivity, FiTrendingUp, FiMinus } from "react-icons/fi";

const SmartMatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getSmartMatches();
        setMatches(data);
      } catch (err) {
        setError("Failed to load smart matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiUser className="text-indigo-500 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">No Perfect Matches Found Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Try updating your profile with more detailed research interests and skills to help our AI find better connections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiCpu className="text-indigo-600" /> Smart Mentor Matches
            </h2>
            <p className="text-gray-500 mt-1">AI-curated list based on your research profile and skills.</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 text-sm font-medium border border-indigo-100">
            {matches.length} Recommended Mentors
        </div>
      </div>

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
                    <button className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2">
                        View Profile
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                        Apply Now <FiArrowRight />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartMatchList;