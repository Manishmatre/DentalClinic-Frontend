import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { FaCreditCard, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const BillingList = ({ 
  invoices = [], 
  onView, 
  onEdit, 
  onDelete, 
  onProcessPayment,
  isLoading = false,
  error = null,
  showPatient = true,
  showDoctor = true,
  userRole = 'Patient' // Default to most restricted role
}) => {
  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  if (error) {
    return <div>Error loading invoices: {error.message}</div>;
  }

  if (invoices.length === 0) {
    return <p className="text-gray-500">No invoices found.</p>;
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Partial':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            {showPatient && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8)}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
              </td>
              {showPatient && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.patientId?.name || 'N/A'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${invoice.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.paymentStatus)}`}>
                  {invoice.paymentStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {onView && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onView(invoice)}
                    title="View Invoice"
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onEdit(invoice)}
                    title="Edit Invoice"
                  >
                    <FaEdit className="h-4 w-4" />
                  </Button>
                )}
                {onProcessPayment && (invoice.paymentStatus === 'Pending' || invoice.paymentStatus === 'Partial') && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onProcessPayment(invoice)}
                    title="Process Payment"
                  >
                    <FaCreditCard className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && invoice.paymentStatus !== 'Paid' && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => onDelete(invoice._id)}
                    title="Delete Invoice"
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillingList;
