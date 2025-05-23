import axios from '../axios';

const BASE_URL = '/roles';

// Helper function to handle API errors with better logging
const handleApiError = (error, operation) => {
  if (error.response) {
    // The request was made and the server responded with a status code outside the 2xx range
    console.error(`API ${operation} failed with status ${error.response.status}:`, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`API ${operation} failed - No response received:`, error.request);
  } else {
    // Something happened in setting up the request
    console.error(`API ${operation} setup error:`, error.message);
  }
  throw error;
};

const roleService = {
  // Get all roles
  getRoles: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}`, {
        params: { clinicId }
      });
      console.log('Roles fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getRoles');
    }
  },

  // Get role by ID
  getRole: async (roleId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${roleId}`);
      console.log('Role fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getRole');
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await axios.post(`${BASE_URL}`, roleData);
      console.log('Role created successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createRole');
    }
  },

  // Update role
  updateRole: async (roleId, roleData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${roleId}`, roleData);
      console.log('Role updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateRole');
    }
  },

  // Delete role
  deleteRole: async (roleId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${roleId}`);
      console.log('Role deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteRole');
    }
  },

  // Get all permissions
  getPermissions: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/permissions`);
      console.log('Permissions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getPermissions');
    }
  },

  // Assign role to user
  assignRole: async (userId, roleId, clinicId) => {
    try {
      const response = await axios.post(`${BASE_URL}/assign`, { userId, roleId, clinicId });
      console.log('Role assigned successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'assignRole');
    }
  },

  // Initialize default roles for a clinic
  initializeRoles: async (clinicId) => {
    try {
      const response = await axios.post(`${BASE_URL}/initialize`, { clinicId });
      console.log('Default roles initialized successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'initializeRoles');
    }
  },
};

export default roleService;
