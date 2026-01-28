import { useState, useEffect } from "react";
import { updateStudentProfile, uploadResume, parseResume } from "../api";
import { FiBook, FiGithub, FiGlobe, FiVideo, FiUpload, FiCheck, FiFileText, FiX, FiPlus, FiTrash2, FiLinkedin, FiTwitter, FiEdit2 } from "react-icons/fi";

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

const StudentProfileView = ({ data, onEdit }) => {
  return (
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
             
             {data.resume_url && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Resume</h3>
                    <a href={data.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 border border-indigo-200 px-4 py-2 rounded hover:bg-indigo-50 transition">
                        <FiFileText /> View Uploaded CV
                    </a>
                </div>
             )}
        </div>
      </div>
    </div>
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
    interests: "", languages: ""
  });

  // Dynamic Lists
  const [workExperiences, setWorkExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Skills
  const [primarySkills, setPrimarySkills] = useState("");
  const [tools, setTools] = useState("");

  // UI State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(true);

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
        interests: p.interests || "", languages: p.languages || ""
      });
      
      if (p.interests) setSelectedInterests(p.interests.split(",").map(i => i.trim()));
      if (p.languages) setSelectedLanguages(p.languages.split(",").map(i => i.trim()));
      
      if (p.work_experiences) setWorkExperiences(p.work_experiences);
      if (p.educations) setEducations(p.educations);
      if (p.projects) setProjects(p.projects);
      
      setPrimarySkills(p.primary_skills || "");
      setTools(p.tools_libraries || "");

      // If profile exists (has an ID), default to View mode
      if (p.id) setIsEditing(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">View Uploaded CV</a>
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