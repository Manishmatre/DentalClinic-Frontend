import client from '../axios';
import { toast } from 'react-toastify';
import uploadService from '../upload/uploadService';

const ehrService = {
  // Get all medical records for a patient
  getPatientRecords: async (patientId) => {
    try {
      const response = await client.get(`/api/ehr/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      if (error.response?.status === 404) {
        return []; // Return empty array if no records found
      }
      throw error;
    }
  },

  // Get medical records by doctor
  getDoctorRecords: async (doctorId) => {
    try {
      const response = await client.get(`/api/ehr/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor medical records:', error);
      if (error.response?.status === 404) {
        return []; // Return empty array if no records found
      }
      throw error;
    }
  },

  // Get a single medical record by ID
  getRecord: async (recordId) => {
    try {
      const response = await client.get(`/api/ehr/${recordId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical record ${recordId}:`, error);
      throw error;
    }
  },

  // Create a new medical record
  createRecord: async (recordData) => {
    try {
      // Ensure clinic ID is included
      if (!recordData.clinicId) {
        const defaultClinicId = localStorage.getItem('defaultClinicId');
        if (defaultClinicId) {
          recordData.clinicId = defaultClinicId;
        } else {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user.clinicId) {
            recordData.clinicId = user.clinicId;
          }
        }
      }

      const response = await client.post('/api/ehr', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  // Update an existing medical record
  updateRecord: async (recordId, recordData) => {
    try {
      const response = await client.put(`/api/ehr/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${recordId}:`, error);
      throw error;
    }
  },

  // Delete a medical record
  deleteRecord: async (recordId) => {
    try {
      const response = await client.delete(`/api/ehr/${recordId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting medical record ${recordId}:`, error);
      throw error;
    }
  },

  // Add attachment to medical record
  addAttachment: async (recordId, attachmentData) => {
    try {
      const response = await client.post(`/api/ehr/${recordId}/attachments`, attachmentData);
      toast.success('Document attached successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add attachment');
      console.error(`Error adding attachment to medical record ${recordId}:`, error);
      return { error: error.message };
    }
  },

  // Upload file attachment to medical record using Cloudinary
  uploadAttachment: async (recordId, file, metadata = {}) => {
    try {
      // Use the uploadService to upload the file to Cloudinary
      const uploadResult = await uploadService.uploadFile(file, 'medical-record');
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      
      // Extract file info from the upload result
      const fileInfo = uploadResult.file || {};
      
      // Prepare attachment data with Cloudinary metadata
      const attachmentData = {
        name: file.name || 'Unnamed file',
        fileType: file.name ? file.name.split('.').pop() : 'unknown',
        mimeType: file.type || fileInfo.mimetype || 'application/octet-stream',
        url: fileInfo.url,
        publicId: fileInfo.public_id,
        size: fileInfo.size || file.size || 0,
        description: metadata.description || '',
        category: metadata.category || 'other',
        tags: metadata.tags || []
      };
      
      // Add the attachment to the medical record
      return await ehrService.addAttachment(recordId, attachmentData);
    } catch (error) {
      toast.error(`Error uploading attachment: ${error.message}`);
      console.error(`Error uploading attachment to medical record ${recordId}:`, error);
      return { error: error.message };
    }
  },

  // Remove attachment from medical record
  removeAttachment: async (recordId, attachmentId) => {
    try {
      const response = await client.delete(`/api/ehr/${recordId}/attachments/${attachmentId}`);
      toast.success('Document removed successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove attachment');
      console.error(`Error removing attachment from medical record ${recordId}:`, error);
      return { error: error.message };
    }
  },

  // Search medical records
  searchRecords: async (searchParams) => {
    try {
      const response = await client.get('/api/ehr/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching medical records:', error);
      if (error.response?.status === 404) {
        return []; // Return empty array if no records found
      }
      throw error;
    }
  },

  // Get patient's prescriptions (extracted from medical records)
  getPatientPrescriptions: async (patientId) => {
    try {
      // First get all patient records
      const records = await ehrService.getPatientRecords(patientId);
      
      // Extract and flatten all medications from records
      const prescriptions = records.reduce((allMeds, record) => {
        if (record.medications && record.medications.length > 0) {
          // Add record context to each medication
          const medsWithContext = record.medications.map(med => ({
            ...med,
            recordId: record._id,
            visitDate: record.visitDate,
            doctorId: record.doctorId,
            doctorName: record.doctorId?.name || 'Unknown Doctor'
          }));
          
          return [...allMeds, ...medsWithContext];
        }
        return allMeds;
      }, []);
      
      // Sort by most recent first
      return prescriptions.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    } catch (error) {
      console.error(`Error fetching prescriptions for patient ${patientId}:`, error);
      return [];
    }
  },

  // Get patient's lab tests (extracted from medical records)
  getPatientLabTests: async (patientId) => {
    try {
      // First get all patient records
      const records = await ehrService.getPatientRecords(patientId);
      
      // Extract and flatten all lab tests from records
      const labTests = records.reduce((allTests, record) => {
        if (record.labTests && record.labTests.length > 0) {
          // Add record context to each lab test
          const testsWithContext = record.labTests.map(test => ({
            ...test,
            recordId: record._id,
            visitDate: record.visitDate,
            doctorId: record.doctorId,
            doctorName: record.doctorId?.name || 'Unknown Doctor'
          }));
          
          return [...allTests, ...testsWithContext];
        }
        return allTests;
      }, []);
      
      // Sort by most recent first
      return labTests.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    } catch (error) {
      console.error(`Error fetching lab tests for patient ${patientId}:`, error);
      return [];
    }
  },
  // Generate PDF for medical record
  generatePdf: async (recordId) => {
    try {
      // Using window.open for direct download
      window.open(`${client.defaults.baseURL}/api/ehr/${recordId}/pdf`, '_blank');
      return { success: true };
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(`Error generating PDF for medical record ${recordId}:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Get medical record by ID - aliased for clarity
  getMedicalRecordById: async (recordId) => {
    return ehrService.getRecord(recordId);
  }
};

export default ehrService;