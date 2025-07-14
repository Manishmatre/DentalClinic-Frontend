import client from '../client';

// Get next sequential employee ID
export const getNextEmployeeId = async () => {
  try {
    const response = await client.get('/staff/next-employee-id');
    return response.data.nextEmployeeId;
  } catch (error) {
    console.error('Error generating next employee ID:', error);
    // Fallback to a timestamp-based ID
    const timestamp = new Date().getTime().toString().slice(-3);
    return `EMP${timestamp}`;
  }
};

// Fetch staff list with query parameters
export const getStaff = async (params) => {
  try {
    const response = await client.get('/staff', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

// Fetch staff analytics data
export const getStaffAnalytics = async () => {
  try {
    const response = await client.get('/staff/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    throw error;
  }
};

// Get staff by ID
export const getStaffById = async (id) => {
  try {
    const response = await client.get(`/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff details:', error);
    throw error;
  }
};

// Create new staff member
export const createStaff = async (data) => {
  try {
    const response = await client.post('/staff', data);
    return response.data;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

// Update staff member
export const updateStaff = async (id, data) => {
  try {
    const response = await client.put(`/staff/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

// Delete staff member
export const deleteStaff = async (id) => {
  try {
    const response = await client.delete(`/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

// Get staff requests
export const getStaffRequests = async (params) => {
  try {
    const response = await client.get('/staff-requests', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff requests:', error);
    throw error;
  }
};

// Process staff request
export const processStaffRequest = async (id, data) => {
  try {
    const response = await client.put(`/staff-requests/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error processing staff request:', error);
    throw error;
  }
};

// Update staff status
export const updateStaffStatus = async (id, status) => {
  try {
    const response = await client.patch(`/staff/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating staff status:', error);
    throw error;
  }
};

export default {
  getStaff,
  getStaffById,
  getStaffAnalytics,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffRequests,
  processStaffRequest,
  updateStaffStatus,
  getNextEmployeeId // Add the new function to the default export
};
