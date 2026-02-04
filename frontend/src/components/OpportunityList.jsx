import React, { useState, useEffect, useRef } from 'react';
import { getOpportunities, getVisits, getBeehiveEvents } from '../api';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiBriefcase, FiArrowRight, FiUser, FiSearch, FiFilter, FiMapPin, FiCalendar, FiHexagon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OpportunityList = ({ initialFilters = {} }) => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  // Ref to track if we've already fetched for these filters to prevent loops
  const lastFiltersRef = useRef(null);

  useEffect(() => {
    const currentFilters = { ...initialFilters, ...(filterType ? { type: filterType } : {}) };
    const filtersString = JSON.stringify(currentFilters);

    // Only fetch if filters have actually changed
    if (lastFiltersRef.current !== filtersString) {
      fetchOpportunities(currentFilters);
      lastFiltersRef.current = filtersString;
    }
  }, [filterType, JSON.stringify(initialFilters)]);

  const fetchOpportunities = async (filters) => {
    setLoading(true);
    try {
      let data = [];
      if (filters.type === 'industrial_visit') {
        data = await getVisits();
        // Normalize data for display
        data = data.map(item => ({
            ...item,
            type: 'industrial_visit',
            mentor: item.organizer, // Map organizer to mentor for UI consistency
            deadline: item.visit_date // Use visit date as deadline for sorting/display
        }));
      } else if (filters.type === 'beehive_event') {
        data = await getBeehiveEvents();
        // Normalize data
        data = data.map(item => ({
            ...item,
            type: 'beehive_event',
            mentor: item.organizer,
            deadline: item.event_date
        }));
      } else {
        data = await getOpportunities(filters);
      }
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to fetch opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'internship': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'research_assistant': return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'phd_guidance': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'grant': return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'industrial_visit': return 'bg-orange-50 text-orange-900 border-orange-200';
      case 'beehive_event': return 'bg-yellow-50 text-yellow-900 border-yellow-200';
      default: return 'bg-stone-50 text-stone-900 border-stone-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-academia-charcoal)] mb-2">
            Academic Opportunities
          </h2>
          <p className="text-stone-500 max-w-xl text-lg font-light">
            Identify research gaps and align with mentors for internships, PhD guidance, and grants.
          </p>
        </div>
        
        {/* Filter Control */}
        <div className="mt-6 md:mt-0 flex items-center gap-3">
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-academia-gold)] focus:border-[var(--color-academia-gold)] shadow-sm font-serif text-[var(--color-academia-charcoal)] appearance-none min-w-[200px]"
            >
              <option value="">All Disciplines</option>
              <option value="internship">Research Internship</option>
              <option value="research_assistant">Research Assistant</option>
              <option value="phd_guidance">PhD Guidance</option>
              <option value="grant">Grant / Collaboration</option>
              <option value="industrial_visit">Industrial Visits</option>
              <option value="beehive_event">Beehive Events</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-[var(--color-academia-gold)] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-400 font-serif tracking-wider text-sm uppercase">Loading Opportunities...</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {opportunities.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-stone-50 rounded-sm border border-stone-100">
              <FiSearch className="mx-auto h-12 w-12 text-stone-300 mb-4" />
              <h3 className="text-xl font-serif text-[var(--color-academia-charcoal)] mb-2">No opportunities found</h3>
              <p className="text-stone-500">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <motion.div 
                key={opp.id} 
                variants={itemVariants}
                layoutId={`opp-${opp.id}`}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
                className="group bg-white rounded-sm border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
              >
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-academia-charcoal)] to-[var(--color-academia-gold)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="p-6 flex-grow">
                  {/* Header: Type & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border ${getTypeColor(opp.type)}`}>
                      {opp.type.replace(/_/g, ' ')}
                    </span>
                    {opp.is_open ? (
                      <span className="flex items-center text-emerald-700 text-xs font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-1.5 animate-pulse"></span> OPEN
                      </span>
                    ) : (
                      <span className="text-rose-600 text-xs font-bold tracking-wide uppercase">Closed</span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold font-serif text-[var(--color-academia-charcoal)] mb-3 group-hover:text-[var(--color-academia-gold)] transition-colors leading-tight min-h-[3.5rem] line-clamp-2">
                    {opp.title}
                  </h3>
                  
                  {/* Mentor Info - PROMINENTLY DISPLAYED */}
                  <div className="flex items-center gap-3 mb-5 p-3 bg-stone-50 rounded-sm border border-stone-100 group-hover:border-[var(--color-academia-gold)]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[var(--color-academia-charcoal)] font-bold font-serif shadow-sm text-lg">
                      {opp.mentor?.name ? opp.mentor.name.charAt(0).toUpperCase() : <FiUser className="w-5 h-5 text-stone-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold mb-0.5">Posted By</p>
                      <p className="text-sm font-bold text-[var(--color-academia-charcoal)] truncate font-serif">
                        {opp.mentor?.name || 'Unknown Faculty'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-stone-600 text-sm mb-4 line-clamp-3 leading-relaxed font-light">
                    {opp.description}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex justify-between items-center group-hover:bg-[var(--color-academia-cream)]/30 transition-colors">
                  {opp.deadline ? (
                    <div className="flex items-center text-stone-500 text-xs font-medium">
                      {opp.type === 'industrial_visit' || opp.type === 'beehive_event' ? (
                        <>
                            <FiCalendar className="mr-1.5 text-[var(--color-academia-gold)]" />
                            <span>Date: {new Date(opp.deadline).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <>
                            <FiClock className="mr-1.5 text-[var(--color-academia-gold)]" />
                            <span>Due: {new Date(opp.deadline).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400">No deadline</div>
                  )}
                  
                  <span className="flex items-center text-xs font-bold uppercase tracking-wider text-[var(--color-academia-charcoal)] group-hover:translate-x-1 transition-transform">
                    View Details <FiArrowRight className="ml-1 text-[var(--color-academia-gold)]" />
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OpportunityList;
