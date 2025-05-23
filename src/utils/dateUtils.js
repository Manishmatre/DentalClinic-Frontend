/**
 * Format a date string to a human-readable date format (e.g., "Monday, January 1, 2023")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date string to a time format (e.g., "9:00 AM")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date string to a date and time format (e.g., "Jan 1, 2023, 9:00 AM")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get the difference between two dates in minutes
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {number} Difference in minutes
 */
export const getMinutesDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return Math.round((end - start) / (1000 * 60));
};

/**
 * Format a duration in minutes to a human-readable format (e.g., "1 hour 30 minutes")
 * @param {number} minutes - The duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  if (remainingMinutes > 0) {
    if (result) result += ' ';
    result += `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  
  return result;
};

/**
 * Check if a date is in the past
 * @param {string|Date} dateString - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
};

/**
 * Get the day of the week for a date (0-6, where 0 is Sunday)
 * @param {string|Date} dateString - The date to check
 * @returns {number} Day of the week (0-6)
 */
export const getDayOfWeek = (dateString) => {
  if (!dateString) return 0;
  
  const date = new Date(dateString);
  return date.getDay();
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {string|Date} dateString - The date to check
 * @returns {boolean} True if the date is a weekend
 */
export const isWeekend = (dateString) => {
  const day = getDayOfWeek(dateString);
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};