import client from '../axios';
import { toast } from 'react-toastify';

// Helper function to handle API calls and suppress console errors
const apiCall = async (apiFunction, errorMessage = 'API call failed') => {
  try {
    return await apiFunction();
  } catch (error) {
    // Only show minimal error info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn(`${errorMessage}: ${error.message || 'Unknown error'}`);
    }
    
    // Return empty data instead of throwing error
    return { data: [], success: false, error: error.message };
  }
};

const serviceService = {
  // Get all services with optional filtering
  async getServices(params = {}) {
    return apiCall(
      async () => {
        const response = await client.get('/services', { params });
        return response.data;
      },
      'Failed to fetch services'
    );
  },

  // Get services by category
  async getServicesByCategory(category, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/services/category/${category}`, { params });
        return response.data;
      },
      `Failed to fetch services for category ${category}`
    );
  },

  // Get a single service by ID
  async getServiceById(serviceId) {
    return apiCall(
      async () => {
        const response = await client.get(`/services/${serviceId}`);
        return response.data;
      },
      `Failed to fetch service ${serviceId}`
    );
  },

  // Create a new service
  async createService(serviceData) {
    try {
      const response = await client.post('/services', serviceData);
      toast.success('Service created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to create service:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Update an existing service
  async updateService(serviceId, serviceData) {
    try {
      const response = await client.put(`/services/${serviceId}`, serviceData);
      toast.success('Service updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update service:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Delete a service
  async deleteService(serviceId) {
    try {
      const response = await client.delete(`/services/${serviceId}`);
      toast.success('Service deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to delete service:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },
  
  // Get service categories
  async getServiceCategories() {
    return apiCall(
      async () => {
        const response = await client.get('/services/categories');
        return response.data;
      },
      'Failed to fetch service categories'
    );
  },
  
  // Format category for display
  formatCategory(category) {
    if (!category) return '';
    // Convert snake_case or kebab-case to Title Case
    return category
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
};

export default serviceService;
