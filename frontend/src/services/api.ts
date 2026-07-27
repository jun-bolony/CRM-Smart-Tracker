// frontend/src/services/api.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { Application, ApplicationQueryParams, StatsData } from '../types/Application';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and extract data
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Request failed');
      }
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear token and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (we'll handle it via event or simply reload)
      window.location.href = '/login';
    }
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

// CRUD functions
export const getApplications = (params?: ApplicationQueryParams): Promise<Application[]> => {
  return apiClient.get('/api/applications', { params });
};

export const getApplication = (id: string): Promise<Application> => {
  return apiClient.get(`/api/applications/${id}`);
};

export const createApplication = (data: Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<Application> => {
  return apiClient.post('/api/applications', data);
};

export const updateApplication = (id: string, data: Partial<Application>): Promise<Application> => {
  return apiClient.put(`/api/applications/${id}`, data);
};

export const deleteApplication = (id: string): Promise<void> => {
  return apiClient.delete(`/api/applications/${id}`);
};

export const getStats = (): Promise<StatsData> => {
  return apiClient.get('/api/stats');
};

// Auth API functions
export const login = (email: string, password: string): Promise<{ token: string; email: string }> => {
  return apiClient.post('/api/auth/login', { email, password });
};

export const register = (email: string, password: string): Promise<{ token: string; email: string }> => {
  return apiClient.post('/api/auth/register', { email, password });
};

// --- Sources and bulk import ---
// FIXED: Correct endpoint is '/api/stats/sources' (not '/api/sources')
export const getSources = (): Promise<string[]> => {
  return apiClient.get('/api/stats/sources');
};

export const bulkCreateApplications = (applications: Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>[]): Promise<Application[]> => {
  return apiClient.post('/api/applications/bulk', { applications });
};