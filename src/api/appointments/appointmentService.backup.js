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
  getAppointments: async (params = {}) => {
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
            details: 'You do not have permission to view these appointments.'
          };
        } else if (status === 404) {
          // Cache empty array for not found
          appointmentsCache = {
            data: [],
            timestamp: Date.now(),
            clinicId: queryParams?.clinicId,
            params: queryParams
          };
          return []; // Return empty array if no appointments found
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view appointments.'
          };
        } else {
          return {
            error: true,
            status: status,
            message: error.response.data?.message || 'Error fetching appointments',
            details: error.response.data?.details || error.message
          };
        }
      }
      
      // For network errors or other issues
      return {
        error: true,
        status: 0,
        message: 'Network error',
        details: error.message || 'Could not connect to the server. Please check your internet connection.'
      };
    }
  },

  // Fetch a single appointment by ID
  async getAppointmentById(id) {
    try {
      // Validate ID format to avoid unnecessary API calls
      if (!id || id === 'new' || id === 'add') {
        console.warn(`Invalid appointment ID: ${id}`);
        return {
          error: true,
          status: 400,
          message: 'Invalid appointment ID',
          details: `The provided ID (${id}) is not valid for fetching an appointment.`
        };
      }
      
      // Get clinic ID for permission check
      let clinicId = null;
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          clinicId = user.clinicId;
          if (typeof clinicId === 'object') {
            clinicId = clinicId._id || clinicId.id;
          }
        }
      } catch (e) {
        console.warn('Error getting clinic ID from user data:', e);
      }
      
      const response = await client.get(`/appointments/${id}`);
      const appointment = response.data;
      
      // Transform dates to Date objects
      return {
        ...appointment,
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        createdAt: new Date(appointment.createdAt),
        updatedAt: new Date(appointment.updatedAt)
      };
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      
      // Handle different error scenarios with structured error responses
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view this appointment.'
          };
        } else if (status === 404) {
          return {
            error: true,
            status: 404,
            message: 'Appointment not found',
            details: `The appointment with ID ${id} could not be found.`
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to view this appointment.'
          };
        } else {
          return {
            error: true,
            status: status,
            message: error.response.data?.message || 'Error fetching appointment',
            details: error.response.data?.details || error.message
          };
        }
      }
      
      // For network errors or other non-response errors
      return {
        error: true,
        status: 500,
        message: 'Error fetching appointment',
        details: error.message
      };
    }
  },

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      // Deep copy to avoid modifying the original object
      appointmentData = JSON.parse(JSON.stringify(appointmentData));
      
      // Handle clinic ID
      if (!appointmentData.clinicId) {
        try {
          // Try to get clinic ID from various sources
          const clinicData = localStorage.getItem('clinicData');
          if (clinicData) {
            const parsed = JSON.parse(clinicData);
            if (parsed && parsed._id) {
              appointmentData.clinicId = parsed._id;
              console.log('Using clinic ID from clinicData:', appointmentData.clinicId);
            }
          } else {
            const userData = localStorage.getItem('userData');
            if (userData) {
              const parsed = JSON.parse(userData);
              if (parsed && parsed.clinicId) {
                appointmentData.clinicId = typeof parsed.clinicId === 'object' ? 
                  parsed.clinicId._id || parsed.clinicId.id : parsed.clinicId;
                console.log('Using clinic ID from userData:', appointmentData.clinicId);
              }
            }
          }
          
          if (!appointmentData.clinicId) {
            return {
              error: true,
              status: 403,
              message: 'Permission denied',
              details: 'Missing clinic ID. You may not have permission to create appointments.'
            };
          }
        } catch (e) {
          console.error('Error getting clinic ID:', e);
          return {
            error: true,
            status: 500,
            message: 'Error creating appointment',
            details: 'Failed to determine clinic ID. Please try again.'
          };
        }
      } else if (typeof appointmentData.clinicId === 'object' && appointmentData.clinicId !== null) {
        // Extract ID from object
        if (appointmentData.clinicId._id) {
          appointmentData.clinicId = appointmentData.clinicId._id;
          console.log('Extracted clinic ID from object:', appointmentData.clinicId);
        } else if (appointmentData.clinicId.id) {
          appointmentData.clinicId = appointmentData.clinicId.id;
          console.log('Extracted clinic ID from object.id:', appointmentData.clinicId);
        }
      }

      // Handle patient ID and patient information
      if (!appointmentData.patientId) {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user._id && user.role === 'Patient') {
            appointmentData.patientId = user._id;
            // Add patient name and phone if available
            appointmentData.patientName = user.name || user.firstName + ' ' + user.lastName;
            appointmentData.patientPhone = user.phone;
            console.log('Using patient info from user context:', user.name || (user.firstName + ' ' + user.lastName));
          }
        } catch (e) {
          console.error('Error getting patient ID:', e);
        }
      } else if (typeof appointmentData.patientId === 'object' && appointmentData.patientId !== null) {
        // Save patient name and phone before extracting ID
        if (appointmentData.patientId.name) {
          appointmentData.patientName = appointmentData.patientId.name;
        }
        if (appointmentData.patientId.phone) {
          appointmentData.patientPhone = appointmentData.patientId.phone;
        }
        
        // Extract ID from object
        if (appointmentData.patientId._id) {
          appointmentData.patientId = appointmentData.patientId._id;
          console.log('Extracted patient ID from object:', appointmentData.patientId);
        } else if (appointmentData.patientId.value) {
          appointmentData.patientId = appointmentData.patientId.value;
          console.log('Extracted patient ID from object.value:', appointmentData.patientId);
        }
      }
      
      // Handle doctor ID and doctor information
      if (typeof appointmentData.doctorId === 'object' && appointmentData.doctorId !== null) {
        // Save doctor name and specialization before extracting ID
        if (appointmentData.doctorId.name) {
          appointmentData.doctorName = appointmentData.doctorId.name;
        }
        if (appointmentData.doctorId.specialization) {
          appointmentData.specialization = appointmentData.doctorId.specialization;
        }
        
        // Extract ID from object
        if (appointmentData.doctorId._id) {
          appointmentData.doctorId = appointmentData.doctorId._id;
          console.log('Extracted doctor ID from object:', appointmentData.doctorId);
        } else if (appointmentData.doctorId.value) {
          appointmentData.doctorId = appointmentData.doctorId.value;
          console.log('Extracted doctor ID from object.value:', appointmentData.doctorId);
        }
      }
      
      // Validate date formats
      let startTime, endTime;
      try {
        startTime = new Date(appointmentData.startTime);
        endTime = new Date(appointmentData.endTime);
        const now = new Date();
        
        if (isNaN(startTime.getTime())) {
          return {
            error: true,
            status: 400,
            message: 'Invalid start time format',
            details: 'The start time provided is not a valid date format.'
          };
        }
        if (isNaN(endTime.getTime())) {
          return {
            error: true,
            status: 400,
            message: 'Invalid end time format',
            details: 'The end time provided is not a valid date format.'
          };
        }
        if (startTime < now) {
          console.warn('Appointment time is in the past, but proceeding anyway');
        }
        if (endTime <= startTime) {
          return {
            error: true,
            status: 400,
            message: 'Invalid appointment times',
            details: 'End time must be after start time.'
          };
        }

        // Ensure dates are in ISO format
        appointmentData.startTime = startTime.toISOString(); 
        appointmentData.endTime = endTime.toISOString();
      } catch (e) {
        console.error('Error validating appointment times:', e);
        return {
          error: true,
          status: 400,
          message: 'Invalid appointment times',
          details: e.message
        };
      }
      
      // Ensure all required fields are present
      const requiredFields = ['patientId', 'doctorId', 'startTime', 'endTime', 'serviceType', 'clinicId'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      if (missingFields.length > 0) {
        return {
          error: true,
          status: 400,
          message: 'Missing required fields',
          details: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      // IMPORTANT: Add reason field if missing (it's required by the backend)
      if (!appointmentData.reason) {
        appointmentData.reason = appointmentData.notes || appointmentData.serviceType || 'Medical appointment';
        console.log('Added reason field:', appointmentData.reason);
      }
      
      // Double-check that reason is set (this is critical)
      if (!appointmentData.reason) {
        console.warn('Reason field is still missing, setting default value');
        appointmentData.reason = 'Medical appointment';
      }
      
      // Explicitly add the reason field to ensure it's not lost in serialization
      appointmentData = {
        ...appointmentData,
        reason: appointmentData.reason
      };

      // Make the API call with proper authentication
      try {
        // Ensure we have a valid auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found, user may need to log in again');
          // Continue anyway, the client interceptor will handle this
        }
        
        // Make the API call
        const response = await client.post('/appointments', appointmentData);
        
        console.log('Appointment created successfully:', response.data);
        
        // Invalidate the cache to ensure fresh data on next fetch
        invalidateCache();
        
        return response.data;
      } catch (apiError) {
        console.error('API Error details:', apiError.response?.data || apiError.message);
        
        // Handle different error scenarios with structured error responses
        if (apiError.response) {
          const status = apiError.response.status;
          
          if (status === 403) {
            return {
              error: true,
              status: 403,
              message: 'Permission denied',
              details: 'You do not have permission to create appointments.'
            };
          } else if (status === 401) {
            return {
              error: true,
              status: 401,
              message: 'Authentication required',
              details: 'Please log in to create appointments.'
            };
          } else if (status === 409) {
            return {
              error: true,
              status: 409,
              message: 'Appointment conflict',
              details: apiError.response.data?.message || 'This appointment conflicts with an existing appointment.'
            };
          } else if (status === 404) {
            return {
              error: true,
              status: 404,
              message: 'Resource not found',
              details: apiError.response.data?.message || 'The requested resource was not found.'
            };
          } else {
            return {
              error: true,
              status: status,
              message: apiError.response.data?.message || 'Error creating appointment',
              details: apiError.response.data?.details || apiError.message
            };
          }
        }
        
        // For network errors or other non-response errors
        return {
          error: true,
          status: 0,
          message: 'Network error',
          details: apiError.message || 'Could not connect to the server. Please check your internet connection.'
        };
      }
    } catch (error) {
      console.error('Error in createAppointment:', error);
      return {
        error: true,
        status: 400,
        message: 'Invalid appointment times',
        details: e.message
      };
    }
    
    // Ensure all required fields are present
    const requiredFields = ['patientId', 'doctorId', 'startTime', 'endTime', 'serviceType', 'clinicId'];
    const missingFields = requiredFields.filter(field => !appointmentData[field]);
    if (missingFields.length > 0) {
      return {
        error: true,
        status: 400,
        message: 'Missing required fields',
        details: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
        details: 'The end time provided is not a valid date format.'
      };
    }
    if (startTime < now) {
      console.warn('Appointment time is in the past, but proceeding anyway');
    }
    if (endTime <= startTime) {
      return {
        error: true,
        status: 400,
        message: 'Invalid appointment times',
        details: 'End time must be after start time.'
      };
    }

    // Ensure dates are in ISO format
    appointmentData.startTime = startTime.toISOString(); 
    appointmentData.endTime = endTime.toISOString();

    // IMPORTANT: Add reason field if missing (it's required by the backend)
    if (!appointmentData.reason) {
      appointmentData.reason = appointmentData.notes || appointmentData.serviceType || 'Medical appointment';
      console.log('Added reason field:', appointmentData.reason);
    }
    
    // Double-check that reason is set (this is critical)
    if (!appointmentData.reason) {
      console.warn('Reason field is still missing, setting default value');
      appointmentData.reason = 'Medical appointment';
    }
    
    // Explicitly add the reason field to ensure it's not lost in serialization
    appointmentData = {
      ...appointmentData,
      reason: appointmentData.reason
    };

    // Make the API call with proper authentication
    try {
      // Ensure we have a valid auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, user may need to log in again');
        // Continue anyway, the client interceptor will handle this
      }
      
      // Make the API call
      const response = await client.post('/appointments', appointmentData);
      
      console.log('Appointment created successfully:', response.data);
      return response.data;
    } catch (apiError) {
      console.error('API Error details:', apiError.response?.data || apiError.message);
      
      // Handle different error scenarios with structured error responses
      if (apiError.response) {
        const status = apiError.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to create appointments.'
          };
        } else if (status === 401) {
          return {
            error: true,
            status: 401,
            message: 'Authentication required',
            details: 'Please log in to create appointments.'
          };
        } else if (status === 409) {
      const response = await client.get(`/appointments/patient/${patientId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      
      // Handle different error scenarios with structured error responses
      if (error.response) {
        const status = error.response.status;
        
        if (status === 403) {
          return {
            error: true,
            status: 403,
            message: 'Permission denied',
            details: 'You do not have permission to view these appointments.'
          };
        } else if (status === 404) {
          return [];
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
        status: 500,
        message: 'Error fetching patient appointments',
        details: error.message
      };
    }
  },

  // Get today's appointments
  async getTodayAppointments() {
    const today = new Date();
    const params = {
      startDate: today.toISOString(),
      endDate: new Date(today.setHours(23, 59, 59)).toISOString()
    };
    return this.getAppointments(params);
  },

  // Get waiting patients
  async getWaitingPatients() {
    try {
      const response = await client.get('/appointments/waiting');
      return response.data;
    } catch (error) {
      console.error('Error fetching waiting patients:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to view waiting patients.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching waiting patients',
        details: error.message
      };
    }
  },

  // Check in a patient
  async checkinPatient(appointmentId) {
    try {
      const response = await client.put(`/appointments/${appointmentId}/checkin`);
      return response.data;
    } catch (error) {
      console.error('Error checking in patient:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to check in patients.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error checking in patient',
        details: error.message
      };
    }
  },

  // Check out a patient 
  async checkoutPatient(appointmentId) {
    try {
      const response = await client.put(`/appointments/${appointmentId}/checkout`);
      return response.data;
    } catch (error) {
      console.error('Error checking out patient:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to check out patients.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error checking out patient',
        details: error.message
      };
    }
  },

  // Get recent check-ins
  async getRecentCheckins() {
    try {
      const response = await client.get('/appointments/recent-checkins');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to view recent check-ins.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching recent check-ins',
        details: error.message
      };
    }
  },

  // Get available time slots for a doctor
  async getAvailableSlots(doctorId, date) {
    try {
      const response = await client.get(`/appointments/available-slots`, {
        params: { doctorId, date }
      });
      return response.data.availableSlots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error fetching available slots',
        details: error.message
      };
    }
  },

  // Reschedule an appointment
  async rescheduleAppointment(id, { startTime, endTime, reason }) {
    try {
      const response = await client.put(`/appointments/${id}/reschedule`, {
        startTime,
        endTime,
        reason
      });
      
      const appointment = response.data.appointment;
      return {
        ...appointment,
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        createdAt: new Date(appointment.createdAt),
        updatedAt: new Date(appointment.updatedAt)
      };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to reschedule this appointment.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error rescheduling appointment',
        details: error.message
      };
    }
  },

  // Send appointment reminder
  async sendReminder(id) {
    try {
      const response = await client.post(`/appointments/${id}/reminder`);
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to send reminders for this appointment.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error sending reminder',
        details: error.message
      };
    }
  },

  // Get appointment statistics
  async getAppointmentStats(startDate, endDate) {
    try {
      const response = await client.get('/appointments/stats', {
        params: { 
          startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
          endDate: endDate instanceof Date ? endDate.toISOString() : endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to view appointment statistics.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error getting appointment statistics',
        details: error.message
      };
    }
  },

  // Get upcoming appointments
  async getUpcomingAppointments(limit = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.getAppointments({
      startDate: today.toISOString(),
      status: ['Scheduled', 'Confirmed'],
      limit
    });
  },

  // Get past appointments
  async getPastAppointments(limit = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.getAppointments({
      endDate: today.toISOString(),
      status: ['Completed', 'No Show'],
      limit
    });
  },

  // Add attachment to appointment
  async addAttachment(appointmentId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', appointmentId);
      
      const response = await client.post(`/appointments/${appointmentId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding attachment:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to add attachments to this appointment.'
        };
      } else if (error.response?.status === 404) {
        return {
          error: true,
          status: 404,
          message: 'Appointment not found',
          details: `The appointment with ID ${appointmentId} could not be found.`
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error adding attachment',
        details: error.message
      };
    }
  },

  // Remove attachment from appointment
  async removeAttachment(appointmentId, attachmentId) {
    try {
      const response = await client.delete(`/appointments/${appointmentId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing attachment:', error);
      
      if (error.response?.status === 403) {
        return {
          error: true,
          status: 403,
          message: 'Permission denied',
          details: 'You do not have permission to remove attachments from this appointment.'
        };
      } else if (error.response?.status === 404) {
        return {
          error: true,
          status: 404,
          message: 'Resource not found',
          details: 'The appointment or attachment could not be found.'
        };
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: 'Error removing attachment',
        details: error.message
      };
    }
  }
};

export default appointmentService;
