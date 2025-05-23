/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a date string into a readable format
 * @param {string} dateString - The date string to format
 * @param {string} format - The format to use (date, time, datetime)
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, format = 'date') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }
  
  switch (format) {
    case 'time':
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'datetime':
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    case 'date':
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Format a number as currency (Indian Rupees)
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number with commas for thousands
 * @param {number} number - The number to format
 * @returns {string} - The formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - The formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};
