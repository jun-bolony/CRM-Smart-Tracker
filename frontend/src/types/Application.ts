export type ApplicationStatus =
  | 'Sent'        // Response sent
  | 'Viewed'      // Viewed by employer
  | 'Interview'   // Interview scheduled
  | 'Test'        // Test task assigned
  | 'Offer'       // Offer received
  | 'Rejected'    // Rejected
  | 'Archived';   // Archived

export interface Application {
  _id?: string;                 // MongoDB ObjectId (string)
  userId?: string;              // For future authentication
  company: string;              // Company name (required)
  position: string;             // Job title (required)
  url?: string;                 // Link to job posting
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  salaryMin?: number;           // Minimum salary
  salaryMax?: number;           // Maximum salary
  source?: string;              // Source (LinkedIn, DOU, etc.)
  status: ApplicationStatus;    // Current status
  appliedDate: Date | string;   // Date of application (defaults to today)
  nextEventDate?: Date | string; // Date of next event (interview, deadline)
  notes?: string[];             // Simple text notes
  statusHistory?: {             // Status change history
    status: ApplicationStatus;
    changedAt: Date | string;
  }[];
  createdAt?: Date | string;    // System creation timestamp
  updatedAt?: Date | string;    // System update timestamp
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApplicationQueryParams {
  status?: ApplicationStatus | ApplicationStatus[];
  source?: string;
  search?: string;           // search by company or position
  sortBy?: 'appliedDate' | 'nextEventDate' | 'salaryMax';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}