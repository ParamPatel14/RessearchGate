import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (email, password, name, role) => {
  const response = await api.post("/auth/register", { email, password, name, role });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users/");
  return response.data;
};

// Profile APIs
export const getProfile = async () => {
  const response = await api.get("/profiles/me");
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await api.put("/profiles/me/student", data);
  return response.data;
};

export const updateMentorProfile = async (data) => {
  const response = await api.put("/profiles/me/mentor", data);
  return response.data;
};

export const addSkills = async (skills) => {
  const response = await api.post("/profiles/me/skills", skills);
  return response.data;
};

// Skills APIs
export const getSkills = async (search = "") => {
  const response = await api.get(`/skills/?search=${search}`);
  return response.data;
};

export const createSkill = async (name) => {
  const response = await api.post("/skills/", { name });
  return response.data;
};

export const getCompleteness = async () => {
  const response = await api.get("/profiles/me/completeness");
  return response.data;
};

// Admin APIs
export const getPendingMentors = async () => {
  const response = await api.get("/admin/mentors/pending");
  return response.data;
};

export const verifyMentor = async (userId) => {
  const response = await api.put(`/admin/verify/mentor/${userId}`);
  return response.data;
};

export const getAllStudents = async () => {
  const response = await api.get("/admin/users/students");
  return response.data;
};

export const getAllMentors = async () => {
  const response = await api.get("/admin/users/mentors");
  return response.data;
};

export const createAdminOpportunity = async (data) => {
  const response = await api.post("/admin/opportunities", data);
  return response.data;
};

export const getAllApplications = async () => {
  const response = await api.get("/admin/applications");
  return response.data;
};

// Opportunity APIs
export const createOpportunity = async (data) => {
  const response = await api.post("/opportunities/", data);
  return response.data;
};

export const getOpportunities = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/opportunities/?${params}`);
  return response.data;
};

// Certificate APIs
export const generateCertificate = async (data) => {
  const response = await api.post("/certificates/generate", data);
  return response.data;
};

export const verifyCertificate = async (uuid) => {
  const response = await api.get(`/certificates/${uuid}`);
  return response.data;
};

export const getMyCertificates = async () => {
  const response = await api.get("/certificates/my/certificates");
  return response.data;
};

// Analytics APIs
export const getAnalytics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

// Tool APIs
export const refineText = async (text) => {
  const response = await api.post("/tools/refine", { text });
  return response.data;
};

export const translateText = async (text, targetLang) => {
  const response = await api.post("/tools/translate", { text, target_language: targetLang });
  return response.data;
};

export const getOpportunity = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

export const getMatchPreview = async (id) => {
  const response = await api.get(`/opportunities/${id}/match-preview`);
  return response.data;
};

// Application APIs
export const applyForOpportunity = async (opportunityId, coverLetter, matchScore = null, matchDetails = null) => {
  const payload = {
    opportunity_id: opportunityId,
    cover_letter: coverLetter
  };
  
  if (matchScore !== null) {
    payload.match_score = matchScore;
    payload.match_details = JSON.stringify(matchDetails);
  }

  const response = await api.post("/applications/", payload);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get("/applications/me");
  return response.data;
};

export const getMentorApplications = async () => {
  const response = await api.get("/applications/mentor");
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/applications/${id}/status`, { status });
  return response.data;
};

// Improvement Plan APIs
export const generateImprovementPlan = async (opportunityId) => {
  const response = await api.post(`/improvement/generate/${opportunityId}`);
  return response.data;
};

export const getMyImprovementPlans = async () => {
  const response = await api.get("/improvement/");
  return response.data;
};

export const getImprovementPlan = async (planId) => {
  const response = await api.get(`/improvement/${planId}`);
  return response.data;
};

export const updatePlanItem = async (itemId, data) => {
  const response = await api.put(`/improvement/item/${itemId}`, data);
  return response.data;
};

export const getMentorImprovementPlans = async (opportunityId) => {
  const response = await api.get(`/improvement/mentor/${opportunityId}`);
  return response.data;
};

// Assignment APIs
export const createAssignment = async (data) => {
  const response = await api.post("/assignments/", data);
  return response.data;
};

export const getOpportunityAssignments = async (opportunityId) => {
  const response = await api.get(`/assignments/opportunity/${opportunityId}`);
  return response.data;
};

export const submitAssignment = async (assignmentId, data) => {
  const response = await api.post(`/assignments/${assignmentId}/submit`, data);
  return response.data;
};

export const getSubmissions = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const gradeSubmission = async (submissionId, data) => {
  const response = await api.post(`/assignments/submissions/${submissionId}/grade`, data);
  return response.data;
};

// Research Project APIs
export const createResearchProject = async (data) => {
  const response = await api.post("/research/", data);
  return response.data;
};

export const getMyResearchProjects = async () => {
  const response = await api.get("/research/my");
  return response.data;
};

export const updateResearchProjectStatus = async (projectId, data) => {
  const response = await api.put(`/research/${projectId}`, data);
  return response.data;
};

// Communication APIs
export const sendMessage = async (data) => {
  const response = await api.post("/comm/messages/", data);
  return response.data;
};

export const getChatHistory = async (otherUserId) => {
  const response = await api.get(`/comm/messages/${otherUserId}`);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/comm/conversations");
  return response.data;
};

export const scheduleMeeting = async (data) => {
  const response = await api.post("/comm/meetings/", data);
  return response.data;
};

export const getMyMeetings = async () => {
  const response = await api.get("/comm/meetings/");
  return response.data;
};

// Reference APIs
export const createReference = async (data) => {
  const response = await api.post("/references/", data);
  return response.data;
};

export const getStudentReferences = async (studentId) => {
  const response = await api.get(`/references/student/${studentId}`);
  return response.data;
};

// Resume APIs
export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/resume/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export default api;

// AI Features
export const analyzeMatch = async (opportunityId) => {
  const response = await api.post('/ai/match-analysis', { opportunity_id: opportunityId });
  return response.data;
};

export const getSmartMatches = async () => {
  const response = await api.get('/matches/mentors');
  return response.data;
};

export const generateAICoverLetter = async (opportunityId) => {
  const response = await api.post('/ai/cover-letter', { opportunity_id: opportunityId });
  return response.data;
};

