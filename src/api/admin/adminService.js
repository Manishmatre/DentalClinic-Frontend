import client from '../client';
import axios from 'axios';

// Helper functions for activity tracking

// Get browser information
export function getBrowserInfo() {
  try {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else if (userAgent.match(/android/i)) {
      browserName = "Android Browser";
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      browserName = "iOS Browser";
    }
    
    return browserName;
  } catch (error) {
    console.error('Error getting browser info:', error);
    return 'Unknown Browser';
  }
}

// Get device information
export function getDeviceInfo() {
  try {
    const userAgent = navigator.userAgent;
    
    if (/Android/i.test(userAgent)) {
      return 'Android Device';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'iOS Device';
    } else if (/Windows Phone/i.test(userAgent)) {
      return 'Windows Phone';
    } else if (/Windows NT/i.test(userAgent)) {
      return 'Windows Desktop';
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent)) {
      return 'Mac Desktop';
    } else if (/Linux/i.test(userAgent)) {
      return 'Linux Desktop';
    } else {
      return 'Unknown Device';
    }
  } catch (error) {
    console.error('Error getting device info:', error);
    return 'Unknown Device';
  }
}

// Get IP address
export async function getIPAddress() {
  try {
    // Use a public API to get the IP address
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return 'Unknown';
  }
}

// Get location information
export async function getLocationInfo() {
  try {
    // First get the IP address
    const ip = await getIPAddress();
    
    // Use IP to get location (in a real app, you might use a paid service for more accurate results)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`;
    } else if (data.country_name) {
      return data.country_name;
    } else {
      return 'Unknown Location';
    }
  } catch (error) {
    console.error('Error getting location:', error);
    return 'Unknown Location';
  }
}

