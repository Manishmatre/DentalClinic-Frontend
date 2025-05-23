import axios from '../axios';

const BASE_URL = '/clinics';

// Helper function to handle API errors with better logging
const handleApiError = (error, operation) => {
  if (error.response) {
    // The request was made and the server responded with a status code outside the 2xx range
    console.error(`API ${operation} failed with status ${error.response.status}:`, error.response.data);
    if (error.response.status === 403) {
      console.warn('Authentication error detected:', error.response.data.message);
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`API ${operation} failed - No response received:`, error.request);
  } else {
    // Something happened in setting up the request
    console.error(`API ${operation} setup error:`, error.message);
  }
  throw error;
};

const clinicService = {
  // Get clinic details
  getClinicDetails: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${clinicId}`);
      console.log('Clinic details fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getClinicDetails');
    }
  },

  // Update clinic settings
  updateClinicSettings: async (clinicId, settings) => {
    try {
      // Add activation flag to ensure clinic is activated
      const updatedSettings = {
        ...settings,
        status: 'active',
        subscription: {
          ...(settings.subscription || {}),
          status: 'active'
        }
      };
      
      console.log('Updating clinic settings with data:', updatedSettings);
      const response = await axios.put(`${BASE_URL}/${clinicId}/settings`, updatedSettings);
      console.log('Clinic settings updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateClinicSettings');
    }
  },

  // Update clinic subscription
  updateClinicSubscription: async (clinicId, subscriptionData) => {
    try {
      // Ensure subscription is active
      const updatedSubscription = {
        ...subscriptionData,
        status: 'active'
      };
      
      const response = await axios.put(`${BASE_URL}/${clinicId}/subscription`, updatedSubscription);
      console.log('Clinic subscription updated successfully:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateClinicSubscription');
    }
  },

  // Update clinic statistics
  updateClinicStatistics: async (clinicId, stats) => {
    try {
      const response = await axios.put(`${BASE_URL}/${clinicId}/statistics`, { statistics: stats });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateClinicStatistics');
    }
  },

  // Get clinic features
  getClinicFeatures: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${clinicId}/features`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getClinicFeatures');
    }
  },

  // Check feature access
  checkFeatureAccess: async (clinicId, featureName) => {
    try {
      const response = await axios.get(`${BASE_URL}/${clinicId}/features/${featureName}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'checkFeatureAccess');
    }
  },

  // Get resource limits
  getResourceLimits: async (clinicId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${clinicId}/limits`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getResourceLimits');
    }
  },

  // Get clinic dashboard statistics
  getClinicStats: async (clinicId) => {
    // If clinicId is undefined, try to get it from localStorage
    if (!clinicId) {
      // Try to get clinic ID from multiple sources
      // First try from localStorage clinicData
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        try {
          const parsedClinicData = JSON.parse(storedClinicData);
          clinicId = parsedClinicData._id;
          console.log('getClinicStats: Using clinic ID from localStorage clinicData:', clinicId);
        } catch (e) {
          console.error('Error parsing clinicData from localStorage:', e);
        }
      }
      
      // Then try from userData.clinicId
      if (!clinicId) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              clinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
              console.log('getClinicStats: Using clinic ID from localStorage userData:', clinicId);
            }
          } catch (e) {
            console.error('Error parsing userData from localStorage:', e);
          }
        }
      }
      
      // Finally try defaultClinicId
      if (!clinicId) {
        clinicId = localStorage.getItem('defaultClinicId');
        if (clinicId) {
          console.log('getClinicStats: Using defaultClinicId from localStorage:', clinicId);
        }
      }
      
      // If still no clinic ID, return default stats
      if (!clinicId) {
        console.warn('Clinic ID is undefined after all fallback attempts, returning default stats');
        return {
          totalPatients: 0,
          totalDoctors: 0,
          todayAppointments: 0,
          monthlyRevenue: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
          staffPresent: 0,
          totalStaff: 0
        };
      }
    }
    
    // Default stats to return if we can't fetch from API
    const defaultStats = {
      totalPatients: 0,
      totalDoctors: 0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      staffPresent: 0,
      totalStaff: 0
    };
    
    // Check user role from multiple sources
    let hasRequiredRole = false;
    
    // 1. Try to get role from localStorage userData
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('User data from localStorage:', parsedUserData);
        
        // Check role field - could be in different formats
        if (parsedUserData.role === 'Admin' || parsedUserData.role === 'Doctor' ||
            parsedUserData.userRole === 'Admin' || parsedUserData.userRole === 'Doctor') {
          hasRequiredRole = true;
          console.log('User has required role from userData:', parsedUserData.role || parsedUserData.userRole);
        }
      }
    } catch (e) {
      console.error('Error checking user role from userData:', e);
    }
    
    // 2. Try to get role from localStorage user
    if (!hasRequiredRole) {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          console.log('User from localStorage:', parsedUser);
          
          if (parsedUser.role === 'Admin' || parsedUser.role === 'Doctor') {
            hasRequiredRole = true;
            console.log('User has required role from user:', parsedUser.role);
          }
        }
      } catch (e) {
        console.error('Error checking user role from user:', e);
      }
    }
    
    // 3. Try direct userRole from localStorage
    if (!hasRequiredRole) {
      const userRole = localStorage.getItem('userRole');
      console.log('Direct userRole from localStorage:', userRole);
      
      if (userRole === 'Admin' || userRole === 'Doctor') {
        hasRequiredRole = true;
        console.log('User has required role from userRole:', userRole);
      }
    }
    
    // If user doesn't have required role, don't even attempt the API call
    if (!hasRequiredRole) {
      console.log('User does not have Admin or Doctor role, skipping stats API call');
      return defaultStats;
    }
    
    // Only proceed with API call if user has required role
    try {
      console.log(`Attempting to fetch clinic stats for clinic ID: ${clinicId}`);
      const response = await axios.get(`${BASE_URL}/${clinicId}/stats`);
      console.log('Clinic stats fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // Check if this is a 403 Forbidden error
      if (error.response && error.response.status === 403) {
        console.warn('Access denied to clinic stats. User may not have required role.');
      } else {
        console.error('Error fetching clinic stats:', error);
      }
      
      // Return default stats object if API fails
      return defaultStats;
    }
  },
  
  // Get report data
  getReport: async (clinicId, params) => {
    try {
      const { type = 'financial', dateRange = 'month' } = params || {};
      const response = await axios.get(`/reports/${clinicId}`, {
        params: { type, dateRange }
      });
      console.log(`${type} report fetched successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },
  
  // Export report as PDF or Excel
  exportReport: async (clinicId, params) => {
    try {
      const { type = 'financial', dateRange = 'month', format = 'pdf' } = params || {};
      const response = await axios.post(`/reports/${clinicId}/export`, 
        { type, dateRange, format },
        { responseType: 'blob' }
      );
      console.log(`Report exported successfully as ${format}`);
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Staff Management
  getStaff: async (clinicId) => {
    // If clinicId is undefined, try to get it from multiple sources
    if (!clinicId) {
      // Try to get clinic ID from multiple sources
      // First try from localStorage clinicData
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        try {
          const parsedClinicData = JSON.parse(storedClinicData);
          clinicId = parsedClinicData._id;
          console.log('getStaff: Using clinic ID from localStorage clinicData:', clinicId);
        } catch (e) {
          console.error('Error parsing clinicData from localStorage:', e);
        }
      }
      
      // Then try from userData.clinicId
      if (!clinicId) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              clinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
              console.log('getStaff: Using clinic ID from localStorage userData:', clinicId);
            }
          } catch (e) {
            console.error('Error parsing userData from localStorage:', e);
          }
        }
      }
      
      // Finally try defaultClinicId
      if (!clinicId) {
        clinicId = localStorage.getItem('defaultClinicId');
        if (clinicId) {
          console.log('getStaff: Using defaultClinicId from localStorage:', clinicId);
        }
      }
      
      // If still no clinic ID, return empty array
      if (!clinicId) {
        console.warn('Clinic ID is undefined after all fallback attempts, returning empty staff array');
        return [];
      }
    }
    
    try {
      console.log(`Fetching staff for clinic ID: ${clinicId}`);
      const response = await axios.get(`${BASE_URL}/${clinicId}/staff`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },
  
  // Get staff by role
  getStaffByRole: async (role) => {
    try {
      console.log(`Fetching staff with role: ${role}`);
      const response = await axios.get(`/staff?role=${role}`);
      console.log(`Successfully fetched ${response.data.length || 0} staff with role ${role}`);
      
      // Ensure we're returning an array even if the API returns an object
      if (response.data && !Array.isArray(response.data)) {
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          console.warn(`API returned non-array data for staff with role ${role}:`, response.data);
          return [];
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching staff with role ${role}:`, error);
      return [];
    }
  },

  createStaff: async (clinicId, staffData) => {
    try {
      const response = await axios.post(`${BASE_URL}/${clinicId}/staff`, staffData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createStaff');
    }
  },

  updateStaff: async (clinicId, staffId, staffData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${clinicId}/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateStaff');
    }
  },

  deleteStaff: async (clinicId, staffId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${clinicId}/staff/${staffId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteStaff');
    }
  },
  
  // Activate clinic
  activateClinic: async (clinicId) => {
    try {
      // Ensure clinicId is a string
      const id = clinicId?.toString() || '';
      
      // Make sure we're sending the request with proper authentication
      const response = await axios.put(`${BASE_URL}/${id}/activate`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Clinic activated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in activateClinic:', error);
      return handleApiError(error, 'activateClinic');
    }
  }
};

export default clinicService;