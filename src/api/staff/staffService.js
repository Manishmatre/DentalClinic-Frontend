import client from '../client';

const STAFF_URL = '/staff';

const staffService = {
  // Get all staff members with optional filtering
  getStaff: async (params = {}) => {
    try {
      console.log('Fetching staff with params:', params);
      console.log('Staff URL:', STAFF_URL);
      
      // Add a cache-busting parameter
      const requestParams = {
        ...params,
        _t: new Date().getTime() // Add timestamp to prevent caching
      };
      
      const response = await client.get(STAFF_URL, { params: requestParams });
      console.log('Staff API raw response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get a single staff member by ID
  getStaffById: async (id) => {
    try {
      const response = await client.get(`${STAFF_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching staff with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new staff member
  createStaff: async (staffData) => {
    try {
      const response = await client.post(STAFF_URL, staffData);
      return response.data;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },
  
  // Update an existing staff member
  updateStaff: async (id, staffData) => {
    try {
      const response = await client.put(`${STAFF_URL}/${id}`, staffData);
      return response.data;
    } catch (error) {
      console.error(`Error updating staff with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a staff member
  deleteStaff: async (id) => {
    try {
      const response = await client.delete(`${STAFF_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting staff with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Update staff status (active/inactive/on leave)
  updateStaffStatus: async (id, status) => {
    try {
      const response = await client.patch(`${STAFF_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for staff with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Reset staff password
  resetPassword: async (id) => {
    try {
      const response = await client.post(`${STAFF_URL}/${id}/reset-password`, {});
      return response.data;
    } catch (error) {
      console.error(`Error resetting password for staff with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await client.get(`${STAFF_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff statistics:', error);
      throw error;
    }
  }
};

export default staffService;
