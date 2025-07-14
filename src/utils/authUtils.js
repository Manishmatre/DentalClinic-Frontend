// src/utils/authUtils.js

const TOKEN_KEY = 'authToken';

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Check if token exists and is valid
    if (!token) {
      console.warn('No auth token found');
      return {}; // Removed Content-Type. Let each request set it as needed.
    }
    
    // Return headers with token
    return {
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Error generating auth headers:', error);
    return {}; // Removed Content-Type. Let each request set it as needed.
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expiry;
  } catch (error) {
    console.error('Error parsing token:', error);
    return false;
  }
};

/**
 * Get user data from token
 * @returns {Object|null} User data or null if not authenticated
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Store authentication token
 * @param {string} token JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('userData');
  localStorage.removeItem('clinicData');
};