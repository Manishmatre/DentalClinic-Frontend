import { getAvailableTimeSlots } from '../utils/timeZoneUtils';
import appointmentService from '../api/appointments/appointmentService';

class SmartSchedulingService {
  /**
   * Get smart appointment suggestions
   * @param {Object} params - Parameters for suggestions
   * @returns {Promise<Array>} Array of suggested time slots
   */
  async getSuggestions(params) {
    const {
      doctorId,
      patientId,
      preferredDate,
      preferredTime,
      duration = 30,
      timeZone,
      businessHours
    } = params;

    try {
      // Get doctor's existing appointments
      const existingAppointments = await appointmentService.getAppointmentsByDoctor(doctorId, {
        startDate: new Date(preferredDate).toISOString(),
        endDate: new Date(preferredDate).setDate(new Date(preferredDate).getDate() + 7)
      });

      // Get patient's appointment history
      const patientHistory = await appointmentService.getAppointmentsByPatient(patientId);

      // Analyze patient's preferred times
      const preferredTimes = this.analyzePatientPreferences(patientHistory);

      // Get available slots
      const availableSlots = getAvailableTimeSlots(
        preferredDate,
        new Date(preferredDate).setDate(new Date(preferredDate).getDate() + 7),
        businessHours,
        timeZone,
        duration
      );

      // Score and rank the slots
      const scoredSlots = this.scoreTimeSlots(availableSlots, {
        existingAppointments,
        preferredTimes,
        preferredTime,
        timeZone
      });

      // Return top 5 suggestions
      return scoredSlots.slice(0, 5);
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      throw error;
    }
  }

  /**
   * Analyze patient's appointment preferences
   * @param {Array} appointmentHistory - Patient's appointment history
   * @returns {Object} Preferred times by day of week
   */
  analyzePatientPreferences(appointmentHistory) {
    const preferences = {
      byDay: {},
      byHour: {}
    };

    appointmentHistory.forEach(appointment => {
      const date = new Date(appointment.startTime);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      // Count preferences by day
      preferences.byDay[dayOfWeek] = (preferences.byDay[dayOfWeek] || 0) + 1;

      // Count preferences by hour
      preferences.byHour[hour] = (preferences.byHour[hour] || 0) + 1;
    });

    return preferences;
  }

  /**
   * Score time slots based on various factors
   * @param {Array} slots - Available time slots
   * @param {Object} factors - Scoring factors
   * @returns {Array} Scored and ranked slots
   */
  scoreTimeSlots(slots, factors) {
    const { existingAppointments, preferredTimes, preferredTime, timeZone } = factors;

    return slots
      .map(slot => {
        let score = 0;

        // Score based on preferred time
        if (preferredTime) {
          const slotHour = new Date(slot.start).getHours();
          const preferredHour = new Date(preferredTime).getHours();
          const hourDiff = Math.abs(slotHour - preferredHour);
          score += (24 - hourDiff) * 2; // Higher score for closer times
        }

        // Score based on patient's historical preferences
        const slotDay = new Date(slot.start).getDay();
        const slotHour = new Date(slot.start).getHours();
        
        if (preferredTimes.byDay[slotDay]) {
          score += preferredTimes.byDay[slotDay] * 1.5;
        }
        
        if (preferredTimes.byHour[slotHour]) {
          score += preferredTimes.byHour[slotHour] * 2;
        }

        // Penalize slots that are too close to existing appointments
        const hasNearbyAppointment = existingAppointments.some(apt => {
          const aptTime = new Date(apt.startTime);
          const slotTime = new Date(slot.start);
          const diffHours = Math.abs(aptTime - slotTime) / (1000 * 60 * 60);
          return diffHours < 1; // Penalize if within 1 hour
        });

        if (hasNearbyAppointment) {
          score -= 5;
        }

        // Bonus for morning slots (before noon)
        if (new Date(slot.start).getHours() < 12) {
          score += 3;
        }

        return {
          ...slot,
          score
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get optimal appointment duration
   * @param {string} serviceType - Type of service
   * @param {Object} patientHistory - Patient's appointment history
   * @returns {number} Suggested duration in minutes
   */
  getOptimalDuration(serviceType, patientHistory) {
    // Default durations for common services
    const defaultDurations = {
      'checkup': 30,
      'cleaning': 60,
      'filling': 45,
      'extraction': 60,
      'root-canal': 90
    };

    // Get average duration from patient's history for this service
    const serviceHistory = patientHistory.filter(apt => apt.serviceType === serviceType);
    if (serviceHistory.length > 0) {
      const avgDuration = serviceHistory.reduce((sum, apt) => {
        const duration = (new Date(apt.endTime) - new Date(apt.startTime)) / (1000 * 60);
        return sum + duration;
      }, 0) / serviceHistory.length;

      // Round to nearest 15 minutes
      return Math.round(avgDuration / 15) * 15;
    }

    // Fall back to default duration
    return defaultDurations[serviceType] || 30;
  }
}

export default new SmartSchedulingService(); 