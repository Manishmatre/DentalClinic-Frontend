import client from '../client';

const medicalNoteService = {
  // Get all medical notes for a patient
  getPatientMedicalNotes: async (patientId, params = {}) => {
    try {
      const response = await client.get(`/patients/${patientId}/medical-notes`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching medical notes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical notes'
      };
    }
  },

  // Get a single medical note by ID
  getMedicalNoteById: async (noteId) => {
    try {
      const response = await client.get(`/medical-notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical note:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical note'
      };
    }
  },

  // Create a new medical note
  createMedicalNote: async (patientId, noteData) => {
    try {
      const response = await client.post(`/patients/${patientId}/medical-notes`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating medical note:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create medical note'
      };
    }
  },

  // Update an existing medical note
  updateMedicalNote: async (noteId, noteData) => {
    try {
      const response = await client.put(`/medical-notes/${noteId}`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error updating medical note:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update medical note'
      };
    }
  },

  // Delete a medical note
  deleteMedicalNote: async (noteId) => {
    try {
      const response = await client.delete(`/medical-notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medical note:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete medical note'
      };
    }
  },

  // Get medical note categories (for filtering and display)
  getMedicalNoteCategories: () => [
    { value: 'general', label: 'General' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'medication', label: 'Medication' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'lab-result', label: 'Lab Result' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'allergy', label: 'Allergy' },
    { value: 'other', label: 'Other' }
  ]
};

export default medicalNoteService;
