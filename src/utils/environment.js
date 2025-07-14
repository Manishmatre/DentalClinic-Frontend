/**
 * Environment utility functions
 * Used to determine the current environment and provide environment-specific functionality
 */

/**
 * Check if the application is running in development mode
 * @returns {boolean} True if in development mode, false otherwise
 */
export const isDevelopment = () => {
  // Check if NODE_ENV is set to development
  // In React apps created with Create React App, this is automatically set
  return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
};

/**
 * Check if the application is running in production mode
 * @returns {boolean} True if in production mode, false otherwise
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost';
};

/**
 * Get the base API URL based on the current environment
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  if (isDevelopment()) {
    return 'http://localhost:5000/api';
  } else {
    // Production API URL
    return 'https://api.healthfirst.in/api';
  }
};

/**
 * Enable mock data in development mode
 * @returns {boolean} True if mock data should be used
 */
export const useMockData = () => {
  // Use mock data in development mode or if explicitly enabled via localStorage
  return isDevelopment() || localStorage.getItem('useMockData') === 'true';
};

/**
 * Log information only in development mode
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
export const devLog = (message, data) => {
  if (isDevelopment()) {
    if (data) {
      console.log(`[DEV] ${message}`, data);
    } else {
      console.log(`[DEV] ${message}`);
    }
  }
};
