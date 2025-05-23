import axios from '../axios';

const BASE_URL = '/branches';

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

const branchService = {
  // Get all branches for the current clinic
  getBranches: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getBranches');
    }
  },

  // Get a single branch by ID
  getBranch: async (branchId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${branchId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getBranch');
    }
  },

  // Get the main branch for the current clinic
  getMainBranch: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/main`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getMainBranch');
    }
  },

  // Create a new branch
  createBranch: async (branchData) => {
    try {
      const response = await axios.post(BASE_URL, branchData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createBranch');
    }
  },

  // Update a branch
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateBranch');
    }
  },

  // Delete a branch
  deleteBranch: async (branchId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${branchId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteBranch');
    }
  },

  // Set a branch as the main branch
  setMainBranch: async (branchId) => {
    try {
      const response = await axios.put(`${BASE_URL}/${branchId}/set-main`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'setMainBranch');
    }
  }
};

export default branchService;
