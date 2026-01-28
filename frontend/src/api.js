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

export const getOpportunity = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

export const getMatchPreview = async (id) => {
  const response = await api.get(`/opportunities/${id}/match-preview`);
  return response.data;
};

// Application APIs
export const applyForOpportunity = async (data) => {
  const response = await api.post("/applications/", data);
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

export default api;
