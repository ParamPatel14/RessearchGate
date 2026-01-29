import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunity, applyForOpportunity, analyzeMatch, generateAICoverLetter, generateImprovementPlan } from '../api';
import { FiClock, FiUsers, FiCheckCircle, FiCpu, FiArrowLeft, FiBriefcase, FiAward } from 'react-icons/fi';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ type: '', text: '' });

  // Match Preview State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchPreview, setMatchPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  
  // Loading Animation State
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Analyzing your profile...",
    "Scanning opportunity requirements...",
    "Matching skills and experience...",
    "Calculating final score..."
  ];

  useEffect(() => {
    let interval;
    if (previewLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [previewLoading]);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const data = await getOpportunity(id);
      setOpportunity(data);
    } catch (err) {
      setError("Failed to load opportunity details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      // Pass match score if available from preview
      const score = matchPreview ? matchPreview.score : null;
      const details = matchPreview ? matchPreview : null;
      
      await applyForOpportunity(id, coverLetter, score, details);
      
      setApplyMessage({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage({ type: '', text: '' });
        setCoverLetter('');
      }, 2000);
    } catch (err) {
      setApplyMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to submit application.' });
    }
  };

  const handleCheckMatch = async () => {
    setShowMatchModal(true);
    setMatchPreview(null);
    setPreviewError('');
    setPreviewLoading(true);

    try {
      const data = await analyzeMatch(id);
      setMatchPreview(data);
    } catch (err) {
      setPreviewError(err.response?.data?.detail || "Failed to analyze match");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    try {
      const data = await generateAICoverLetter(id);
      setCoverLetter(data.cover_letter);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate cover letter");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleImproveChances = async () => {
    if (!window.confirm("Generate an improvement plan for this opportunity? This will analyze your gaps and create tasks.")) return;
    try {
        await generateImprovementPlan(id);
        navigate('/improvement-plans');
    } catch (err) {
        alert(err.response?.data?.detail || "Failed to generate improvement plan");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!opportunity) return <div className="text-center mt-10">Opportunity not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
        <FiArrowLeft className="mr-2" /> Back to Opportunities
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                <div className="flex items-center gap-4 text-blue-100">
                    <span className="flex items-center"><FiBriefcase className="mr-1"/> {opportunity.type.replace('_', ' ')}</span>
                    {opportunity.deadline && (
                        <span className="flex items-center"><FiClock className="mr-1"/> Open till: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                    )}
                    <span className="flex items-center"><FiUsers className="mr-1"/> {opportunity.total_slots || 1} Slots</span>
                </div>
            </div>
            {opportunity.funding_amount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg text-center">
                    <p className="text-xs text-blue-100 uppercase font-semibold">Grant Funding</p>
                    <p className="text-xl font-bold">{opportunity.currency} {opportunity.funding_amount.toLocaleString()}</p>
                </div>
            )}
          </div>
        </div>
        
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><FiCheckCircle className="mr-2 text-blue-500"/> Description</h3>
                        <p className="text-gray-600 leading-relaxed">{opportunity.description}</p>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><FiAward className="mr-2 text-purple-500"/> Requirements</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{opportunity.requirements}</p>
                    </section>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-4">Action Center</h4>
                        {opportunity.is_open ? (
                            <div className="space-y-3">
                                <button onClick={() => setShowApplyModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    Apply Now
                                </button>
                                <button onClick={handleCheckMatch} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2">
                                    <FiCpu /> Check AI Match
                                </button>
                                <button onClick={handleImproveChances} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                                    Improve My Chances
                                </button>
                            </div>
                        ) : (
                            <div className="bg-red-100 text-red-800 p-3 rounded-lg text-center font-bold">
                                Applications Closed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl transform transition-all animate-scale-up overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Submit Application</h3>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <div className="p-6">
                {applyMessage.text && (
                    <div className={`p-3 rounded mb-4 ${applyMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {applyMessage.text}
                    </div>
                )}
                <form onSubmit={handleApplySubmit}>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-semibold">Cover Letter</label>
                        <button
                            type="button"
                            onClick={handleGenerateCoverLetter}
                            disabled={isGeneratingCoverLetter}
                            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1 transition disabled:opacity-50"
                        >
                            <FiCpu /> Generate with AI
                        </button>
                    </div>
                    <div className="relative">
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-6 min-h-[200px]"
                            rows="8"
                            placeholder="Why are you the best fit for this role?"
                            required
                            disabled={isGeneratingCoverLetter}
                        />
                        {isGeneratingCoverLetter && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg border border-indigo-100 z-10">
                                <div className="relative mb-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FiCpu className="text-indigo-600 text-sm animate-pulse"/>
                                    </div>
                                </div>
                                <p className="text-indigo-600 font-medium animate-pulse">AI is crafting your cover letter...</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowApplyModal(false)} className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                        <button type="submit" disabled={isGeneratingCoverLetter} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">Submit Application</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Match Preview Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl p-6 relative animate-scale-up border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FiCpu className="text-indigo-600"/> AI Match Analysis</h3>
            
            {previewLoading ? (
                <div className="flex flex-col items-center py-12 px-4 text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <FiCpu className="text-indigo-600 text-xl animate-bounce"/>
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{loadingMessages[loadingStep]}</h4>
                    <p className="text-sm text-gray-500 max-w-xs">Comparing your profile skills, projects, and experience against the internship requirements.</p>
                </div>
            ) : previewError ? (
                <p className="text-red-500">{previewError}</p>
            ) : matchPreview && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`text-5xl font-extrabold ${
                            matchPreview.score >= 80 ? 'text-green-600' :
                            matchPreview.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                            {matchPreview.score}%
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm uppercase font-semibold">Match Score</p>
                            <p className="text-xs text-gray-400">Based on skills & experience</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h5 className="font-bold text-blue-800 mb-1">AI Feedback</h5>
                        <p className="text-blue-900 text-sm leading-relaxed">{matchPreview.explanation}</p>
                    </div>

                    {matchPreview.missing_skills && matchPreview.missing_skills.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h5 className="font-bold text-red-800 mb-2">Missing Skills</h5>
                            <div className="flex flex-wrap gap-2">
                                {matchPreview.missing_skills.map((s, i) => (
                                    <span key={i} className="bg-white text-red-600 px-2 py-1 rounded border border-red-200 text-xs font-semibold">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-6 flex justify-end">
                <button onClick={() => setShowMatchModal(false)} className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 font-medium transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;
