import React, { useState, useEffect, useRef } from 'react';
import { createOpportunity, getSkills, createSkill } from '../api';
import { 
    FiBriefcase, FiAlignLeft, FiCalendar, FiPlus, FiX, 
    FiCheck, FiSearch, FiTarget, FiDollarSign, FiAward, 
    FiLayers, FiZap, FiLayout, FiClock 
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
    total_slots: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      const payload = {
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

      setSuccess('Opportunity created successfully!');
      
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
        total_slots: 1
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
              <FiZap className="text-yellow-300" />
              Post New Opportunity
          </h2>
          <p className="text-blue-100 mt-2">Create an exciting role for students to apply to.</p>
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
                <div className="flex items-center gap-2 text-gray-800 border-b pb-2">
                    <FiLayout className="text-blue-600" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Opportunity Title</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiBriefcase className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. AI Research Intern, Backend Developer"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLayers className="text-gray-400" />
                            </div>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white appearance-none"
                            >
                                <option value="internship">Internship</option>
                                <option value="research_assistant">Research Assistant</option>
                                <option value="phd_guidance">PhD Guidance</option>
                                <option value="grant">Grant / Collaboration</option>
                            </select>
                        </div>
                    </div>

                    <div>
                         <label className="block text-gray-700 text-sm font-bold mb-2">Total Slots</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiTarget className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="total_slots"
                                value={formData.total_slots}
                                onChange={handleChange}
                                min="1"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 hover:bg-white"
                            />
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Application Deadline</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiCalendar className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 hover:bg-white"
                            />
                        </div>
                    </div>
                    
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
                                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_open ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_open ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                Immediately Open
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Grant Details (Conditional) */}
            {formData.type === 'grant' && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-2 mb-2">
                        <FiDollarSign />
                        <h3 className="text-lg font-semibold">Grant Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-blue-800 text-sm font-bold mb-2">Amount</label>
                            <input
                                type="number"
                                name="funding_amount"
                                value={formData.funding_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-blue-800 text-sm font-bold mb-2">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-blue-800 text-sm font-bold mb-2">Agency</label>
                            <input
                                type="text"
                                name="grant_agency"
                                value={formData.grant_agency}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
                                placeholder="e.g. NSF"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Description Section */}
            <div className="space-y-4">
                 <div className="flex items-center gap-2 text-gray-800 border-b pb-2">
                    <FiAlignLeft className="text-blue-600" />
                    <h3 className="text-lg font-semibold">Details & Requirements</h3>
                </div>
                
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the role, responsibilities, and what the student will learn..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 hover:bg-white"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Detailed Requirements</label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Specific prerequisites, eligibility criteria, etc."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 hover:bg-white"
                    />
                </div>
            </div>

            {/* Skills Section - Dynamic */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800 border-b pb-2">
                    <FiAward className="text-blue-600" />
                    <h3 className="text-lg font-semibold">Required Skills</h3>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Add Skills (Type to search or create)</label>
                    <div className="relative" ref={skillInputRef}>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="text-gray-400" />
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                                />
                            </div>
                        </div>

                        {/* Dropdown */}
                        {showSkillDropdown && skillSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredSkills.map(skill => (
                                    <div 
                                        key={skill.id}
                                        onClick={() => handleAddSkill(skill)}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">{skill.name}</span>
                                        <FiPlus className="text-gray-400 group-hover:text-blue-600" />
                                    </div>
                                ))}
                                
                                {!exactMatch && skillSearch.trim() && (
                                    <div 
                                        onClick={handleCreateAndAddSkill}
                                        className="px-4 py-3 hover:bg-green-50 cursor-pointer flex items-center gap-2 text-green-700 border-t border-gray-100"
                                    >
                                        <FiPlus className="font-bold" />
                                        <span>Create new skill: <strong>"{skillSearch}"</strong></span>
                                    </div>
                                )}
                                
                                {filteredSkills.length === 0 && exactMatch && (
                                    <div className="px-4 py-3 text-gray-500 italic text-center">
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
                                <div key={item.skill_id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {item.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-800">{item.name}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={item.weight}
                                            onChange={(e) => handleSkillWeightChange(item.skill_id, e.target.value)}
                                            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            title="Skill Importance"
                                        >
                                            <option value="1">Nice to have</option>
                                            <option value="3">Important</option>
                                            <option value="5">Critical</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(item.skill_id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                            <FiAward className="mx-auto text-2xl mb-2 opacity-50" />
                            <p>No skills added yet. Add skills to help students match.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Posting...
                        </>
                    ) : (
                        <>
                            Post Opportunity <FiCheck />
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
