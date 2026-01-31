import { useState, useEffect } from "react";
import { updateMentorProfile } from "../api";
import { FiUser, FiGlobe, FiBook, FiBriefcase, FiPlus, FiTrash2, FiType, FiCalendar, FiLink } from "react-icons/fi";

const MentorProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    lab_name: "",
    university: "",
    position: "",
    research_areas: "",
    bio: "",
    website_url: "",
    accepting_phd_students: "Maybe",
    funding_available: "Depends",
    preferred_backgrounds: "",
    min_expectations: "",
    max_student_requests: 5,
    mentor_type: "academic_supervisor",
    company: "",
  });
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.mentor_profile) {
      setFormData({
        lab_name: user.mentor_profile.lab_name || "",
        university: user.mentor_profile.university || "",
        position: user.mentor_profile.position || "",
        research_areas: user.mentor_profile.research_areas || "",
        bio: user.mentor_profile.bio || "",
        website_url: user.mentor_profile.website_url || "",
        accepting_phd_students: user.mentor_profile.accepting_phd_students || "Maybe",
        funding_available: user.mentor_profile.funding_available || "Depends",
        preferred_backgrounds: user.mentor_profile.preferred_backgrounds || "",
        min_expectations: user.mentor_profile.min_expectations || "",
        max_student_requests: user.mentor_profile.max_student_requests || 5,
        mentor_type: user.mentor_profile.mentor_type || "academic_supervisor",
        company: user.mentor_profile.company || "",
      });
      if (user.mentor_profile.publications) {
        setPublications(user.mentor_profile.publications);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Publication Handlers
  const addPublication = () => {
    setPublications([...publications, { title: "", journal_conference: "", publication_date: "", url: "", description: "" }]);
  };

  const removePublication = (index) => {
    const updated = publications.filter((_, i) => i !== index);
    setPublications(updated);
  };

  const updatePublication = (index, field, value) => {
    const updated = [...publications];
    updated[index][field] = value;
    setPublications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        ...formData,
        publications: publications
      };
      await updateMentorProfile(payload);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const backgrounds = ["CS", "ECE", "Bio", "Math"];
  const expectations = ["Programming", "Math", "Writing"];

  const handleCheckboxChange = (field, value) => {
    const current = formData[field] ? formData[field].split(",").map(s => s.trim()).filter(s => s !== "") : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter(item => item !== value);
    } else {
      updated = [...current, value];
    }
    setFormData(prev => ({ ...prev, [field]: updated.join(", ") }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 bg-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <FiUser className="mr-2" /> Mentor Profile
          </h2>
          {user?.mentor_profile?.is_verified ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Verified
            </span>
          ) : (
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Pending Verification
            </span>
          )}
        </div>
        <p className="opacity-80 mt-1">Provide details about your research lab and mentorship opportunities</p>
      </div>
      
      <div className="p-6">
        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mentor Type Selection */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mentor_type: 'academic_supervisor' }))}
                    className={`flex-1 py-3 px-4 rounded-lg border text-center transition-all ${formData.mentor_type === 'academic_supervisor' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500 ring-opacity-50' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    <span className="font-semibold block">PhD Supervisor</span>
                    <span className="text-xs opacity-75">Academic Research</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mentor_type: 'industry_mentor' }))}
                    className={`flex-1 py-3 px-4 rounded-lg border text-center transition-all ${formData.mentor_type === 'industry_mentor' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500 ring-opacity-50' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    <span className="font-semibold block">Mentor</span>
                    <span className="text-xs opacity-75">Industry & Placements</span>
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.mentor_type === 'academic_supervisor' ? (
                <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                      <input
                        type="text"
                        name="lab_name"
                        value={formData.lab_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="AI Research Lab"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University / Institution</label>
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="MIT"
                      />
                    </div>
                </>
            ) : (
                <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Google, Microsoft, Startup Inc."
                      />
                    </div>
                    <div className="hidden md:block"></div>
                </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{formData.mentor_type === 'academic_supervisor' ? 'Position / Title' : 'Job Title'}</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={formData.mentor_type === 'academic_supervisor' ? "Associate Professor" : "Senior Software Engineer"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiGlobe className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://lab.example.edu"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Research Areas (comma separated)</label>
            <textarea
              name="research_areas"
              value={formData.research_areas}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Computer Vision, NLP, Robotics"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your mentorship style and what you're looking for in students..."
            ></textarea>
          </div>

          {/* PhD Supervision Section */}
          {formData.mentor_type === 'academic_supervisor' && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiBriefcase className="mr-2 text-indigo-600" /> PhD Supervision Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Are you accepting PhD students?</label>
                <select
                  name="accepting_phd_students"
                  value={formData.accepting_phd_students}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Available?</label>
                <select
                  name="funding_available"
                  value={formData.funding_available}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="Depends">Depends</option>
                  <option value="No">No</option>
                </select>
              </div>
              
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Student Requests per Month</label>
                <input
                  type="number"
                  name="max_student_requests"
                  value={formData.max_student_requests}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Backgrounds</label>
                <div className="flex flex-wrap gap-3">
                  {backgrounds.map(bg => (
                    <label key={bg} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferred_backgrounds.split(",").map(s => s.trim()).includes(bg)}
                        onChange={() => handleCheckboxChange("preferred_backgrounds", bg)}
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-700">{bg}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Expectations</label>
                <div className="flex flex-wrap gap-3">
                  {expectations.map(exp => (
                    <label key={exp} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.min_expectations.split(",").map(s => s.trim()).includes(exp)}
                        onChange={() => handleCheckboxChange("min_expectations", exp)}
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-700">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Publications Section */}
          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FiBook className="mr-2 text-indigo-600" /> Recent Publications
                </h3>
                <button type="button" onClick={addPublication} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                    <FiPlus /> Add Paper
                </button>
            </div>
            
            <div className="space-y-4">
              {publications.map((pub, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm relative group">
                  <button type="button" onClick={() => removePublication(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition bg-white p-2 rounded-full hover:bg-red-50">
                    <FiTrash2 />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                    <div className="relative">
                      <FiType className="absolute top-3.5 left-3 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Paper Title" 
                        value={pub.title} 
                        onChange={(e) => updatePublication(index, 'title', e.target.value)} 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div className="relative">
                      <FiBook className="absolute top-3.5 left-3 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Journal / Conference Name" 
                        value={pub.journal_conference} 
                        onChange={(e) => updatePublication(index, 'journal_conference', e.target.value)} 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                    <div className="relative">
                      <FiCalendar className="absolute top-3.5 left-3 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Publication Date (YYYY-MM)" 
                        value={pub.publication_date} 
                        onChange={(e) => updatePublication(index, 'publication_date', e.target.value)} 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div className="relative">
                      <FiLink className="absolute top-3.5 left-3 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Link to Paper (URL)" 
                        value={pub.url} 
                        onChange={(e) => updatePublication(index, 'url', e.target.value)} 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  
                  <textarea 
                    placeholder="Abstract / Short Description..." 
                    value={pub.description} 
                    onChange={(e) => updatePublication(index, 'description', e.target.value)} 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition h-24 resize-none"
                  />
                </div>
              ))}
              {publications.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      No publications added yet. Click "Add Paper" to showcase your research.
                  </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorProfileForm;
