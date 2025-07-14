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
      
      // In development mode, if the endpoint is not available, return mock data
      if (import.meta.env.DEV) {
        // Try to get the token to determine if user is logged in
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          console.log('authService: No token found, returning null in dev mode');
          return null;
        }
        
        // Parse the token to get user info (in a real app, this would come from the server)
        try {
          // Simple token parsing (this is just for development, not secure)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          console.log('authService: Using mock user data from token in dev mode', payload);
          
          // Return mock user data based on token payload
          return {
            id: payload.id || '12345',
            name: payload.name || 'Development User',
            email: payload.email || 'dev@example.com',
            role: payload.role || 'Admin',
            isVerified: true,
            createdAt: new Date().toISOString()
          };
        } catch (tokenError) {
          console.error('authService: Error parsing token in dev mode:', tokenError);
          // If token parsing fails, return a default mock user
          return {
            id: '12345',
            name: 'Development User',
            email: 'dev@example.com',
            role: 'Admin',
            isVerified: true,
            createdAt: new Date().toISOString()
          };
        }
      }
      
      // Normal API call for production
      const response = await client.get('/auth/profile');
      console.log('authService: User profile fetched successfully', response.data);
      
      if (!response.data || !response.data.user) {
        console.error('authService: Invalid user data structure received');
        throw new Error('Invalid user data received from server');
      }
      
      return response.data.user;
    } catch (error) {
      console.error('authService: Error fetching current user:', error);
      
      // In development mode, return mock data even on error
      if (import.meta.env.DEV) {
        console.log('authService: Returning mock user data after API error in dev mode');
        return {
          id: '12345',
          name: 'Development User',
          email: 'dev@example.com',
          role: 'Admin',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
      }
      
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