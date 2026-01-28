import React, { useState, useEffect } from 'react';
import { createOpportunity, getSkills } from '../api';

const OpportunityForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    requirements: '',
    funding_amount: 0,
    currency: 'USD',
    grant_agency: '',
    is_open: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Skills Management
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // Array of { skill_id, weight, name }
  const [currentSkillId, setCurrentSkillId] = useState('');
  const [currentWeight, setCurrentWeight] = useState(1);
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    fetchSkills();
  }, [skillSearch]);

  const fetchSkills = async () => {
    try {
      const skills = await getSkills(skillSearch);
      setAvailableSkills(skills);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const handleAddSkill = () => {
    if (!currentSkillId) return;
    
    // Check if already added
    if (selectedSkills.find(s => s.skill_id === parseInt(currentSkillId))) {
      alert("Skill already added");
      return;
    }

    const skillObj = availableSkills.find(s => s.id === parseInt(currentSkillId));
    if (!skillObj) return;

    setSelectedSkills([
      ...selectedSkills,
      {
        skill_id: skillObj.id,
        name: skillObj.name,
        weight: parseInt(currentWeight)
      }
    ]);
    
    // Reset selection
    setCurrentSkillId('');
    setCurrentWeight(1);
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const payload = {
        ...formData,
        skills: selectedSkills.map(s => ({ skill_id: s.skill_id, weight: s.weight }))
    };

    try {
      await createOpportunity(payload);
      setSuccess('Opportunity created successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'internship',
        requirements: '',
        funding_amount: 0,
        currency: 'USD',
        grant_agency: '',
        is_open: true,
      });
      setSelectedSkills([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to create opportunity. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Post New Opportunity</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="internship">Internship</option>
            <option value="research_assistant">Research Assistant</option>
            <option value="phd_guidance">PhD Guidance</option>
            <option value="grant">Grant / Collaboration</option>
          </select>
        </div>

        {formData.type === 'grant' && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-blue-800 mb-3">Grant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Funding Amount</label>
                <input
                  type="number"
                  name="funding_amount"
                  value={formData.funding_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Grant Agency</label>
                <input
                  type="text"
                  name="grant_agency"
                  value={formData.grant_agency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g. NSF, NIH"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Skills Section */}
        <div className="border p-4 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
            
            <div className="flex gap-2 mb-4">
                <div className="flex-1">
                    <select 
                        value={currentSkillId}
                        onChange={(e) => setCurrentSkillId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="">Select Skill...</option>
                        {availableSkills.map(skill => (
                            <option key={skill.id} value={skill.id}>{skill.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-32">
                    <select
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        title="Importance (1: Nice to have, 5: Critical)"
                    >
                        <option value="1">1 - Nice to have</option>
                        <option value="2">2 - Low</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - High</option>
                        <option value="5">5 - Critical</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add
                </button>
            </div>

            {/* Selected Skills List */}
            {selectedSkills.length > 0 && (
                <ul className="space-y-2">
                    {selectedSkills.map((item) => (
                        <li key={item.skill_id} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                            <span className="font-medium">{item.name}</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    item.weight >= 5 ? 'bg-red-100 text-red-800' : 
                                    item.weight >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'
                                }`}>
                                    Weight: {item.weight}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(item.skill_id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    &times;
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Detailed Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_open"
            checked={formData.is_open}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-gray-700 text-sm">
            Immediately Open for Applications
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Post Opportunity
        </button>
      </form>
    </div>
  );
};

export default OpportunityForm;