const adminService = {
  // Helper methods for activity tracking
  getBrowserInfo,
  getDeviceInfo,
  getIPAddress,
  getLocationInfo,
  // Get admin profile
  async getAdminProfile() {
    try {
      console.log('adminService: Getting admin profile');
      const response = await client.get('/admin/profile');
      console.log('adminService: Admin profile fetched successfully');
      return response.data.data || response.data;
    } catch (error) {
      console.error('adminService: Error fetching admin profile:', error);
      // Return empty profile structure with default values
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        profilePicture: '',
        
        // Professional information
        designation: '',
        department: '',
        employeeId: '',
        joinDate: '',
        qualification: '',
        specialization: '',
        yearsOfExperience: '',
        languagesSpoken: [],
        education: [],
        certifications: [],
        
        // Financial information
        bankAccounts: [],
        paymentMethods: [],
        
        // Social and clinic information
        socialLinks: [],
        clinicDetails: {
          name: '',
          logo: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          contactNumber: '',
          email: '',
          website: '',
          registrationNumber: '',
          taxIdentificationNumber: '',
          establishedYear: '',
          operatingHours: [],
          specialties: [],
          facilities: [],
          insuranceAccepted: [],
          images: []
        },
        
        // Preferences and activity
        notificationPreferences: {
          email: {
            appointments: true,
            reminders: true,
            billing: true,
            marketing: false,
            systemUpdates: true
          },
          sms: {
            appointments: true,
            reminders: true,
            billing: false,
            marketing: false,
            systemUpdates: false
          },
          push: {
            appointments: true,
            reminders: true,
            billing: true,
            marketing: false,
            systemUpdates: true
          }
        },
        appointmentReminderTime: '24',
        quietHoursStart: '',
        quietHoursEnd: '',
        newsletterSubscription: false,
        healthTipsSubscription: false,
        appointmentDigest: false,
        
        // History and logs
        experience: [],
        activityLog: [],
        loginHistory: []
      };
    }
  },

  // Update admin profile
  async updateAdminProfile(profileData) {
    try {
      console.log('adminService: Updating admin profile');
      console.log('adminService: Profile data being sent:', profileData);
      console.log('adminService: Profile picture URL:', profileData.profilePicture);
      
      // Ensure the profilePicture field is properly included
      const dataToSend = { ...profileData };
      
      // If we have a profile picture URL in localStorage but not in the profileData, use it
      if (!dataToSend.profilePicture) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.profilePicture) {
          dataToSend.profilePicture = userData.profilePicture;
          console.log('adminService: Using profile picture from localStorage:', dataToSend.profilePicture);
        }
      }
      
      const response = await client.put('/admin/profile', dataToSend);
      console.log('adminService: Admin profile updated successfully');
      console.log('adminService: Response data:', response.data);
      
      // Update the userData in localStorage with the response data
      if (response.data && response.data.data) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.profilePicture = response.data.data.profilePicture || userData.profilePicture;
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating admin profile:', error);
      throw error;
    }
  },

  // Add bank account
  async addBankAccount(bankAccountData) {
    try {
      console.log('adminService: Adding bank account');
      // Ensure the data structure matches the backend model
      const formattedData = {
        bankName: bankAccountData.bankName,
        accountNumber: bankAccountData.accountNumber,
        accountType: bankAccountData.accountType,
        routingNumber: bankAccountData.routingNumber,
        accountHolderName: bankAccountData.accountHolderName,
        branch: bankAccountData.branch,
        isDefault: bankAccountData.isDefault || false
      };
      
      const response = await client.post('/admin/bank-account', formattedData);
      console.log('adminService: Bank account added successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error adding bank account:', error);
      throw error;
    }
  },

  // Add experience
  async addExperience(experienceData) {
    try {
      const response = await client.post('/admin/experience', experienceData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error adding experience:', error);
      throw error;
    }
  },

  // Update social links
  async updateSocialLinks(socialLinksData) {
    try {
      console.log('adminService: Updating social links');
      // Format the social links data to match the backend model structure
      // The backend expects an array of objects with platform, url, and isPublic properties
      const formattedData = Array.isArray(socialLinksData) 
        ? socialLinksData 
        : Object.entries(socialLinksData).map(([platform, url]) => ({
            platform,
            url,
            isPublic: true // Default to public if not specified
          }));
      
      const response = await client.put('/admin/social-links', { socialLinks: formattedData });
      console.log('adminService: Social links updated successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating social links:', error);
      throw error;
    }
  },

  // Update preferences
  async updatePreferences(preferencesData) {
    try {
      console.log('adminService: Updating preferences');
      const response = await client.put('/admin/preferences', preferencesData);
      console.log('adminService: Preferences updated successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating preferences:', error);
      throw error;
    }
  },
  
  // Add payment method
  async addPaymentMethod(paymentMethodData) {
    try {
      console.log('adminService: Adding payment method');
      const response = await client.post('/admin/payment-method', paymentMethodData);
      console.log('adminService: Payment method added successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error adding payment method:', error);
      throw error;
    }
  },
  
  // Update notification preferences
  async updateNotificationPreferences(notificationPreferences) {
    try {
      console.log('adminService: Updating notification preferences');
      const response = await client.put('/admin/notification-preferences', notificationPreferences);
      console.log('adminService: Notification preferences updated successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating notification preferences:', error);
      throw error;
    }
  },

  // Add service
  async addService(serviceData) {
    try {
      const response = await client.post('/admin/service', serviceData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error adding service:', error);
      throw error;
    }
  },

  // Log activity
  async logActivity(activityData) {
    try {
      console.log('adminService: Logging activity', activityData);
      // Get browser and location info
      const browserInfo = await this.getBrowserInfo();
      const locationInfo = await this.getLocationInfo();
      // Ensure required fields are present
      const enhancedData = {
        type: activityData.type || 'profile',
        title: activityData.title || 'Activity',
        description: activityData.description || '',
        details: activityData.details || '',
        module: activityData.module || 'general',
        status: activityData.status || 'success',
        browser: browserInfo,
        location: locationInfo,
        timestamp: new Date()
      };
      const response = await client.post('/admin/log-activity', enhancedData);
      console.log('adminService: Activity logged successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error logging activity:', error);
      // If it's a 401 error, try to refresh token and retry
      if (error.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
              refreshToken
            });
            if (refreshResponse.data.token) {
              localStorage.setItem('authToken', refreshResponse.data.token);
              // Retry the request with new token
              const response = await client.post('/admin/log-activity', enhancedData);
              return response.data;
            }
          }
        } catch (refreshError) {
          console.error('adminService: Failed to refresh token:', refreshError);
        }
      }
      // Still log activity locally if server request fails
      console.log('adminService: Logging activity locally due to server error');
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to log activity on server',
        error: error.response?.data || error.message,
        data: activityData
      };
    }
  },

  // Log login
  async logLogin(loginData = {}) {
    try {
      console.log('adminService: Logging login');
      
      // Get device and browser information
      const ipInfo = await this.getIPAddress();
      const deviceInfo = this.getDeviceInfo();
      const browserInfo = this.getBrowserInfo();
      const locationInfo = await this.getLocationInfo();
      
      const enhancedData = {
        ipAddress: loginData.ipAddress || ipInfo,
        device: loginData.device || deviceInfo,
        browser: loginData.browser || browserInfo,
        location: loginData.location || locationInfo,
        status: loginData.status || 'successful',
        timestamp: new Date()
      };
      
      const response = await client.post('/admin/log-login', enhancedData);
      console.log('adminService: Login logged successfully');
      
      // Also log as an activity
      this.logActivity({
        type: 'login',
        title: 'User logged in',
        description: `Logged in from ${enhancedData.location}`,
        details: `Device: ${enhancedData.device}, Browser: ${enhancedData.browser}`,
        module: 'authentication',
        status: 'success'
      }).catch(err => console.error('Failed to log login as activity:', err));
      
      return response.data;
    } catch (error) {
      console.error('adminService: Error logging login:', error);
      // Still return some data even if server request fails
      return {
        success: false,
        message: 'Failed to log login on server',
        data: loginData
      };
    }
  },
  
  // Log logout
  async logLogout() {
    try {
      // Log the logout activity
      await this.logActivity({
        type: 'login',
        title: 'User logged out',
        description: 'User session ended',
        module: 'authentication',
        status: 'success'
      });
      
      console.log('adminService: Logout logged successfully');
      return { success: true };
    } catch (error) {
      console.error('adminService: Error logging logout:', error);
      return { success: false };
    }
  },

  // Get admin activity data
  async getAdminActivity() {
    try {
      console.log('adminService: Fetching activity data...');
      const response = await client.get('/admin/activity');
      console.log('adminService: Activity data response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log(`adminService: Received ${response.data.data.length} activity records`);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log(`adminService: Received ${response.data.length} activity records (direct array)`);
        return response.data;
      } else {
        console.warn('adminService: Unexpected activity data format:', response.data);
        // Return empty array if data is not in expected format
        return [];
      }
    } catch (error) {
      console.error('adminService: Error fetching activity data:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  // Get login history
  async getLoginHistory() {
    try {
      console.log('adminService: Fetching login history...');
      const response = await client.get('/admin/login-history');
      console.log('adminService: Login history response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log(`adminService: Received ${response.data.data.length} login history records`);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log(`adminService: Received ${response.data.length} login history records (direct array)`);
        return response.data;
      } else {
        console.warn('adminService: Unexpected login history format:', response.data);
        // Return empty array if data is not in expected format
        return [];
      }
    } catch (error) {
      console.error('adminService: Error fetching login history:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      console.log('adminService: Changing password');
      const response = await client.post('/admin/change-password', passwordData);
      console.log('adminService: Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error changing password:', error);
      throw error;
    }
  }
};

export default adminService;
