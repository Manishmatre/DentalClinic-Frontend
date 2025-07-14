import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeaders } from '../utils/authUtils';

const patientService = {
  /**
   * Get patient by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Patient data
   */
  getPatientByUserId: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/user/${userId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  /**
   * Get patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  getPatientById: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  /**
   * Update patient profile
   * @param {string} patientId - Patient ID
   * @param {Object} data - Updated patient data
   * @returns {Promise<Object>} Updated patient data
   */
  updatePatient: async (patientId, data) => {
    try {
      const response = await axios.put(`${API_URL}/patients/${patientId}`, data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  /**
   * Get patient's medical records
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Medical records
   */
  getMedicalRecords: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/medical-records`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  /**
   * Get patient's appointments
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Appointments
   */
  getAppointments: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  /**
   * Get patient's doctors
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Doctors
   */
  getDoctors: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/doctors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  /**
   * Get patient's billing history
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Billing history
   */
  getBillingHistory: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patients/${patientId}/billing`);
      return response.data;
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  },

  /**
   * Upload patient profile image
   * @param {string} patientId - Patient ID
   * @param {File} image - Image file
   * @returns {Promise<Object>} Updated patient data
   */
  uploadProfileImage: async (patientId, image) => {
    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await axios.post(
        `${API_URL}/patients/${patientId}/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  /**
   * Download medical record
   * @param {string} recordId - Medical record ID
   * @returns {Promise<Blob>} Medical record file
   */
  downloadMedicalRecord: async (recordId) => {
    try {
      const response = await axios.get(
        `${API_URL}/medical-records/${recordId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response;
    } catch (error) {
      console.error('Error downloading medical record:', error);
      throw error;
    }
  },
};

export { patientService }; 