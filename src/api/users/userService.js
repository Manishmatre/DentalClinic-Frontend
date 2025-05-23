import axios from '../axios';

const BASE_URL = '/users';

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

const userService = {
  // Get all users
  getUsers: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}`, {
        params: { clinicId }
      });
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getUsers');
    }
  },

  // Get user by ID
  getUser: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${userId}`);
      console.log('User fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getUser');
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}`, userData);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createUser');
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${userId}`, userData);
      console.log('User updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateUser');
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${userId}`);
      console.log('User deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteUser');
    }
  },

  // Get staff users (doctors, receptionists, etc.)
  getStaffUsers: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}/staff`, {
        params: { clinicId }
      });
      console.log('Staff users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getStaffUsers');
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${userId}/profile`, profileData);
      console.log('Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateProfile');
    }
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${userId}/password`, passwordData);
      console.log('Password changed successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'changePassword');
    }
  }
};

export default userService;
