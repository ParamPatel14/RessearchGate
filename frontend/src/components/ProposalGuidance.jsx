import { useState, useEffect } from "react";
import { getProposalGuidance } from "../api";
import { FaClipboardCheck, FaComments, FaLightbulb, FaCheckCircle, FaSpinner, FaTimes } from "react-icons/fa";

const ProposalGuidance = ({ mentorId, gap, onClose, mentorName }) => {
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("direction"); // direction, talking, readiness

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        setLoading(true);
        const data = await getProposalGuidance(mentorId, gap.title, gap.description);
        setGuidance(data);
      } catch (err) {
        setError("Failed to generate guidance. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (mentorId && gap) {
      fetchGuidance();
    }
  }, [mentorId, gap]);

  if (!gap) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaLightbulb className="text-yellow-300" /> Research Proposal Guidance
            </h2>
            <p className="text-indigo-100 text-sm mt-1 opacity-90">
                {mentorName && <span className="font-bold bg-white/20 px-2 py-0.5 rounded mr-2">{mentorName}</span>}
                <span className="line-clamp-1 inline-block align-bottom">{gap.title}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FaSpinner className="text-indigo-600 text-4xl animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Analyzing fit and generating strategy...</p>
              <p className="text-xs text-gray-400 mt-2">This may take a few seconds.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
              <p className="font-medium">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              {/* Navigation Tabs */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("direction")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === "direction"
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <FaLightbulb /> Proposal Direction
                </button>
                <button
                  onClick={() => setActiveTab("talking")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === "talking"
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <FaComments /> Talking Points
                </button>
                <button
                  onClick={() => setActiveTab("readiness")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === "readiness"
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <FaClipboardCheck /> Readiness Check
                </button>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === "direction" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Structured Direction</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">Problem Statement</h4>
                          <p className="text-gray-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                            {guidance.proposal_direction.problem_statement}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">Why It Matters</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {guidance.proposal_direction.why_it_matters}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">Missing in Research</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {guidance.proposal_direction.missing_current_research}
                                </p>
                            </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">High-Level Methodology</h4>
                          <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {guidance.proposal_direction.methodology}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-1">Expected Contribution</h4>
                          <p className="text-gray-700 leading-relaxed">
                            {guidance.proposal_direction.expected_contribution}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
                        <FaLightbulb className="text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Tip: Use this structure to write your initial email or concept note.</p>
                            <p className="text-xs text-blue-600 mt-1">Supervisors value clarity of thought over finished solutions.</p>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === "talking" && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Supervisor-Aligned Talking Points</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Use these points to approach the supervisor intelligently—respectful, realistic, and non-pushy.
                    </p>

                    <ul className="space-y-4">
                      {guidance.talking_points.map((point, index) => (
                        <li key={index} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                          <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "readiness" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-gray-800">Feasibility Check</h3>
                          <div className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${
                              guidance.readiness_check.score >= 70 ? 'bg-green-100 text-green-700' : 
                              guidance.readiness_check.score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                              <span className="text-sm font-normal uppercase opacity-70">Readiness Score:</span>
                              {guidance.readiness_check.score}%
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {Object.entries(guidance.readiness_check.breakdown).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                    {key.replace(/_/g, " ")}
                                </span>
                                <span className={`font-bold ${
                                    value === 'High' ? 'text-green-600' :
                                    value === 'Medium' ? 'text-yellow-600' : 'text-red-500'
                                }`}>
                                    {value}
                                </span>
                            </div>
                        ))}
                      </div>

                      <div>
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <FaClipboardCheck className="text-indigo-600" /> Actionable Suggestions
                          </h4>
                          <ul className="space-y-2">
                              {guidance.readiness_check.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex gap-2 items-start text-sm text-gray-600 bg-indigo-50/50 p-2 rounded border border-indigo-50">
                                      <FaCheckCircle className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                      {suggestion}
                                  </li>
                              ))}
                          </ul>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> A lower score doesn't mean you shouldn't apply. It means you should prepare more in the suggested areas to increase your chances.
                        </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalGuidance;
