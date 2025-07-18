import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { getToken, setToken, clearToken } from '../api/axios';
import axios from 'axios';
import { toast } from 'react-toastify';
import adminService from '../api/admin/adminService';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create a silent axios instance that doesn't log errors to console
const silentAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
silentAxios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // Silently handle request errors
    return Promise.resolve({ data: null });
  }
);

// Add response interceptor to silently handle errors
silentAxios.interceptors.response.use(
  response => response,
  error => {
    // Silently handle response errors and return a resolved promise
    // to prevent console errors
    return Promise.resolve({ data: null, silentError: error });
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const newSocket = io('http://localhost:5000', {
          transports: ['websocket', 'polling'],
          withCredentials: true,
          auth: {
            token: getToken()
          }
        });

        newSocket.on('connect', () => {
          console.log('Socket.IO connected successfully');
        });

        newSocket.on('connect_error', (error) => {
          console.warn('Socket.IO connection error:', error.message);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
        });

        setSocket(newSocket);

        return () => {
          if (newSocket) {
            newSocket.disconnect();
          }
        };
      } catch (error) {
        console.warn('Failed to initialize Socket.IO:', error);
      }
    } else if (socket) {
      // Disconnect socket if user is not authenticated
      socket.disconnect();
      setSocket(null);
    }
  }, [isAuthenticated, user]);

  // Helper function to handle API errors silently in production
  const silentApiCall = async (apiFunction, errorMessage) => {
    try {
      return await apiFunction();
    } catch (error) {
      // In development, log minimal error info
      if (process.env.NODE_ENV === 'development') {
        // Only log the message, not the full error object to reduce console noise
        console.warn(`${errorMessage}: ${error.message}`);
      }
      return null;
    }
  };

  const refreshAuth = async () => {
    try {
      // Check for token without logging
      const token = getToken();

      if (!token) {
        // Silent handling of missing token
        handleLogout();
        return null;
      }

      try {
        // Use silentAxios to prevent console errors
        const response = await silentAxios.get('/auth/profile');
        
        // If we got a successful response with data
        if (response.data && response.data.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth profile fetched successfully');
          }
          return response.data.user;
        }
      } catch (error) {
        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 404) {
            console.log('Auth profile endpoint not found, using cached data');
            // Try to get user data from token instead
            try {
              const decodedToken = jwtDecode(token);
              return {
                id: decodedToken.userId || decodedToken.id,
                email: decodedToken.email,
                role: decodedToken.role,
                clinicId: decodedToken.clinicId,
                name: decodedToken.name || 'User'
              };
            } catch (tokenError) {
              console.error('Failed to decode token:', tokenError);
            }
          } else if (error.response.status === 401) {
            console.log('Authentication required, redirecting to login');
            // Clear auth data and redirect to login
            clearToken();
            localStorage.removeItem('userData');
            localStorage.removeItem('clinicData');
            navigate('/login');
            return null;
          }
        }
        console.log(`Using cached auth data (${error.message})`);
      }
      
      // Try to use stored user data from localStorage
      {
        // Use stored user data if available
        const storedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
        if (storedUserData) {
          // Make sure profilePicture is included in the user data
          if (storedUserData.profilePicture) {
            console.log('Using stored profile picture:', storedUserData.profilePicture);
          }
          setUser(storedUserData);
          setIsAuthenticated(true);
          return storedUserData;
        }
        return null;
      }

      const userData = response.data.user;

      // Update localStorage with fresh user data
      localStorage.setItem('userData', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      if (userData.clinicId) {
        // Ensure clinicId is a string before using it in the URL
        const clinicId = typeof userData.clinicId === 'object' ? 
          (userData.clinicId._id || userData.clinicId.id || '') : userData.clinicId;
        
        // Defensive check: clinicId must be a valid 24-char string (MongoDB ObjectId)
        if (!clinicId || typeof clinicId !== 'string' || clinicId.length !== 24) {
          setClinic(null);
          localStorage.removeItem('clinicData');
          if (typeof window !== 'undefined') {
            window.alert('Your account is not associated with a valid clinic. Please contact support.');
            window.location.href = '/no-clinic';
          }
          return null;
        }
        // Only proceed if we have a valid clinic ID
        if (clinicId) {
          // Always fetch clinic data from the database
          try {
            const clinicResponse = await api.get(`/clinics/${clinicId}`);
            if (clinicResponse && clinicResponse.data) {
              const clinicData = clinicResponse.data;
              console.log('Clinic data fetched during refresh:', clinicData);
              localStorage.setItem('clinicData', JSON.stringify(clinicData));
              setClinic(clinicData);
            } else {
              // If no clinic data, clear context and redirect
              setClinic(null);
              localStorage.removeItem('clinicData');
              if (typeof window !== 'undefined') {
                window.alert('Your account is no longer associated with a clinic. Please contact support.');
                window.location.href = '/no-clinic';
              }
              return null;
            }
          } catch (err) {
            // On error, clear context and redirect
            setClinic(null);
            localStorage.removeItem('clinicData');
            if (typeof window !== 'undefined') {
              window.alert('Failed to fetch clinic information. Please contact support or try again later.');
              window.location.href = '/no-clinic';
            }
            return null;
          }
        }
      }

      return userData;
    } catch (error) {
      // Silent error handling
      if (process.env.NODE_ENV === 'development') {
        console.warn('Auth refresh failed silently, using stored data if available');
      }

      // Try to use stored user data
      const storedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
      if (storedUserData) {
        setUser(storedUserData);
        setIsAuthenticated(true);
        return storedUserData;
      }

      return null;
    }
  };

  // Initialize auth state by decoding JWT token and checking expiration
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        const token = getToken();

        if (!token) {
          // No token, just skip initialization silently
          setIsLoading(false);
          return;
        }

        try {
          // Decode the token and check expiration
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired, handle logout silently
            handleLogout();
            return;
          }

          // Set authentication state based on valid token
          setIsAuthenticated(true);

          // First try to use stored user and clinic data from localStorage
          const storedUserData = localStorage.getItem('userData');
          const storedClinicData = localStorage.getItem('clinicData');

          let userData = null;
          let clinicData = null;

          if (storedUserData) {
            try {
              userData = JSON.parse(storedUserData);
              setUser(userData);

              if (storedClinicData) {
                clinicData = JSON.parse(storedClinicData);
                setClinic(clinicData);
              }
            } catch (parseError) {
              // Silent error handling for parsing errors
              if (process.env.NODE_ENV === 'development') {
                console.warn('Error parsing stored user data');
              }
              // Continue with refreshAuth if parsing fails
            }
          }

          // Attempt to refresh auth state with the server
          try {
            const refreshedUser = await refreshAuth();

            // If refresh failed but we have stored data, continue with that
            if (!refreshedUser && userData) {
              // Continue silently with stored data
            } else if (!refreshedUser && !userData) {
              // If we don't have stored user data and can't refresh, logout silently
              handleLogout();
              return;
            }
          } catch (refreshError) {
            // Silent error handling
            if (process.env.NODE_ENV === 'development') {
              console.warn('Auth refresh failed, using stored data if available');
            }

            // If we have stored user data, continue with that
            if (userData) {
              // Continue silently with stored data
            } else {
              // If we don't have stored user data and can't refresh, logout silently
              handleLogout();
              return;
            }
          }
        } catch (tokenError) {
          // Silent error handling for token decoding
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error decoding token');
          }
          handleLogout();
          return;
        }
      } catch (error) {
        // Silent error handling for general initialization
        if (process.env.NODE_ENV === 'development') {
          console.warn('Auth initialization error');
        }
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (registrationData) => {
    try {
      const response = await api.post('/auth/register-admin', registrationData);

      if (response.data.success) {
        // If token is provided in registration response, we could also log the user in immediately
        if (response.data.data?.token) {
          setToken(response.data.data.token);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Registration successful! Please check your email to verify your account.'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Register staff (Doctor or Receptionist)
  const registerStaff = async (staffData) => {
    try {
      const response = await api.post('/auth/register-staff', staffData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || `${staffData.role} registration successful! Please check your email to verify your account.`
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Register patient
  const registerPatient = async (patientData) => {
    try {
      const response = await api.post('/auth/register-patient', patientData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Patient registration successful! Please check your email to verify your account.'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data && response.data.token) {
        // Set the token in localStorage
        setToken(response.data.token);
        
        // Set the user data
        const userData = response.data.data?.user;
        if (!userData) {
          throw new Error('Invalid user data received from server');
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        // Handle clinic data from login response
        const clinicData = response.data.data?.clinic;
        if (clinicData) {
          console.log('Clinic data received from login:', clinicData);
          localStorage.setItem('clinicData', JSON.stringify(clinicData));
          setClinic(clinicData);
        } else if (userData.clinicId) {
          // If no clinic data in response but user has clinicId, try to fetch it
          try {
            const clinicId = typeof userData.clinicId === 'object' ? 
            (userData.clinicId._id || userData.clinicId.id || '') : 
              userData.clinicId;
        
        if (clinicId) {
            const clinicResponse = await api.get(`/clinics/${clinicId}`);
            if (clinicResponse.data) {
              localStorage.setItem('clinicData', JSON.stringify(clinicResponse.data));
              setClinic(clinicResponse.data);
              }
            }
          } catch (clinicError) {
            console.warn('Failed to fetch clinic data:', clinicError);
            // Continue with login even if clinic fetch fails
          }
        }

        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const handleLogout = () => {
    // Get user data before clearing
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    
    // Log logout activity for admin users
    if (userData && userData.role === 'Admin') {
      try {
        // Log the logout activity
        adminService.logActivity({
          type: 'login',
          title: 'User logged out',
          description: 'User session ended',
          module: 'authentication',
          status: 'success'
        }).catch(error => {
          console.error('Error logging logout activity:', error);
        });
      } catch (logError) {
        console.error('Failed to log logout activity:', logError);
      }
    }
    
    // Silently clear all auth data
    clearToken();
    // Clear stored user and clinic data
    localStorage.removeItem('userData');
    localStorage.removeItem('clinicData');
    setUser(null);
    setClinic(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const resendVerification = async (email) => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to resend verification email'
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      await api.post('/auth/reset-password-request', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send password reset email'
      };
    }
  };

  const confirmResetPassword = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to reset password'
      };
    }
  };

  const checkFeatureAccess = (feature) => {
    try {
      // Basic implementation - you can expand based on your subscription model
      return true;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Feature access check failed');
      }
      return false;
    }
  };

  const forceRefreshUserData = async () => {
    console.log('Force refreshing user data...');
    try {
      // Clear any cached user data
      localStorage.removeItem('lastAuthRefresh');
      
      // Force a full refresh of user data
      const freshUserData = await refreshAuth(true);
      console.log('User data refreshed successfully:', freshUserData);
      return freshUserData;
    } catch (error) {
      console.error('Error force refreshing user data:', error);
      return null;
    }
  };

  const value = {
    user,
    clinic,
    socket,
    isAuthenticated,
    isLoading,
    login,
    register,
    registerStaff,
    registerPatient,
    logout: handleLogout,
    refreshAuth,
    resendVerification,
    resetPassword,
    confirmResetPassword,
    checkFeatureAccess,
    forceRefreshUserData
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
