import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:8001/api'; // Update this to your backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newToken = response.data.access;
          await AsyncStorage.setItem('auth_token', newToken);
          
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'client' | 'worker';
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  profile_picture?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  years_of_experience?: number;
  experience_description?: string;
  average_rating: number;
  total_reviews: number;
  total_completed_jobs: number;
  rating_display: string;
  experience_display: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  category_name: string;
  category_slug: string;
  job_type: 'one-time' | 'recurring' | 'urgent';
  job_type_display: string;
  urgent: boolean;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  status_display: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  duration?: string;
  duration_display?: string;
  flexible_schedule: boolean;
  payment_type: 'fixed' | 'hourly';
  payment_type_display: string;
  budget: number;
  budget_currency: string;
  budget_display: string;
  experience_level: 'any' | 'beginner' | 'experienced' | 'expert';
  experience_level_display: string;
  special_requirements?: string;
  views_count: number;
  applications_count: number;
  client_name: string;
  client_email: string;
  posted_time_ago: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
}

export interface JobListItem {
  id: string;
  title: string;
  description: string;
  category_name: string;
  city: string;
  job_type: string;
  urgent: boolean;
  budget_display: string;
  posted_time_ago: string;
  client_name: string;
  status: string;
}

export interface Bid {
  id: string;
  job: string;
  worker: string;
  price: number;
  availability: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
  response_at?: string;
}

export interface CreateBidRequest {
  job: string;
  price: number;
  availability: string;
  proposal: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: 'client' | 'worker';
  phone_number?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  years_of_experience?: number;
  experience_description?: string;
}

// API Functions
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout/`, {
        refresh: refreshToken,
      });
    } catch (error) {
      // Logout endpoint might fail, but we still want to clear local data
      console.log('Logout API call failed, but continuing with local cleanup');
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (profileData: ProfileUpdateRequest): Promise<User> => {
    const response = await api.patch('/auth/profile/', profileData);
    return response.data.user;
  },

  uploadProfilePicture: async (imageFile: any): Promise<{ profile_picture_url: string }> => {
    const formData = new FormData();
    formData.append('profile_picture', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'profile.jpg',
    } as any);

    const response = await api.post('/auth/profile/picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const jobsAPI = {
  // Get jobs list (different for clients vs workers)
  getJobs: async (params?: {
    category?: string;
    city?: string;
    job_type?: string;
    urgent?: boolean;
    min_budget?: number;
    max_budget?: number;
    search?: string;
    ordering?: string;
  }): Promise<JobListItem[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/jobs/?${queryParams.toString()}`);
    return response.data.results || response.data;
  },

  // Get job details
  getJob: async (jobId: string): Promise<Job> => {
    const response = await api.get(`/jobs/${jobId}/`);
    return response.data;
  },

  // Create new job (clients only)
  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const response = await api.post('/jobs/', jobData);
    return response.data.job;
  },

  // Update job (clients only)
  updateJob: async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await api.patch(`/jobs/${jobId}/`, jobData);
    return response.data.job;
  },

  // Delete job (clients only)
  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/jobs/${jobId}/`);
  },

  // Get job categories
  getCategories: async (): Promise<JobCategory[]> => {
    const response = await api.get('/job-categories/');
    return response.data.results || response.data;
  },
};

export const bidsAPI = {
  // Get bids (different for clients vs workers)
  getBids: async (params?: {
    job?: string;
    status?: string;
  }): Promise<Bid[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/bids/?${queryParams.toString()}`);
    return response.data.results || response.data;
  },

  // Create bid (workers only)
  createBid: async (bidData: CreateBidRequest): Promise<Bid> => {
    const response = await api.post('/bids/', bidData);
    return response.data.bid;
  },

  // Update bid status (clients can accept/reject, workers can withdraw)
  updateBid: async (bidId: string, data: { status: string }): Promise<Bid> => {
    const response = await api.patch(`/bids/${bidId}/`, data);
    return response.data;
  },
};

export default api; 