import { useState, useEffect } from "react";
import { updateStudentProfile, uploadResume, parseResume } from "../api";
import { FiBook, FiGithub, FiGlobe, FiVideo, FiUpload, FiCheck, FiFileText, FiX, FiPlus, FiTrash2, FiLinkedin, FiTwitter, FiEdit2, FiType, FiCalendar, FiLink } from "react-icons/fi";

const INTEREST_OPTIONS = [
  "Web Development", "Data Science", "Machine Learning", "Mobile App Dev", 
  "UI/UX Design", "Graphic Design", "Digital Marketing", "Content Writing",
  "Finance", "Blockchain", "Cybersecurity", "Cloud Computing", "Robotics", "IoT"
];

const USER_TYPES = [
  "College Student", "Fresher", "Working Professional", "School Student", "Woman returning to work"
];

const GENDER_OPTIONS = ["Female", "Male", "Others"];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Telugu", "Tamil", "Marathi", "Kannada", "Bengali", "Gujarati"];

const getResumeUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `http://localhost:8000/${url}`;
};

const StudentProfileView = ({ data, onEdit }) => {
  return (
    <>
      {!data.is_phd_seeker && (
        <div 
          onClick={onEdit}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-1 mb-8 shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="bg-purple-100 p-3 rounded-full">
                  <FiBook className="text-2xl text-purple-600" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Looking for a PhD Supervisor?</h3>
                  <p className="text-gray-600">Connect with top professors. Add your research interests and publications.</p>
               </div>
            </div>
            <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 transition">
               Get Started &rarr;
            </button>
          </div>
        </div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-md max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">{data.name}</h2>
            <p className="text-gray-600 text-lg">{data.headline}</p>
        </div>
        <button onClick={onEdit} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition">
            <FiEdit2 /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiFileText /> Personal Details</h3>
                <ul className="space-y-3 text-sm">
                    <li><span className="font-medium">Status:</span> {data.current_status}</li>
                    <li><span className="font-medium">Location:</span> {data.city}, {data.country}</li>
                    <li><span className="font-medium">Phone:</span> {data.phone_number}</li>
                    <li><span className="font-medium">Gender:</span> {data.gender}</li>
                    <li><span className="font-medium">Languages:</span> {data.languages}</li>
                </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiGlobe /> Socials</h3>
                <div className="flex flex-col gap-3">
                    {data.github_url && <a href={data.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline"><FiGithub /> GitHub</a>}
                    {data.linkedin_url && <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><FiLinkedin /> LinkedIn</a>}
                    {data.twitter_url && <a href={data.twitter_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline"><FiTwitter /> Twitter</a>}
                    {data.website_url && <a href={data.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:underline"><FiGlobe /> Website</a>}
                </div>
            </div>

             <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiCheck /> Skills</h3>
                <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Primary</p>
                    <div className="flex flex-wrap gap-2">
                        {data.primary_skills?.split(',').map((s, i) => (
                            <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">{s.trim()}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tools</p>
                    <div className="flex flex-wrap gap-2">
                        {data.tools_libraries?.split(',').map((s, i) => (
                            <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">{s.trim()}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Experience, Education, Projects */}
        <div className="md:col-span-2 space-y-8">
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FiBook /> Work Experience</h3>
                {data.work_experiences?.length > 0 ? (
                    <div className="space-y-4">
                        {data.work_experiences.map((exp, i) => (
                            <div key={i} className="border-l-4 border-indigo-500 pl-4 py-1">
                                <h4 className="font-bold text-lg">{exp.title}</h4>
                                <p className="text-indigo-600 font-medium">{exp.company} <span className="text-gray-400 text-sm">| {exp.start_date} - {exp.end_date}</span></p>
                                <p className="text-gray-600 mt-2 text-sm whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 italic">No work experience added.</p>}
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FiBook /> Projects</h3>
                {data.projects?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {data.projects.map((proj, i) => (
                            <div key={i} className="border p-4 rounded-lg hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg">{proj.title}</h4>
                                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">View Project</a>}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 mb-2 font-mono">{proj.tech_stack}</p>
                                <p className="text-gray-600 text-sm">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 italic">No projects added.</p>}
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FiBook /> Education</h3>
                {data.educations?.length > 0 ? (
                    <div className="space-y-4">
                        {data.educations.map((edu, i) => (
                            <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                    <h4 className="font-bold">{edu.institution}</h4>
                                    <p className="text-gray-600 text-sm">{edu.degree}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-sm">{edu.start_year} - {edu.end_year}</p>
                                    <p className="text-indigo-600 text-xs font-medium">Grade: {edu.grade}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 italic">No education details added.</p>}
            </section>

            {data.is_phd_seeker && (
             <section className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2"><FiBook /> Research Profile (PhD)</h3>
                
                <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
                    <h4 className="font-bold text-purple-900 mb-2">Research Interests</h4>
                    <p className="text-gray-800 whitespace-pre-line">{data.research_interests || "No research interests specified."}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <span className="block text-gray-500 text-xs uppercase tracking-wide">GPA</span>
                        <span className="font-bold text-2xl text-gray-800">{data.gpa || "-"}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <span className="block text-gray-500 text-xs uppercase tracking-wide">GRE</span>
                        <span className="font-bold text-2xl text-gray-800">{data.gre_score || "-"}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <span className="block text-gray-500 text-xs uppercase tracking-wide">TOEFL</span>
                        <span className="font-bold text-2xl text-gray-800">{data.toefl_score || "-"}</span>
                    </div>
                </div>

                <h4 className="font-bold text-lg mb-3 text-gray-800">Publications</h4>
                {data.publications?.length > 0 ? (
                    <div className="space-y-4">
                        {data.publications.map((pub, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border hover:shadow-md transition">
                                <h4 className="font-bold text-lg text-purple-700">{pub.title}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-gray-600 font-medium text-sm">{pub.journal_conference}</p>
                                    <span className="text-gray-400 text-xs">{pub.publication_date}</span>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm">{pub.description}</p>
                                {pub.url && <a href={pub.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">View Paper &rarr;</a>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-400 italic">No publications listed.</p>}
             </section>
            )}
             
             {data.resume_url && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Resume</h3>
                    <a href={getResumeUrl(data.resume_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 border border-indigo-200 px-4 py-2 rounded hover:bg-indigo-50 transition">
                        <FiFileText /> View Uploaded CV
                    </a>
                </div>
             )}
        </div>
      </div>
      </div>
    </>
  );
};

const StudentProfileForm = ({ user, onUpdate }) => {
  // Core Profile Data
  const [formData, setFormData] = useState({
    name: "",
    university: "", degree: "", major: "", graduation_year: "", start_year: "",
    current_status: "College Student", bio: "",
    github_url: "", scholar_url: "", website_url: "", intro_video_url: "",
    linkedin_url: "", twitter_url: "", headline: "",
    resume_url: "", phone_number: "", city: "", country: "", gender: "",
    interests: "", languages: "",
    // PhD Fields
    is_phd_seeker: false, research_interests: "", gpa: "", gre_score: "", toefl_score: ""
  });

  // Dynamic Lists
  const [workExperiences, setWorkExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  
  // Skills
  const [primarySkills, setPrimarySkills] = useState("");
  const [tools, setTools] = useState("");

  // UI State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleOpenEdit = () => {
      setIsEditing(true);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-profile-edit', handleOpenEdit);
    return () => window.removeEventListener('open-profile-edit', handleOpenEdit);
  }, []);

  useEffect(() => {
    if (user?.student_profile) {
      const p = user.student_profile;
      setFormData({
        name: user?.name || "",
        university: p.university || "", degree: p.degree || "", major: p.major || "",
        graduation_year: p.graduation_year || "", start_year: p.start_year || "",
        current_status: p.current_status || "College Student", bio: p.bio || "",
        github_url: p.github_url || "", scholar_url: p.scholar_url || "",
        website_url: p.website_url || "", intro_video_url: p.intro_video_url || "",
        linkedin_url: p.linkedin_url || "",
        twitter_url: p.twitter_url || "", headline: p.headline || "",
        resume_url: p.resume_url || "", phone_number: p.phone_number || "",
        city: p.city || "", country: p.country || "", gender: p.gender || "",
        interests: p.interests || "", languages: p.languages || "",
        is_phd_seeker: p.is_phd_seeker || false,
        research_interests: p.research_interests || "",
        gpa: p.gpa || "", gre_score: p.gre_score || "", toefl_score: p.toefl_score || ""
      });
      
      if (p.interests) setSelectedInterests(p.interests.split(",").map(i => i.trim()));
      if (p.languages) setSelectedLanguages(p.languages.split(",").map(i => i.trim()));
      
      if (p.work_experiences) setWorkExperiences(p.work_experiences);
      if (p.educations) setEducations(p.educations);
      if (p.projects) setProjects(p.projects);
      if (p.publications) setPublications(p.publications);
      
      setPrimarySkills(p.primary_skills || "");
      setTools(p.tools_libraries || "");

      // If profile exists (has an ID), default to View mode
      if (p.id) setIsEditing(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) setList(prev => prev.filter(i => i !== item));
    else setList(prev => [...prev, item]);
  };

  // Dynamic List Handlers
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { title: "", company: "", start_date: "", end_date: "", description: "" }]);
  };
  const updateWorkExperience = (index, field, value) => {
    const newExp = [...workExperiences];
    newExp[index][field] = value;
    setWorkExperiences(newExp);
  };
  const removeWorkExperience = (index) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations([...educations, { institution: "", degree: "", start_year: "", end_year: "", grade: "" }]);
  };
  const updateEducation = (index, field, value) => {
    const newEdu = [...educations];
    newEdu[index][field] = value;
    setEducations(newEdu);
  };
  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { title: "", tech_stack: "", url: "", description: "" }]);
  };
  const updateProject = (index, field, value) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addPublication = () => {
    setPublications([...publications, { title: "", journal_conference: "", publication_date: "", url: "", description: "" }]);
  };
  const updatePublication = (index, field, value) => {
    const newPub = [...publications];
    newPub[index][field] = value;
    setPublications(newPub);
  };
  const removePublication = (index) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  const handleResumeAutofill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsParsing(true);
    setMessage({ type: "info", text: "Parsing resume..." });
    
    try {
      const result = await parseResume(file);
      const data = result.extracted_data;
      
      // Update basic fields
      setFormData(prev => ({
        ...prev,
        phone_number: data.phone_number || prev.phone_number,
        headline: data.headline || prev.headline,
        email: data.email || prev.email,
        github_url: data.github_url || prev.github_url,
        linkedin_url: data.linkedin_url || prev.linkedin_url,
        behance_url: data.behance_url || prev.behance_url,
        twitter_url: data.twitter_url || prev.twitter_url,
        university: data.educations?.[0]?.institution || prev.university,
        degree: data.educations?.[0]?.degree || prev.degree
      }));
      
      // Update Lists (Merge or Replace? Let's append for now)
      if (data.work_experiences?.length) setWorkExperiences(prev => [...prev, ...data.work_experiences]);
      if (data.educations?.length) setEducations(prev => [...prev, ...data.educations]);
      if (data.projects?.length) setProjects(prev => [...prev, ...data.projects]);
      
      if (data.primary_skills) setPrimarySkills(data.primary_skills);
      if (data.tools_libraries) setTools(data.tools_libraries);

      const uploadResult = await uploadResume(file);
      if (uploadResult.url) {
        setFormData(prev => ({ ...prev, resume_url: uploadResult.url }));
      }
      
      setMessage({ type: "success", text: "Resume parsed! Please review the details below." });
    } catch (err) {
        console.error(err);
      setMessage({ type: "error", text: "Failed to process resume." });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare Payload - sanitize integers
      const payload = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        start_year: formData.start_year ? parseInt(formData.start_year) : null,
        interests: selectedInterests.join(", "),
        languages: selectedLanguages.join(", "),
        primary_skills: primarySkills,
        tools_libraries: tools,
        // Map arrays to remove extra fields like ID if they exist, to avoid strict schema issues
        // Although Pydantic usually ignores extras, we do this to be clean
        work_experiences: workExperiences.map(({title, company, start_date, end_date, description, skills_used}) => ({
            title, company, start_date, end_date, description, skills_used
        })),
        educations: educations.map(({institution, degree, start_year, end_year, grade}) => ({
            institution, degree, start_year, end_year, grade
        })),
        projects: projects.map(({title, tech_stack, url, description}) => ({
            title, tech_stack, url, description
        })),
        publications: publications.map(({title, journal_conference, publication_date, url, description}) => ({
            title, journal_conference, publication_date, url, description
        }))
      };
      
      await updateStudentProfile(payload);
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false); // Switch to View Mode
      if (onUpdate) onUpdate();
    } catch (err) {
        console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please check all fields." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    // Combine state into a single object for the View component
    const viewData = {
        ...formData,
        work_experiences: workExperiences,
        educations: educations,
        projects: projects,
        primary_skills: primarySkills,
        tools_libraries: tools,
        interests: selectedInterests.join(", "),
        languages: selectedLanguages.join(", ")
    };
    return <StudentProfileView data={viewData} onEdit={() => setIsEditing(true)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-md max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
        {formData.resume_url && <span className="text-green-600 flex items-center gap-2"><FiCheck /> CV Uploaded</span>}
      </div>

      {/* Resume Upload Section - Front & Center */}
      <div className="bg-indigo-50 p-6 rounded-lg border-2 border-dashed border-indigo-200 text-center">
        <FiUpload className="mx-auto text-4xl text-indigo-500 mb-2" />
        <h3 className="font-semibold text-lg text-indigo-900">Auto-fill with Resume</h3>
        <p className="text-sm text-indigo-700 mb-4">Upload your CV to automatically extract details</p>
        <div className="flex justify-center items-center gap-4">
            <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
            {isParsing ? "Parsing..." : "Upload Resume / CV"}
            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeAutofill} disabled={isParsing} />
            </label>
            {formData.resume_url && (
                <a href={getResumeUrl(formData.resume_url)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">View Uploaded CV</a>
            )}
        </div>
        {message.text && <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>}
      </div>

      {/* 1. Core Profile & Identity */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiFileText /> Core Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">I am a</label>
                <select name="current_status" value={formData.current_status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg">
                    {USER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Headline</label>
                <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Full Stack Developer | React Expert" className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <div className="flex gap-2 mt-1">
                    {GENDER_OPTIONS.map(g => (
                        <button key={g} type="button" onClick={() => setFormData(p => ({...p, gender: g}))}
                            className={`px-4 py-2 rounded-full text-sm border ${formData.gender === g ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* PhD Matcher Section */}
      <section className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center gap-4 mb-4">
            <input 
                type="checkbox" 
                name="is_phd_seeker" 
                id="is_phd_seeker"
                checked={formData.is_phd_seeker} 
                onChange={handleChange} 
                className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
            />
            <label htmlFor="is_phd_seeker" className="text-xl font-bold text-purple-900 cursor-pointer">
                I am looking for a PhD Supervisor
            </label>
        </div>
        
        {formData.is_phd_seeker && (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-purple-900">Research Interests & Goals (Detailed)</label>
                    <textarea 
                        name="research_interests" 
                        value={formData.research_interests} 
                        onChange={handleChange} 
                        rows={4}
                        placeholder="Describe your research interests, potential topics, and career goals..."
                        className="w-full mt-1 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-900">Overall GPA</label>
                        <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} placeholder="e.g. 3.8/4.0" className="w-full mt-1 p-2 border border-purple-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-900">GRE Score</label>
                        <input type="text" name="gre_score" value={formData.gre_score} onChange={handleChange} placeholder="e.g. 320" className="w-full mt-1 p-2 border border-purple-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-900">TOEFL/IELTS</label>
                        <input type="text" name="toefl_score" value={formData.toefl_score} onChange={handleChange} placeholder="e.g. 110" className="w-full mt-1 p-2 border border-purple-300 rounded-lg" />
                    </div>
                </div>

                {/* Publications List */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-purple-900">Publications / Papers</label>
                        <button type="button" onClick={addPublication} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                            <FiPlus /> Add Paper
                        </button>
                    </div>
                    <div className="space-y-4">
                        {publications.map((pub, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 relative group">
                                <button type="button" onClick={() => removePublication(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition bg-gray-50 p-2 rounded-full hover:bg-red-50">
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
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div className="relative">
                                        <FiBook className="absolute top-3.5 left-3 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Journal / Conference Name" 
                                            value={pub.journal_conference} 
                                            onChange={(e) => updatePublication(index, 'journal_conference', e.target.value)} 
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        />
                                    </div>
                                     <div className="relative">
                                        <FiLink className="absolute top-3.5 left-3 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Link to Paper (URL)" 
                                            value={pub.url} 
                                            onChange={(e) => updatePublication(index, 'url', e.target.value)} 
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                                
                                <textarea 
                                    placeholder="Abstract / Short Description..." 
                                    value={pub.description} 
                                    onChange={(e) => updatePublication(index, 'description', e.target.value)} 
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-24 resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* 2. Socials */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiGlobe /> Socials & Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-2">
                <FiGithub className="text-xl" />
                <input type="text" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="GitHub URL" className="w-full p-2 border rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
                <FiLinkedin className="text-xl text-blue-600" />
                <input type="text" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-2 border rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
                <FiTwitter className="text-xl text-blue-400" />
                <input type="text" name="twitter_url" value={formData.twitter_url} onChange={handleChange} placeholder="Twitter URL" className="w-full p-2 border rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
                <FiGlobe className="text-xl" />
                <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="Personal Website" className="w-full p-2 border rounded-lg" />
            </div>
        </div>
      </section>

      {/* 3. Work Experience */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><FiBook /> Work Experience</h3>
            <button type="button" onClick={addWorkExperience} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"><FiPlus /> Add</button>
        </div>
        <div className="space-y-4">
            {workExperiences.map((exp, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                    <button type="button" onClick={() => removeWorkExperience(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => updateWorkExperience(index, 'title', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateWorkExperience(index, 'company', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="Start Date (e.g. 2020)" value={exp.start_date} onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="End Date (e.g. Present)" value={exp.end_date} onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)} className="p-2 border rounded" />
                    </div>
                    <textarea placeholder="Description (Bullet points)" value={exp.description} onChange={(e) => updateWorkExperience(index, 'description', e.target.value)} className="w-full p-2 border rounded h-20" />
                </div>
            ))}
        </div>
      </section>

      {/* 4. Education */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><FiBook /> Education</h3>
            <button type="button" onClick={addEducation} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"><FiPlus /> Add</button>
        </div>
        <div className="space-y-4">
            {educations.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="Start Year" value={edu.start_year} onChange={(e) => updateEducation(index, 'start_year', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="End Year" value={edu.end_year} onChange={(e) => updateEducation(index, 'end_year', e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="Grade/CGPA" value={edu.grade} onChange={(e) => updateEducation(index, 'grade', e.target.value)} className="p-2 border rounded" />
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 5. Projects */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><FiBook /> Projects</h3>
            <button type="button" onClick={addProject} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 flex items-center gap-1"><FiPlus /> Add</button>
        </div>
        <div className="space-y-4">
            {projects.map((proj, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                    <button type="button" onClick={() => removeProject(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FiTrash2 /></button>
                    <div className="grid grid-cols-1 gap-4 mb-2">
                        <input type="text" placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(index, 'title', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="text" placeholder="Project URL" value={proj.url} onChange={(e) => updateProject(index, 'url', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="text" placeholder="Tech Stack (comma separated)" value={proj.tech_stack} onChange={(e) => updateProject(index, 'tech_stack', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} className="w-full p-2 border rounded h-20" />
                </div>
            ))}
        </div>
      </section>

      {/* 6. Skills */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><FiCheck /> Skills</h3>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Primary Skills (Top 5)</label>
                <input type="text" value={primarySkills} onChange={(e) => setPrimarySkills(e.target.value)} placeholder="e.g. Python, React, Node.js (Comma separated)" className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tools & Libraries</label>
                <input type="text" value={tools} onChange={(e) => setTools(e.target.value)} placeholder="e.g. Pandas, Docker, Git (Comma separated)" className="w-full mt-1 p-2 border rounded-lg" />
            </div>
        </div>
      </section>

      {/* 7. Additional Info */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Interests & Languages</h3>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                    <button key={interest} type="button" onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                        className={`px-3 py-1 rounded-full text-sm border ${selectedInterests.includes(interest) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {interest}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(lang => (
                    <button key={lang} type="button" onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                        className={`px-3 py-1 rounded-full text-sm border ${selectedLanguages.includes(lang) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {lang}
                    </button>
                ))}
            </div>
        </div>
      </section>

      <div className="pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading || !formData.resume_url}
          className={`w-full py-4 rounded-lg font-bold text-lg text-white shadow-lg ${
            isLoading || !formData.resume_url ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transition'
          }`}
        >
          {isLoading ? 'Saving Profile...' : 'Save & Complete Profile'}
        </button>
        {!formData.resume_url && <p className="text-center text-red-500 mt-2 text-sm">Please upload your CV/Resume to continue</p>}
      </div>
    </form>
  );
};

export default StudentProfileForm;