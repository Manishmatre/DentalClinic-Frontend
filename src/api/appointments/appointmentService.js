import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthHeaders } from '../../utils/authUtils';
import { toast } from 'react-toastify';

// Cache for appointments to reduce API calls
let appointmentsCache = {
  data: null,
  timestamp: null,
  clinicId: null,
  params: null
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Helper function to get clinic ID from various sources
 * @returns {string|null} The clinic ID or null if not found
 */
const getClinicId = () => {
  // Always try to get clinic ID from current user's auth context first
      try {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const tokenData = JSON.parse(atob(authToken.split('.')[1]));
      if (tokenData.clinicId) {
        return typeof tokenData.clinicId === 'object' ? tokenData.clinicId._id : tokenData.clinicId;
          }
        }
  } catch (error) {
    console.warn('Error parsing auth token for clinic ID:', error);
  }
  
  // Fallback to localStorage if auth token doesn't have clinic info
  const storedClinicId = localStorage.getItem('clinicId');
  if (storedClinicId) {
    return storedClinicId;
  }

  return null;
};

/**
 * Helper function to format appointment data consistently
 * @param {Object} appointment - The appointment object to format
 * @returns {Object} Formatted appointment object
 */
const formatAppointmentData = (appointment) => {
  if (!appointment) return null;

  // Extract patient name and phone
  let patientName = appointment.patientName;
  let patientPhone = appointment.patientPhone;

  // Try to extract from patientId if it's an object
  if (!patientName && appointment.patientId && typeof appointment.patientId === 'object') {
    patientName = appointment.patientId.name || 
                 (appointment.patientId.firstName && appointment.patientId.lastName ? 
                  `${appointment.patientId.firstName} ${appointment.patientId.lastName}` : 
                  null);
    patientPhone = appointment.patientId.phone || appointment.patientId.phoneNumber;
  }

  // Try to extract from patient if it's an object
  if (!patientName && appointment.patient && typeof appointment.patient === 'object') {
    patientName = appointment.patient.name || 
                 (appointment.patient.firstName && appointment.patient.lastName ? 
                  `${appointment.patient.firstName} ${appointment.patient.lastName}` : 
                  null);
    patientPhone = appointment.patient.phone || appointment.patient.phoneNumber;
  }

  // Extract doctor name and specialization
  let doctorName = appointment.doctorName;
  let specialization = appointment.specialization;

  // Try to extract from doctorId if it's an object
  if (!doctorName && appointment.doctorId && typeof appointment.doctorId === 'object') {
    doctorName = appointment.doctorId.name || 
                (appointment.doctorId.firstName && appointment.doctorId.lastName ? 
                 `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 
                 null);
    specialization = appointment.doctorId.specialization;
  }

  // Try to extract from doctor if it's an object
  if (!doctorName && appointment.doctor && typeof appointment.doctor === 'object') {
    doctorName = appointment.doctor.name || 
                (appointment.doctor.firstName && appointment.doctor.lastName ? 
                 `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 
                 null);
    specialization = appointment.doctor.specialization;
  }

  // Return formatted appointment with all data normalized
  let startTime = appointment.startTime ? new Date(appointment.startTime) : null;
  let endTime = appointment.endTime ? new Date(appointment.endTime) : null;
  if (!startTime || isNaN(startTime.getTime()) || !endTime || isNaN(endTime.getTime())) {
    console.error('Invalid appointment date:', appointment);
    startTime = null;
    endTime = null;
  }
  return {
    ...appointment,
    startTime,
    endTime,
    createdAt: appointment.createdAt ? new Date(appointment.createdAt) : null,
    updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt) : null,
    patientName,
    patientPhone,
    doctorName,
    specialization
  };
};

/**
 * Helper function to invalidate cache
 */
const invalidateCache = () => {
  appointmentsCache = {
    data: null,
    timestamp: null,
    clinicId: null,
    params: null
  };
};

