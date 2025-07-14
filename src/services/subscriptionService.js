import api from '../utils/apiClient';
import { mockApiResponses, shouldUseMockData } from '../utils/mockDataHelper';

const subscriptionService = {
  // Get all subscription plans
  getSubscriptionPlans: async () => {
    try {
      // Use mock data in development mode if needed
      if (shouldUseMockData()) {
        console.log('Using mock subscription plans data');
        return await mockApiResponses.getSubscriptionPlans();
      }
      
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      
      // Fallback to mock data if API fails
      if (shouldUseMockData()) {
        console.log('Falling back to mock subscription plans data');
        return await mockApiResponses.getSubscriptionPlans();
      }
      
      throw error.response?.data?.error || 'Failed to fetch subscription plans';
    }
  },

  // Get subscription plan by ID
  getSubscriptionPlanById: async (planId) => {
    try {
      const response = await api.get(`/subscriptions/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch subscription plan';
    }
  },

  // Get clinic's current subscription
  getClinicSubscription: async (clinicId) => {
    try {
      // Use mock data in development mode if needed
      if (shouldUseMockData()) {
        console.log('Using mock clinic subscription data');
        return await mockApiResponses.getClinicSubscription(clinicId);
      }
      
      const response = await api.get(`/subscriptions/clinic/${clinicId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinic subscription:', error);
      
      // Fallback to mock data if API fails
      if (shouldUseMockData()) {
        console.log('Falling back to mock clinic subscription data');
        return await mockApiResponses.getClinicSubscription(clinicId);
      }
      
      throw error.response?.data?.error || 'Failed to fetch clinic subscription';
    }
  },

  // Get subscription history
  getSubscriptionHistory: async (clinicId) => {
    try {
      // Use mock data in development mode if needed
      if (shouldUseMockData()) {
        console.log('Using mock subscription history data');
        return await mockApiResponses.getSubscriptionHistory(clinicId);
      }
      
      const response = await api.get(`/subscriptions/history/${clinicId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      
      // Fallback to mock data if API fails
      if (shouldUseMockData()) {
        console.log('Falling back to mock subscription history data');
        return await mockApiResponses.getSubscriptionHistory(clinicId);
      }
      
      throw error.response?.data?.error || 'Failed to fetch subscription history';
    }
  },

  // Create a new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create subscription';
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update subscription';
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to cancel subscription';
    }
  },

  // Renew subscription
  renewSubscription: async (subscriptionId, renewalData) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/renew`, renewalData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to renew subscription';
    }
  },

  // Change subscription plan
  changePlan: async (subscriptionId, planData) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/change-plan`, planData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to change subscription plan';
    }
  },

  // Create Razorpay order for subscription
  createRazorpayOrder: async (orderData) => {
    try {
      const response = await api.post('/payments/subscription/razorpay/create-order', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create payment order';
    }
  },

  // Verify Razorpay payment and activate subscription
  verifyRazorpayPayment: async (paymentData) => {
    try {
      console.log('Verifying payment and activating subscription with data:', paymentData);
      
      // For development/testing, use mock data if needed
      if (shouldUseMockData() && !paymentData.skipMock) {
        console.log('Using mock payment verification');
        
        // Create a mock successful response with proper subscription data
        const mockSubscription = {
          _id: 'sub_' + Date.now(),
          plan: paymentData.plan,
          planName: paymentData.planName || 'Enterprise',
          status: 'active',
          clinicId: paymentData.clinicId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (paymentData.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          billingCycle: paymentData.billingCycle || 'monthly',
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          autoRenew: true,
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          features: [
            'All features',
            'Unlimited patients',
            'Unlimited doctors',
            'Advanced analytics',
            'Multi-branch support',
            'Priority support'
          ],
          history: [
            {
              action: 'created',
              date: new Date().toISOString(),
              details: `Subscription created with ${paymentData.planName || 'Enterprise'} plan`,
              paymentId: paymentData.razorpay_payment_id
            }
          ]
        };
        
        // Create a mock payment record
        const mockPayment = {
          _id: 'pay_' + Date.now(),
          clinicId: paymentData.clinicId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          status: 'completed',
          paymentMethod: 'razorpay',
          gatewayPaymentId: paymentData.razorpay_payment_id,
          gatewayOrderId: paymentData.razorpay_order_id,
          gatewaySignature: paymentData.razorpay_signature,
          paidAt: new Date().toISOString(),
          description: `Payment for ${paymentData.planName || 'Enterprise'} plan (${paymentData.billingCycle || 'monthly'})`
        };
        
        // Format the response to match what the frontend expects
        const mockResponse = {
          success: true,
          data: {
            subscription: mockSubscription,
            payment: mockPayment
          },
          message: 'Subscription activated successfully'
        };
        
        // Log the mock response structure for debugging
        console.log('Mock verification response structure:', mockResponse);
        
        // Store the mock subscription in localStorage for persistence during development
        try {
          localStorage.setItem('mockSubscription', JSON.stringify(mockSubscription));
          localStorage.setItem('mockPayment', JSON.stringify(mockPayment));
        } catch (e) {
          console.warn('Could not store mock data in localStorage', e);
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return { data: mockResponse };
      }
      
      // Real API call for production
      const response = await api.post('/payments/subscription/razorpay/verify', paymentData);
      console.log('Payment verification response:', response.data);
      
      // If the response doesn't include subscription data, throw an error
      if (!response.data?.data?.subscription) {
        console.error('Invalid response format from server:', response.data);
        throw new Error('Server returned invalid subscription data');
      }
      
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error.response?.data?.error || error.message || 'Failed to verify payment';
    }
  },
  
  // Activate a subscription directly (for testing and admin purposes)
  activateSubscription: async (subscriptionData) => {
    try {
      console.log('Activating subscription with data:', subscriptionData);
      
      // For development/testing, use mock data if needed
      if (shouldUseMockData() && !subscriptionData.skipMock) {
        console.log('Using mock subscription activation');
        
        // Create a mock successful response
        const mockResponse = {
          success: true,
          subscription: {
            _id: 'sub_' + Date.now(),
            plan: subscriptionData.planId,
            planName: subscriptionData.planName,
            status: 'active',
            clinicId: subscriptionData.clinicId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            billingCycle: subscriptionData.billingCycle || 'monthly',
            amount: subscriptionData.amount || 0,
            autoRenew: subscriptionData.autoRenew || true
          },
          message: 'Subscription activated successfully'
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return { data: mockResponse };
      }
      
      // Real API call for production
      const response = await api.post('/subscriptions/activate', subscriptionData);
      console.log('Subscription activation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Subscription activation error:', error);
      throw error.response?.data?.error || 'Failed to activate subscription';
    }
  }
};

export default subscriptionService;
