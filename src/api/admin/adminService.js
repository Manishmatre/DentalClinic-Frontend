import client from '../client';

const adminService = {
  // Get admin profile
  async getAdminProfile() {
    try {
      console.log('adminService: Getting admin profile');
      const response = await client.get('/admin/profile');
      console.log('adminService: Admin profile fetched successfully', response.data);
      return response.data.data;
    } catch (error) {
      console.error('adminService: Error fetching admin profile:', error);
      // Return default profile structure instead of throwing
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        qualification: '',
        specialization: '',
        yearsOfExperience: '',
        languagesSpoken: [],
        socialLinks: {
          linkedIn: '',
          twitter: '',
          facebook: '',
          instagram: '',
          website: ''
        },
        bankAccounts: [],
        experience: [],
        activityLogs: [],
        loginHistory: []
      };
    }
  },

  // Update admin profile
  async updateAdminProfile(profileData) {
    try {
      console.log('adminService: Updating admin profile');
      const response = await client.put('/admin/profile', profileData);
      console.log('adminService: Admin profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating admin profile:', error);
      throw error;
    }
  },

  // Add bank account
  async addBankAccount(bankAccountData) {
    try {
      const response = await client.post('/admin/bank-account', bankAccountData);
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
      const response = await client.put('/admin/social-links', socialLinksData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating social links:', error);
      throw error;
    }
  },

  // Update preferences
  async updatePreferences(preferencesData) {
    try {
      const response = await client.put('/admin/preferences', preferencesData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error updating preferences:', error);
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
      const response = await client.post('/admin/log-activity', activityData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error logging activity:', error);
      throw error;
    }
  },

  // Log login
  async logLogin(loginData) {
    try {
      const response = await client.post('/admin/log-login', loginData);
      return response.data;
    } catch (error) {
      console.error('adminService: Error logging login:', error);
      throw error;
    }
  }
};

export default adminService;
