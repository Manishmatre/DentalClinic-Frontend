import axios from '../axios';

const BASE_URL = '/services';

// Helper function to handle API errors with better logging
const handleApiError = (error, operation) => {
  if (error.response) {
    console.error(`API ${operation} failed with status ${error.response.status}:`, error.response.data);
  } else if (error.request) {
    console.error(`API ${operation} failed - No response received:`, error.request);
  } else {
    console.error(`API ${operation} setup error:`, error.message);
  }
  throw error;
};

const serviceService = {
  // Get all services for the current clinic
  getServices: async (filters = {}) => {
    try {
      console.log('Fetching services from API with filters:', filters);
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.branchId) queryParams.append('branchId', filters.branchId);
      if (filters.clinicId) queryParams.append('clinicId', filters.clinicId);
      
      // If no clinicId is provided, try to get it from localStorage
      if (!filters.clinicId) {
        const defaultClinicId = localStorage.getItem('defaultClinicId');
        if (defaultClinicId) {
          console.log('Using clinicId from localStorage:', defaultClinicId);
          queryParams.append('clinicId', defaultClinicId);
        }
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      console.log(`Calling API: ${BASE_URL}${queryString}`);
      const response = await axios.get(`${BASE_URL}${queryString}`);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} services`);
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Successfully fetched ${response.data.data.length} services`);
        return response.data.data;
      } else {
        console.warn('Unexpected response format from services API:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Return empty array instead of throwing to prevent form loading failures
      return [];
    }
  },

  // Get a single service by ID
  getService: async (serviceId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${serviceId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getService');
    }
  },

  // Get popular services
  getPopularServices: async (limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getPopularServices');
    }
  },

  // Create a new service
  createService: async (serviceData) => {
    try {
      const response = await axios.post(BASE_URL, serviceData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createService');
    }
  },

  // Update a service
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateService');
    }
  },

  // Delete a service
  deleteService: async (serviceId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${serviceId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteService');
    }
  },

  // Update service popularity (e.g., when a service is booked)
  updateServicePopularity: async (serviceId) => {
    try {
      const response = await axios.put(`${BASE_URL}/${serviceId}/popularity`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateServicePopularity');
    }
  },

  // Async search for services by name
  async searchServices(query, clinicId) {
    try {
      const params = { search: query, clinicId, limit: 10 };
      const response = await axios.get(`${BASE_URL}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching services:', error);
      return { data: [] };
    }
  },

  // Seed default services for the current clinic (admin only)
  async seedDefaultServices() {
    try {
      const response = await axios.post(`${BASE_URL}/seed`);
      return response.data;
    } catch (error) {
      console.error('Error seeding default services:', error);
      throw error;
    }
  }
};

export default serviceService;
