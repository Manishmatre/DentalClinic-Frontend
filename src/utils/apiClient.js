import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookies for cross-origin requests
});

// Add request interceptor to include tenant ID and auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get tenant ID from localStorage
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle tenant-related errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Handle tenant errors
      if (status === 403 && data.message?.includes('tenant')) {
        console.error('Tenant error:', data.message);
        // Redirect to tenant selection or error page
        // window.location.href = '/tenant-error';
      }
      
      // Handle subscription/plan errors
      if (status === 402) {
        console.error('Subscription error:', data.message);
        // Redirect to subscription page
        // window.location.href = '/subscription';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
const api = {
  // GET request
  get: async (url, config = {}) => {
    return apiClient.get(url, config);
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    return apiClient.delete(url, config);
  },
  
  // Upload file
  upload: async (url, formData, onProgress = () => {}, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });
  },
  
  // Set tenant ID for all future requests
  setTenantId: (tenantId) => {
    if (tenantId) {
      localStorage.setItem('tenantId', tenantId);
      apiClient.defaults.headers.common['x-tenant-id'] = tenantId;
    } else {
      localStorage.removeItem('tenantId');
      delete apiClient.defaults.headers.common['x-tenant-id'];
    }
  },
  
  // Get current tenant ID
  getTenantId: () => {
    return localStorage.getItem('tenantId');
  },
  
  // Clear tenant ID
  clearTenantId: () => {
    localStorage.removeItem('tenantId');
    delete apiClient.defaults.headers.common['x-tenant-id'];
  }
};

export default api;
