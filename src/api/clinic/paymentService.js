import axios from '../axios';

const BASE_URL = '/payments';

const paymentService = {
  // Initialize payment for subscription
  initializePayment: async (clinicId, subscriptionData) => {
    const response = await axios.post(`${BASE_URL}/subscription/init`, {
      clinicId,
      ...subscriptionData
    });
    return response.data;
  },

  // Process subscription payment
  processPayment: async (paymentData) => {
    const response = await axios.post(`${BASE_URL}/subscription/process`, paymentData);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    const response = await axios.get(`${BASE_URL}/subscription/verify/${paymentId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (clinicId) => {
    const response = await axios.get(`${BASE_URL}/subscription/history/${clinicId}`);
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (clinicId, paymentMethod) => {
    const response = await axios.put(`${BASE_URL}/subscription/payment-method/${clinicId}`, paymentMethod);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (clinicId) => {
    const response = await axios.post(`${BASE_URL}/subscription/cancel/${clinicId}`);
    return response.data;
  }
};

export default paymentService;