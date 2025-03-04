import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

// Generic API request function with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const { token } = useAuthStore.getState();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    console.log('API Request:', {
      url: `${API_URL}${endpoint}`,
      method: options.method,
      headers,
      body: options.body
    });

    const response = await fetch(`${API_URL}${endpoint}`, config);
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText
    });
    
    const data = await response.json();
    console.log('API Data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return { data };
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API methods
const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (endpoint: string, data: any = {}) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' })
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// User API
export const userAPI = {
  getAllUsers: async (params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/users?${queryParams}`);
  },
  
  getUserById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },
  
  createUser: async (userData: any) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  deleteUser: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  },
  
  resetPassword: async (id: string, newPassword: string) => {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }
};

// Dock API
export const dockAPI = {
  getAllDocks: async (params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/docks?${queryParams}`);
  },
  
  getDockById: async (id: string) => {
    return apiRequest(`/docks/${id}`);
  },
  
  createDock: async (dockData: any) => {
    return apiRequest('/docks', {
      method: 'POST',
      body: JSON.stringify(dockData)
    });
  },
  
  updateDock: async (id: string, dockData: any) => {
    return apiRequest(`/docks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dockData)
    });
  },
  
  deleteDock: async (id: string) => {
    return apiRequest(`/docks/${id}`, {
      method: 'DELETE'
    });
  },
  
  getDockSchedule: async (id: string, params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/docks/${id}/schedule?${queryParams}`);
  },
  
  checkDockAvailability: async (id: string, params: any = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/docks/${id}/availability?${queryParams}`);
  }
};

export default api;