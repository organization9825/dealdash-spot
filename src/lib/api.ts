import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/vendors/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
    }
    return response.data;
  },

  register: async (vendorData: any) => {
    const response = await api.post('/api/vendors/register', vendorData);
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('vendorToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('vendorToken');
  }
};

// Vendor service
export const vendorService = {
  getAll: async () => {
    const response = await api.get('/api/vendors/');
    return response.data;
  },

  update: async (id: string, vendorData: any) => {
    const response = await api.put(`/api/vendors/${id}`, vendorData);
    return response.data;
  }
};

// Menu service
export const menuService = {
  getVendorMenu: async () => {
    const response = await api.get('/api/vendors/menu/');
    return response.data;
  },

  addMenuItem: async (menuItem: any) => {
    const response = await api.post('/api/vendors/menu/', menuItem);
    return response.data;
  },

  updateMenuItem: async (id: string, menuItem: any) => {
    const response = await api.put(`/api/vendors/menu/${id}`, menuItem);
    return response.data;
  },

  deleteMenuItem: async (id: string) => {
    const response = await api.delete(`/api/vendors/menu/${id}`);
    return response.data;
  }
};