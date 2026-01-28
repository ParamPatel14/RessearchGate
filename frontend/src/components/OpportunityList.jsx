import React, { useState, useEffect } from 'react';
import { getOpportunities, applyForOpportunity, getMatchPreview, generateImprovementPlan } from '../api';
import { useNavigate } from 'react-router-dom';

const OpportunityList = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  // Application State
  const [applyingId, setApplyingId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Match Preview State
  const [matchPreview, setMatchPreview] = useState(null); // { score, details }
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, [filterType]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const filters = filterType ? { type: filterType } : {};
      const data = await getOpportunities(filters);
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to fetch opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (id) => {
    setApplyingId(id);
    setCoverLetter('');
    setMessage({ type: '', text: '' });
  };

  const handleCancelApply = () => {
    setApplyingId(null);
    setCoverLetter('');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      await applyForOpportunity({
        opportunity_id: applyingId,
        cover_letter: coverLetter
      });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => {
        setApplyingId(null);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to submit application.' });
    }
  };

  const handleCheckMatch = async (id) => {
      setMatchPreview(null);
      setPreviewError('');
      setPreviewLoading(true);
      // Open modal placeholder? Or just set loading state for that item?
      // Let's use a single modal for simplicity
      setApplyingId('PREVIEW_' + id); // Hack to reuse modal logic or just distinct ID

      try {
          const data = await getMatchPreview(id);
          setMatchPreview(data);
      } catch (err) {
          console.error(err);
          setPreviewError(err.response?.data?.detail || "Failed to get match preview");
      } finally {
          setPreviewLoading(false);
      }
  };
  
  const closeMatchModal = () => {
      setApplyingId(null);
      setMatchPreview(null);
  }

  const handleImproveChances = async (id) => {
    if (!window.confirm("Generate an improvement plan for this opportunity? This will analyze your gaps and create tasks.")) return;
    
    try {
        await generateImprovementPlan(id);
        navigate('/improvement-plans');
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Failed to generate improvement plan");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Browse Opportunities</h2>

      {/* Filter */}
      <div className="mb-6">
        <label className="mr-2 font-medium text-gray-700">Filter by Type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="research_assistant">Research Assistant</option>
          <option value="phd_guidance">PhD Guidance</option>
          <option value="grant">Grant / Collaboration</option>
        </select>
      </div>

      {loading ? (
        <p>Loading opportunities...</p>
      ) : (
        <div className="space-y-6">
          {opportunities.length === 0 ? (
            <p className="text-gray-500">No opportunities found.</p>
          ) : (
            opportunities.map((opp) => (
              <div key={opp.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-600">{opp.title}</h3>
                    <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 mt-2">
                      {opp.type.replace('_', ' ')}
                    </span>
                    <p className="text-gray-600 mt-2">{opp.description}</p>
                    {opp.requirements && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700">Requirements:</h4>
                        <p className="text-gray-600 text-sm">{opp.requirements}</p>
                      </div>
                    )}
                    
                    {opp.type === 'grant' && opp.funding_amount > 0 && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100 inline-block">
                        <p className="text-sm font-semibold text-blue-800">
                          Grant Funding: {opp.currency} {opp.funding_amount.toLocaleString()}
                        </p>
                        {opp.grant_agency && (
                           <p className="text-xs text-blue-600">Agency: {opp.grant_agency}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {opp.is_open ? (
                        <>
                        <button
                        onClick={() => handleApplyClick(opp.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                        Apply Now
                        </button>
                        <button
                            onClick={() => handleCheckMatch(opp.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                        >
                            Check Match
                        </button>
                        <button
                            onClick={() => handleImproveChances(opp.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm"
                        >
                            Improve My Chances
                        </button>
                        </>
                    ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Closed
                        </span>
                    )}
                  </div>
                </div>

                {/* Apply Modal (Inline) */}
                {applyingId === opp.id && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-lg mb-2">Submit Application</h4>
                    {message.text && (
                      <div className={`p-3 rounded mb-3 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                      </div>
                    )}
                    <form onSubmit={handleSubmitApplication}>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Cover Letter</label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        rows="4"
                        placeholder="Explain why you are a good fit..."
                        required
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleCancelApply}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Match Preview Modal (Inline) */}
                {applyingId === 'PREVIEW_' + opp.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-lg w-full m-4">
                            <h3 className="text-xl font-bold mb-4">Match Analysis</h3>
                            
                            {previewLoading && <p>Analyzing skills...</p>}
                            {previewError && <p className="text-red-500">{previewError}</p>}
                            
                            {matchPreview && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`text-4xl font-bold ${
                                            matchPreview.match_score >= 80 ? 'text-green-600' :
                                            matchPreview.match_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {matchPreview.match_score}%
                                        </div>
                                        <div className="text-gray-600">Match Score</div>
                                    </div>
                                    
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {/* Missing Skills */}
                                        {matchPreview.details.missing_critical.length > 0 && (
                                            <div className="bg-red-50 p-3 rounded">
                                                <h5 className="font-bold text-red-800 mb-1">Missing Critical Skills</h5>
                                                <ul className="list-disc pl-5 text-red-700">
                                                    {matchPreview.details.missing_critical.map(s => <li key={s}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {matchPreview.details.missing_important.length > 0 && (
                                            <div className="bg-yellow-50 p-3 rounded">
                                                <h5 className="font-bold text-yellow-800 mb-1">Missing Important Skills</h5>
                                                <ul className="list-disc pl-5 text-yellow-700">
                                                    {matchPreview.details.missing_important.map(s => <li key={s}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Matched Skills */}
                                        {matchPreview.details.matched_skills.length > 0 && (
                                            <div className="bg-green-50 p-3 rounded">
                                                <h5 className="font-bold text-green-800 mb-1">Matched Skills</h5>
                                                <ul className="list-disc pl-5 text-green-700">
                                                    {matchPreview.details.matched_skills.map(s => <li key={s}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={closeMatchModal}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunityList;
