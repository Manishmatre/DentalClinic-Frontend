import axios from '../client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create a new dental procedure
 * @param {Object} procedureData - The procedure data
 * @returns {Promise} - The created procedure
 */
const createDentalProcedure = async (procedureData) => {
  const response = await axios.post(`${API_URL}/dental/procedures`, procedureData);
  return response.data;
};

/**
 * Get all dental procedures with optional filters
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - List of procedures
 */
const getDentalProcedures = async (params = {}) => {
  const response = await axios.get(`${API_URL}/dental/procedures`, { params });
  return response.data;
};

/**
 * Get a dental procedure by ID
 * @param {string} id - The procedure ID
 * @returns {Promise} - The procedure
 */
const getDentalProcedureById = async (id) => {
  const response = await axios.get(`${API_URL}/dental/procedures/${id}`);
  return response.data;
};

/**
 * Update a dental procedure
 * @param {string} id - The procedure ID
 * @param {Object} procedureData - The updated procedure data
 * @returns {Promise} - The updated procedure
 */
const updateDentalProcedure = async (id, procedureData) => {
  const response = await axios.put(`${API_URL}/dental/procedures/${id}`, procedureData);
  return response.data;
};

/**
 * Delete a dental procedure
 * @param {string} id - The procedure ID
 * @returns {Promise} - The result
 */
const deleteDentalProcedure = async (id) => {
  const response = await axios.delete(`${API_URL}/dental/procedures/${id}`);
  return response.data;
};

/**
 * Add inventory items to a procedure
 * @param {string} id - The procedure ID
 * @param {Array} inventoryItems - The inventory items to add
 * @returns {Promise} - The updated procedure
 */
const addInventoryItems = async (id, inventoryItems) => {
  const response = await axios.post(`${API_URL}/dental/procedures/${id}/inventory`, { inventoryItems });
  return response.data;
};

/**
 * Get inventory usage report
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Usage report data
 */
const getInventoryUsageReport = async (params = {}) => {
  const response = await axios.get(`${API_URL}/dental/procedures/reports/inventory-usage`, { params });
  return response.data;
};

/**
 * Get inventory usage trends over time
 * @param {Object} params - Query parameters (period, category, limit)
 * @returns {Promise<Object>} - Usage trend data
 */
const getInventoryUsageTrend = async (params = {}) => {
  const response = await axios.get(`${API_URL}/dental/procedures/reports/inventory-usage-trend`, { params });
  return response.data;
};

/**
 * Get procedure categories
 * @returns {Array} - List of procedure categories
 */
const getProcedureCategories = () => [
  'Diagnostic', 
  'Preventive', 
  'Restorative', 
  'Endodontic', 
  'Periodontic', 
  'Prosthodontic', 
  'Oral Surgery', 
  'Orthodontic', 
  'Implant',
  'Other'
];

/**
 * Get procedure statuses
 * @returns {Array} - List of procedure statuses
 */
const getProcedureStatuses = () => [
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled'
];

/**
 * Get common inventory items needed for a specific procedure category
 * @param {string} category - The procedure category
 * @returns {Promise<Array>} - List of inventory items with estimated quantities
 */
const getCommonInventoryItems = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/dental/procedures/inventory-items`, {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching common inventory items:', error);
    throw error;
  }
};

const dentalProcedureService = {
  createDentalProcedure,
  getDentalProcedures,
  getDentalProcedureById,
  updateDentalProcedure,
  deleteDentalProcedure,
  addInventoryItems,
  getInventoryUsageReport,
  getInventoryUsageTrend,
  getProcedureCategories,
  getProcedureStatuses,
  getCommonInventoryItems
};

export default dentalProcedureService;
