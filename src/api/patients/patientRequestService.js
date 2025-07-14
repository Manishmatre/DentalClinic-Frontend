import client from '../client';

// The endpoint for patient registration requests
// Note: The baseURL in client.js already includes '/api', so we don't need to include it here
const PATIENT_REQUESTS_URL = '/patient-requests';

const patientRequestService = {
  // Get all patient registration requests with optional filtering
  getPatientRequests: async (params = {}) => {
    try {
      console.log('Fetching patient requests with params:', params);
      console.log('Request URL:', PATIENT_REQUESTS_URL);
      const response = await client.get(PATIENT_REQUESTS_URL, { params });
      console.log('Patient requests response:', response);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} patient requests`);
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Successfully fetched ${response.data.data.length} patient requests`);
        return response.data;
      } else {
        console.warn('Unexpected response format from patient requests API:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching patient requests:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Process a patient registration request (approve or reject)
  processPatientRequest: async (requestId, action, responseMessage = '') => {
    try {
      console.log(`Processing patient request ${requestId} with action: ${action}`);
      console.log('Request URL:', `${PATIENT_REQUESTS_URL}/${requestId}/process`);
      console.log('Request payload:', { action, responseMessage });
      
      const response = await client.post(`${PATIENT_REQUESTS_URL}/${requestId}/process`, {
        action, // 'approve' or 'reject'
        responseMessage
      });
      
      console.log('Process patient request response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error processing patient request with ID ${requestId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      
      // If we get a 404, it might be because the URL is incorrect
      if (error.response?.status === 404) {
        console.error('API endpoint not found. Please check the URL and server routes.');
      }
      
      throw error;
    }
  },

  // Get a single patient request by ID
  getPatientRequestById: async (requestId) => {
    try {
      console.log(`Fetching patient request with ID: ${requestId}`);
      console.log('Request URL:', `${PATIENT_REQUESTS_URL}/${requestId}`);
      
      const response = await client.get(`${PATIENT_REQUESTS_URL}/${requestId}`);
      console.log('Patient request details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient request by ID:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default patientRequestService;
