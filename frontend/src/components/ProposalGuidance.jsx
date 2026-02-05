import { useState, useEffect } from "react";
import { getProposalGuidance } from "../api";
import { FiClipboard, FiMessageSquare, FiZap, FiCheckCircle, FiLoader, FiX, FiBookOpen, FiTarget, FiAlertCircle } from "react-icons/fi";

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
    <div className="fixed inset-0 bg-[var(--color-academia-charcoal)]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-[var(--color-academia-gold)]">
        {/* Header */}
        <div className="bg-[var(--color-academia-charcoal)] p-6 text-[var(--color-academia-cream)] flex justify-between items-start border-b-4 border-[var(--color-academia-gold)]">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2 tracking-wide">
              <FiZap className="text-[var(--color-academia-gold)]" /> Research Proposal Guidance
            </h2>
            <p className="text-stone-300 text-sm mt-1 opacity-90 font-light">
                {mentorName && <span className="font-bold bg-white/10 px-2 py-0.5 rounded-sm mr-2 text-[var(--color-academia-gold)]">{mentorName}</span>}
                <span className="line-clamp-1 inline-block align-bottom italic">{gap.title}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-[var(--color-academia-gold)] transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FiLoader className="text-[var(--color-academia-gold)] text-4xl animate-spin mb-4" />
              <p className="text-[var(--color-academia-charcoal)] font-serif font-medium text-lg">Analyzing fit and generating strategy...</p>
              <p className="text-sm text-stone-500 mt-2">This may take a few seconds.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-700 bg-red-50 rounded-sm border border-red-200">
              <p className="font-serif font-medium text-lg mb-2 flex items-center justify-center gap-2"><FiAlertCircle /> {error}</p>
              <button 
                onClick={onClose}
                className="mt-4 text-[var(--color-academia-charcoal)] hover:text-[var(--color-academia-gold)] font-medium underline"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              {/* Navigation Tabs */}
              <div className="flex bg-white rounded-sm p-1 shadow-sm border border-stone-200 mb-6">
                <button
                  onClick={() => setActiveTab("direction")}
                  className={`flex-1 py-3 px-4 rounded-sm text-sm font-medium transition-all flex items-center justify-center gap-2 font-serif ${
                    activeTab === "direction"
                      ? "bg-[var(--color-academia-charcoal)] text-[var(--color-academia-gold)] shadow-md"
                      : "text-stone-500 hover:bg-stone-100 hover:text-[var(--color-academia-charcoal)]"
                  }`}
                >
                  <FiBookOpen /> Proposal Direction
                </button>
                <button
                  onClick={() => setActiveTab("talking")}
                  className={`flex-1 py-3 px-4 rounded-sm text-sm font-medium transition-all flex items-center justify-center gap-2 font-serif ${
                    activeTab === "talking"
                      ? "bg-[var(--color-academia-charcoal)] text-[var(--color-academia-gold)] shadow-md"
                      : "text-stone-500 hover:bg-stone-100 hover:text-[var(--color-academia-charcoal)]"
                  }`}
                >
                  <FiMessageSquare /> Talking Points
                </button>
                <button
                  onClick={() => setActiveTab("readiness")}
                  className={`flex-1 py-3 px-4 rounded-sm text-sm font-medium transition-all flex items-center justify-center gap-2 font-serif ${
                    activeTab === "readiness"
                      ? "bg-[var(--color-academia-charcoal)] text-[var(--color-academia-gold)] shadow-md"
                      : "text-stone-500 hover:bg-stone-100 hover:text-[var(--color-academia-charcoal)]"
                  }`}
                >
                  <FiClipboard /> Readiness Check
                </button>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === "direction" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200">
                      <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 border-b border-stone-200 pb-2 flex items-center gap-2">
                        <FiTarget className="text-[var(--color-academia-gold)]" /> Structured Direction
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Problem Statement</h4>
                          <p className="text-[var(--color-academia-charcoal)] leading-relaxed bg-[var(--color-academia-cream)] p-4 rounded-sm border-l-4 border-[var(--color-academia-gold)] font-serif">
                            {guidance.proposal_direction.problem_statement}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Why It Matters</h4>
                                <p className="text-stone-700 text-sm leading-relaxed border-l-2 border-stone-300 pl-3">
                                    {guidance.proposal_direction.why_it_matters}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Missing in Research</h4>
                                <p className="text-stone-700 text-sm leading-relaxed border-l-2 border-stone-300 pl-3">
                                    {guidance.proposal_direction.missing_current_research}
                                </p>
                            </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">High-Level Methodology</h4>
                          <p className="text-[var(--color-academia-charcoal)] leading-relaxed bg-white p-4 rounded-sm border border-stone-200 shadow-sm">
                            {guidance.proposal_direction.methodology}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Expected Contribution</h4>
                          <p className="text-stone-700 leading-relaxed italic">
                            {guidance.proposal_direction.expected_contribution}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--color-academia-cream)] border border-[var(--color-academia-gold)] p-4 rounded-sm flex gap-3 items-start">
                        <FiZap className="text-[var(--color-academia-gold)] mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-[var(--color-academia-charcoal)] font-bold font-serif">Tip: Use this structure to write your initial email or concept note.</p>
                            <p className="text-xs text-stone-600 mt-1">Supervisors value clarity of thought over finished solutions.</p>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === "talking" && (
                  <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200">
                    <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 border-b border-stone-200 pb-2 flex items-center gap-2">
                        <FiMessageSquare className="text-[var(--color-academia-gold)]" /> Supervisor-Aligned Talking Points
                    </h3>
                    <p className="text-stone-500 text-sm mb-6 italic">
                        Use these points to approach the supervisor intelligently—respectful, realistic, and non-pushy.
                    </p>

                    <ul className="space-y-4">
                      {guidance.talking_points.map((point, index) => (
                        <li key={index} className="flex gap-4 items-start p-4 hover:bg-[var(--color-academia-cream)] transition-colors border-b border-stone-100 last:border-0 group">
                          <div className="bg-[var(--color-academia-charcoal)] text-[var(--color-academia-gold)] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="text-[var(--color-academia-charcoal)] leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "readiness" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)]">Feasibility Check</h3>
                          <div className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 border ${
                              guidance.readiness_check.score >= 70 ? 'bg-green-50 text-green-700 border-green-200' : 
                              guidance.readiness_check.score >= 40 ? 'bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] border-[var(--color-academia-gold)]' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                              <span className="text-xs font-normal uppercase opacity-70 tracking-widest">Readiness Score:</span>
                              {guidance.readiness_check.score}%
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {Object.entries(guidance.readiness_check.breakdown).map(([key, value]) => (
                            <div key={key} className="bg-stone-50 p-3 rounded-sm border border-stone-200 text-center">
                                <span className="text-xs text-stone-500 uppercase tracking-widest block mb-1">
                                    {key.replace(/_/g, " ")}
                                </span>
                                <span className={`font-serif font-bold ${
                                    value === 'High' ? 'text-green-600' :
                                    value === 'Medium' ? 'text-[var(--color-academia-gold)]' : 'text-red-500'
                                }`}>
                                    {value}
                                </span>
                            </div>
                        ))}
                      </div>

                      <div>
                          <h4 className="font-serif font-bold text-[var(--color-academia-charcoal)] mb-3 flex items-center gap-2">
                              <FiClipboard className="text-[var(--color-academia-gold)]" /> Actionable Suggestions
                          </h4>
                          <ul className="space-y-2">
                              {guidance.readiness_check.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex gap-3 items-start text-sm text-stone-700 bg-stone-50 p-3 rounded-sm border-l-2 border-[var(--color-academia-gold)]">
                                      <FiCheckCircle className="text-[var(--color-academia-charcoal)] mt-0.5 flex-shrink-0" />
                                      {suggestion}
                                  </li>
                              ))}
                          </ul>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--color-academia-cream)] border border-[var(--color-academia-gold)] p-4 rounded-sm">
                        <p className="text-sm text-[var(--color-academia-charcoal)]">
                            <strong className="font-serif">Note:</strong> A lower score doesn't mean you shouldn't apply. It means you should prepare more in the suggested areas to increase your chances.
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
