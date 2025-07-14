import client from './client';

const TREATMENTS_URL = '/treatments';

const treatmentService = {
  // Get all treatments
  async getTreatments(params = {}) {
    try {
      const response = await client.get(TREATMENTS_URL, { params });
        return response.data;
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return { data: [], pagination: { total: 0, page: 1, pages: 1, limit: params.limit || 10 } };
    }
  },

  // Create a new treatment
  async createTreatment(data) {
    try {
      const response = await client.post(TREATMENTS_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating treatment:', error);
      throw error;
    }
  },

  // Update a treatment
  async updateTreatment(id, data) {
    try {
      const response = await client.put(`${TREATMENTS_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating treatment:', error);
      throw error;
    }
  },

  // Delete a treatment
  async deleteTreatment(id) {
    try {
      const response = await client.delete(`${TREATMENTS_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  }
};

export default treatmentService; 