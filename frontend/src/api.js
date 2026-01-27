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

export default api;
