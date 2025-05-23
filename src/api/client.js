import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://dentalclinic-backend.onrender.com/api';
const TOKEN_KEY = 'authToken';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the auth token
client.interceptors.request.use(
  (config) => {
    // Get the token on each request to ensure we have the latest
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add more detailed logging for staff request endpoints
      if (config.url?.includes('staff-requests')) {
        console.log(`API Client: Request to ${config.url}`, {
          method: config.method?.toUpperCase(),
          params: config.params,
          headers: {
            ...config.headers,
            Authorization: 'Bearer [REDACTED]' // Don't log the actual token
          }
        });
      } else {
        console.log('API Client: Added auth token to request');
      }
    } else {
      console.warn('API Client: No auth token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Client: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
client.interceptors.response.use(
  (response) => {
    // Log successful staff request responses
    if (response.config.url?.includes('staff-requests')) {
      console.log(`API Client: Successful response from ${response.config.url}`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // Log detailed error information for staff request endpoints
    if (config?.url?.includes('staff-requests')) {
      console.error(`API Client: Error response from ${config.url}`, {
        status: response?.status,
        statusText: response?.statusText,
        data: response?.data,
        method: config.method?.toUpperCase(),
        params: config.params
      });
    }
    
    if (response?.status === 401) {
      console.warn('API Client: Unauthorized response (401) - clearing auth state');
      // Clear auth state on unauthorized
      localStorage.removeItem(TOKEN_KEY);
      
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('API Client: Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    // Redirect to login if token is invalid or expired
    if (response?.data?.message?.includes('token')) {
      console.warn('API Client: Token-related error received, clearing auth state');
      localStorage.removeItem(TOKEN_KEY);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('API Client: Redirecting to login page');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;