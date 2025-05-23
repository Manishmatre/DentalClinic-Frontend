import client from '../axios';
import { toast } from 'react-toastify';

// Helper function to handle API calls and suppress console errors
const apiCall = async (apiFunction, errorMessage = 'API call failed') => {
  try {
    return await apiFunction();
  } catch (error) {
    // Only show minimal error info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn(`${errorMessage}: ${error.message || 'Unknown error'}`);
    }
    
    // Return empty data instead of throwing error
    return { data: [], success: false, error: error.message };
  }
};

const billingService = {
  // Get all invoices with optional filtering
  async getInvoices(params = {}) {
    return apiCall(
      async () => {
        const response = await client.get('/invoices', { params });
        return response.data;
      },
      'Failed to fetch invoices'
    );
  },

  // Get invoices for a specific clinic
  async getInvoicesByClinic(clinicId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/invoices/clinic/${clinicId}`, { params });
        return response.data;
      },
      `Failed to fetch invoices for clinic ${clinicId}`
    );
  },

  // Get invoices for a specific patient
  async getInvoicesByPatient(patientId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/invoices/patient/${patientId}`, { params });
        return response.data;
      },
      `Failed to fetch invoices for patient ${patientId}`
    );
  },

  // Get a single invoice by ID
  async getInvoiceById(invoiceId) {
    return apiCall(
      async () => {
        const response = await client.get(`/invoices/${invoiceId}`);
        return response.data;
      },
      `Failed to fetch invoice ${invoiceId}`
    );
  },

  // Create a new invoice
  async createInvoice(invoiceData) {
    try {
      const response = await client.post('/invoices', invoiceData);
      toast.success('Invoice created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to create invoice:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Update an existing invoice
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const response = await client.put(`/invoices/${invoiceId}`, invoiceData);
      toast.success('Invoice updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update invoice:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Delete an invoice
  async deleteInvoice(invoiceId) {
    try {
      const response = await client.delete(`/invoices/${invoiceId}`);
      toast.success('Invoice deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to delete invoice:', error.message || 'Unknown error');
      }
      return { error: error.message };
    }
  },

  // Change payment status
  async updatePaymentStatus(invoiceId, status) {
    try {
      const response = await client.patch(`/invoices/${invoiceId}/status`, { paymentStatus: status });
      toast.success(`Payment status updated to ${status}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update payment status:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Process payment for an invoice
  async processPayment(invoiceId, paymentData) {
    try {
      // Process payment with all payment details
      const response = await client.post(`/billing/invoices/${invoiceId}/payment`, {
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        transactionId: paymentData.transactionId,
        upiId: paymentData.upiId,
        chequeNumber: paymentData.chequeNumber,
        bankName: paymentData.bankName
      });
      
      toast.success('Payment processed successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process payment');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to process payment:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Generate PDF invoice
  async generateInvoicePdf(invoiceId) {
    try {
      const response = await client.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      toast.success('PDF generated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate PDF');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to generate PDF:', error.message || 'Unknown error');
      }
      return null;
    }
  },

  // Get billing statistics
  async getBillingStats(clinicId, startDate, endDate) {
    const params = { clinicId, startDate, endDate };
    return apiCall(
      async () => {
        const response = await client.get('/billing/stats', { params });
        return response.data;
      },
      'Failed to fetch billing statistics'
    );
  },
  
  // Get all payments
  async getPayments(params = {}) {
    return apiCall(
      async () => {
        const response = await client.get('/billing/payments', { params });
        return response.data;
      },
      'Failed to fetch payments'
    );
  },
  
  // Get payments by clinic
  async getPaymentsByClinic(clinicId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/billing/payments/clinic/${clinicId}`, { params });
        return response.data;
      },
      `Failed to fetch payments for clinic ${clinicId}`
    );
  },
  
  // Get payments by patient
  async getPaymentsByPatient(patientId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/billing/payments/patient/${patientId}`, { params });
        return response.data;
      },
      `Failed to fetch payments for patient ${patientId}`
    );
  },
  
  // Get a single payment by ID
  async getPaymentById(paymentId) {
    return apiCall(
      async () => {
        const response = await client.get(`/billing/payments/${paymentId}`);
        return response.data;
      },
      `Failed to fetch payment ${paymentId}`
    );
  },
  
  // Get all receipts
  async getReceipts(params = {}) {
    return apiCall(
      async () => {
        const response = await client.get('/billing/receipts', { params });
        return response.data;
      },
      'Failed to fetch receipts'
    );
  },
  
  // Get receipts by clinic
  async getReceiptsByClinic(clinicId, params = {}) {
    return apiCall(
      async () => {
        const response = await client.get(`/billing/receipts/clinic/${clinicId}`, { params });
        return response.data;
      },
      `Failed to fetch receipts for clinic ${clinicId}`
    );
  },
  
  // Generate receipt for a payment
  async generateReceipt(paymentId, options = {}) {
    try {
      const response = await client.post(`/billing/payments/${paymentId}/receipt`, options);
      toast.success('Receipt generated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate receipt');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to generate receipt:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },
  
  // Get GST reports
  async getGstReports(clinicId, startDate, endDate, reportType = 'summary') {
    const params = { clinicId, startDate, endDate, reportType };
    return apiCall(
      async () => {
        const response = await client.get('/billing/gst-reports', { params });
        return response.data;
      },
      'Failed to fetch GST reports'
    );
  },
  
  // Generate GST report for a specific period
  async generateGstReport(reportData) {
    try {
      const response = await client.post('/billing/gst-reports', reportData);
      toast.success('GST report generated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate GST report');
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to generate GST report:', error.message || 'Unknown error');
      }
      return { success: false, error: error.message };
    }
  },

  // Calculate invoice totals
  calculateSubtotal(services) {
    return services.reduce((total, service) => total + (service.cost * service.quantity), 0);
  },

  // Calculate final total with discount and tax
  calculateTotal(subtotal, discount = 0, tax = 0) {
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);
    return afterDiscount + taxAmount;
  }
};

export default billingService;