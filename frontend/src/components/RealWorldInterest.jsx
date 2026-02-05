import React, { useState, useEffect } from 'react';
import { createInterest, getInterests } from '../api';
import { FiBriefcase, FiLayers, FiCpu, FiCheckCircle, FiClock } from "react-icons/fi";

const RealWorldInterest = () => {
  const [interestArea, setInterestArea] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [submittedInterests, setSubmittedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const data = await getInterests();
      setSubmittedInterests(data);
    } catch (err) {
      console.error("Failed to fetch interests", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createInterest({
        interest_area: interestArea,
        preferred_industry: preferredIndustry,
        current_skills: currentSkills
      });
      setInterestArea('');
      setPreferredIndustry('');
      setCurrentSkills('');
      fetchInterests(); // Refresh list
    } catch (err) {
      setError("Failed to submit interest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-sm border border-[var(--color-academia-gold)] shadow-sm">
      <h2 className="text-xl font-serif font-bold text-[var(--color-academia-charcoal)] mb-4 flex items-center gap-2">
        <FiBriefcase className="text-[var(--color-academia-gold)]" /> Real World Project Interest
      </h2>
      <p className="text-stone-600 mb-6 font-light leading-relaxed">
        Express your interest in working on real-world projects. We will connect you with industry partners based on your skills and preferences.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 mb-8">
        <div>
          <label className="block text-sm font-serif font-bold text-[var(--color-academia-charcoal)] mb-2">Area of Interest</label>
          <div className="relative">
            <FiLayers className="absolute top-3.5 left-3 text-stone-400" />
            <input
                type="text"
                required
                className="w-full pl-10 p-3 bg-white border border-stone-300 rounded-sm focus:border-[var(--color-academia-gold)] focus:ring-1 focus:ring-[var(--color-academia-gold)] transition-colors placeholder-stone-400"
                placeholder="e.g. AI, Web Development, IoT"
                value={interestArea}
                onChange={(e) => setInterestArea(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-serif font-bold text-[var(--color-academia-charcoal)] mb-2">Preferred Industry</label>
          <div className="relative">
             <FiBriefcase className="absolute top-3.5 left-3 text-stone-400" />
             <input
                type="text"
                className="w-full pl-10 p-3 bg-white border border-stone-300 rounded-sm focus:border-[var(--color-academia-gold)] focus:ring-1 focus:ring-[var(--color-academia-gold)] transition-colors placeholder-stone-400"
                placeholder="e.g. Fintech, Healthcare, Automotive"
                value={preferredIndustry}
                onChange={(e) => setPreferredIndustry(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-serif font-bold text-[var(--color-academia-charcoal)] mb-2">Current Skills</label>
          <div className="relative">
             <FiCpu className="absolute top-3.5 left-3 text-stone-400" />
            <textarea
                className="w-full pl-10 p-3 bg-white border border-stone-300 rounded-sm focus:border-[var(--color-academia-gold)] focus:ring-1 focus:ring-[var(--color-academia-gold)] transition-colors placeholder-stone-400 resize-none"
                rows="3"
                placeholder="List your relevant skills..."
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-700 text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-sm font-serif font-bold text-[var(--color-academia-cream)] shadow-sm hover:shadow-md transition-all duration-300 ${
            loading ? 'bg-stone-400 cursor-not-allowed' : 'bg-[var(--color-academia-charcoal)] hover:bg-black'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Interest'}
        </button>
      </form>

      {submittedInterests.length > 0 && (
        <div className="mt-10 border-t border-[var(--color-academia-gold)] pt-6">
          <h3 className="text-lg font-serif font-bold text-[var(--color-academia-charcoal)] mb-4">Your Submitted Interests</h3>
          <div className="space-y-4">
            {submittedInterests.map((interest) => (
              <div key={interest.id} className="bg-[var(--color-academia-cream)] p-5 rounded-sm border border-stone-200 hover:border-[var(--color-academia-gold)] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-[var(--color-academia-charcoal)] text-lg">{interest.interest_area}</h4>
                    <p className="text-sm text-stone-600 mt-1"><span className="font-bold text-[var(--color-academia-charcoal)]">Industry:</span> {interest.preferred_industry || 'Any'}</p>
                    <p className="text-sm text-stone-600 mt-1"><span className="font-bold text-[var(--color-academia-charcoal)]">Skills:</span> {interest.current_skills}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-sm border ${
                    interest.status === 'connected' 
                        ? 'bg-green-50 text-green-800 border-green-200 flex items-center gap-1' 
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1'
                  }`}>
                    {interest.status === 'connected' ? <FiCheckCircle /> : <FiClock />}
                    {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldInterest;
