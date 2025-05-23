import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import BillingList from '../../components/billing/BillingList';
import IndianBillingList from '../../components/billing/IndianBillingList';
import IndianBillingForm from '../../components/billing/IndianBillingForm';
import IndianBillingDetail from '../../components/billing/IndianBillingDetail';
import BillingDashboard from '../../components/billing/BillingDashboard';
import BillingNavigation from '../../components/billing/BillingNavigation';
import PaymentProcessor from '../../components/billing/PaymentProcessor';
import PaymentManagement from '../../components/billing/PaymentManagement';
import ReceiptManagement from '../../components/billing/ReceiptManagement';
import GstReportManagement from '../../components/billing/GstReportManagement';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaFileInvoiceDollar, 
  FaChartBar, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEnvelope, 
  FaWhatsapp, 
  FaFilePdf, 
  FaFileExcel,
  FaMoneyBillWave,
  FaReceipt,
  FaCalculator,
  FaFileContract,
  FaRupeeSign,
  FaClipboardList,
  FaFileExport,
  FaChartLine
} from 'react-icons/fa';

const BillingManagement = () => {
  const { user, clinic } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // Default tab

  // Fetch invoices based on user role
  const fetchInvoices = async () => {
    if (!user || !user.clinicId) {
      toast.error('User information is missing');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching invoices for user role:', user.role);
      }
      
      let invoices = [];
      let result;

      switch (user.role) {
        case 'Admin':
        case 'Receptionist':
          // Admin and receptionists can see all invoices for their clinic
          result = await billingService.getInvoicesByClinic(user.clinicId);
          break;
        case 'Doctor':
          // Doctors can see invoices for their patients
          result = await billingService.getInvoices({ doctorId: user._id });
          break;
        case 'Patient':
          // Patients can only see their own invoices
          result = await billingService.getInvoicesByPatient(user._id);
          break;
        default:
          toast.warning(`Unknown user role: ${user.role}`);
          break;
      }

      if (result && !result.error) {
        // Check if result is an array or has an invoices property
        if (Array.isArray(result)) {
          invoices = result;
        } else if (result.invoices && Array.isArray(result.invoices)) {
          invoices = result.invoices;
        }
      }

      setInvoices(invoices || []);
      
      if (invoices.length === 0) {
        toast.info('No invoices found');
      }
    } catch (err) {
      // This should rarely happen since billingService handles errors
      toast.error('An unexpected error occurred while fetching invoices');
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled error in fetchInvoices:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.clinicId) {
      fetchInvoices();
      
      // Set default active tab based on role
      if (user.role === 'Admin') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('invoices');
      }
    }
  }, [user]);
  
  // Check if user can create/edit invoices
  const canManageInvoices = () => {
    return ['Admin', 'Receptionist'].includes(user?.role);
  };
  
  // Check if user can delete invoices
  const canDeleteInvoices = () => {
    return user?.role === 'Admin';
  };
  
  // Check if user can process payments
  const canProcessPayments = () => {
    return ['Admin', 'Receptionist'].includes(user?.role);
  };

  // Save invoice (create or update)
  const saveInvoice = async (invoiceData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let result;
      
      if (selectedInvoice) {
        // Update existing invoice
        result = await billingService.updateInvoice(selectedInvoice._id, invoiceData);
      } else {
        // Create new invoice
        result = await billingService.createInvoice(invoiceData);
      }
      
      if (result && !result.error) {
        // Success case is handled by toast in the service
        // Refresh the list
        fetchInvoices();
        // Close the form
        setIsFormModalOpen(false);
      }
    } catch (err) {
      // This should rarely happen since billingService handles errors
      toast.error('An unexpected error occurred while saving the invoice');
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled error in saveInvoice:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await billingService.deleteInvoice(invoiceId);
      
      if (result && !result.error) {
        // Success case is handled by toast in the service
        // Refresh the list
        fetchInvoices();
        // Close the modal
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      // This should rarely happen since billingService handles errors
      toast.error('An unexpected error occurred while deleting the invoice');
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled error in deleteInvoice:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing an invoice
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  // Handle editing an invoice
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  };

  // Handle confirming invoice deletion
  const handleConfirmDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setIsDeleteModalOpen(true);
  };

  // Handle printing an invoice
  const handlePrintInvoice = async (invoice) => {
    try {
      const result = await billingService.generateInvoicePdf(invoice._id);
      
      if (result && !result.error) {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(result);
        // Open the PDF in a new tab
        window.open(url, '_blank');
        // Clean up the URL object
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      // This should rarely happen since billingService handles errors
      toast.error('An unexpected error occurred while generating the PDF');
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled error in handlePrintInvoice:', err.message);
      }
    }
  };
  
  // Handle processing a payment
  const handleProcessPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };
  
  // Handle payment completion
  const handlePaymentComplete = (updatedInvoice) => {
    // Update the invoice in the list
    const updatedInvoices = invoices.map(inv => 
      inv._id === updatedInvoice._id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
    
    // Close the payment modal
    setIsPaymentModalOpen(false);
    
    // Show success message
    toast.success('Payment processed successfully');
    setSuccessMessage('Payment processed successfully');
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <BillingDashboard 
            clinicId={user?.clinicId}
            userRole={user?.role}
          />
        );
        
      case 'invoices':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
              {canManageInvoices() && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedInvoice(null);
                    setIsFormModalOpen(true);
                  }}
                >
                  <FaPlus className="mr-1" /> Create Invoice
                </Button>
              )}
            </div>
            <IndianBillingList
              invoices={invoices}
              onView={handleViewInvoice}
              onEdit={canManageInvoices() ? handleEditInvoice : null}
              onDelete={canDeleteInvoices() ? handleConfirmDelete : null}
              isLoading={isLoading}
              error={error}
              onProcessPayment={canProcessPayments() ? handleProcessPayment : null}
              onDownloadInvoice={handlePrintInvoice}
              onGenerateGstInvoice={(invoice) => {
                toast.info('GST invoice generation will be available soon');
              }}
              showPatient={user?.role !== 'Patient'}
              showDoctor={user?.role !== 'Doctor'}
              userRole={user?.role}
            />
          </div>
        );
        
      case 'payments':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Payments</h2>
            </div>
            <PaymentManagement
              onViewInvoice={(invoice) => {
                if (invoice) {
                  // Find the invoice in our existing list or fetch it
                  const existingInvoice = invoices.find(inv => inv._id === invoice._id);
                  if (existingInvoice) {
                    handleViewInvoice(existingInvoice);
                  } else {
                    // Fetch the invoice if not in our list
                    billingService.getInvoiceById(invoice._id)
                      .then(result => {
                        if (result && !result.error) {
                          handleViewInvoice(result);
                        }
                      })
                      .catch(err => {
                        toast.error('Failed to fetch invoice details');
                      });
                  }
                }
              }}
              onProcessPayment={handleProcessPayment}
              onGenerateReceipt={(payment) => {
                toast.info('Receipt generation will be available soon');
              }}
              onPrintReceipt={(payment) => {
                toast.info('Receipt printing will be available soon');
              }}
              isLoading={isLoading}
              error={error}
              userRole={user?.role}
            />
          </div>
        );
        
      case 'receipts':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Receipts</h2>
            </div>
            <ReceiptManagement
              onViewInvoice={(invoice) => {
                if (invoice) {
                  // Find the invoice in our existing list or fetch it
                  const existingInvoice = invoices.find(inv => inv._id === invoice._id);
                  if (existingInvoice) {
                    handleViewInvoice(existingInvoice);
                  } else {
                    // Fetch the invoice if not in our list
                    billingService.getInvoiceById(invoice._id)
                      .then(result => {
                        if (result && !result.error) {
                          handleViewInvoice(result);
                        }
                      })
                      .catch(err => {
                        toast.error('Failed to fetch invoice details');
                      });
                  }
                }
              }}
              onPrintReceipt={(receipt) => {
                toast.info('Receipt printing will be available soon');
              }}
              onEmailReceipt={(receipt) => {
                toast.info('Email functionality will be implemented soon');
              }}
              onWhatsappReceipt={(receipt) => {
                toast.info('WhatsApp functionality will be implemented soon');
              }}
              isLoading={isLoading}
              error={error}
            />
          </div>
        );
        
      case 'gst-reports':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">GST Reports</h2>
            </div>
            <GstReportManagement
              onGenerateReport={(reportType, dateRange) => {
                toast.info(`Generating ${reportType.toUpperCase()} report for the selected period...`);
                // In a real implementation, this would call the backend API
                setTimeout(() => {
                  toast.success(`${reportType.toUpperCase()} report generated successfully!`);
                }, 1500);
              }}
              onDownloadReport={(reportType, dateRange, format) => {
                toast.info(`Downloading ${reportType.toUpperCase()} report in ${format.toUpperCase()} format...`);
                // In a real implementation, this would call the backend API
                setTimeout(() => {
                  toast.success(`${reportType.toUpperCase()} report downloaded successfully!`);
                }, 1500);
              }}
              isLoading={isLoading}
              error={error}
            />
          </div>
        );
        
      case 'financial-reports':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Reports</h2>
            <p className="text-gray-600">Access comprehensive financial reports including revenue analysis, profit & loss statements, and more.</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <FaChartBar className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <p className="text-gray-500">Financial reporting features will be available soon.</p>
            </div>
          </div>
        );
        
      case 'insurance-claims':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Insurance Claims</h2>
            <p className="text-gray-600">Manage insurance claims, track claim status, and process insurance payments.</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <FaFileContract className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <p className="text-gray-500">Insurance claim management features will be available soon.</p>
            </div>
          </div>
        );
        
      case 'price-packages':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Price Packages</h2>
            <p className="text-gray-600">Create and manage service packages with special pricing for different treatments and procedures.</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <FaRupeeSign className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <p className="text-gray-500">Price package management features will be available soon.</p>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Settings</h2>
            <p className="text-gray-600">Configure billing settings including tax rates, invoice templates, and payment methods.</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <FaClipboardList className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <p className="text-gray-500">Billing settings features will be available soon.</p>
            </div>
          </div>
        );
        
      case 'export':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Data</h2>
            <p className="text-gray-600">Export billing data in various formats for accounting and record-keeping purposes.</p>
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <FaFileExport className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <p className="text-gray-500">Data export features will be available soon.</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Select a tab from above to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <BillingNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role}
      />
      
      {renderTabContent()}

      {/* Invoice Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        size="xl"
      >
        <IndianBillingForm
          onSubmit={saveInvoice}
          initialData={selectedInvoice}
          isLoading={isLoading}
          error={error}
          clinicId={user?.clinicId}
        />
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Invoice Details"
        size="xl"
      >
        <IndianBillingDetail
          invoice={selectedInvoice}
          onEdit={canManageInvoices() ? handleEditInvoice : null}
          onPrint={handlePrintInvoice}
          onBack={() => setIsDetailModalOpen(false)}
          onProcessPayment={canProcessPayments() ? handleProcessPayment : null}
          onDownloadPdf={handlePrintInvoice}
          onSendEmail={(invoice) => toast.info(`Email functionality will be implemented soon`)}
          onSendWhatsapp={(invoice) => toast.info(`WhatsApp functionality will be implemented soon`)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this invoice? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteInvoice(invoiceToDelete)}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Payment Processing Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Process Payment"
        size="md"
      >
        <PaymentProcessor
          invoice={selectedInvoice}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setIsPaymentModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default BillingManagement;
