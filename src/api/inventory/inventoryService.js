import client from '../axios';

const inventoryService = {
  // Inventory Items
  async getInventoryItems(params = {}) {
    const response = await client.get('/inventory/items', { params });
    return response.data;
  },

  async getInventoryItemById(itemId) {
    const response = await client.get(`/inventory/items/${itemId}`);
    return response.data;
  },

  async createInventoryItem(itemData) {
    const response = await client.post('/inventory/items', itemData);
    return response.data;
  },

  async updateInventoryItem(itemId, itemData) {
    const response = await client.put(`/inventory/items/${itemId}`, itemData);
    return response.data;
  },

  async deleteInventoryItem(itemId) {
    const response = await client.delete(`/inventory/items/${itemId}`);
    return response.data;
  },

  // Inventory Transactions
  async getInventoryTransactions(params = {}) {
    const response = await client.get('/inventory/transactions', { params });
    return response.data;
  },

  async getTransactionsByItem(itemId, params = {}) {
    const response = await client.get(`/inventory/transactions/item/${itemId}`, { params });
    return response.data;
  },

  async createInventoryTransaction(transactionData) {
    const response = await client.post('/inventory/transactions', transactionData);
    return response.data;
  },

  // Inventory Statistics
  async getInventoryStats() {
    const response = await client.get('/inventory/stats');
    return response.data;
  },

  // Helper functions
  getStockStatusColor(status) {
    switch (status) {
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Adequate':
        return 'bg-blue-100 text-blue-800';
      case 'Well Stocked':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getTransactionTypeColor(type) {
    switch (type) {
      case 'Purchase':
        return 'bg-green-100 text-green-800';
      case 'Usage':
        return 'bg-blue-100 text-blue-800';
      case 'Adjustment':
        return 'bg-purple-100 text-purple-800';
      case 'Return':
        return 'bg-yellow-100 text-yellow-800';
      case 'Disposal':
        return 'bg-red-100 text-red-800';
      case 'Transfer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

export default inventoryService;