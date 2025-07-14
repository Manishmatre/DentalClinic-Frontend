import { format } from 'date-fns';
import * as dateFnsTz from 'date-fns-tz';

/**
 * Convert UTC time to local time zone
 * @param {Date|string} utcDate - UTC date to convert
 * @param {string} timeZone - Target time zone (e.g., 'America/New_York')
 * @returns {Date} Date in local time zone
 */
export const convertToLocalTime = (utcDate, timeZone) => {
  return dateFnsTz.utcToZonedTime(new Date(utcDate), timeZone);
};

/**
 * Convert local time to UTC
 * @param {Date|string} localDate - Local date to convert
 * @param {string} timeZone - Source time zone (e.g., 'America/New_York')
 * @returns {Date} Date in UTC
 */
export const convertToUTC = (localDate, timeZone) => {
  return dateFnsTz.zonedTimeToUtc(new Date(localDate), timeZone);
};

/**
 * Format date in specific time zone
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (e.g., 'yyyy-MM-dd HH:mm:ss')
 * @param {string} timeZone - Target time zone
 * @returns {string} Formatted date string
 */
export const formatInTimeZone = (date, formatStr, timeZone) => {
  return format(dateFnsTz.utcToZonedTime(new Date(date), timeZone), formatStr, { timeZone });
};

/**
 * Get user's local time zone
 * @returns {string} User's time zone (e.g., 'America/New_York')
 */
export const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get clinic's time zone
 * @param {Object} clinic - Clinic object
 * @returns {string} Clinic's time zone or user's time zone as fallback
 */
export const getClinicTimeZone = (clinic) => {
  return clinic?.timeZone || getUserTimeZone();
};

/**
 * Format appointment time range
 * @param {Date|string} startTime - Appointment start time
 * @param {Date|string} endTime - Appointment end time
 * @param {string} timeZone - Target time zone
 * @returns {string} Formatted time range
 */
export const formatAppointmentTimeRange = (startTime, endTime, timeZone) => {
  const formatStr = 'MMM d, yyyy h:mm a';
  const start = formatInTimeZone(startTime, formatStr, timeZone);
  const end = formatInTimeZone(endTime, 'h:mm a', timeZone);
  return `${start} - ${end}`;
};

/**
 * Check if a time slot is in business hours
 * @param {Date|string} time - Time to check
 * @param {Object} businessHours - Business hours object
 * @param {string} timeZone - Time zone
 * @returns {boolean} Whether the time is in business hours
 */
export const isInBusinessHours = (time, businessHours, timeZone) => {
  const localTime = convertToLocalTime(time, timeZone);
  const dayOfWeek = localTime.getDay();
  const hour = localTime.getHours();
  const minutes = localTime.getMinutes();
  
  const dayHours = businessHours[dayOfWeek];
  if (!dayHours || !dayHours.isOpen) return false;
  
  const openTime = dayHours.open.split(':').map(Number);
  const closeTime = dayHours.close.split(':').map(Number);
  
  const timeInMinutes = hour * 60 + minutes;
  const openInMinutes = openTime[0] * 60 + openTime[1];
  const closeInMinutes = closeTime[0] * 60 + closeTime[1];
  
  return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
};

/**
 * Get available time slots considering time zones
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Object} businessHours - Business hours
 * @param {string} timeZone - Time zone
 * @param {number} duration - Duration in minutes
 * @returns {Array} Array of available time slots
 */
export const getAvailableTimeSlots = (startDate, endDate, businessHours, timeZone, duration = 30) => {
  const slots = [];
  const start = convertToLocalTime(startDate, timeZone);
  const end = convertToLocalTime(endDate, timeZone);
  
  let current = new Date(start);
  while (current < end) {
    if (isInBusinessHours(current, businessHours, timeZone)) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd <= end) {
        slots.push({
          start: new Date(current),
          end: slotEnd
        });
      }
    }
    current = new Date(current.getTime() + duration * 60000);
  }
  
  return slots;
}; 