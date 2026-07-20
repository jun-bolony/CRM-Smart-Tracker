import axios from 'axios';
import { Application, ApiResponse, ApplicationQueryParams } from '../types/Application';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export const applicationApi = {
  // Get all applications (filters can be added later)
  getAll: async (params?: ApplicationQueryParams): Promise<Application[]> => {
    const response = await api.get<ApiResponse<Application[]>>('/api/applications', { params });
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch applications');
    return response.data.data || [];
  },

  // Get a single application by ID
  getOne: async (id: string): Promise<Application> => {
    const response = await api.get<ApiResponse<Application>>(`/api/applications/${id}`);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch application');
    if (!response.data.data) throw new Error('No data received');
    return response.data.data;
  },

  // Create a new application
  create: async (data: Omit<Application, '_id' | 'createdAt' | 'updatedAt'>): Promise<Application> => {
    const response = await api.post<ApiResponse<Application>>('/api/applications', data);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to create application');
    if (!response.data.data) throw new Error('No data received');
    return response.data.data;
  },

  // Update an existing application
  update: async (id: string, data: Partial<Application>): Promise<Application> => {
    const response = await api.put<ApiResponse<Application>>(`/api/applications/${id}`, data);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to update application');
    if (!response.data.data) throw new Error('No data received');
    return response.data.data;
  },

  // Delete an application
  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/api/applications/${id}`);
    if (!response.data.success) throw new Error(response.data.message || 'Failed to delete application');
  },
};