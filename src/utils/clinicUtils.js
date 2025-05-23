/**
 * Utility functions for clinic-related operations
 */

/**
 * Get clinic ID from localStorage
 * @returns {string|null} Clinic ID or null if not found
 */
export const getClinicIdFromStorage = () => {
  try {
    // Try to get from user data first
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.clinicId) {
        return parsedUserData.clinicId;
      }
    }
    
    // Try to get directly from localStorage
    const clinicId = localStorage.getItem('clinicId');
    if (clinicId) {
      return clinicId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting clinic ID from storage:', error);
    return null;
  }
};

/**
 * Get clinic name from localStorage
 * @returns {string|null} Clinic name or null if not found
 */
export const getClinicNameFromStorage = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.clinicName) {
        return parsedUserData.clinicName;
      }
    }
    
    const clinicData = localStorage.getItem('clinicData');
    if (clinicData) {
      const parsedClinicData = JSON.parse(clinicData);
      if (parsedClinicData.name) {
        return parsedClinicData.name;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting clinic name from storage:', error);
    return null;
  }
};

/**
 * Set clinic ID in localStorage
 * @param {string} clinicId - Clinic ID to store
 */
export const setClinicIdInStorage = (clinicId) => {
  try {
    localStorage.setItem('clinicId', clinicId);
  } catch (error) {
    console.error('Error setting clinic ID in storage:', error);
  }
};

/**
 * Clear clinic data from localStorage
 */
export const clearClinicDataFromStorage = () => {
  try {
    localStorage.removeItem('clinicId');
    localStorage.removeItem('clinicData');
  } catch (error) {
    console.error('Error clearing clinic data from storage:', error);
  }
};

export default {
  getClinicIdFromStorage,
  getClinicNameFromStorage,
  setClinicIdInStorage,
  clearClinicDataFromStorage
};
