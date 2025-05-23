import client from '../client';

/**
 * Get dental chart for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise} - Promise with dental chart data
 */
export const getPatientDentalChart = async (patientId) => {
  try {
    // First try to get from API
    try {
      const response = await client.get(`/dental/patients/${patientId}/chart`);
      return response.data.data;
    } catch (apiError) {
      console.log('API not available, using mock data');
      // If API fails, return mock data for demo
      return {
        _id: 'mock-chart-id',
        patientId: patientId,
        teeth: {
          1: { condition: 'healthy', surfaces: [], notes: '' },
          2: { condition: 'filled', surfaces: ['occlusal'], notes: 'Composite filling' },
          3: { condition: 'healthy', surfaces: [], notes: '' },
          4: { condition: 'healthy', surfaces: [], notes: '' },
          5: { condition: 'healthy', surfaces: [], notes: '' },
          6: { condition: 'caries', surfaces: ['occlusal', 'distal'], notes: 'Needs treatment' },
          7: { condition: 'healthy', surfaces: [], notes: '' },
          8: { condition: 'healthy', surfaces: [], notes: '' },
          // Add more teeth as needed
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
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
 * Add treatment to tooth
 * @param {string} chartId - Chart ID
 * @param {number} toothNumber - Tooth number
 * @param {Object} treatmentData - Treatment data
 * @returns {Promise} - Promise with updated tooth record
 */
export const addTreatment = async (chartId, toothNumber, treatmentData) => {
  try {
    const response = await client.post(
      `/dental/charts/${chartId}/teeth/${toothNumber}/treatments`, 
      treatmentData
    );
    return response.data.data;
  } catch (error) {
    console.error('Error adding treatment:', error);
    throw error;
  }
};

/**
 * Get all treatments for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise} - Promise with treatments data
 */
export const getPatientTreatments = async (patientId) => {
  try {
    // First try to get from API
    try {
      const response = await client.get(`/dental/patients/${patientId}/treatments`);
      return response.data.data;
    } catch (apiError) {
      console.log('API not available, using mock data');
      // If API fails, return mock data for demo
      return [
        {
          _id: 'treatment-1',
          patientId: patientId,
          toothNumber: 6,
          quadrant: 'upper-right',
          procedure: 'Composite Filling',
          procedureCode: 'D2391',
          surfaces: ['occlusal', 'distal'],
          notes: 'Composite filling on tooth #6',
          performedBy: 'Dr. Smith',
          performedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          cost: 150,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'treatment-2',
          patientId: patientId,
          toothNumber: 2,
          quadrant: 'upper-right',
          procedure: 'Composite Filling',
          procedureCode: 'D2391',
          surfaces: ['occlusal'],
          notes: 'Composite filling on tooth #2',
          performedBy: 'Dr. Smith',
          performedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          cost: 120,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'treatment-3',
          patientId: patientId,
          toothNumber: 19,
          quadrant: 'lower-left',
          procedure: 'Root Canal',
          procedureCode: 'D3310',
          surfaces: [],
          notes: 'Root canal treatment on tooth #19',
          performedBy: 'Dr. Johnson',
          performedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          cost: 800,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  } catch (error) {
    console.error('Error fetching treatments:', error);
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
    // First try to get from API
    try {
      const response = await client.get(`/dental/patients/${patientId}/images`);
      return response.data.data;
    } catch (apiError) {
      console.log('API not available, using mock data');
      // If API fails, return mock data for demo
      return [
        {
          _id: 'image-1',
          patientId: patientId,
          imageType: 'panoramic',
          imageUrl: 'https://via.placeholder.com/800x400?text=Panoramic+X-Ray',
          description: 'Full mouth panoramic X-ray',
          takenDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          takenBy: 'Dr. Smith',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'image-2',
          patientId: patientId,
          imageType: 'bitewing',
          imageUrl: 'https://via.placeholder.com/400x300?text=Bitewing+X-Ray',
          description: 'Bitewing X-ray of right side',
          takenDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          takenBy: 'Dr. Johnson',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
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

const dentalService = {
  getPatientDentalChart,
  updateToothRecord,
  addTreatment,
  getPatientTreatments,
  getPatientImages,
  uploadDentalImage,
  getDentalImage,
  updateDentalImage,
  deleteDentalImage
};

export default dentalService;
