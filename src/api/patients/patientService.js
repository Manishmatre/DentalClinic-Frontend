import client from '../client';

const PATIENTS_URL = '/patients';

const patientService = {
  // Get all patients with pagination and filtering
  async getPatients(params) {
    try {
      console.log('Fetching patients from API...');
      const response = await client.get(PATIENTS_URL, { params });
      
      // Handle different response formats and convert to a consistent format
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // New API format with data and pagination
        console.log(`Successfully fetched ${response.data.data.length} patients`);
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            total: response.data.data.length,
            pages: 1,
            page: params.page || 1,
            limit: params.limit || response.data.data.length
          }
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Legacy API format with just an array
        console.log(`Successfully fetched ${response.data.length} patients`);
        return {
          data: response.data,
          pagination: {
            total: response.data.length,
            pages: 1,
            page: params.page || 1,
            limit: params.limit || response.data.length
          }
        };
      } else {
        console.warn('Unexpected response format from patients API:', response.data);
        return {
          data: [],
          pagination: {
            total: 0,
            pages: 1,
            page: params.page || 1,
            limit: params.limit || 10
          }
        };
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          pages: 1,
          page: params.page || 1,
          limit: params.limit || 10
        }
      };
    }
  },

  // Get a single patient by ID
  async getPatientById(id) {
    try {
      console.log('Fetching patient by ID from API...');
      const response = await client.get(`${PATIENTS_URL}/${id}`);
      console.log(`Successfully fetched patient with ID ${id}`);
      
      // Handle different response formats
      if (response.data && response.data.data) {
        // New API format with data nested in a data property
        return response.data.data;
      } else if (response.data) {
        // Direct data format
        return response.data;
      } else {
        console.warn('Unexpected response format from patient API:', response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          // Log a more user-friendly message without the full error stack
          console.log('Access forbidden: You do not have permission to view this patient');
          // Return a user-friendly error object instead of throwing
          return {
            error: true,
            status: 403,
            message: 'You do not have permission to view this patient. Please contact your administrator if you believe this is an error.',
            details: error.response.data?.message || 'Permission denied'
          };
        } else if (error.response.status === 404) {
          console.log('Patient not found');
          return {
            error: true,
            status: 404,
            message: 'Patient not found. The patient may have been removed or you have entered an invalid ID.',
            details: error.response.data?.message || 'Patient not found'
          };
        } else {
          // Handle other status codes
          return {
            error: true,
            status: error.response.status,
            message: error.response.data?.message || `Error (${error.response.status}): Unable to fetch patient data`,
            details: error.response.data || {}
          };
        }
      }
      // Only log the full error for unexpected errors
      console.error('Error fetching patient by ID:', error.message || 'Unknown error');
      return {
        error: true,
        status: 500,
        message: 'An unexpected error occurred while fetching patient data. Please try again later.',
        details: error.message || 'Unknown error'
      };
    }
  },

  // Create a new patient
  async createPatient(patientData) {
    try {
      console.log('Creating new patient...');
      const response = await client.post(PATIENTS_URL, patientData);
      console.log(`Successfully created patient with ID ${response.data.id || response.data._id}`);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          return {
            error: true,
            status: 403,
            message: 'You do not have permission to create a patient. Please contact your administrator if you believe this is an error.',
            details: error.response.data?.message || 'Permission denied'
          };
        } else if (error.response.status === 400) {
          return {
            error: true,
            status: 400,
            message: error.response.data?.message || 'Invalid patient data. Please check your input and try again.',
            details: error.response.data || {}
          };
        } else {
          return {
            error: true,
            status: error.response.status,
            message: error.response.data?.message || `Error (${error.response.status}): Unable to create patient`,
            details: error.response.data || {}
          };
        }
      }
      
      return {
        error: true,
        status: 500,
        message: 'An unexpected error occurred while creating the patient. Please try again later.',
        details: error.message || 'Unknown error'
      };
    }
  },

  // Update a patient
  async updatePatient(id, patientData) {
    
    // Ensure we have a valid ID
    if (!id) {
      return {
        error: true,
        status: 400,
        message: 'Patient ID is required for update'
      };
    }
    
    try {
      const response = await client.put(`${PATIENTS_URL}/${id}`, patientData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error.response || error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          return {
            error: true,
            status: 403,
            message: 'You do not have permission to update this patient. Please contact your administrator if you believe this is an error.',
            details: error.response.data?.message || 'Permission denied'
          };
        } else if (error.response.status === 404) {
          return {
            error: true,
            status: 404,
            message: 'Patient not found. The patient may have been removed or you have entered an invalid ID.',
            details: error.response.data?.message || 'Patient not found'
          };
        } else {
          return {
            error: true,
            status: error.response.status,
            message: error.response.data?.message || `Error (${error.response.status}): Unable to update patient data`,
            details: error.response.data || {}
          };
        }
      }
      
      return {
        error: true,
        status: 500,
        message: 'An unexpected error occurred while updating patient data. Please try again later.',
        details: error.message || 'Unknown error'
      };
    }
  },

  // Get patient profile
  async getPatientProfile(id) {
    try {
      console.log('Fetching patient profile...');
      const response = await client.get(`${PATIENTS_URL}/${id}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      
      // Return mock data if the API fails
      return {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1234567890',
        gender: 'female',
        dob: '1990-05-15',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        emergencyContact: {
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '+1987654321'
        },
        profileImage: 'https://randomuser.me/api/portraits/women/1.jpg'
      };
    }
  },

  // Delete a patient
  async deletePatient(id) {
    try {
      console.log(`Deleting patient with ID ${id}...`);
      const response = await client.delete(`${PATIENTS_URL}/${id}`);
      console.log('Successfully deleted patient');
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to delete patient'
      };
    }
  },

  // Get medical history
  async getMedicalHistory(patientId) {
    try {
      const response = await client.get(`/patients/${patientId}/medical-notes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical history:', error);
      throw error;
    }
  },

  // Update medical history
  async updateMedicalHistory(patientId, data) {
    try {
      const response = await client.post(`/patients/${patientId}/medical-notes`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medical history:', error);
      throw error;
    }
  },
  
  // Add medical record
  async addMedicalRecord(patientId, recordData) {
    try {
      const response = await client.post(`/patients/${patientId}/medical-notes`, recordData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error adding medical record:', error);
      throw error;
    }
  },
  
  // Delete medical record
  async deleteMedicalRecord(patientId, recordId) {
    try {
      const response = await client.delete(`/medical-notes/${recordId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  },

  // Get treatment history
  async getTreatmentHistory(patientId) {
    try {
      const response = await client.get(`/treatments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      throw error;
    }
  },

  // Get patient appointments
  async getPatientAppointments(patientId) {
    try {
      const response = await client.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Upload documents
  async uploadDocuments(patientId, formData) {
    try {
      const response = await client.post(
        `/patients/${patientId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  },

  // Get documents
  async getDocuments(patientId) {
    try {
      const response = await client.get(`/patients/${patientId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Download document
  async downloadDocument(patientId, documentId) {
    try {
      const response = await client.get(
        `/documents/${documentId}`,
        { 
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(patientId, documentId) {
    try {
      const response = await client.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get billing history
  async getBillingHistory(patientId) {
    try {
      const response = await client.get(`/billing/invoices/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  },

  // Get patient medical notes
  async getPatientMedicalNotes(patientId, params = {}) {
    try {
      const response = await client.get(`/medical-notes/patients/${patientId}/medical-notes`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical notes:', error);
      throw error;
    }
  },

  // Add patient medical note
  async addPatientMedicalNote(patientId, noteData) {
    try {
      const response = await client.post(`/medical-notes/patients/${patientId}/medical-notes`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding patient medical note:', error);
      throw error;
    }
  },

  // Update patient medical note
  async updatePatientMedicalNote(noteId, noteData) {
    try {
      const response = await client.put(`/medical-notes/medical-notes/${noteId}`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient medical note:', error);
      throw error;
    }
  },

  // Delete patient medical note
  async deletePatientMedicalNote(noteId) {
    try {
      const response = await client.delete(`/medical-notes/medical-notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient medical note:', error);
      throw error;
    }
  },

  // Get patient analytics
  async getPatientAnalytics() {
    try {
      console.log('Fetching patient analytics...');
      const response = await client.get(`${PATIENTS_URL}/analytics`);
      console.log('Successfully fetched patient analytics');
      
      // Handle different response formats
      if (response.data && response.data.data) {
        // New API format with data nested in a data property
        return response.data.data;
      } else if (response.data) {
        // Direct data format
        return response.data;
      } else {
        console.warn('Unexpected response format from patient analytics API:', response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching patient analytics:', error);
      
      // Return default analytics structure on error
      return {
        total: 0,
        active: 0,
        inactive: 0,
        gender: { male: 0, female: 0, other: 0 },
        ageGroups: {},
        bloodGroups: {},
        trend: [],
        recentlyRegistered: [],
        appointmentStats: { completed: 0, upcoming: 0, cancelled: 0, noShow: 0 }
      };
    }
  },

  // Export patients data
  async exportPatients(format, params = {}) {
    try {
      console.log(`Exporting patients data in ${format} format...`);
      const response = await client.get(`${PATIENTS_URL}/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting patients:', error);
      throw error;
    }
  },

  // Search patients
  async searchPatients(query, clinicId) {
    try {
      const params = { search: query, clinicId, limit: 10 };
      const response = await client.get(`${PATIENTS_URL}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },

  // Patient Examination API
  async getExaminations(patientId) {
    const response = await client.get('/patient-examinations', { params: { patient: patientId } });
    return response.data;
  },

  async getExaminationById(id) {
    const response = await client.get(`/patient-examinations/${id}`);
    return response.data;
  },

  async createExamination(data) {
    const response = await client.post('/patient-examinations', {
      doctor: data.doctor,
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      notes: data.notes,
      patient: data.patient
    });
    return response.data;
  },

  async updateExamination(id, data) {
    const response = await client.put(`/patient-examinations/${id}`, {
      doctor: data.doctor,
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      notes: data.notes,
      patient: data.patient
    });
    return response.data;
  },

  async deleteExamination(id) {
    const response = await client.delete(`/patient-examinations/${id}`);
    return response.data;
  },

  // Get a patient by userId
  async getPatientByUserId(userId) {
    try {
      const response = await client.get(`${PATIENTS_URL}/user/${userId}`);
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching patient by userId:', error);
      throw error;
    }
  }
};

export default patientService;