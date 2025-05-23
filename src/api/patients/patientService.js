import client from '../client';

const PATIENTS_URL = '/patients';

const patientService = {
  // Get all patients with pagination and filtering
  async getPatients(params) {
    try {
      console.log('Fetching patients from API...');
      const response = await client.get(PATIENTS_URL, { params });
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} patients`);
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log(`Successfully fetched ${response.data.data.length} patients`);
        return response.data.data;
      } else {
        console.warn('Unexpected response format from patients API:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  // Get a single patient by ID
  async getPatientById(id) {
    try {
      console.log('Fetching patient by ID from API...');
      const response = await client.get(`${PATIENTS_URL}/${id}`);
      console.log(`Successfully fetched patient with ID ${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw error;
    }
  },

  // Create a new patient
  async createPatient(patientData) {
    try {
      console.log('Creating new patient...');
      const response = await client.post(PATIENTS_URL, patientData);
      console.log(`Successfully created patient with ID ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update a patient
  async updatePatient(id, patientData) {
    
    // Ensure we have a valid ID
    if (!id) {
      throw new Error('Patient ID is required for update');
    }
    
    try {
      const response = await client.put(`${PATIENTS_URL}/${id}`, patientData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error.response || error);
      throw error;
    }
  },

  // Delete a patient
  deletePatient: async (id) => {
    const response = await client.delete(`${PATIENTS_URL}/${id}`);
    return response.data;
  },

  // Medical History Management
  getMedicalHistory: async (patientId) => {
    const response = await client.get(`${PATIENTS_URL}/${patientId}/medical-history`);
    return response.data;
  },

  updateMedicalHistory: async (patientId, data) => {
    const response = await client.post(`${PATIENTS_URL}/${patientId}/medical-history`, data);
    return response.data;
  },

  // Get patient's treatment history
  getTreatmentHistory: async (patientId) => {
    const response = await client.get(`${PATIENTS_URL}/${patientId}/treatments`);
    return response.data;
  },

  // Get patient's appointments
  getPatientAppointments: async (patientId) => {
    const response = await client.get(`${PATIENTS_URL}/${patientId}/appointments`);
    return response.data;
  },

  // Document Management
  uploadDocuments: async (patientId, formData) => {
    const response = await client.post(
      `${PATIENTS_URL}/${patientId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getDocuments: async (patientId) => {
    const response = await client.get(`${PATIENTS_URL}/${patientId}/documents`);
    return response.data;
  },

  downloadDocument: async (patientId, documentId) => {
    const response = await client.get(
      `${PATIENTS_URL}/${patientId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  deleteDocument: async (patientId, documentId) => {
    const response = await client.delete(`${PATIENTS_URL}/${patientId}/documents/${documentId}`);
    return response.data;
  },

  // Patient Billing Management
  getBillingHistory(patientId) {
    return client.get(`${PATIENTS_URL}/${patientId}/billing`)
      .then(response => response.data)
      .catch(error => { throw error; });
  },

  // Medical Notes Management
  async getPatientMedicalNotes(patientId, params = {}) {
    try {
      const response = await client.get(`/patients/${patientId}/medical-notes`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching medical notes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch medical notes',
        data: []
      };
    }
  },

  async addPatientMedicalNote(patientId, noteData) {
    try {
      const response = await client.post(`/patients/${patientId}/medical-notes`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding medical note:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add medical note'
      };
    }
  },

  async updatePatientMedicalNote(noteId, noteData) {
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

  async deletePatientMedicalNote(noteId) {
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
  }
};

export default patientService;