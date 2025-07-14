import client from '../client';

const BASE_URL = '/doctors';

const doctorService = {
  /**
   * Get all doctors
   * @param {Object} params - Query parameters (clinicId, status, etc.)
   * @returns {Promise<Array>} List of doctors
   */
  async getDoctors(params = {}) {
    try {
      const response = await client.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view doctors.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view doctors.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching doctors',
        details: error.message
      };
    }
  },

  /**
   * Get doctor by ID
   * @param {string} doctorId - ID of the doctor
   * @returns {Promise<Object>} Doctor details
   */
  async getDoctor(doctorId) {
    try {
      const response = await client.get(`${BASE_URL}/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching doctor',
        details: error.message
      };
    }
  },

  /**
   * Create new doctor
   * @param {Object} doctorData - Doctor details
   * @returns {Promise<Object>} Created doctor
   */
  async createDoctor(doctorData) {
    try {
      const response = await client.post(BASE_URL, doctorData);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error creating doctor',
        details: error.message
      };
    }
  },

  /**
   * Update doctor
   * @param {string} doctorId - ID of the doctor
   * @param {Object} doctorData - Updated doctor details
   * @returns {Promise<Object>} Updated doctor
   */
  async updateDoctor(doctorId, doctorData) {
    try {
      const response = await client.put(`${BASE_URL}/${doctorId}`, doctorData);
      return response.data;
    } catch (error) {
      console.error('Error updating doctor:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error updating doctor',
        details: error.message
      };
    }
  },

  /**
   * Delete doctor
   * @param {string} doctorId - ID of the doctor
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDoctor(doctorId) {
    try {
      const response = await client.delete(`${BASE_URL}/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting doctor:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error deleting doctor',
        details: error.message
      };
    }
  },

  /**
   * Get doctor's schedule
   * @param {string} doctorId - ID of the doctor
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} Doctor's schedule
   */
  async getDoctorSchedule(doctorId, params = {}) {
    try {
      const response = await client.get(`${BASE_URL}/${doctorId}/schedule`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching doctor schedule',
        details: error.message
      };
    }
  },

  /**
   * Update doctor's schedule
   * @param {string} doctorId - ID of the doctor
   * @param {Object} scheduleData - Updated schedule details
   * @returns {Promise<Object>} Updated schedule
   */
  async updateDoctorSchedule(doctorId, scheduleData) {
    try {
      const response = await client.put(`${BASE_URL}/${doctorId}/schedule`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating doctor schedule:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error updating doctor schedule',
        details: error.message
      };
    }
  }
};

export default doctorService; 