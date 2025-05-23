/**
 * Utility functions for GST calculations in the Indian healthcare context
 */

/**
 * Calculate GST components based on amount, rate, and supply type
 * @param {Number} amount - The taxable amount
 * @param {Number} gstRate - The GST rate in percentage (e.g., 5, 12, 18)
 * @param {Boolean} isIntraState - Whether the transaction is intra-state (true) or inter-state (false)
 * @returns {Object} GST breakdown with CGST, SGST, IGST and total GST
 */
export const calculateGst = (amount, gstRate = 18, isIntraState = true) => {
  // Validate inputs
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Amount must be a non-negative number');
  }
  
  if (typeof gstRate !== 'number' || gstRate < 0) {
    throw new Error('GST rate must be a non-negative number');
  }
  
  // Calculate total GST amount
  const totalGstAmount = (amount * gstRate) / 100;
  
  // For intra-state transactions, split into CGST and SGST
  // For inter-state transactions, apply IGST
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (isIntraState) {
    cgst = totalGstAmount / 2;
    sgst = totalGstAmount / 2;
  } else {
    igst = totalGstAmount;
  }
  
  return {
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    totalGst: parseFloat(totalGstAmount.toFixed(2))
  };
};

/**
 * Calculate invoice totals with GST
 * @param {Array} services - Array of service items with cost, quantity, and gstRate
 * @param {Boolean} isIntraState - Whether the transaction is intra-state
 * @returns {Object} Calculated totals including GST breakdown
 */
export const calculateInvoiceTotals = (services, isIntraState = true) => {
  if (!Array.isArray(services) || services.length === 0) {
    return {
      subtotal: 0,
      totalTaxableValue: 0,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 0,
      totalGst: 0,
      total: 0
    };
  }
  
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  
  // Process each service
  services.forEach(service => {
    const { cost, quantity, gstRate = 18 } = service;
    const serviceAmount = cost * quantity;
    subtotal += serviceAmount;
    
    // Calculate GST for this service
    const { cgst, sgst, igst } = calculateGst(serviceAmount, gstRate, isIntraState);
    
    // Update service with GST details
    service.cgst = cgst;
    service.sgst = sgst;
    service.igst = igst;
    
    // Add to totals
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;
  });
  
  const totalGst = totalCgst + totalSgst + totalIgst;
  const total = subtotal + totalGst;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalTaxableValue: parseFloat(subtotal.toFixed(2)),
    totalCgst: parseFloat(totalCgst.toFixed(2)),
    totalSgst: parseFloat(totalSgst.toFixed(2)),
    totalIgst: parseFloat(totalIgst.toFixed(2)),
    totalGst: parseFloat(totalGst.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

/**
 * Format amount in Indian Rupee format
 * @param {Number} amount - The amount to format
 * @returns {String} Formatted amount with ₹ symbol
 */
export const formatIndianRupee = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Get common GST rates used in healthcare
 * @returns {Array} Array of common GST rates
 */
export const getCommonGstRates = () => {
  return [
    { value: 0, label: 'GST Exempt (0%)' },
    { value: 5, label: 'GST 5%' },
    { value: 12, label: 'GST 12%' },
    { value: 18, label: 'GST 18%' },
    { value: 28, label: 'GST 28%' }
  ];
};

/**
 * Get HSN/SAC codes commonly used in healthcare
 * @returns {Array} Array of common HSN/SAC codes with descriptions
 */
export const getCommonHealthcareHsnSacCodes = () => {
  return [
    { code: '9983', description: 'Medical, dental and other health services' },
    { code: '9993', description: 'Healthcare services by clinical establishments' },
    { code: '9985', description: 'Support services (laboratory services)' },
    { code: '3006', description: 'Pharmaceutical goods' },
    { code: '9018', description: 'Medical instruments and appliances' }
  ];
};

export default {
  calculateGst,
  calculateInvoiceTotals,
  formatIndianRupee,
  getCommonGstRates,
  getCommonHealthcareHsnSacCodes
};
