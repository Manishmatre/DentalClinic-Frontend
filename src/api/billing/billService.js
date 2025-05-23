import client from '../axios';
import { toast } from 'react-toastify';

// Helper function to handle API calls and suppress console errors
const apiCall = async (apiFunction, errorMessage = 'API call failed') => {
  try {
    return await apiFunction();
  } catch (error) {
    // Only show minimal error info in development mode
    if (import.meta.env.DEV) {
      console.warn(`${errorMessage}: ${error.message || 'Unknown error'}`);
    }
    
    // Return empty data instead of throwing error
    return { data: [], success: false, error: error.message };
  }
};

const billService = {
  // Get all bills with optional filtering
  async getBills(params = {}) {
    return apiCall(
      async () => {
        const response = await client.get('/bills', { params });
        return response.data;
      },
      'Failed to fetch bills'
    );
  },

  // Get bills for a specific patient
  async getPatientBills(patientId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/bills/patient/${patientId}`, { params });
        return response.data;
      },
      `Failed to fetch bills for patient ${patientId}`
    );
  },

  // Get a single bill by ID
  async getBillById(billId) {
    return apiCall(
      async () => {
        const response = await client.get(`/bills/${billId}`);
        return response.data;
      },
      `Failed to fetch bill ${billId}`
    );
  },

  // Create a new bill
  async createBill(billData) {
    try {
      const response = await client.post('/bills', billData);
      toast.success('Bill created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bill');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to create bill:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Update an existing bill
  async updateBill(billId, billData) {
    try {
      const response = await client.put(`/bills/${billId}`, billData);
      toast.success('Bill updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bill');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update bill:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Delete a bill
  async deleteBill(billId) {
    try {
      const response = await client.delete(`/bills/${billId}`);
      toast.success('Bill deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bill');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to delete bill:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Add a payment to a bill
  async addPayment(billId, paymentData) {
    try {
      const response = await client.post(`/bills/${billId}/payments`, paymentData);
      toast.success('Payment added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add payment');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to add payment:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Update insurance claim status
  async updateClaimStatus(billId, claimData) {
    try {
      const response = await client.put(`/bills/${billId}/claim`, claimData);
      toast.success('Insurance claim status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update claim status');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update claim status:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Generate PDF bill
  async generateBillPdf(billId) {
    try {
      // Using window.open for direct download
      window.open(`${client.defaults.baseURL}/bills/${billId}/pdf`, '_blank');
      return { success: true };
    } catch (error) {
      toast.error('Failed to generate PDF bill');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to generate PDF bill:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Get billing statistics
  async getBillingStats(startDate, endDate) {
    try {
      const params = { startDate, endDate };
      const response = await client.get('/billing/stats', { params });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch billing statistics:', error.message || 'Unknown error');
      return { 
        totalBills: 0,
        summary: {
          totalBilled: 0,
          totalPaid: 0,
          totalPending: 0,
          totalInsuranceCoverage: 0,
          averageBillAmount: 0
        },
        statusDistribution: [],
        monthlyTrend: [],
        paymentMethodDistribution: []
      };
    }
  },

  // Helper functions for bill calculations
  calculateItemTotal(item) {
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const tax = item.tax || 0;
    return (quantity * unitPrice) + tax - discount;
  },

  calculateSubtotal(items) {
    return items.reduce((total, item) => total + this.calculateItemTotal(item), 0);
  },

  calculateTaxTotal(items) {
    return items.reduce((total, item) => total + (item.tax || 0), 0);
  },

  calculateDiscountTotal(items) {
    return items.reduce((total, item) => total + (item.discount || 0), 0);
  },

  calculateTotal(items) {
    const subtotal = this.calculateSubtotal(items);
    const taxTotal = this.calculateTaxTotal(items);
    const discountTotal = this.calculateDiscountTotal(items);
    return subtotal;
  },

  // Format currency for display
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Get payment status label with color
  getStatusInfo(status) {
    const statusMap = {
      draft: { label: 'Draft', color: 'gray.500' },
      pending: { label: 'Pending', color: 'orange.500' },
      partial: { label: 'Partially Paid', color: 'blue.500' },
      paid: { label: 'Paid', color: 'green.500' },
      overdue: { label: 'Overdue', color: 'red.500' },
      cancelled: { label: 'Cancelled', color: 'red.700' },
      refunded: { label: 'Refunded', color: 'purple.500' }
    };
    
    return statusMap[status] || { label: status, color: 'gray.500' };
  },

  // Get claim status label with color
  getClaimStatusInfo(status) {
    const statusMap = {
      not_submitted: { label: 'Not Submitted', color: 'gray.500' },
      pending: { label: 'Pending', color: 'orange.500' },
      submitted: { label: 'Submitted', color: 'blue.500' },
      in_progress: { label: 'In Progress', color: 'blue.700' },
      approved: { label: 'Approved', color: 'green.500' },
      partially_approved: { label: 'Partially Approved', color: 'teal.500' },
      denied: { label: 'Denied', color: 'red.500' },
      completed: { label: 'Completed', color: 'green.700' }
    };
    
    return statusMap[status] || { label: status, color: 'gray.500' };
  },
  
  // Add an attachment to a bill
  async addAttachment(billId, attachmentData) {
    try {
      const response = await client.post(`/bills/${billId}/attachments`, attachmentData);
      toast.success('Document attached successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to attach document');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to attach document:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },
  
  // Remove an attachment from a bill
  async removeAttachment(billId, attachmentId) {
    try {
      const response = await client.delete(`/bills/${billId}/attachments/${attachmentId}`);
      toast.success('Document removed successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove document');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to remove document:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },
  
  // Get file type information
  getFileTypeInfo(fileType) {
    const fileTypeMap = {
      pdf: { icon: 'file-pdf', color: 'red.500' },
      doc: { icon: 'file-word', color: 'blue.500' },
      docx: { icon: 'file-word', color: 'blue.500' },
      xls: { icon: 'file-excel', color: 'green.500' },
      xlsx: { icon: 'file-excel', color: 'green.500' },
      jpg: { icon: 'file-image', color: 'purple.500' },
      jpeg: { icon: 'file-image', color: 'purple.500' },
      png: { icon: 'file-image', color: 'purple.500' },
      txt: { icon: 'file-alt', color: 'gray.500' }
    };
    
    return fileTypeMap[fileType] || { icon: 'file', color: 'gray.500' };
  }
};

export default billService;
