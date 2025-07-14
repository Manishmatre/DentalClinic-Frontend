import client from '../client';

const CHAIRS_URL = '/chairs';

const chairService = {
  // Get all chairs
  async getChairs(params = {}) {
    try {
      const response = await client.get(CHAIRS_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching chairs:', error);
      return { data: [], pagination: { total: 0, page: 1, pages: 1, limit: params.limit || 10 } };
    }
  },

  // Create a new chair
  async createChair(data) {
    try {
      const response = await client.post(CHAIRS_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating chair:', error);
      throw error;
    }
  },

  // Update a chair
  async updateChair(id, data) {
    try {
      const response = await client.put(`${CHAIRS_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating chair:', error);
      throw error;
    }
  },

  // Delete a chair
  async deleteChair(id) {
    try {
      const response = await client.delete(`${CHAIRS_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chair:', error);
      throw error;
    }
  }
};

export default chairService; 