import axios from 'axios';

const BASE_URL = '/api/treatments';

export const getTreatments = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const getTreatmentById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createTreatment = async (data) => {
  const response = await axios.post(BASE_URL, data);
  return response.data;
};

export const updateTreatment = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteTreatment = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}; 