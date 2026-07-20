import axios from 'axios';
import type { Application, ApiResponse, ApplicationQueryParams } from '../types/Application';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export const applicationApi = {
  getAll: async (params?: ApplicationQueryParams): Promise<Application[]> => {
    const response = await api.get<ApiResponse<Application[]>>('/api/applications', { params });
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<Application> => {
    const response = await api.get<ApiResponse<Application>>(`/api/applications/${id}`);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch');
    if (!response.data.data) throw new Error('No data');
    return response.data.data;
  },

  create: async (data: Omit<Application, '_id' | 'createdAt' | 'updatedAt'>): Promise<Application> => {
    const response = await api.post<ApiResponse<Application>>('/api/applications', data);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to create');
    if (!response.data.data) throw new Error('No data');
    return response.data.data;
  },

  update: async (id: string, data: Partial<Application>): Promise<Application> => {
    const response = await api.put<ApiResponse<Application>>(`/api/applications/${id}`, data);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to update');
    if (!response.data.data) throw new Error('No data');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/api/applications/${id}`);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to delete');
  },
};