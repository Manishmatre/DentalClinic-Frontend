import client from '../client';

export const documentService = {
  // Upload documents for a patient
  uploadDocuments: async (patientId, formData) => {
    const response = await client.post(
      `/patients/${patientId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Get all documents for a patient
  getDocuments: async (patientId, params = {}) => {
    const response = await client.get(`/patients/${patientId}/documents`, { params });
    return response.data;
  },

  // Get single document with download URL
  getDocument: async (documentId) => {
    const response = await client.get(`/documents/${documentId}`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await client.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Get document categories (for filtering)
  getDocumentCategories: () => [
    { value: 'general', label: 'General Document' },
    { value: 'medical-record', label: 'Medical Record' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab-result', label: 'Lab Result' },
    { value: 'bill', label: 'Bill/Invoice' },
    { value: 'id-document', label: 'ID Document' },
    { value: 'insurance', label: 'Insurance Document' },
    { value: 'consent-form', label: 'Consent Form' },
    { value: 'referral', label: 'Referral' },
    { value: 'profile-picture', label: 'Profile Picture' },
    { value: 'xray', label: 'X-Ray' },
    { value: 'other', label: 'Other' }
  ],

  // Get documents by category
  getDocumentsByCategory: async (patientId, category) => {
    const response = await client.get(`/patients/${patientId}/documents`, { 
      params: { category } 
    });
    return response.data;
  },
  
  // Get documents for current user (patient portal)
  getMyDocuments: async (params = {}) => {
    const response = await client.get('/documents/my', { params });
    return response.data;
  },
  
  // Upload document with category
  uploadDocumentWithCategory: async (patientId, file, category, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await client.post(
      `/patients/${patientId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
};