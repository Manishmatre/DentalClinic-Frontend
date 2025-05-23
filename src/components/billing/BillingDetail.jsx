import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { FaEdit, FaPrint, FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const BillingDetail = ({ invoice, onEdit, onPrint, onBack, onProcessPayment }) => {
  if (!invoice) {
    return <div>No invoice data available</div>;
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
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Invoice #{invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8)}`}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created on {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-3">
          {onBack && (
            <Button variant="secondary" size="sm" onClick={onBack}>
              <FaArrowLeft className="mr-1" /> Back
            </Button>
          )}
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(invoice)}>
              <FaEdit className="mr-1" /> Edit
            </Button>
          )}
          {onPrint && (
            <Button variant="secondary" size="sm" onClick={() => onPrint(invoice)}>
              <FaPrint className="mr-1" /> Print
            </Button>
          )}
          {onProcessPayment && (invoice.paymentStatus === 'Pending' || invoice.paymentStatus === 'Partial') && (
            <Button variant="primary" size="sm" onClick={() => onProcessPayment(invoice)}>
              <FaCreditCard className="mr-1" /> Process Payment
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.paymentStatus)}`}>
                {invoice.paymentStatus}
              </span>
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.paymentMethod}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Patient</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.patientId?.name || 'N/A'}</dd>
          </div>
          
          {invoice.appointmentId && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Related Appointment</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(invoice.appointmentId.startTime), 'MMM d, yyyy h:mm a')} - {invoice.appointmentId.serviceType}
              </dd>
            </div>
          )}
          
          {invoice.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{invoice.notes}</dd>
            </div>
          )}
        </dl>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-md font-medium text-gray-900">Services</h4>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.services.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${service.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(service.quantity * service.cost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-end">
            <dl className="w-64 space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Subtotal:</dt>
                <dd className="text-sm font-medium text-gray-900">${invoice.subtotal.toFixed(2)}</dd>
              </div>
              
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Discount ({invoice.discount}%):</dt>
                  <dd className="text-sm font-medium text-gray-900">-${(invoice.subtotal * (invoice.discount / 100)).toFixed(2)}</dd>
                </div>
              )}
              
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Tax ({invoice.tax}%):</dt>
                  <dd className="text-sm font-medium text-gray-900">${(invoice.subtotal * (1 - invoice.discount / 100) * (invoice.tax / 100)).toFixed(2)}</dd>
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-base font-medium text-gray-900">Total:</dt>
                <dd className="text-base font-bold text-gray-900">${invoice.total.toFixed(2)}</dd>
              </div>
              
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between pt-2">
                  <dt className="text-base font-medium text-gray-900">Paid Amount:</dt>
                  <dd className="text-base font-medium text-green-600">${invoice.paidAmount.toFixed(2)}</dd>
                </div>
              )}
              
              {invoice.paidAmount < invoice.total && (
                <div className="flex justify-between pt-2">
                  <dt className="text-base font-medium text-gray-900">Balance Due:</dt>
                  <dd className="text-base font-bold text-red-600">${(invoice.total - invoice.paidAmount).toFixed(2)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetail;
