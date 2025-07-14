import client from './client';

const MEDICINES_URL = '/medicines';

const medicineService = {
  // Get all medicines
  async getMedicines(params = {}) {
    try {
      const response = await client.get(MEDICINES_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return { data: [], pagination: { total: 0, page: 1, pages: 1, limit: params.limit || 10 } };
    }
  },

  // Create a new medicine
  async createMedicine(data) {
    try {
      const response = await client.post(MEDICINES_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error;
    }
  },

  // Update a medicine
  async updateMedicine(id, data) {
    try {
      const response = await client.put(`${MEDICINES_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw error;
    }
  },

  // Delete a medicine
  async deleteMedicine(id) {
    try {
      const response = await client.delete(`${MEDICINES_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  }
};

export default medicineService; 