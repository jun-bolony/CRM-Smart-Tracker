import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { Application, ApplicationQueryParams, StatsData } from '../types/Application';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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