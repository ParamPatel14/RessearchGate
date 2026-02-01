import { useState, useEffect } from "react";
import { updateMentorProfile } from "../api";
import { 
  FiUser, FiGlobe, FiBook, FiBriefcase, FiPlus, FiTrash2, FiType, 
  FiCalendar, FiLink, FiEdit2, FiCheckCircle, FiXCircle, FiAward, FiUsers, FiClock,
  FiActivity, FiTrendingUp
} from "react-icons/fi";

const MentorProfileForm = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
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
    lab_size: "",
    time_commitment: "",
    application_requirements: "",
    research_methodology: "Experimental",
    mentorship_style: "Collaborative",
    alumni_placement: "",
    other_background: "",
    other_expectation: "",
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
        lab_size: user.mentor_profile.lab_size || "",
        time_commitment: user.mentor_profile.time_commitment || "",
        application_requirements: user.mentor_profile.application_requirements || "",
        research_methodology: user.mentor_profile.research_methodology || "Experimental",
        mentorship_style: user.mentor_profile.mentorship_style || "Collaborative",
        alumni_placement: user.mentor_profile.alumni_placement || "",
        other_background: "",
        other_expectation: "",
      });
      if (user.mentor_profile.publications) {
        setPublications(user.mentor_profile.publications);
      }
      setIsEditing(false); // Default to view mode if profile exists
    } else {
      setIsEditing(true); // New profile -> Edit mode
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
      // Append "Other" values if present
      let finalBackgrounds = formData.preferred_backgrounds;
      if (formData.other_background.trim()) {
        const currentBgs = finalBackgrounds ? finalBackgrounds.split(", ").filter(s => s) : [];
        if (!currentBgs.includes(formData.other_background.trim())) {
           finalBackgrounds = [...currentBgs, formData.other_background.trim()].join(", ");
        }
      }

      let finalExpectations = formData.min_expectations;
      if (formData.other_expectation.trim()) {
         const currentExps = finalExpectations ? finalExpectations.split(", ").filter(s => s) : [];
         if (!currentExps.includes(formData.other_expectation.trim())) {
            finalExpectations = [...currentExps, formData.other_expectation.trim()].join(", ");
         }
      }

      const payload = {
        ...formData,
        preferred_backgrounds: finalBackgrounds,
        min_expectations: finalExpectations,
        publications: publications
      };
      
      // Sanitize integer fields to avoid 422 errors (empty string -> null)
      if (payload.lab_size === "") payload.lab_size = null;
      if (payload.max_student_requests === "") payload.max_student_requests = 5; // Default to 5
      
      delete payload.other_background;
      delete payload.other_expectation;

      await updateMentorProfile(payload);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false); // Switch to view mode
      if (onUpdate) onUpdate();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const backgrounds = [
    "Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", 
    "Chemical Engineering", "Bioengineering", "Physics", "Mathematics", "Statistics", 
    "Chemistry", "Biology", "Psychology", "Economics", "Data Science", "Medicine/Health"
  ];
  
  const expectations = [
    "Programming (Python/C++)", "Data Analysis", "Machine Learning", "Deep Learning", 
    "Statistical Modeling", "Academic Writing", "Literature Review", "Experimental Design", 
    "Critical Thinking", "Independent Research", "Strong Math Background"
  ];

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

  // --- View Mode Component ---
  const renderViewMode = () => (
    <div className="animate-fade-in space-y-8">
      {/* Header / Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiBook className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">{formData.position || "Mentor"}</h2>
              {user?.mentor_profile?.is_verified && (
                <span className="bg-green-400/20 text-green-100 border border-green-400/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
                  <FiCheckCircle /> Verified
                </span>
              )}
            </div>
            <p className="text-xl opacity-90 font-medium">
              {formData.mentor_type === 'academic_supervisor' 
                ? `${formData.university} ${formData.lab_name ? `• ${formData.lab_name}` : ''}`
                : formData.company}
            </p>
            {formData.website_url && (
              <a href={formData.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-indigo-100 hover:text-white transition-colors">
                <FiGlobe /> {formData.website_url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          >
            <FiEdit2 /> Edit Profile
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Students</span>
          <span className={`text-lg font-bold ${formData.accepting_phd_students === 'Yes' ? 'text-green-600' : 'text-gray-700'}`}>
            {formData.accepting_phd_students === 'Yes' ? 'Accepting' : formData.accepting_phd_students}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Funding</span>
          <span className={`text-lg font-bold ${formData.funding_available === 'Yes' ? 'text-green-600' : 'text-gray-700'}`}>
            {formData.funding_available}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Reputation</span>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
            <FiAward /> {user?.mentor_profile?.reputation_score || "N/A"}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Outcomes</span>
          <span className="text-lg font-bold text-indigo-600">
            {user?.mentor_profile?.outcome_count || 0}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiUser className="text-indigo-500" /> About
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {formData.bio || "No bio provided yet."}
            </p>
          </div>

          {/* Research Areas */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiBook className="text-indigo-500" /> Research Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.research_areas ? (
                formData.research_areas.split(',').map((area, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                    {area.trim()}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic">No research areas listed.</span>
              )}
            </div>
          </div>

          {/* Publications */}
          {publications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiType className="text-indigo-500" /> Selected Publications
              </h3>
              <div className="space-y-4">
                {publications.map((pub, idx) => (
                  <div key={idx} className="group p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                    <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {pub.url ? (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {pub.title} <FiLink className="w-4 h-4 opacity-50" />
                        </a>
                      ) : pub.title}
                    </h4>
                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4">
                      {pub.journal_conference && <span className="font-medium text-gray-700">{pub.journal_conference}</span>}
                      {pub.publication_date && <span>{pub.publication_date}</span>}
                    </div>
                    {pub.description && <p className="text-sm text-gray-600 mt-2">{pub.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Details & Requirements) */}
        <div className="space-y-8">
          
          {/* Lab/Work Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiBriefcase className="text-indigo-500" /> Lab Details
            </h3>
            <div className="space-y-4">
               {formData.mentor_type === 'academic_supervisor' && (
                  <>
                    <div className="flex items-start justify-between">
                      <span className="text-gray-500 text-sm">Lab Size</span>
                      <span className="font-medium text-gray-800">{formData.lab_size || "N/A"} members</span>
                    </div>
                     <div className="flex items-start justify-between">
                      <span className="text-gray-500 text-sm">Methodology</span>
                      <span className="font-medium text-gray-800">{formData.research_methodology || "N/A"}</span>
                    </div>
                     <div className="flex items-start justify-between">
                      <span className="text-gray-500 text-sm">Style</span>
                      <span className="font-medium text-gray-800">{formData.mentorship_style || "N/A"}</span>
                    </div>
                  </>
               )}
               <div className="flex items-start justify-between">
                  <span className="text-gray-500 text-sm">Time Commitment</span>
                  <span className="font-medium text-gray-800">{formData.time_commitment || "N/A"}</span>
               </div>
            </div>
            
            {formData.alumni_placement && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <span className="block text-gray-500 text-sm mb-2">Alumni Placements</span>
                    <p className="text-sm text-gray-700 italic">"{formData.alumni_placement}"</p>
                </div>
            )}
          </div>

          {/* Student Requirements */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiUsers className="text-indigo-400" /> Student Profile
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Preferred Backgrounds</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_backgrounds ? (
                    formData.preferred_backgrounds.split(',').map((bg, i) => (
                      <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200 border border-gray-600">
                        {bg.trim()}
                      </span>
                    ))
                  ) : <span className="text-sm text-gray-500">None specified</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Minimum Expectations</h4>
                <ul className="text-sm space-y-2 text-gray-300">
                  {formData.min_expectations ? (
                    formData.min_expectations.split(',').map((exp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span> {exp.trim()}
                      </li>
                    ))
                  ) : <li>None specified</li>}
                </ul>
              </div>

               {formData.application_requirements && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Application Req.</h4>
                    <p className="text-sm text-gray-300">{formData.application_requirements}</p>
                  </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[600px] transition-all duration-500 ease-in-out">
      {/* Messages */}
      {message.text && (
         <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in ${
            message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
         }`}>
            {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
            <span className="font-medium">{message.text}</span>
         </div>
      )}

      {/* Conditional Rendering: View vs Edit */}
      {!isEditing ? (
        <div className="p-6 md:p-8 bg-gray-50/50">
           {renderViewMode()}
        </div>
      ) : (
        // --- Edit Mode (Existing Form with enhancements) ---
        <div className="animate-fade-in">
           <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex justify-between items-center sticky top-0 z-20 shadow-md">
            <div>
                <h2 className="text-2xl font-bold flex items-center">
                    <FiEdit2 className="mr-3" /> Edit Profile
                </h2>
                <p className="opacity-80 mt-1 text-sm">Update your lab details and requirements</p>
            </div>
            {/* Cancel Button */}
            {user?.mentor_profile && (
                <button 
                    type="button" 
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsEditing(false);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
            )}
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
              {/* Mentor Type Selection */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Select Role Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mentor_type: 'academic_supervisor' }))}
                        className={`relative py-4 px-6 rounded-xl border-2 text-left transition-all duration-200 ${
                            formData.mentor_type === 'academic_supervisor' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-lg">PhD Supervisor</span>
                            {formData.mentor_type === 'academic_supervisor' && <FiCheckCircle className="text-indigo-600" />}
                        </div>
                        <span className="text-sm opacity-75">For Academic Research & Lab Recruitment</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mentor_type: 'industry_mentor' }))}
                        className={`relative py-4 px-6 rounded-xl border-2 text-left transition-all duration-200 ${
                            formData.mentor_type === 'industry_mentor' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-lg">Industry Mentor</span>
                            {formData.mentor_type === 'industry_mentor' && <FiCheckCircle className="text-indigo-600" />}
                        </div>
                        <span className="text-sm opacity-75">For Internships, Jobs & Career Guidance</span>
                    </button>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                      <FiUser className="text-indigo-500" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.mentor_type === 'academic_supervisor' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University / Institution</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Stanford University"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                                <input
                                    type="text"
                                    name="lab_name"
                                    value={formData.lab_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. SAIL (Stanford AI Lab)"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company / Organization</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="e.g. Google"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position / Title</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="e.g. Associate Professor"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                        <div className="relative">
                            <FiGlobe className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="url"
                                name="website_url"
                                value={formData.website_url}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Tell students about yourself and your work..."
                    ></textarea>
                </div>

                 <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Areas</label>
                    <textarea
                        name="research_areas"
                        value={formData.research_areas}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="e.g. Computer Vision, NLP, Robotics (Comma separated)"
                    ></textarea>
                </div>
              </div>

              {/* PhD Specifics */}
              {formData.mentor_type === 'academic_supervisor' && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                        <FiBriefcase className="text-indigo-500" /> Lab & Mentorship Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Accepting Students?</label>
                            <select
                                name="accepting_phd_students"
                                value={formData.accepting_phd_students}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Yes">Yes</option>
                                <option value="Depends">Depends</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Requests/Month</label>
                            <input
                                type="number"
                                name="max_student_requests"
                                value={formData.max_student_requests}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Research Methodology</label>
                            <select
                                name="research_methodology"
                                value={formData.research_methodology}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Experimental">Experimental</option>
                                <option value="Theoretical">Theoretical</option>
                                <option value="Computational">Computational</option>
                                <option value="Mixed Methods">Mixed Methods</option>
                                <option value="Clinical">Clinical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mentorship Style</label>
                            <select
                                name="mentorship_style"
                                value={formData.mentorship_style}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Hands-on">Hands-on (Close Supervision)</option>
                                <option value="Collaborative">Collaborative (Team)</option>
                                <option value="Independent">Independent</option>
                                <option value="Hands-off">Hands-off</option>
                            </select>
                        </div>
                    </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alumni Placements</label>
                        <input
                            type="text"
                            name="alumni_placement"
                            value={formData.alumni_placement}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Google, MIT Faculty, Startups"
                        />
                    </div>

                    {/* Checkboxes for Backgrounds */}
                     <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Backgrounds</label>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {backgrounds.map(bg => (
                                    <label key={bg} className="inline-flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={formData.preferred_backgrounds.split(",").map(s => s.trim()).includes(bg)}
                                            onChange={() => handleCheckboxChange("preferred_backgrounds", bg)}
                                            className="form-checkbox text-indigo-600 rounded focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{bg}</span>
                                    </label>
                                ))}
                            </div>
                             <div className="mt-3 pt-3 border-t border-gray-200">
                                <input
                                    type="text"
                                    name="other_background"
                                    value={formData.other_background}
                                    onChange={handleChange}
                                    placeholder="Other (specify)"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                     {/* Checkboxes for Expectations */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Minimum Expectations</label>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {expectations.map(exp => (
                                    <label key={exp} className="inline-flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={formData.min_expectations.split(",").map(s => s.trim()).includes(exp)}
                                            onChange={() => handleCheckboxChange("min_expectations", exp)}
                                            className="form-checkbox text-indigo-600 rounded focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{exp}</span>
                                    </label>
                                ))}
                            </div>
                             <div className="mt-3 pt-3 border-t border-gray-200">
                                <input
                                    type="text"
                                    name="other_expectation"
                                    value={formData.other_expectation}
                                    onChange={handleChange}
                                    placeholder="Other (specify)"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Publications Section */}
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6 border-b pb-2">
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiType className="text-indigo-500" /> Publications
                    </h3>
                    <button type="button" onClick={addPublication} className="text-sm flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800">
                        <FiPlus /> Add New
                    </button>
                  </div>
                  
                  {publications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          No publications added yet. Click "Add New" to showcase your work.
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {publications.map((pub, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group transition-all hover:shadow-md">
                                <button
                                    type="button"
                                    onClick={() => removePublication(index)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                                    title="Remove"
                                >
                                    <FiTrash2 />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Paper Title"
                                        value={pub.title}
                                        onChange={(e) => updatePublication(index, "title", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                                    />
                                     <input
                                        type="text"
                                        placeholder="Journal / Conference (e.g. CVPR 2024)"
                                        value={pub.journal_conference}
                                        onChange={(e) => updatePublication(index, "journal_conference", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                                    />
                                     <input
                                        type="text"
                                        placeholder="Link to Paper (URL)"
                                        value={pub.url}
                                        onChange={(e) => updatePublication(index, "url", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                                    />
                                     <input
                                        type="text"
                                        placeholder="Publication Date (YYYY-MM-DD)"
                                        value={pub.publication_date}
                                        onChange={(e) => updatePublication(index, "publication_date", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                                    />
                                    <div className="md:col-span-2">
                                         <textarea
                                            placeholder="Brief Description / Abstract"
                                            value={pub.description}
                                            onChange={(e) => updatePublication(index, "description", e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                      </div>
                  )}
               </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                    </>
                  ) : (
                    "Save Profile Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileForm;
