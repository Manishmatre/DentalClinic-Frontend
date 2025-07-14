import client from '../client';

// Dental-specific categories and subcategories
export const DENTAL_INVENTORY_CATEGORIES = [
  {
    name: 'Dental Materials',
    subcategories: [
      'Restorative Materials',
      'Impression Materials',
      'Cements and Liners',
      'Endodontic Materials',
      'Orthodontic Materials',
      'Prosthodontic Materials',
      'Temporary Materials'
    ]
  },
  {
    name: 'Instruments',
    subcategories: [
      'Examination Instruments',
      'Restorative Instruments',
      'Surgical Instruments',
      'Endodontic Instruments',
      'Periodontal Instruments',
      'Orthodontic Instruments',
      'Prosthodontic Instruments'
    ]
  },
  {
    name: 'Equipment',
    subcategories: [
      'Dental Chairs',
      'Handpieces',
      'Imaging Equipment',
      'Sterilization Equipment',
      'Laboratory Equipment',
      'Lighting',
      'Accessories'
    ]
  },
  {
    name: 'Disposables',
    subcategories: [
      'Infection Control',
      'Barriers',
      'Gloves',
      'Masks',
      'Bibs and Towels',
      'Suction and Evacuation',
      'Syringes and Needles'
    ]
  },
  {
    name: 'Medication',
    subcategories: [
      'Anesthetics',
      'Analgesics',
      'Antibiotics',
      'Hemostatics',
      'Antiseptics',
      'Fluoride Products',
      'Emergency Medications'
    ]
  },
  {
    name: 'Office Supplies',
    subcategories: [
      'Administrative',
      'Patient Records',
      'Marketing Materials',
      'Cleaning Supplies',
      'Miscellaneous'
    ]
  }
];

// Common dental suppliers
export const DENTAL_SUPPLIERS = [
  { name: 'Henry Schein Dental', country: 'USA', website: 'www.henryschein.com' },
  { name: 'Patterson Dental', country: 'USA', website: 'www.pattersondental.com' },
  { name: 'Dentsply Sirona', country: 'USA', website: 'www.dentsplysirona.com' },
  { name: '3M Oral Care', country: 'USA', website: 'www.3m.com/oral-care' },
  { name: 'Kerr Dental', country: 'USA', website: 'www.kerrdental.com' },
  { name: 'Hu-Friedy', country: 'USA', website: 'www.hu-friedy.com' },
  { name: 'Ivoclar Vivadent', country: 'Liechtenstein', website: 'www.ivoclarvivadent.com' },
  { name: 'GC Corporation', country: 'Japan', website: 'www.gc-dental.com' },
  { name: 'Septodont', country: 'France', website: 'www.septodont.com' },
  { name: 'Coltene', country: 'Switzerland', website: 'www.coltene.com' },
  { name: 'Kuraray Noritake Dental', country: 'Japan', website: 'www.kuraraynoritake.com' },
  { name: 'Ultradent Products', country: 'USA', website: 'www.ultradent.com' },
  { name: 'Premier Dental Products', country: 'USA', website: 'www.premusa.com' },
  { name: 'Shofu Dental', country: 'Japan', website: 'www.shofu.com' },
  // Indian suppliers
  { name: 'Dental Products of India (DPI)', country: 'India', website: 'www.dpident.com' },
  { name: 'Prevest DenPro', country: 'India', website: 'www.prevestdenpro.com' },
  { name: 'Confident Dental Equipments', country: 'India', website: 'www.confident.co.in' },
  { name: 'Dentmark', country: 'India', website: 'www.dentmark.com' },
  { name: 'Pyrax Polymars', country: 'India', website: 'www.pyraxpolymars.com' },
  { name: 'Dentokem', country: 'India', website: 'www.dentokem.com' },
  { name: 'Prime Dental Products', country: 'India', website: 'www.primedentalproducts.com' },
  { name: 'Ammdent', country: 'India', website: 'www.ammdent.com' }
];

// Create the inventoryService object with all methods
const inventoryService = {
  // Inventory Items
  // Inventory Items
  async getInventoryItems(params = {}) {
    try {
      const response = await client.get('/inventory', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  async getInventoryItemById(itemId) {
    try {
      const response = await client.get(`/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  async createInventoryItem(itemData) {
    try {
      const response = await client.post('/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  async updateInventoryItem(itemId, itemData) {
    try {
      const response = await client.put(`/inventory/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  async deleteInventoryItem(itemId) {
    try {
      const response = await client.delete(`/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Inventory Transactions
  async getInventoryTransactions(params = {}) {
    try {
      const response = await client.get('/inventory/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  },

  async getTransactionsByItem(itemId, params = {}) {
    try {
      const response = await client.get(`/inventory/transactions/item/${itemId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching item transactions:', error);
      throw error;
    }
  },

  async createInventoryTransaction(transactionData) {
    try {
      const response = await client.post('/inventory/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory transaction:', error);
      throw error;
    }
  },

  // Inventory Statistics
  async getInventoryStats() {
    try {
      const response = await client.get('/inventory/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  },
  
  // Dental-specific functions
  async getDentalMaterialsByCategory(category) {
    try {
      const response = await client.get(`/inventory/dental/categories/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dental materials for category ${category}:`, error);
      throw error;
    }
  },
  
  async getExpiringItems(daysThreshold = 30) {
    try {
      const response = await client.get(`/inventory/dental/expiring?days=${daysThreshold}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      throw error;
    }
  },
  
  // Helper function to calculate stock status based on quantities
  calculateStockStatus(currentQty, reorderLevel, idealQty) {
    if (currentQty <= 0) return 'Out of Stock';
    if (reorderLevel && currentQty <= reorderLevel) return 'Low Stock';
    if (idealQty && currentQty >= idealQty) return 'Well Stocked';
    return 'Adequate';
  },
  
  // Dental-specific API methods
  async getDentalInventoryStats() {
    try {
      const response = await client.get('/inventory/dental-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dental inventory stats:', error);
      throw error;
    }
  },
  
  async getDentalCategories() {
    try {
      const response = await client.get('/inventory/dental/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching dental categories:', error);
      throw error;
    }
  },
  
  async getDentalSuppliers() {
    try {
      const response = await client.get('/inventory/dental/suppliers');
      return response.data;
    } catch (error) {
      console.error('Error fetching dental suppliers:', error);
      throw error;
    }
  },
  
  async getDentalDashboard() {
    try {
      const response = await client.get('/inventory/dental/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dental dashboard data:', error);
      throw error;
    }
  },
  
  async getUsageReport(params = {}) {
    try {
      const response = await client.get('/inventory/dental/usage-report', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching usage report:', error);
      throw error;
    }
  },

  // Helper functions for UI
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
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
};

// No mock data needed - using real API data

export default inventoryService;