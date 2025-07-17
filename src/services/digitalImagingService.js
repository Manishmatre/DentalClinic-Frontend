import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeaders } from '../utils/authUtils';

class DigitalImagingService {
  /**
   * Upload a medical image
   * @param {Object} params - Upload parameters
   * @param {File} params.file - Image file to upload
   * @param {string} params.appointmentId - Associated appointment ID
   * @param {string} params.patientId - Patient ID
   * @param {string} params.imageType - Type of image (e.g., 'xray', 'mri', 'ultrasound')
   * @param {string} params.notes - Additional notes about the image
   * @returns {Promise<Object>} Uploaded image data
   */
    async uploadImage({ file, patientId, imageType, notes, description }) {
    try {
      const formData = new FormData();
      formData.append('image', file); // always use 'image' as the field name
      formData.append('type', imageType); // must be 'type' for backend
      if (description) formData.append('description', description);
      if (notes) formData.append('notes', notes);
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'multipart/form-data';
      const response = await axios.post(`${API_URL}/dental/patients/${patientId}/images`, formData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw {
        error: true,
        message: error.response?.data?.message || 'Failed to upload image',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Get images for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Array of patient images
   */
  async getPatientImages(patientId) {
    try {
      const response = await axios.get(`${API_URL}/dental/patients/${patientId}/images`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient images:', error);
      throw {
        error: true,
        message: error.response?.data?.message || 'Failed to fetch patient images',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Get images for an appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Array>} Array of appointment images
   */
  async getAppointmentImages(appointmentId) {
    try {
      const response = await axios.get(`${API_URL}/images/appointment/${appointmentId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment images:', error);
      throw {
        error: true,
        message: error.response?.data?.message || 'Failed to fetch appointment images',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Delete an image
   * @param {string} imageId - Image ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteImage(imageId) {
    try {
      const response = await axios.delete(`${API_URL}/images/${imageId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw {
        error: true,
        message: error.response?.data?.message || 'Failed to delete image',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Update image metadata
   * @param {string} imageId - Image ID
   * @param {Object} metadata - New metadata
   * @returns {Promise<Object>} Updated image data
   */
  async updateImageMetadata(imageId, metadata) {
    try {
      const response = await axios.put(`${API_URL}/images/${imageId}/metadata`, metadata, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating image metadata:', error);
      throw {
        error: true,
        message: error.response?.data?.message || 'Failed to update image metadata',
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Get image URL for viewing
   * @param {string} imageId - Image ID
   * @returns {string} URL for viewing the image
   */
  getImageUrl(imageId) {
    return `${API_URL}/images/${imageId}/view`;
  }

  /**
   * Get image thumbnail URL
   * @param {string} imageId - Image ID
   * @returns {string} URL for the image thumbnail
   */
  getThumbnailUrl(imageId) {
    return `${API_URL}/images/${imageId}/thumbnail`;
  }
}

export default new DigitalImagingService(); 