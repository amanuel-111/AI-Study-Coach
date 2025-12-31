import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  register: (data: {
    name: string;
    email: string;
    password: string;
    fieldOfStudy: string;
    level: string;
  }) => api.post('/auth/register', data),
  
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (data: any) => api.put('/user/profile', data),
};

// Chat API
export const chatAPI = {
  sendMessage: (data: { message: string; sessionId?: string }) =>
    api.post('/chat/message', data),
  
  getSessions: () => api.get('/chat/sessions'),
  
  getSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}`),
  
  deleteSession: (sessionId: string) => api.delete(`/chat/sessions/${sessionId}`),
};

// Study Plan API
export const studyPlanAPI = {
  generate: (data: {
    subject: string;
    duration: number;
    hoursPerDay: number;
  }) => api.post('/study-plans/generate', data),
  
  getPlans: () => api.get('/study-plans'),
  
  getPlan: (planId: string) => api.get(`/study-plans/${planId}`),
  
  completeTask: (taskId: string) =>
    api.patch(`/study-plans/tasks/${taskId}/complete`),
};

// Quiz API
export const quizAPI = {
  generate: (data: { subject: string; questionCount?: number }) =>
    api.post('/quiz/generate', data),
  
  submit: (data: { quizId: string; answers: any }) =>
    api.post('/quiz/submit', data),
  
  getHistory: () => api.get('/quiz/history'),
};

// Coding API
export const codingAPI = {
  getProblems: (params?: any) => api.get('/coding/problems', { params }),
  
  getProblem: (problemId: string) => api.get(`/coding/problems/${problemId}`),
  
  submit: (data: {
    problemId: string;
    code: string;
    language: string;
  }) => api.post('/coding/submit', data),
  
  getSubmissions: () => api.get('/coding/submissions'),
};

// Progress API
export const progressAPI = {
  getDashboard: () => api.get('/progress/dashboard'),
  
  getSubjectProgress: (subject: string) =>
    api.get(`/progress/subject/${subject}`),
};

export default api;