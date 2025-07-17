import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'authToken';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Add a request interceptor to attach the auth token
client.interceptors.request.use(
  async (config) => {
    // Get the token and refresh token
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token) {
      console.warn('API Client: No auth token found, checking if we need to refresh');
      
      // If we have a refresh token, try to refresh
      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          if (refreshResponse.data.token) {
            localStorage.setItem(TOKEN_KEY, refreshResponse.data.token);
            config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            console.log('API Client: Token refreshed successfully');
          }
        } catch (refreshError) {
          console.error('API Client: Failed to refresh token:', refreshError);
          // Clear auth state on refresh failure
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('refreshToken');
          
          // If not on login page, redirect to login
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        console.error('API Client: No auth token or refresh token found');
        return Promise.reject(new Error('No auth token available'));
      }
    } else {
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
    }
    // Add tenant header if present
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
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
    
    // Handle token-related errors
    if (response?.data?.message?.includes('token') || response?.status === 401) {
      console.warn('API Client: Token-related error received, attempting to refresh token');
      
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          if (refreshResponse.data.token) {
            localStorage.setItem(TOKEN_KEY, refreshResponse.data.token);
            // Retry the original request with new token
            config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return client(config);
          }
        } catch (refreshError) {
          console.error('API Client: Failed to refresh token:', refreshError);
        }
      }
      
      // If refresh fails or no refresh token, clear auth state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('refreshToken');
      
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