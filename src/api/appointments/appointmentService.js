import client from '../client';

const appointmentService = {
  // Fetch appointments with optional filters
  getAppointments: async (params = {}) => {
    try {
      // Create a copy of params to avoid modifying the original object
      const queryParams = { ...params };
      
      // Get user and clinic info from localStorage if available
      const userInfo = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      const clinicInfo = localStorage.getItem('clinic') ? JSON.parse(localStorage.getItem('clinic')) : null;
      
      // Handle clinicId - ensure it's a string ID, not an object
      if (!queryParams.clinicId) {
        // Try to get clinic ID from user context or localStorage
        if (clinicInfo && clinicInfo._id) {
          queryParams.clinicId = clinicInfo._id;
          console.log('Using clinicId from localStorage:', queryParams.clinicId);
        } else if (userInfo && userInfo.clinicId) {
          queryParams.clinicId = typeof userInfo.clinicId === 'object' ? 
            userInfo.clinicId._id || userInfo.clinicId.id : userInfo.clinicId;
          console.log('Using clinicId from user info:', queryParams.clinicId);
        }
      } else if (typeof queryParams.clinicId === 'object') {
        // Extract ID from object
        queryParams.clinicId = queryParams.clinicId._id || queryParams.clinicId.id;
        console.log('Extracted clinicId from object:', queryParams.clinicId);
      }

      // Format date parameters if present
      if (queryParams.startDate) {
        queryParams.startDate = new Date(queryParams.startDate).toISOString();
      }
      if (queryParams.endDate) {
        queryParams.endDate = new Date(queryParams.endDate).toISOString();
      }

      console.log('Fetching appointments with params:', queryParams);
      const response = await client.get('/appointments', { params: queryParams });
      
      // Transform dates to Date objects
      const appointments = response.data.map(apt => ({
        ...apt,
        startTime: new Date(apt.startTime),
        endTime: new Date(apt.endTime),
        createdAt: new Date(apt.createdAt),
        updatedAt: new Date(apt.updatedAt)
      }));

      console.log('Appointments fetched successfully:', appointments);
      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 404) {
        return []; // Return empty array if no appointments found
      }
      throw error;
    }
  },

  // Fetch a single appointment by ID
  async getAppointmentById(id) {
    try {
      const response = await client.get(`/appointments/${id}`);
      const appointment = response.data;
      return {
        ...appointment,
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        createdAt: appointment.createdAt ? new Date(appointment.createdAt) : null,
        updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt) : null
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      // Handle clinic ID - ensure it's a string, not an object
      if (!appointmentData.clinicId) {
        try {
          // Try to get clinic ID from localStorage
          const defaultClinicId = localStorage.getItem('defaultClinicId');
          if (defaultClinicId) {
            appointmentData.clinicId = defaultClinicId;
            console.log('Using defaultClinicId from localStorage:', defaultClinicId);
          } else {
            // Try to get from user object
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.clinicId) {
              appointmentData.clinicId = user.clinicId;
              console.log('Using clinic ID from user context:', user.clinicId);
            } else {
              throw new Error('No clinic ID available');
            }
          }
        } catch (e) {
          console.error('Error getting clinic ID:', e);
          throw new Error('Missing clinic ID. Please log in again.');
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
      
      // Handle patient ID - ensure it's a string, not an object
      if (!appointmentData.patientId) {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user._id && user.role === 'Patient') {
            appointmentData.patientId = user._id;
            console.log('Using patient ID from user context:', user._id);
          }
        } catch (e) {
          console.error('Error getting patient ID:', e);
        }
      } else if (typeof appointmentData.patientId === 'object' && appointmentData.patientId !== null) {
        // Extract ID from object
        if (appointmentData.patientId._id) {
          appointmentData.patientId = appointmentData.patientId._id;
          console.log('Extracted patient ID from object:', appointmentData.patientId);
        } else if (appointmentData.patientId.value) {
          appointmentData.patientId = appointmentData.patientId.value;
          console.log('Extracted patient ID from object.value:', appointmentData.patientId);
        }
      }
      
      // Handle doctor ID - ensure it's a string, not an object
      if (typeof appointmentData.doctorId === 'object' && appointmentData.doctorId !== null) {
        // Extract ID from object
        if (appointmentData.doctorId._id) {
          appointmentData.doctorId = appointmentData.doctorId._id;
          console.log('Extracted doctor ID from object:', appointmentData.doctorId);
        } else if (appointmentData.doctorId.value) {
          appointmentData.doctorId = appointmentData.doctorId.value;
          console.log('Extracted doctor ID from object.value:', appointmentData.doctorId);
        }
      }
      
      // Ensure all required fields are present
      const requiredFields = ['patientId', 'doctorId', 'startTime', 'endTime', 'serviceType', 'clinicId'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
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
      
      console.log('Final appointment data with reason field:', appointmentData);
      
      // Log the final data being sent to the API
      console.log('Final appointment data being sent to API:', {
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        clinicId: appointmentData.clinicId,
        serviceType: appointmentData.serviceType,
        reason: appointmentData.reason
      });

      // Validate dates
      const startTime = new Date(appointmentData.startTime);
      const endTime = new Date(appointmentData.endTime);
      const now = new Date();

      if (isNaN(startTime.getTime())) {
        throw new Error('Invalid start time format');
      }
      if (isNaN(endTime.getTime())) {
        throw new Error('Invalid end time format');
      }
      if (startTime < now) {
        console.warn('Appointment time is in the past, but proceeding anyway');
      }
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      // Ensure dates are in ISO format
      appointmentData.startTime = startTime.toISOString(); 
      appointmentData.endTime = endTime.toISOString();

      // Make the API call with proper authentication
      try {
        // Ensure we have a valid auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found, user may need to log in again');
          // Continue anyway, the client interceptor will handle this
        }
        
        // Add some debugging to see what's happening
        console.log('API base URL:', client.defaults.baseURL);
        console.log('Sending API request to: appointments');
        console.log('Auth token present:', !!token);
        
        // Make the API call - try both with and without leading slash
        let response;
        try {
          // First try without leading slash (should be correct based on baseURL)
          response = await client.post('appointments', appointmentData);
        } catch (firstError) {
          console.warn('First attempt failed, trying with leading slash:', firstError.message);
          // If that fails, try with leading slash
          response = await client.post('/appointments', appointmentData);
        }
        
        console.log('Appointment created successfully:', response.data);
        return response.data;
      } catch (apiError) {
        console.error('API Error details:', apiError.response?.data || apiError.message);
        
        // Handle different error scenarios
        if (apiError.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (apiError.response?.status === 404) {
          throw new Error('Appointment endpoint not found. The server may not be running or the API path is incorrect.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        } else {
          throw new Error(`Failed to create appointment: ${apiError.message}`);
        }
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Check for specific error types
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Patient, doctor, or clinic not found');
        } else if (error.response.status === 409) {
          throw new Error('This time slot is already booked');
        } else if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw error;
    }
  },

  // Update an existing appointment
  async updateAppointment(id, updateData) {
    try {
      console.log('Updating appointment with ID:', id);
      console.log('Update data:', updateData);
      
      // Format the appointment data
      let formattedData = { ...updateData };
      
      // Format dates properly if they aren't already
      if (formattedData.startTime) {
        formattedData.startTime = formattedData.startTime instanceof Date ? 
          formattedData.startTime.toISOString() : 
          formattedData.startTime;
      }
      
      if (formattedData.endTime) {
        formattedData.endTime = formattedData.endTime instanceof Date ? 
          formattedData.endTime.toISOString() : 
          formattedData.endTime;
      }
      
      // The client instance already has the interceptor to add the auth token
      const response = await client.put(`/appointments/${id}`, formattedData);
      
      return response.data;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to update appointment');
      }
      throw error;
    }
  },

  // Delete an appointment
  async deleteAppointment(id) {
    try {
      console.log('Deleting appointment with ID:', id);
      
      // The client instance already has the interceptor to add the auth token
      const response = await client.delete(`/appointments/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to delete appointment');
      }
      throw error;
    }
  },

  // Fetch appointments for a specific doctor
  async getAppointmentsByDoctor(doctorId, params = {}) {
    const response = await client.get(`/appointments/doctor/${doctorId}`, { params });
    return response.data;
  },

  // Fetch appointments for a specific patient
  async getAppointmentsByPatient(patientId, params = {}) {
    const response = await client.get(`/appointments/patient/${patientId}`, { params });
    return response.data;
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
    const response = await client.get('/appointments/waiting');
    return response.data;
  },

  // Check in a patient
  async checkinPatient(appointmentId) {
    const response = await client.put(`/appointments/${appointmentId}/checkin`);
    return response.data;
  },

  // Check out a patient 
  async checkoutPatient(appointmentId) {
    const response = await client.put(`/appointments/${appointmentId}/checkout`);
    return response.data;
  },

  // Get recent check-ins
  async getRecentCheckins() {
    const response = await client.get('/appointments/recent-checkins');
    return response.data;
  },

  // Get available time slots for a doctor
  async getAvailableSlots(doctorId, date) {
    const response = await client.get(`/appointments/available-slots`, {
      params: { doctorId, date }
    });
    return response.data.availableSlots;
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
      throw error;
    }
  },

  // Send appointment reminder
  async sendReminder(id) {
    try {
      const response = await client.post(`/appointments/${id}/reminder`);
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
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
      throw error;
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
      throw error;
    }
  },

  // Remove attachment from appointment
  async removeAttachment(appointmentId, attachmentId) {
    try {
      const response = await client.delete(`/appointments/${appointmentId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }
  }
};

export default appointmentService;
