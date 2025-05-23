import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import BillingList from '../../components/billing/BillingList';
import BillingDetail from '../../components/billing/BillingDetail';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { FaFileInvoiceDollar } from 'react-icons/fa';

const MyBilling = () => {
  const { user, clinic } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch invoices for the patient
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !user._id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await billingService.getInvoicesByPatient(user._id);
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.response?.data?.message || 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user._id) {
      fetchInvoices();
    }
  }, [user]);

  // Handle viewing an invoice
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  // Handle printing an invoice
  const handlePrintInvoice = async (invoice) => {
    try {
      const pdfBlob = await billingService.generateInvoicePdf(invoice._id);
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      // Open the PDF in a new tab
      window.open(url, '_blank');
      // Clean up the URL object
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.response?.data?.message || 'Failed to generate PDF');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaFileInvoiceDollar className="mr-2" /> My Billing
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your invoices and payment history
        </p>
      </div>

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          className="mb-4"
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <BillingList
          invoices={invoices}
          onView={handleViewInvoice}
          isLoading={isLoading}
          error={error}
          showPatient={false}
          showDoctor={true}
        />
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Invoice Details"
        size="lg"
      >
        <BillingDetail
          invoice={selectedInvoice}
          onPrint={handlePrintInvoice}
          onBack={() => setIsDetailModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default MyBilling;
