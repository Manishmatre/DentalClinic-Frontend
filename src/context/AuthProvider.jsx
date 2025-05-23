import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { getToken, setToken, clearToken } from '../api/axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

      // Fetch fresh user data with silent error handling
      // Use a try-catch to handle potential 404 errors gracefully
      let response;
      try {
        response = await api.get('/auth/profile');
      } catch (error) {
        // If we get a 404, try the alternative endpoint
        if (error.response && error.response.status === 404) {
          try {
            // Try alternative endpoint
            response = await api.get('/users/profile');
          } catch (innerError) {
            // Fallback to using stored data
            console.warn('Profile endpoint not found, using cached data');
          }
        }
      }

      // If the API call failed, use stored data
      if (!response || !response.data || !response.data.user) {
        // Use stored user data if available
        const storedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
        if (storedUserData) {
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
        
        // Only proceed if we have a valid clinic ID
        if (clinicId) {
          // Fetch clinic data with silent error handling
          const clinicResponse = await silentApiCall(
            () => api.get(`/clinics/${clinicId}`),
            'Clinic data fetch failed'
          );

          if (clinicResponse && clinicResponse.data) {
            const clinicData = clinicResponse.data;

            // Update localStorage with fresh clinic data
            localStorage.setItem('clinicData', JSON.stringify(clinicData));

            // Update state
            setClinic(clinicData);
          } else {
            // Try to use stored clinic data
            const storedClinicData = JSON.parse(localStorage.getItem('clinicData') || 'null');
            if (storedClinicData) {
              setClinic(storedClinicData);
            }
          }
        } else {
          // No valid clinicId, try to use stored clinic data
          const storedClinicData = JSON.parse(localStorage.getItem('clinicData') || 'null');
          if (storedClinicData) {
            setClinic(storedClinicData);
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

      // Check for success flag in response
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const token = response.data.token;

      if (!token) {
        throw new Error('Authentication failed - no token received');
      }

      // Set user and clinic data in state
      let userData = null;
      let clinicData = null;

      if (response.data.data && response.data.data.user) {
        userData = response.data.data.user;
        setUser(userData);

        // Set clinic data if available
        if (response.data.data.clinic) {
          clinicData = response.data.data.clinic;
          setClinic(clinicData);
        }
      }

      setIsAuthenticated(true);

      // Save token using our helper function
      setToken(token);

      // Store user data in localStorage for persistence across page refreshes
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
        if (clinicData) {
          localStorage.setItem('clinicData', JSON.stringify(clinicData));
        }
      }

      // Check if there's a redirect path stored from a previous session
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin'); // Clear it after use

        // Use timeout to ensure state is updated before redirect
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      } else {
        // Default redirect based on user role
        const roleBasedRedirect = {
          'Admin': '/admin/dashboard',
          'Doctor': '/doctor/dashboard',
          'Receptionist': '/receptionist/dashboard',
          'Patient': '/patient/dashboard'
        };

        if (userData && userData.role && roleBasedRedirect[userData.role]) {
          setTimeout(() => {
            navigate(roleBasedRedirect[userData.role]);
          }, 100);
        }
      }

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Please verify your email before logging in'
        };
      }
      if (error.response?.status === 401) {
        // Check if the error is related to role mismatch
        if (error.response?.data?.message?.includes('not registered as a')) {
          return {
            success: false,
            error: error.response.data.message || 'Role mismatch. Please select the correct role.'
          };
        }
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const handleLogout = () => {
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

  const value = {
    user,
    clinic,
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
    checkFeatureAccess
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
