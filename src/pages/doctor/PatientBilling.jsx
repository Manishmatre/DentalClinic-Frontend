import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import patientService from '../../api/patients/patientService';
import BillingList from '../../components/billing/BillingList';
import BillingDetail from '../../components/billing/BillingDetail';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { FaFileInvoiceDollar } from 'react-icons/fa';

const PatientBilling = () => {
  const { user, clinic } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch patients for the doctor
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || !user._id) return;
      
      setIsLoading(true);
      try {
        const data = await patientService.getPatients({ doctorId: user._id });
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.response?.data?.message || 'Failed to load patients');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user._id) {
      fetchPatients();
    }
  }, [user]);

  // Fetch invoices for the selected patient
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedPatient) {
        setInvoices([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await billingService.getInvoicesByPatient(selectedPatient);
        setInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.response?.data?.message || 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [selectedPatient]);

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

  // Handle patient selection change
  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
          <FaFileInvoiceDollar className="mr-2" /> Patient Billing
        </h1>
        
        <div className="mb-4">
          <label htmlFor="patientSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Patient
          </label>
          <select
            id="patientSelect"
            value={selectedPatient}
            onChange={handlePatientChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">-- Select a patient --</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          message={successMessage}
          className="mb-4"
        />
      )}

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          className="mb-4"
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {selectedPatient ? (
          <BillingList
            invoices={invoices}
            onView={handleViewInvoice}
            isLoading={isLoading}
            error={error}
            showPatient={false}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Please select a patient to view their billing history.
          </div>
        )}
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

export default PatientBilling;
