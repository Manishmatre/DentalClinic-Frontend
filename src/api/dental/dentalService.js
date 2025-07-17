import client from '../client';

/**
 * Get dental statistics for dashboard
 * @returns {Promise} - Promise with dental statistics data
 */
export const getDentalStats = async () => {
  try {
    const response = await client.get('/dental/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental statistics:', error);
    throw error;
  }
};

/**
 * Get dental procedures list
 * @returns {Promise} - Promise with dental procedures data
 */
export const getDentalProcedures = async () => {
  try {
    const response = await client.get('/dental/procedures');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental procedures:', error);
    throw error;
  }
};

/**
 * Add a new dental procedure
 * @param {Object} procedureData - Procedure data
 * @returns {Promise} - Promise with created procedure data
 */
export const addDentalProcedure = async (procedureData) => {
  try {
    const response = await client.post('/dental/procedures', procedureData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding dental procedure:', error);
    throw error;
  }
};

/**
 * Get dental reports
 * @param {Object} filters - Report filters
 * @returns {Promise} - Promise with dental reports data
 */
export const getDentalReports = async (filters = {}) => {
  try {
    const response = await client.get('/dental/reports', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental reports:', error);
    throw error;
  }
};

/**
 * Get patients with dental records
 * @param {Object} queryParams - Query parameters for filtering and pagination
 * @returns {Promise} - Promise with patients data
 */
export const getDentalPatients = async (queryParams = {}) => {
  try {
    const response = await client.get('/dental/patients', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching dental patients:', error);
    throw error;
  }
};

/**
 * Get dental chart for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise} - Promise with dental chart data
 */
export const getPatientDentalChart = async (patientId) => {
  try {
    const response = await client.get(`/dental/patients/${patientId}/chart`);
    // Normalize response: always return { chart, teeth } with chart._id and teeth as object
    let data = response.data.data;
    let chart = data?.chart || data;
    let chartId = chart?._id || chart?.id;
    let teeth = data?.teeth || data?.teethRecords || data?.teethData || {};
    // If teeth is array, convert to object
    if (Array.isArray(teeth)) {
      const teethObj = {};
      teeth.forEach(tr => {
        teethObj[tr.toothNumber] = tr;
      });
      teeth = teethObj;
    }
    return { chart: { ...chart, _id: chartId }, teeth };
  } catch (error) {
    console.error('Error fetching dental chart:', error);
    throw error;
  }
};

/**
 * Update tooth record
 * @param {string} chartId - Chart ID
 * @param {number} toothNumber - Tooth number
 * @param {Object} toothData - Tooth data
 * @returns {Promise} - Promise with updated tooth record
 */
export const updateToothRecord = async (chartId, toothNumber, toothData) => {
  try {
    const response = await client.put(`/dental/charts/${chartId}/teeth/${toothNumber}`, toothData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating tooth record:', error);
    throw error;
  }
};

/**
 * Create a new dental treatment (plan or completed)
 * @param {Object} treatmentData - Treatment data (include patientApprovalStatus if needed)
 * @returns {Promise} - Promise with created treatment data
 */
export const createTreatment = async (treatmentData) => {
  try {
    const response = await client.post('/dental/treatments', treatmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating dental treatment:', error);
    throw error;
  }
};

/**
 * Update a dental treatment
 * @param {string} id - Treatment ID
 * @param {Object} updateData - Updated treatment data (include patientApprovalStatus if needed)
 * @returns {Promise} - Promise with updated treatment data
 */
export const updateTreatment = async (id, updateData) => {
  try {
    const response = await client.put(`/dental/treatments/${id}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating dental treatment:', error);
    throw error;
  }
};

/**
 * Get all dental treatments for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise} - Promise with treatments data
 */
export const getPatientDentalTreatments = async (patientId) => {
  try {
    const response = await client.get(`/dental/patients/${patientId}/dental-treatments`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental treatments:', error);
    throw error;
  }
};

/**
 * Delete a dental treatment
 * @param {string} id - Treatment ID
 * @returns {Promise} - Promise with success message
 */
export const deleteTreatment = async (id) => {
  try {
    const response = await client.delete(`/dental/treatments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting dental treatment:', error);
    throw error;
  }
};

/**
 * Get all dental images for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise} - Promise with dental images data
 */
export const getPatientImages = async (patientId) => {
  try {
    const response = await client.get(`/dental/patients/${patientId}/images`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental images:', error);
    throw error;
  }
};

/**
 * Upload a dental image
 * @param {string} patientId - Patient ID
 * @param {FormData} imageData - Image data with file and metadata
 * @returns {Promise} - Promise with uploaded image data
 */
export const uploadDentalImage = async (patientId, imageData) => {
  try {
    const response = await client.post(
      `/dental/patients/${patientId}/images`,
      imageData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error uploading dental image:', error);
    throw error;
  }
};

/**
 * Get a single dental image
 * @param {string} imageId - Image ID
 * @returns {Promise} - Promise with dental image data
 */
export const getDentalImage = async (imageId) => {
  try {
    const response = await client.get(`/dental/images/${imageId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dental image:', error);
    throw error;
  }
};

/**
 * Update a dental image
 * @param {string} imageId - Image ID
 * @param {Object} imageData - Updated image data
 * @returns {Promise} - Promise with updated image data
 */
export const updateDentalImage = async (imageId, imageData) => {
  try {
    const response = await client.put(`/dental/images/${imageId}`, imageData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating dental image:', error);
    throw error;
  }
};

/**
 * Delete a dental image
 * @param {string} imageId - Image ID
 * @returns {Promise} - Promise with success message
 */
export const deleteDentalImage = async (imageId) => {
  try {
    const response = await client.delete(`/dental/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting dental image:', error);
    throw error;
  }
};

/**
 * Alias for getPatientDentalTreatments for compatibility
 */
export const getPatientTreatments = getPatientDentalTreatments;

const dentalService = {
  getPatientDentalChart,
  updateToothRecord,
  createTreatment,
  updateTreatment,
  getPatientDentalTreatments,
  deleteTreatment,
  getPatientImages,
  uploadDentalImage,
  getDentalImage,
  updateDentalImage,
  deleteDentalImage,
  getDentalStats,
  getDentalProcedures,
  addDentalProcedure,
  getDentalReports,
  getDentalPatients
};

export default dentalService;
