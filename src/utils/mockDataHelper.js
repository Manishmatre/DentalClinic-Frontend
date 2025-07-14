/**
 * Mock Data Helper
 * 
 * This file provides mock data for development and testing purposes.
 * It's particularly useful when the backend API is not available or when
 * you want to test specific scenarios without relying on the actual API.
 */

// Mock subscription plans
export const mockSubscriptionPlans = [
  {
    _id: 'plan_free',
    name: 'Free',
    description: 'Basic features for small clinics just getting started',
    price: 0,
    interval: 'month',
    features: [
      'Up to 50 patients',
      'Basic appointment scheduling',
      'Patient records management',
      'Basic reporting',
      'Email support'
    ],
    limits: {
      patients: 50,
      users: 2,
      storage: '500MB',
      appointments: 100
    },
    popular: false
  },
  {
    _id: 'plan_basic',
    name: 'Basic',
    description: 'Essential features for growing clinics',
    price: 1999,
    interval: 'month',
    features: [
      'Up to 200 patients',
      'Advanced appointment scheduling',
      'Patient records management',
      'Basic reporting',
      'Online booking',
      'Email & chat support',
      'Prescription management'
    ],
    limits: {
      patients: 200,
      users: 5,
      storage: '2GB',
      appointments: 500
    },
    popular: true
  },
  {
    _id: 'plan_premium',
    name: 'Premium',
    description: 'Advanced features for established clinics',
    price: 4999,
    interval: 'month',
    features: [
      'Unlimited patients',
      'Advanced appointment scheduling',
      'Comprehensive patient records',
      'Advanced analytics',
      'Online booking',
      'Priority support',
      'Prescription management',
      'Inventory management',
      'Billing & invoicing',
      'Custom reports'
    ],
    limits: {
      patients: 'Unlimited',
      users: 15,
      storage: '10GB',
      appointments: 'Unlimited'
    },
    popular: false
  },
  {
    _id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large multi-branch clinics',
    price: 9999,
    interval: 'month',
    features: [
      'Unlimited patients',
      'Multi-branch management',
      'Advanced scheduling',
      'Comprehensive patient records',
      'Advanced analytics',
      'Online booking',
      '24/7 dedicated support',
      'Prescription management',
      'Inventory management',
      'Billing & invoicing',
      'Custom reports',
      'API access',
      'Custom integrations',
      'Staff performance analytics'
    ],
    limits: {
      patients: 'Unlimited',
      users: 'Unlimited',
      storage: '50GB',
      appointments: 'Unlimited'
    },
    popular: false
  }
];

// Mock subscription data
export const mockSubscription = {
  _id: 'sub_123456',
  clinicId: 'clinic_123',
  plan: 'Premium',
  planId: 'plan_premium',
  status: 'active',
  startDate: '2025-01-15T00:00:00.000Z',
  endDate: '2025-06-15T00:00:00.000Z',
  autoRenew: true,
  paymentMethod: 'razorpay',
  price: 4999,
  interval: 'month',
  usage: {
    patients: {
      used: 156,
      limit: 'Unlimited',
      percentage: 15
    },
    users: {
      used: 8,
      limit: 15,
      percentage: 53
    },
    storage: {
      used: '4.2GB',
      limit: '10GB',
      percentage: 42
    },
    appointments: {
      used: 423,
      limit: 'Unlimited',
      percentage: 10
    }
  },
  features: [
    'Unlimited patients',
    'Advanced appointment scheduling',
    'Comprehensive patient records',
    'Advanced analytics',
    'Online booking',
    'Priority support',
    'Prescription management',
    'Inventory management',
    'Billing & invoicing',
    'Custom reports'
  ]
};

// Mock subscription history
export const mockSubscriptionHistory = [
  {
    _id: 'invoice_12345',
    date: '2025-05-15T10:30:00.000Z',
    amount: 4999,
    description: 'Premium Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123456'
  },
  {
    _id: 'invoice_12344',
    date: '2025-04-15T09:15:00.000Z',
    amount: 4999,
    description: 'Premium Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123455'
  },
  {
    _id: 'invoice_12343',
    date: '2025-03-15T11:45:00.000Z',
    amount: 4999,
    description: 'Premium Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123454'
  },
  {
    _id: 'invoice_12342',
    date: '2025-02-15T08:20:00.000Z',
    amount: 4999,
    description: 'Premium Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123453'
  },
  {
    _id: 'invoice_12341',
    date: '2025-01-15T14:10:00.000Z',
    amount: 1999,
    description: 'Basic Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123452'
  },
  {
    _id: 'invoice_12340',
    date: '2024-12-15T16:30:00.000Z',
    amount: 1999,
    description: 'Basic Plan - Monthly Subscription',
    status: 'paid',
    paymentMethod: 'razorpay',
    invoiceUrl: '#',
    transactionId: 'txn_123451'
  }
];

// Helper function to simulate API response delay
export const simulateApiDelay = (data, delay = 800) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

// Mock API responses
export const mockApiResponses = {
  getSubscriptionPlans: () => simulateApiDelay(mockSubscriptionPlans),
  getClinicSubscription: () => simulateApiDelay(mockSubscription),
  getSubscriptionHistory: () => simulateApiDelay(mockSubscriptionHistory),
  getSubscriptionPlanById: (planId) => {
    const plan = mockSubscriptionPlans.find(p => p._id === planId);
    return simulateApiDelay(plan || null);
  }
};

// Utility to determine if mock data should be used
export const shouldUseMockData = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // You can add additional conditions here, like a specific query parameter
  // or localStorage setting to enable/disable mock data
  
  return isDevelopment;
};

export default {
  mockSubscriptionPlans,
  mockSubscription,
  mockSubscriptionHistory,
  simulateApiDelay,
  mockApiResponses,
  shouldUseMockData
};
