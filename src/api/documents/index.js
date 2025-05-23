import client from '../client';

const documentApi = {
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

  getDocuments: async (patientId, params = {}) => {
    const response = await client.get(`/patients/${patientId}/documents`, { params });
    return response.data;
  },

  getDocument: async (documentId) => {
    const response = await client.get(`/documents/${documentId}`);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await client.delete(`/documents/${documentId}`);
    return response.data;
  }
};

export default documentApi;