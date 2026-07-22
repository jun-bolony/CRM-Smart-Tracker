// frontend/src/types/Application.ts
export type ApplicationStatus =
  | 'Sent'
  | 'Viewed'
  | 'Interview'
  | 'Test'
  | 'Offer'
  | 'Rejected'
  | 'Archived';

export interface Application {
  _id?: string;
  userId?: string;
  company: string;
  position: string;
  url?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  salaryMin?: number;
  salaryMax?: number;
  source?: string;
  status: ApplicationStatus;
  appliedDate: Date | string;
  nextEventDate?: Date | string;
  notes?: string[];
  statusHistory?: {
    status: ApplicationStatus;
    changedAt: Date | string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApplicationQueryParams {
  status?: string; // comma-separated statuses, e.g. "Sent,Viewed"
  source?: string;
  search?: string;
  sortBy?: 'appliedDate' | 'nextEventDate' | 'salaryMax';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StatsData {
  statusDistribution: { name: string; value: number }[];
  timeline: { date: string; count: number }[];
  topSources: { source: string; count: number }[];
  funnel: { stage: string; count: number }[];
  totalApplications: number;
  offerCount: number;
  offerRate: number;
}