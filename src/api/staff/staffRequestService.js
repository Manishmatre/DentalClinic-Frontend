import client from '../client';

// The endpoint for staff requests is under the auth controller
// Note: The baseURL in client.js already includes '/api', so we don't need to include it here
const STAFF_REQUESTS_URL = '/auth/staff-requests';

const staffRequestService = {
  // Get all staff requests with optional filtering
  getStaffRequests: async (params = {}) => {
    try {
      console.log('Fetching staff requests with params:', params);
      console.log('Request URL:', STAFF_REQUESTS_URL);
      const response = await client.get(STAFF_REQUESTS_URL, { params });
      console.log('Staff requests response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff requests:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Process a staff request (approve or reject)
  processStaffRequest: async (requestId, action, responseMessage) => {
    try {
      console.log(`Processing staff request ${requestId} with action: ${action}`);
      console.log('Request URL:', `${STAFF_REQUESTS_URL}/${requestId}/process`);
      console.log('Request payload:', { action, responseMessage });
      
      const response = await client.post(`${STAFF_REQUESTS_URL}/${requestId}/process`, {
        action, // 'approve' or 'reject'
        responseMessage
      });
      
      console.log('Process staff request response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error processing staff request with ID ${requestId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      
      // If we get a 404, it might be because the URL is incorrect
      if (error.response?.status === 404) {
        console.error('API endpoint not found. Please check the URL and server routes.');
      }
      
      throw error;
    }
  }
};

export default staffRequestService;
