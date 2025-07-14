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
 * Get clinic data from multiple sources with fallback
 * @returns {object|null} Clinic data or null if not found
 */
export const getClinicDataFromStorage = () => {
  try {
    // Try to get from clinicData first (most complete)
    const clinicData = localStorage.getItem('clinicData');
    if (clinicData) {
      const parsedClinicData = JSON.parse(clinicData);
      if (parsedClinicData && parsedClinicData._id) {
        return parsedClinicData;
      }
    }
    
    // Try to get from userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData && parsedUserData.clinicId) {
        // If clinicId is an object, extract the ID
        const clinicId = typeof parsedUserData.clinicId === 'object' ? 
          (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
          parsedUserData.clinicId;
        
        if (clinicId) {
          return { _id: clinicId, name: parsedUserData.clinicName || 'Unknown Clinic' };
        }
      }
    }
    
    // Try to get from defaultClinicId
    const defaultClinicId = localStorage.getItem('defaultClinicId');
    if (defaultClinicId) {
      return { _id: defaultClinicId, name: 'Default Clinic' };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting clinic data from storage:', error);
    return null;
  }
};

/**
 * Set clinic data in localStorage
 * @param {object} clinicData - Clinic data to store
 */
export const setClinicDataInStorage = (clinicData) => {
  try {
    if (clinicData && clinicData._id) {
      localStorage.setItem('clinicData', JSON.stringify(clinicData));
      console.log('Clinic data stored successfully:', clinicData);
    }
  } catch (error) {
    console.error('Error setting clinic data in storage:', error);
  }
};

/**
 * Clear all clinic-related data from localStorage
 */
export const clearClinicDataFromStorage = () => {
  try {
    localStorage.removeItem('clinicData');
    localStorage.removeItem('defaultClinicId');
    console.log('Clinic data cleared from storage');
  } catch (error) {
    console.error('Error clearing clinic data from storage:', error);
  }
};

export default {
  getClinicIdFromStorage,
  getClinicNameFromStorage,
  setClinicIdInStorage,
  getClinicDataFromStorage,
  setClinicDataInStorage,
  clearClinicDataFromStorage
};
