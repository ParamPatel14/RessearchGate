import { useState, useEffect } from "react";
import { updateStudentProfile, addSkills, parseResume, uploadResume } from "../api";
import { FiBook, FiGithub, FiGlobe, FiVideo, FiUpload, FiCheck, FiFileText, FiX } from "react-icons/fi";

const INTEREST_OPTIONS = [
  "Web Development", "Data Science", "Machine Learning", "Mobile App Dev", 
  "UI/UX Design", "Graphic Design", "Digital Marketing", "Content Writing",
  "Finance", "Blockchain", "Cybersecurity", "Cloud Computing", "Robotics", "IoT"
];

const USER_TYPES = [
  "College Student", "Fresher", "Working Professional", "School Student", "Woman returning to work"
];

const StudentProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    major: "",
    graduation_year: "",
    start_year: "",
    current_status: "College Student",
    bio: "",
    github_url: "",
    scholar_url: "",
    website_url: "",
    intro_video_url: "",
    interests: "",
    resume_url: ""
  });
  const [skills, setSkills] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.student_profile) {
      const profile = user.student_profile;
      setFormData({
        university: profile.university || "",
        degree: profile.degree || "",
        major: profile.major || "",
        graduation_year: profile.graduation_year || "",
        start_year: profile.start_year || "",
        current_status: profile.current_status || "College Student",
        bio: profile.bio || "",
        github_url: profile.github_url || "",
        scholar_url: profile.scholar_url || "",
        website_url: profile.website_url || "",
        intro_video_url: profile.intro_video_url || "",
        interests: profile.interests || "",
        resume_url: profile.resume_url || ""
      });
      
      if (profile.interests) {
        setSelectedInterests(profile.interests.split(",").map(i => i.trim()));
      }
    }
    if (user?.skills) {
      setSkills(user.skills.map(s => s.name).join(", "));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleResumeAutofill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsParsing(true);
    setMessage({ type: "info", text: "Parsing resume..." });
    
    try {
      // 1. Parse for Autofill
      const result = await parseResume(file);
      const data = result.extracted_data;
      
      setFormData(prev => ({
        ...prev,
        university: data.university || prev.university,
        degree: data.degree || prev.degree,
        major: data.major || prev.major,
        github_url: data.github_url || prev.github_url,
        website_url: data.website_url || prev.website_url,
        // If phone/email extracted, we might want to show them or update user (skipped for now)
      }));
      
      if (data.skills) {
        setSkills(prev => {
            const newSkills = data.skills;
            // Avoid duplicates
            if (prev) return prev + ", " + newSkills;
            return newSkills;
        });
      }

      // 2. Upload File
      const uploadResult = await uploadResume(file);
      if (uploadResult.url) {
        setFormData(prev => ({ ...prev, resume_url: uploadResult.url }));
      }
      
      setMessage({ type: "success", text: "Resume parsed and attached! Please review the auto-filled details." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to process resume. Please try again." });
    } finally {
      setIsParsing(false);
    }
  };

  const handleResumeUploadOnly = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
          const uploadResult = await uploadResume(file);
          if (uploadResult.url) {
              setFormData(prev => ({ ...prev, resume_url: uploadResult.url }));
              setMessage({ type: "success", text: "Resume uploaded successfully!" });
          }
      } catch (_) {
          void _;
          setMessage({ type: "error", text: "Failed to upload resume." });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!formData.resume_url) {
        setMessage({ type: "error", text: "Please upload your CV to complete profile submission." });
        setIsLoading(false);
        return;
      }
      await updateStudentProfile({
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        start_year: formData.start_year ? parseInt(formData.start_year) : null,
        interests: selectedInterests.join(", ")
      });

      if (skills.trim()) {
        const skillList = skills.split(",").map(s => ({ name: s.trim() })).filter(s => s.name);
        await addSkills(skillList);
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      if (onUpdate) onUpdate();
    } catch (_) {
      void _;
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 bg-indigo-600 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <FiBook className="mr-2" /> Student Profile
        </h2>
        <p className="opacity-80">Complete your profile to get matched with mentors</p>
      </div>
      
      <div className="p-6">
        {/* Resume Autofill Section */}
        <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col md:flex-row items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">🚀 Speed up with Resume Autofill</h3>
                <p className="text-indigo-700 text-sm">Upload your CV to automatically fill skills, education, and links.</p>
            </div>
            <div className="mt-4 md:mt-0">
                <label className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition ${isParsing ? 'opacity-50' : ''}`}>
                    {isParsing ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div> : <FiUpload className="mr-2" />}
                    {isParsing ? "Analyzing..." : "Upload Resume"}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeAutofill} disabled={isParsing} />
                </label>
            </div>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : (message.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700')}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Type Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                <div className="flex flex-wrap gap-3">
                    {USER_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, current_status: type }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                formData.current_status === type 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conditional Fields based on User Type */}
            {formData.current_status === "College Student" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div className="col-span-2">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">College Details</h4>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                        <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Eg. BITS Pilani"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course/Degree</label>
                        <input
                            type="text"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Eg. B.Tech"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stream (Optional)</label>
                        <input
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Eg. Computer Science"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                            <input
                                type="number"
                                name="start_year"
                                value={formData.start_year}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="2022"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                            <input
                                type="number"
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="2026"
                            />
                        </div>
                    </div>
                 </div>
            )}
             {/* Fallback for other types - reuse same fields but maybe different labels if needed, or just show them generally */}
             {formData.current_status !== "College Student" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Company</label>
                        <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Current Organization"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role/Degree</label>
                        <input
                            type="text"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Designation or Degree"
                        />
                    </div>
                 </div>
             )}

            {/* Interest Chips */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Area(s) of Interest</label>
                <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors border flex items-center ${
                                selectedInterests.includes(interest)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            {interest}
                            {selectedInterests.includes(interest) && <FiX className="ml-2" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* General Info */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about your research interests..."
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Python, Machine Learning, React, Data Analysis"
                />
            </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Links & Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiGithub className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="GitHub Profile URL"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBook className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="scholar_url"
                  value={formData.scholar_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Google Scholar URL"
                />
              </div>

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
                  placeholder="Personal Website URL"
                />
              </div>
            </div>
          </div>
          
          {/* File Upload Confirmation */}
           <div className="border-t pt-6">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Resume/CV</h3>
             <div className="flex items-center space-x-4">
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Upload Updated Resume</label>
                     <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleResumeUploadOnly}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                     />
                 </div>
                 {formData.resume_url && (
                     <div className="flex items-center text-green-600">
                         <FiCheck className="mr-1" />
                         <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="underline text-sm">View Current Resume</a>
                     </div>
                 )}
             </div>
           </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.resume_url}
              className={`bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;
