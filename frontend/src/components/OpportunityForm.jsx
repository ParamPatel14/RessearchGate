import React, { useState, useEffect, useRef } from 'react';
import { createOpportunity, getSkills, createSkill, createVisit, createBeehiveEvent } from '../api';
import { 
    FiBriefcase, FiAlignLeft, FiCalendar, FiPlus, FiX, 
    FiCheck, FiSearch, FiTarget, FiDollarSign, FiAward, 
    FiLayers, FiZap, FiLayout, FiClock, FiMapPin, FiGlobe, FiHexagon 
} from 'react-icons/fi';

const OpportunityForm = ({ onSuccess, customSubmitFunction }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    requirements: '',
    funding_amount: 0,
    currency: 'USD',
    grant_agency: '',
    is_open: true,
    deadline: '',
    total_slots: 1,
    curriculum: '',
    company_name: '',
    location: '',
    visit_date: '',
    event_date: '',
    duration_hours: 0,
    entry_fee: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Get user role from local storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        setUserRole(user.role);
    }
  }, []);
  
  // Skills Management
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // Array of { skill_id, weight, name }
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillInputRef = useRef(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillInputRef.current && !skillInputRef.current.contains(event.target)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setAvailableSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare payload
      let payload = { ...formData };

      if (formData.type === 'industrial_visit') {
        // Prepare payload for Industrial Visit
        const visitPayload = {
          title: formData.title,
          company_name: formData.company_name,
          location: formData.location,
          description: formData.description,
          visit_date: formData.visit_date,
          max_students: formData.total_slots
        };
        await createVisit(visitPayload);
      } else if (formData.type === 'beehive_event') {
        // Prepare payload for Beehive Event
        const beehivePayload = {
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            duration_hours: formData.duration_hours,
            max_seats: formData.total_slots,
            entry_fee: formData.entry_fee,
            is_active: formData.is_open
        };
        await createBeehiveEvent(beehivePayload);
      } else {
        // Prepare payload for Opportunity
        payload = {
            ...formData,
            skills: selectedSkills.map(s => ({
            skill_id: s.skill_id,
            weight: s.weight
            }))
        };
        
        // Ensure deadline is properly formatted or null
        if (!payload.deadline) {
            payload.deadline = null;
        }

        if (customSubmitFunction) {
            await customSubmitFunction(payload);
        } else {
            await createOpportunity(payload);
        }
      }

      setSuccess('Created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'internship',
        requirements: '',
        funding_amount: 0,
        currency: 'USD',
        grant_agency: '',
        is_open: true,
        deadline: '',
        total_slots: 1,
        curriculum: '',
        company_name: '',
        location: '',
        visit_date: '',
        event_date: '',
        duration_hours: 0,
        entry_fee: 0
      });
      setSelectedSkills([]);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill, weight = 3) => {
    if (selectedSkills.find(s => s.skill_id === skill.id)) return;
    
    setSelectedSkills([...selectedSkills, {
      skill_id: skill.id,
      name: skill.name,
      weight: weight
    }]);
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const handleCreateAndAddSkill = async () => {
      if (!skillSearch.trim()) return;
      
      try {
          const newSkill = await createSkill(skillSearch);
          setAvailableSkills([...availableSkills, newSkill]);
          handleAddSkill(newSkill);
      } catch (err) {
          console.error("Failed to create skill", err);
          setError("Failed to create new skill");
      }
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
  };

  const handleSkillWeightChange = (skillId, newWeight) => {
      setSelectedSkills(selectedSkills.map(s => 
          s.skill_id === skillId ? { ...s, weight: parseInt(newWeight) } : s
      ));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Filter skills based on search
  const filteredSkills = availableSkills.filter(skill => 
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.find(s => s.skill_id === skill.id)
  );

  const exactMatch = filteredSkills.some(s => s.name.toLowerCase() === skillSearch.toLowerCase());

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden font-sans">
      <div className="bg-[var(--color-academia-charcoal)] p-8 text-[var(--color-academia-cream)]">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-3 tracking-wide">
              <FiZap className="text-[var(--color-academia-gold)]" />
              Post New Opportunity
          </h2>
          <p className="text-stone-300 mt-2 text-lg">Create an exciting role for students to apply to.</p>
      </div>
      
      <div className="p-8">
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start gap-3">
                <FiX className="mt-1 flex-shrink-0" />
                <div>
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        )}
        
        {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start gap-3">
                <FiCheck className="mt-1 flex-shrink-0" />
                <div>
                    <p className="font-bold">Success</p>
                    <p>{success}</p>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-4">
                    <FiLayout className="text-[var(--color-academia-gold)] text-xl" />
                    <h3 className="text-xl font-serif font-bold tracking-wide">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Opportunity Title</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiBriefcase className="text-stone-400" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. AI Research Intern, Backend Developer"
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] focus:border-transparent transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Type</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLayers className="text-stone-400" />
                            </div>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] focus:border-transparent transition bg-[var(--color-academia-cream)] hover:bg-white appearance-none text-[var(--color-academia-charcoal)]"
                            >
                                <option value="internship">Internship</option>
                                <option value="research_assistant">Research Assistant</option>
                                <option value="phd_guidance">PhD Guidance</option>
                                <option value="industrial_visit">Industrial Visit</option>
                                {userRole === 'admin' && (
                                    <option value="beehive_event">Beehive Event</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                         <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">
                            {formData.type === 'industrial_visit' ? 'Max Students' : 'Total Slots'}
                         </label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiTarget className="text-stone-400" />
                            </div>
                            <input
                                type="number"
                                name="total_slots"
                                value={formData.total_slots}
                                onChange={handleChange}
                                min="1"
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                            />
                         </div>
                    </div>
                </div>

                {/* Industrial Visit Specific Fields */}
                {formData.type === 'industrial_visit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                         <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiGlobe className="text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Google, Tesla"
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'industrial_visit'}
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMapPin className="text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Mountain View, CA"
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'industrial_visit'}
                                />
                            </div>
                        </div>

                         <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Visit Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiCalendar className="text-stone-400" />
                                </div>
                                <input
                                    type="datetime-local"
                                    name="visit_date"
                                    value={formData.visit_date}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'industrial_visit'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Beehive Event Specific Fields */}
                {formData.type === 'beehive_event' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                         <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Event Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiCalendar className="text-stone-400" />
                                </div>
                                <input
                                    type="datetime-local"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'beehive_event'}
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Duration (Hours)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiClock className="text-stone-400" />
                                </div>
                                <input
                                    type="number"
                                    name="duration_hours"
                                    value={formData.duration_hours}
                                    onChange={handleChange}
                                    step="0.5"
                                    min="0"
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'beehive_event'}
                                />
                            </div>
                        </div>

                         <div className="col-span-1">
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Entry Fee</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiDollarSign className="text-stone-400" />
                                </div>
                                <input
                                    type="number"
                                    name="entry_fee"
                                    value={formData.entry_fee}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                    required={formData.type === 'beehive_event'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {formData.type !== 'industrial_visit' && formData.type !== 'beehive_event' && (
                        <div>
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Application Deadline</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiCalendar className="text-stone-400" />
                                </div>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                                />
                            </div>
                        </div>
                     )}
                    
                    <div className="flex items-center pt-8">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="is_open"
                                    checked={formData.is_open}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_open ? 'bg-[var(--color-academia-gold)]' : 'bg-stone-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_open ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-[var(--color-academia-charcoal)] font-medium">
                                Immediately Open
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Grant Details (Conditional) */}
            {formData.type === 'grant' && (
                <div className="bg-[var(--color-academia-cream)] p-6 rounded-xl border border-stone-200 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-2 mb-2">
                        <FiDollarSign className="text-[var(--color-academia-gold)]" />
                        <h3 className="text-lg font-serif font-semibold">Grant Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Amount</label>
                            <input
                                type="number"
                                name="funding_amount"
                                value={formData.funding_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[var(--color-academia-gold)] bg-white text-[var(--color-academia-charcoal)]"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-[var(--color-academia-charcoal)] focus:ring-[var(--color-academia-gold)]"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Agency</label>
                            <input
                                type="text"
                                name="grant_agency"
                                value={formData.grant_agency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-[var(--color-academia-charcoal)] focus:ring-[var(--color-academia-gold)]"
                                placeholder="e.g. NSF"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Description Section */}
            <div className="space-y-4">
                 <div className="flex items-center gap-3 text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-4">
                    <FiAlignLeft className="text-[var(--color-academia-gold)] text-xl" />
                    <h3 className="text-xl font-serif font-bold tracking-wide">Details & Requirements</h3>
                </div>
                
                <div>
                    <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the role, responsibilities, and what the student will learn..."
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Detailed Requirements</label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Specific prerequisites, eligibility criteria, etc."
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                    />
                </div>

                <div>
                    <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Curriculum / Learning Plan</label>
                    <textarea
                        name="curriculum"
                        value={formData.curriculum}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Outline the learning modules, weekly plan, or syllabus..."
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-[var(--color-academia-cream)] hover:bg-white text-[var(--color-academia-charcoal)]"
                    />
                </div>
            </div>

            {/* Skills Section - Dynamic */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-academia-charcoal)] border-b border-stone-200 pb-4">
                    <FiAward className="text-[var(--color-academia-gold)] text-xl" />
                    <h3 className="text-xl font-serif font-bold tracking-wide">Required Skills</h3>
                </div>
                
                <div className="bg-[var(--color-academia-cream)] p-6 rounded-xl border border-stone-200">
                    <label className="block text-[var(--color-academia-charcoal)] text-sm font-bold mb-2">Add Skills (Type to search or create)</label>
                    <div className="relative" ref={skillInputRef}>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    value={skillSearch}
                                    onChange={(e) => {
                                        setSkillSearch(e.target.value);
                                        setShowSkillDropdown(true);
                                    }}
                                    onFocus={() => setShowSkillDropdown(true)}
                                    placeholder="e.g. Python, React, Machine Learning..."
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-academia-gold)] transition bg-white text-[var(--color-academia-charcoal)]"
                                />
                            </div>
                        </div>

                        {/* Dropdown */}
                        {showSkillDropdown && skillSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredSkills.map(skill => (
                                    <div 
                                        key={skill.id}
                                        onClick={() => handleAddSkill(skill)}
                                        className="px-4 py-3 hover:bg-[var(--color-academia-cream)] cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className="font-medium text-[#222222] group-hover:text-[#C5A028]">{skill.name}</span>
                                        <FiPlus className="text-stone-400 group-hover:text-[#C5A028]" />
                                    </div>
                                ))}
                                
                                {!exactMatch && skillSearch.trim() && (
                                    <div 
                                        onClick={handleCreateAndAddSkill}
                                        className="px-4 py-3 hover:bg-[#F7F5F0] cursor-pointer flex items-center gap-2 text-[#C5A028] border-t border-stone-100"
                                    >
                                        <FiPlus className="font-bold" />
                                        <span>Create new skill: <strong>"{skillSearch}"</strong></span>
                                    </div>
                                )}
                                
                                {filteredSkills.length === 0 && exactMatch && (
                                    <div className="px-4 py-3 text-stone-500 italic text-center">
                                        Skill already selected
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Skills List */}
                    {selectedSkills.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedSkills.map((item) => (
                                <div key={item.skill_id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-academia-charcoal)] flex items-center justify-center text-[var(--color-academia-gold)] font-bold text-sm border border-[var(--color-academia-gold)]">
                                            {item.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-[var(--color-academia-charcoal)]">{item.name}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={item.weight}
                                            onChange={(e) => handleSkillWeightChange(item.skill_id, e.target.value)}
                                            className="text-xs bg-[var(--color-academia-cream)] border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-academia-gold)] text-[var(--color-academia-charcoal)]"
                                            title="Skill Importance"
                                        >
                                            <option value="1">Nice to have</option>
                                            <option value="3">Important</option>
                                            <option value="5">Critical</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(item.skill_id)}
                                            className="text-stone-400 hover:text-red-500 transition"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 text-center py-6 bg-[var(--color-academia-cream)] border border-dashed border-stone-300 rounded-lg text-stone-500">
                            <FiAward className="mx-auto text-2xl mb-2 opacity-50 text-[var(--color-academia-gold)]" />
                            <p>No skills added yet. Add skills to help students match.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-stone-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] font-serif font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transform transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-academia-gold)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg border border-[var(--color-academia-charcoal)] hover:border-[var(--color-academia-gold)]"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-academia-gold)]"></div>
                            Posting...
                        </>
                    ) : (
                        <>
                            Post Opportunity <FiCheck className="text-[var(--color-academia-gold)]" />
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm;
