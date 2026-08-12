// frontend/src/services/api.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { Application, ApplicationQueryParams, StatsData } from '../types/Application';

// In development, use empty baseURL so requests go through Vite proxy.
// In production, use the full backend URL from environment.
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com'
  : '';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

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

export const login = (email: string, password: string): Promise<{ token: string; email: string }> => {
  return apiClient.post('/api/auth/login', { email, password });
};

export const register = (email: string, password: string): Promise<{ token: string; email: string }> => {
  return apiClient.post('/api/auth/register', { email, password });
};

export const getSources = (): Promise<string[]> => {
  return apiClient.get('/api/stats/sources');
};

export const bulkCreateApplications = (applications: Omit<Application, '_id' | 'createdAt' | 'updatedAt' | 'statusHistory'>[]): Promise<Application[]> => {
  return apiClient.post('/api/applications/bulk', { applications });
};

// Health check function (uses fetch to avoid interceptors and token injection)
export const checkHealth = (signal?: AbortSignal): Promise<void> => {
  const url = import.meta.env.PROD
    ? `${import.meta.env.VITE_API_URL}/api/health`
    : '/api/health';
  return fetch(url, {
    method: 'GET',
    signal,
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }).then(() => undefined);
};