const appointmentService = {
  /**
   * Get appointments with optional filtering
   * @param {Object} params - Query parameters for filtering appointments
   * @returns {Promise<Array>} Array of formatted appointment objects
   */
  async getAppointments(params = {}) {
    try {
      const queryParams = { ...params };
      
      // If clinicId is not provided in params, try to get it from various sources
      if (!queryParams.clinicId) {
        const clinicId = getClinicId();
        if (clinicId) {
          queryParams.clinicId = clinicId;
        }
      }
      
      // If we still don't have a clinic ID, log a warning
      if (!queryParams.clinicId) {
        console.warn('No clinic ID found for appointment query, this may cause issues');
      }
      
      // Check if we have a valid cache that matches the current query parameters
      const now = Date.now();
      const isSameClinic = appointmentsCache.clinicId === queryParams.clinicId;
      const isSameParams = JSON.stringify(appointmentsCache.params) === JSON.stringify(queryParams);
      const isCacheValid = appointmentsCache.data && 
                          appointmentsCache.timestamp && 
                          (now - appointmentsCache.timestamp < CACHE_EXPIRATION) &&
                          isSameClinic &&
                          isSameParams;
      
      // If we have a valid cache, use it
      if (isCacheValid) {
        console.log('Using cached appointments data');
        return appointmentsCache.data;
      }
      
      // Otherwise, fetch from API
      console.log('Fetching appointments from API');
      const response = await axios.get(`${API_URL}/appointments`, { 
        headers: getAuthHeaders(),
        params: queryParams 
      });
      
      // Process and format the appointments data
      const appointments = response.data.map(apt => formatAppointmentData(apt));
      
      // Update the cache
      appointmentsCache = {
        data: appointments,
        timestamp: now,
        clinicId: queryParams.clinicId,
        params: queryParams
      };
      
      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      // Handle different error scenarios with structured error responses
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view appointments.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view appointments.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching appointments',
        details: error.message
      };
    }
  },
  
  /**
   * Get a single appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Formatted appointment object
   */
  async getAppointmentById(id) {
    try {
      if (!id) {
        return {
          error: true,
          status: 400,
          message: 'Missing appointment ID',
          details: 'An appointment ID is required to fetch appointment details.'
        };
      }
      
      const response = await axios.get(`${API_URL}/appointments/${id}`, {
        headers: getAuthHeaders()
      });
      return formatAppointmentData(response.data);
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      
      // Handle different error scenarios with structured error responses
      if (error.response) {
        const status = error.response.status;
        
        if (status === 404) {
          return {
            error: true,
            status: 404,
            message: 'Appointment not found',
            details: `The appointment with ID ${id} could not be found.`
          };
        } else if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view this appointment.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view appointment details.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching appointment',
        details: error.message
      };
    }
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Data for the new appointment
   * @returns {Promise<Object>} Created appointment or error object
   */
  async createAppointment(appointmentData) {
    try {
      // Deep clone the appointment data to avoid side effects
      const data = JSON.parse(JSON.stringify(appointmentData));
      
      // Validate required fields
      if (!data.patientId) {
        return {
          error: true,
          status: 400,
          message: 'Missing required fields',
          details: 'Patient ID is required'
        };
      }
      
      // Get clinic ID from various sources if not provided
      let clinicId = data.clinicId;
      
      // If clinicId is an object, extract the ID
      if (clinicId && typeof clinicId === 'object') {
        clinicId = clinicId._id || clinicId.id;
      }
      
      // If still no clinicId, try to get from localStorage
      if (!clinicId) {
        clinicId = getClinicId();
      }
      
      // If we still don't have a clinic ID, return an error
      if (!clinicId) {
        return {
          error: true,
          status: 400,
          message: 'Missing clinic ID',
          details: 'A clinic ID is required to create an appointment'
        };
      }
      
      // Set the clinic ID in the data
      data.clinicId = clinicId;
      
      // Handle patient ID formatting
      if (data.patientId && typeof data.patientId === 'object') {
        data.patientId = data.patientId._id || data.patientId.id;
      }
      
      // Handle doctor ID formatting
      if (data.doctorId && typeof data.doctorId === 'object') {
        data.doctorId = data.doctorId._id || data.doctorId.id;
      }
      
      // IMPORTANT: Add reason field if missing (it's required by the backend)
      if (!data.reason) {
        data.reason = data.notes || data.serviceType || 'Medical appointment';
      }
      // Double-check that reason is set (this is critical)
      if (!data.reason) {
        data.reason = 'Medical appointment';
      }
      
      // Validate and format appointment times
      if (data.startTime) {
        // Ensure startTime is in ISO format
        data.startTime = new Date(data.startTime).toISOString();
      } else {
        return {
          error: true,
          status: 400,
          message: 'Missing start time',
          details: 'Appointment start time is required'
        };
      }
      
      if (data.endTime) {
        // Ensure endTime is in ISO format
        data.endTime = new Date(data.endTime).toISOString();
      } else {
        // If no end time is provided, default to 30 minutes after start time
        const endTime = new Date(data.startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        data.endTime = endTime.toISOString();
      }
      
      // Validate that end time is after start time
      if (new Date(data.endTime) <= new Date(data.startTime)) {
        return {
          error: true,
          status: 400,
          message: 'Invalid appointment times',
          details: 'End time must be after start time'
        };
      }
      
      // Make the API call to create the appointment
      console.log('Sending appointment data to backend:', JSON.stringify(data, null, 2));
      const response = await axios.post(`${API_URL}/appointments`, data, {
        headers: getAuthHeaders()
      });
      
      // Invalidate the cache to ensure fresh data on next fetch
      invalidateCache();
      
      // Return the formatted appointment data
      const createdAppointment = formatAppointmentData(response.data);
      return createdAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Backend error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        // Show toast notification for all backend errors
        const backendError = error.response.data;
        toast.error(
          backendError.message
            ? `${backendError.message}${backendError.details ? ': ' + backendError.details : ''}`
            : 'Error creating appointment'
        );
      } else {
        toast.error('Error creating appointment: ' + error.message);
      }
      
      // Handle different error scenarios with structured error responses
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to create an appointment.'
          };
        } else if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to create appointments.'
          };
        } else if (status === 404) {
          return {
            error: true,
            status: 404,
            message: 'Resource not found',
            details: 'The patient, doctor, or clinic could not be found.'
          };
        } else if (status === 409) {
          return {
            error: true,
            status: 409,
            message: 'Appointment conflict',
            details: 'The requested appointment time conflicts with an existing appointment.'
          };
        } else if (status === 400) {
          // Handle 400 errors with detailed backend response
          const backendError = error.response.data;
          return {
            error: true,
            status: 400,
            message: backendError.message || 'Bad Request',
            details: backendError.details || backendError.error || 'Invalid appointment data'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error creating appointment',
        details: error.message
      };
    }
  },

  /**
   * Update an existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Data for the updated appointment
   * @returns {Promise<Object>} Updated appointment or error object
   */
  async updateAppointment(id, appointmentData) {
    try {
      if (!id) {
        return {
          error: true,
          status: 400,
          message: 'Missing appointment ID',
          details: 'An appointment ID is required to update an appointment.'
        };
      }
      // Deep clone the appointment data to avoid side effects
      const data = JSON.parse(JSON.stringify(appointmentData));
      // Format IDs
      if (data.patientId && typeof data.patientId === 'object') {
        data.patientId = data.patientId._id || data.patientId.id;
      }
      if (data.doctorId && typeof data.doctorId === 'object') {
        data.doctorId = data.doctorId._id || data.doctorId.id;
      }
      // Format times
      if (data.startTime) {
        data.startTime = new Date(data.startTime).toISOString();
      }
      if (data.endTime) {
        data.endTime = new Date(data.endTime).toISOString();
      }
      // Ensure reason is present
      if (!data.reason) {
        data.reason = data.notes || data.serviceType || 'Medical appointment';
      }
      // Make the API call
      const response = await axios.put(`${API_URL}/appointments/${id}`, data, {
        headers: getAuthHeaders()
      });
      invalidateCache();
      return formatAppointmentData(response.data);
    } catch (error) {
      console.error('Error updating appointment:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to update appointment');
        return {
          error: true,
          status: error.response.status,
          message: error.response.data?.message || 'Failed to update appointment',
          details: error.response.data?.details || error.message
        };
      }
      toast.error('Failed to update appointment: ' + error.message);
      return {
        error: true,
        status: 500,
        message: 'Failed to update appointment',
        details: error.message
      };
    }
  },

  /**
   * Get appointment statistics
   * @param {Object} params - Query parameters for filtering stats (startDate, endDate)
   * @returns {Promise<Object>} Appointment statistics
   */
  async getAppointmentStats(params = {}) {
    try {
      // Always include clinicId if available
      const queryParams = {
        startDate: params.startDate,
        endDate: params.endDate
      };
      const clinicId = params.clinicId || getClinicId();
      if (clinicId) queryParams.clinicId = clinicId;

      const response = await axios.get(`${API_URL}/appointments/stats`, {
        headers: getAuthHeaders(),
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view appointment statistics.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view appointment statistics.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching appointment statistics',
        details: error.message
      };
    }
  },

  /**
   * Get past appointments
   * @param {Object} params - Query parameters for filtering appointments
   * @returns {Promise<Array>} Array of past appointments
   */
  async getPastAppointments(params = {}) {
    try {
      const queryParams = { ...params };
      
      // If clinicId is not provided in params, try to get it from various sources
      if (!queryParams.clinicId) {
        const clinicId = getClinicId();
        if (clinicId) {
          queryParams.clinicId = clinicId;
        }
      }
      
      // Add endDate to get only past appointments
      queryParams.endDate = new Date().toISOString();
      
      // Add status filter to exclude cancelled appointments
      queryParams.status = { $nin: ['Cancelled'] };

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: getAuthHeaders(),
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching past appointments:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view past appointments.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view past appointments.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching past appointments',
        details: error.message
      };
    }
  },

  /**
   * Get upcoming appointments
   * @param {Object} params - Query parameters for filtering appointments
   * @returns {Promise<Array>} Array of upcoming appointments
   */
  async getUpcomingAppointments(params = {}) {
    try {
      const queryParams = { ...params };
      
      // If clinicId is not provided in params, try to get it from various sources
      if (!queryParams.clinicId) {
        const clinicId = getClinicId();
        if (clinicId) {
          queryParams.clinicId = clinicId;
        }
      }
      
      // Add startDate to get only upcoming appointments
      queryParams.startDate = new Date().toISOString();
      
      // Add status filter to exclude cancelled appointments
      queryParams.status = { $nin: ['Cancelled'] };

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: getAuthHeaders(),
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view upcoming appointments.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view upcoming appointments.'
          };
        }
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching upcoming appointments',
        details: error.message
      };
    }
  },

  /**
   * Delete an appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Result of deletion
   */
  async deleteAppointment(id) {
    try {
      if (!id) {
        throw new Error('Appointment ID is required');
      }
      const response = await axios.delete(`${API_URL}/appointments/${id}`, {
        headers: getAuthHeaders()
      });
      invalidateCache();
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to delete appointment');
        return {
          error: true,
          status: error.response.status,
          message: error.response.data?.message || 'Failed to delete appointment',
          details: error.response.data?.details || error.message
        };
      }
      toast.error('Failed to delete appointment: ' + error.message);
      return {
        error: true,
        status: 500,
        message: 'Failed to delete appointment',
        details: error.message
      };
    }
  },

  /**
   * Check for appointment conflicts
   * @param {Object} params - { doctorId, startTime, endTime, clinicId }
   * @returns {Promise<Array>} Array of conflicting appointments (if any)
   */
  async checkConflicts(params) {
    try {
      const response = await axios.get(`${API_URL}/appointments/check-conflicts`, {
        headers: getAuthHeaders(),
        params
      });
      return response.data; // Should be an array of conflicts
    } catch (error) {
      console.error('Error checking appointment conflicts:', error);
      throw error;
    }
  }
};

export default appointmentService;