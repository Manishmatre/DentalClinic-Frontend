import client from '../client';

const medicalRecordService = {
  // Fetch medical records with optional filters
  async getMedicalRecords(params = {}) {
    const response = await client.get('/medical-records', { params });
    return response.data;
  },

  // Fetch a single medical record by ID
  async getMedicalRecordById(id) {
    const response = await client.get(`/medical-records/${id}`);
    return response.data;
  },

  // Create a new medical record
  async createMedicalRecord(recordData) {
    const response = await client.post('/medical-records', recordData);
    return response.data;
  },

  // Update an existing medical record
  async updateMedicalRecord(id, updateData) {
    const response = await client.put(`/medical-records/${id}`, updateData);
    return response.data;
  },

  // Delete a medical record
  async deleteMedicalRecord(id) {
    const response = await client.delete(`/medical-records/${id}`);
    return response.data;
  },

  // Fetch medical records for a specific patient
  async getMedicalRecordsByPatient(patientId, params = {}) {
    const response = await client.get(`/medical-records/patient/${patientId}`, { params });
    return response.data;
  },

  // Fetch medical records for a specific doctor
  async getMedicalRecordsByDoctor(doctorId, params = {}) {
    const response = await client.get(`/medical-records/doctor/${doctorId}`, { params });
    return response.data;
  },

  // Upload attachments for a medical record
  async uploadAttachments(recordId, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await client.post(`/medical-records/${recordId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Get attachments for a medical record
  async getAttachments(recordId) {
    const response = await client.get(`/medical-records/${recordId}/attachments`);
    return response.data;
  },

  // Delete an attachment
  async deleteAttachment(recordId, attachmentId) {
    const response = await client.delete(`/medical-records/${recordId}/attachments/${attachmentId}`);
    return response.data;
  }
};

export default medicalRecordService;
