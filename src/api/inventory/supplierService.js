import api from '../axios';

export const getSuppliers = async (params) => {
  try {
    const response = await api.get('/suppliers', { params });
    return response.data;
  } catch (error) {
    console.error('getSuppliers error:', error);
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Failed to fetch suppliers',
      details: error.response?.data
    };
  }
};

export const getSupplier = async (id) => {
  try {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error('getSupplier error:', error);
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Failed to fetch supplier',
      details: error.response?.data
    };
  }
};

export const createSupplier = async (data) => {
  try {
    const response = await api.post('/suppliers', data);
    return response.data;
  } catch (error) {
    console.error('createSupplier error:', error);
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Failed to create supplier',
      details: error.response?.data
    };
  }
};

export const updateSupplier = async (id, data) => {
  try {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('updateSupplier error:', error);
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Failed to update supplier',
      details: error.response?.data
    };
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/suppliers/${id}`);
    // Always return an object with error property
    return {
      error: false,
      ...(typeof response.data === 'object' ? response.data : { message: response.data })
    };
  } catch (error) {
    console.error('deleteSupplier error:', error);
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Failed to delete supplier',
      details: error.response?.data
    };
  }
}; 