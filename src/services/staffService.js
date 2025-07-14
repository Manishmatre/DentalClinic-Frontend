import axios from 'axios';
import { API_URL } from '../config/api';

// Staff Management Functions
export const getStaff = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/staff`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStaff = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/staff`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStaff = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/staff/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStaff = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/staff/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffRequests = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/staff-requests`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processStaffRequest = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/staff-requests/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
