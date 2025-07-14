import client from '../client';

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
  const sources = [
    // Try to get from clinicData in localStorage
    () => {
      try {
        const clinicData = localStorage.getItem('clinicData');
        if (clinicData) {
          const parsed = JSON.parse(clinicData);
          if (parsed && parsed._id) {
            return parsed._id;
          }
        }
      } catch (e) {
        console.warn('Error parsing clinicData from localStorage:', e);
      }
      return null;
    },
    // Try to get from userData in localStorage
    () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed && parsed.clinicId) {
            // Handle both string and object clinic IDs
            if (typeof parsed.clinicId === 'object') {
              return parsed.clinicId._id || parsed.clinicId.id;
            }
            return parsed.clinicId;
          }
        }
      } catch (e) {
        console.warn('Error parsing userData from localStorage:', e);
      }
      return null;
    },
    // Try to get from defaultClinicId in localStorage
    () => {
      try {
        return localStorage.getItem('defaultClinicId');
      } catch (e) {
        console.warn('Error getting defaultClinicId from localStorage:', e);
      }
      return null;
    }
  ];

  // Try each source in order until we find a valid clinic ID
  for (const source of sources) {
    const id = source();
    if (id) {
      return id;
    }
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
  return {
    ...appointment,
    startTime: appointment.startTime ? new Date(appointment.startTime) : null,
    endTime: appointment.endTime ? new Date(appointment.endTime) : null,
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
      const response = await client.get('/appointments', { params: queryParams });
      
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
      
      const response = await client.get(`/appointments/${id}`);
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
  }
};
