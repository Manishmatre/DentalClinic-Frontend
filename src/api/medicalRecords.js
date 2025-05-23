import axios from 'axios';

const API_URL = '/api/medical-records';

// Get all medical records
export const getAll = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get medical record by ID
export const getById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new medical record
export const createMedicalRecord = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update medical record
export const updateMedicalRecord = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete medical record
export const deleteMedicalRecord = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get medical records by patient ID
export const getByPatientId = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get medical records by doctor ID
export const getByDoctorId = async (doctorId) => {
  try {
    const response = await axios.get(`${API_URL}/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getAll,
  getById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getByPatientId,
  getByDoctorId
}; 