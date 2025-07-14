import axios from 'axios';
import { getAuthHeaders } from '../utils/authUtils';
import { API_URL } from '../config';


// Helper function to log API errors and handle authentication issues
const logApiError = (endpoint, error) => {
  // Only log detailed errors in development mode
  if (process.env.NODE_ENV === 'development') {
    // Group related logs to reduce console noise
    console.groupCollapsed(`API Error (${endpoint}): ${error.message}`);
    console.log('Error details:', error);
    console.log(`Status: ${error.response?.status || 'Unknown'}`);
    console.log(`Response data:`, error.response?.data || {});
    console.groupEnd();
    
    // Check if the error is related to authentication
    if (error.response?.data?.message === 'Authentication error' || 
        error.response?.status === 401) {
      console.warn('Authentication error detected. Token may be invalid.');
    }
  }
  
  // Handle authentication errors
  if (error.response?.data?.message === 'Authentication error' || 
      error.response?.status === 401) {
    // Clear invalid token if it's causing JSON parsing issues
    if (error.response?.data?.error?.includes('not valid JSON')) {
      localStorage.removeItem('token');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Removed invalid authentication token');
      }
    }
    
    // Redirect to login page if we have a 401 error
    if (error.response?.status === 401) {
      // Check if we're not already on the login page to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Redirecting to login page due to authentication error');
        }
        window.location.href = '/login';
      }
    }
  }
  
  // Return the error so it can be handled by the caller
  return error;
};

// General Inventory API calls
const getInventoryItems = async (params = {}) => {
  try {
    // Get fresh auth headers
    const headers = getAuthHeaders();
    
    // Only attempt API call if we have authorization headers
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.get(`${API_URL}/inventory/items`, {
      headers,
      params
    });
    
    return response.data || [];
  } catch (error) {
    // Log and handle the error
    logApiError('inventory/items', error);
    
    // Throw the error to be handled by the component
    throw error;
  }
};

const getInventoryItemById = async (id) => {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.get(`${API_URL}/inventory/items/${id}`, { headers });
    return response.data;
  } catch (error) {
    logApiError(`inventory/items/${id}`, error);
    throw error;
  }
};

const createInventoryItem = async (itemData) => {
  const response = await axios.post(`${API_URL}/inventory/items`, itemData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const updateInventoryItem = async (id, itemData) => {
  const response = await axios.put(`${API_URL}/inventory/items/${id}`, itemData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const deleteInventoryItem = async (id) => {
  const response = await axios.delete(`${API_URL}/inventory/items/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const createInventoryTransaction = async (transactionData) => {
  const response = await axios.post(`${API_URL}/inventory/transactions`, transactionData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getInventoryTransactions = async (params = {}) => {
  const response = await axios.get(`${API_URL}/inventory/transactions`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

const getTransactionsByItem = async (itemId) => {
  const response = await axios.get(`${API_URL}/inventory/transactions/item/${itemId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getInventoryStats = async () => {
  const response = await axios.get(`${API_URL}/inventory/statistics`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Dental-specific Inventory API calls
const getDentalInventoryStats = async () => {
  const response = await axios.get(`${API_URL}/inventory/dental-stats`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getDentalCategories = async () => {
  const response = await axios.get(`${API_URL}/inventory/dental/categories`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getDentalSuppliers = async () => {
  const response = await axios.get(`${API_URL}/inventory/dental/suppliers`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getExpiringItems = async (days = 30) => {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.get(`${API_URL}/inventory/dental/expiring`, {
      headers,
      params: { days }
    });
    
    return response.data || [];
  } catch (error) {
    logApiError('inventory/dental/expiring', error);
    throw error;
  }
};

const getDentalDashboard = async () => {
  const response = await axios.get(`${API_URL}/inventory/dental/dashboard`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

const getUsageReport = async (params = {}) => {
  const response = await axios.get(`${API_URL}/inventory/dental/usage-report`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};

const inventoryService = {
  // Get all inventory items
  getAllItems: async () => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.get(`${API_URL}/inventory`, { headers });
      return response.data || [];
    } catch (error) {
      logApiError('inventory', error);
      throw error;
    }
  },

  // Get a single inventory item
  getItem: async (id) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.get(`${API_URL}/inventory/${id}`, { headers });
      return response.data;
    } catch (error) {
      logApiError(`inventory/${id}`, error);
      throw error;
    }
  },

  // Create a new inventory item
  createItem: async (itemData) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.post(`${API_URL}/inventory`, itemData, { headers });
      return response.data;
    } catch (error) {
      logApiError('inventory', error);
      throw error;
    }
  },

  // Update an inventory item
  updateItem: async (id, itemData) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.put(`${API_URL}/inventory/${id}`, itemData, { headers });
      return response.data;
    } catch (error) {
      logApiError(`inventory/${id}`, error);
      throw error;
    }
  },

  // Delete an inventory item
  deleteItem: async (id) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.delete(`${API_URL}/inventory/${id}`, { headers });
      return response.data;
    } catch (error) {
      logApiError(`inventory/${id}`, error);
      throw error;
    }
  },

  // Update stock level
  updateStock: async (id, quantity, type) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.post(`${API_URL}/inventory/${id}/stock`, {
        quantity,
        type
      }, { headers });
      return response.data;
    } catch (error) {
      logApiError(`inventory/${id}/stock`, error);
      throw error;
    }
  },

  // Get inventory categories
  getCategories: async () => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.get(`${API_URL}/inventory/categories`, { headers });
      return response.data || [];
    } catch (error) {
      logApiError('inventory/categories', error);
      throw error;
    }
  },

  // Create inventory category
  createCategory: async (categoryData) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.post(`${API_URL}/inventory/categories`, categoryData, { headers });
      return response.data;
    } catch (error) {
      logApiError('inventory/categories', error);
      throw error;
    }
  },

  // Get inventory transactions
  getTransactions: async (filters = {}) => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.get(`${API_URL}/inventory/transactions`, { 
        headers,
        params: filters 
      });
      return response.data || [];
    } catch (error) {
      logApiError('inventory/transactions', error);
      throw error;
    }
  },

  // Get inventory statistics
  getStatistics: async () => {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.get(`${API_URL}/inventory/statistics`, { headers });
      return response.data;
    } catch (error) {
      logApiError('inventory/statistics', error);
      throw error;
    }
  },

  // General inventory methods
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryTransaction,
  getInventoryTransactions,
  getTransactionsByItem,
  getInventoryStats,
  
  // Dental-specific methods
  getDentalInventoryStats,
  getDentalCategories,
  getDentalSuppliers,
  getExpiringItems,
  getDentalDashboard,
  getUsageReport
};

// Add missing methods that were referenced in InventoryManagement.jsx
inventoryService.getLowStockAlerts = async (clinicId) => {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No authentication token available');
    }
    
    const response = await axios.get(`${API_URL}/inventory/low-stock-alerts`, {
      params: { clinicId },
      headers
    });
    
    return response.data || [];
  } catch (error) {
    logApiError('inventory/low-stock-alerts', error);
    throw error;
  }
};

export default inventoryService;
