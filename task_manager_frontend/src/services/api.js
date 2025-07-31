import axios from 'axios';

// API base URL - should be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vscode-internal-15654-beta.beta01.cloud.kavia.ai:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
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

// PUBLIC_INTERFACE
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email, password, full_name) {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      full_name 
    });
    return response.data;
  },

  async getCurrentUser(token) {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// PUBLIC_INTERFACE
export const taskService = {
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
    if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const response = await api.get(`/tasks/?${params.toString()}`);
    return response.data;
  },

  async getTask(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async markComplete(taskId) {
    const response = await api.patch(`/tasks/${taskId}/complete`);
    return response.data;
  }
};

export default api;
