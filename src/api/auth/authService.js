import client from '../client';

const TOKEN_KEY = 'authToken';

const authService = {
  async login(credentials) {
    try {
      console.log('authService: Attempting login with role:', credentials.role);
      const response = await client.post('/auth/login', credentials);
      console.log('authService: Login successful, response:', response.data);
      
      // Store the token in localStorage directly here as backup
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        console.log('authService: Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('authService: Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      console.log('authService: Getting current user profile');
      const response = await client.get('/auth/profile');
      console.log('authService: User profile fetched successfully', response.data);
      
      if (!response.data || !response.data.user) {
        console.error('authService: Invalid user data structure received');
        throw new Error('Invalid user data received from server');
      }
      
      return response.data.user;
    } catch (error) {
      console.error('authService: Error fetching current user:', error);
      // If we get an auth error, clear the token
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      throw error;
    }
  },

  async registerAdmin(registrationData) {
    const response = await client.post('/auth/register-admin', registrationData);
    console.log('authService: Admin registration successful');
    return response.data;
  },

  async registerStaff(staffData) {
    const response = await client.post('/auth/register-staff', staffData);
    return response.data;
  },

  async registerPatient(patientData) {
    const response = await client.post('/auth/register-patient', patientData);
    return response.data;
  },

  async resendVerification(email) {
    const response = await client.post('/auth/resend-verification', { email });
    return response.data;
  },

  async resetPasswordRequest(email) {
    const response = await client.post('/auth/reset-password-request', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await client.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await client.put('/auth/profile', profileData);
    return response.data;
  },
  
  // Convenience method to check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token; // Return true if token exists, false otherwise
  }
};

export default authService;