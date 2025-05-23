import axios from 'axios';

// Define token constants
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'authToken';

// Create axios instance with consistent base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to inject the auth token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't handle errors for auth-related pages to prevent redirect loops
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const isAuthPath = authPaths.some(path => window.location.pathname.includes(path));
    
    // Only handle auth errors for non-auth pages
    if (!isAuthPath && error.response) {
      // Check if error is due to token expiry or invalid authentication
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn('Authentication error detected:', error.response?.data?.message);
        
        // Only clear token and redirect on specific auth errors
        if (error.response?.data?.message === 'Token expired' || 
            error.response?.data?.message === 'Invalid token' ||
            error.response?.data?.message === 'No token provided') {
          
          console.log('Clearing invalid token');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('userData');
          localStorage.removeItem('clinicData');
          
          // Store the current URL to redirect back after login
          const currentPath = window.location.pathname;
          if (currentPath !== '/' && !currentPath.includes('/login')) {
            localStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          // Use history.push instead of location.href to prevent full page reload
          window.location.href = '/login';
          return Promise.reject(new Error('Authentication required'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Export getter/setter helper functions
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

export default api;