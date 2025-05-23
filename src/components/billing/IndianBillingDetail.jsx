import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { FaEdit, FaPrint, FaArrowLeft, FaCreditCard, FaDownload, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const IndianBillingDetail = ({ 
  invoice, 
  onEdit, 
  onPrint, 
  onBack, 
  onProcessPayment,
  onDownloadPdf,
  onSendEmail,
  onSendWhatsapp 
}) => {
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

  // Format currency in Indian format
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
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
        <div className="flex space-x-2">
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
          {onDownloadPdf && (
            <Button variant="secondary" size="sm" onClick={() => onDownloadPdf(invoice)}>
              <FaDownload className="mr-1" /> Download
            </Button>
          )}
          {onSendEmail && (
            <Button variant="secondary" size="sm" onClick={() => onSendEmail(invoice)}>
              <FaEnvelope className="mr-1" /> Email
            </Button>
          )}
          {onSendWhatsapp && (
            <Button variant="success" size="sm" onClick={() => onSendWhatsapp(invoice)}>
              <FaWhatsapp className="mr-1" /> WhatsApp
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
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
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
            <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Patient</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.patientId?.name || 'N/A'}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Patient Contact</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.patientId?.phone || 'N/A'}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Patient Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.patientId?.email || 'N/A'}</dd>
          </div>
          
          {invoice.patientGstin && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Patient GSTIN</dt>
              <dd className="mt-1 text-sm text-gray-900">{invoice.patientGstin}</dd>
            </div>
          )}
          
          {invoice.appointmentId && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Related Appointment</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(invoice.appointmentId.startTime), 'dd/MM/yyyy h:mm a')} - {invoice.appointmentId.serviceType}
              </dd>
            </div>
          )}
          
          {invoice.notes && (
            <div className="sm:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{invoice.notes}</dd>
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
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HSN/SAC
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  {invoice.includeGst && (
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST Rate
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.services.map((service, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {service.hsn || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {service.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatIndianCurrency(service.cost)}
                    </td>
                    {invoice.includeGst && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {service.gstRate || 0}%
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatIndianCurrency(service.quantity * service.cost)}
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
                <dd className="text-sm font-medium text-gray-900">{formatIndianCurrency(invoice.subtotal)}</dd>
              </div>
              
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Discount ({invoice.discount}%):</dt>
                  <dd className="text-sm font-medium text-gray-900">-{formatIndianCurrency(invoice.subtotal * (invoice.discount / 100))}</dd>
                </div>
              )}
              
              {invoice.includeGst && !invoice.isInterState && invoice.cgst > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">CGST:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatIndianCurrency(invoice.cgst)}</dd>
                </div>
              )}
              
              {invoice.includeGst && !invoice.isInterState && invoice.sgst > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">SGST:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatIndianCurrency(invoice.sgst)}</dd>
                </div>
              )}
              
              {invoice.includeGst && invoice.isInterState && invoice.igst > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">IGST:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatIndianCurrency(invoice.igst)}</dd>
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-base font-medium text-gray-900">Total:</dt>
                <dd className="text-base font-bold text-gray-900">{formatIndianCurrency(invoice.total)}</dd>
              </div>
              
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between pt-2">
                  <dt className="text-base font-medium text-gray-900">Paid Amount:</dt>
                  <dd className="text-base font-medium text-green-600">{formatIndianCurrency(invoice.paidAmount)}</dd>
                </div>
              )}
              
              {invoice.paidAmount < invoice.total && (
                <div className="flex justify-between pt-2">
                  <dt className="text-base font-medium text-gray-900">Balance Due:</dt>
                  <dd className="text-base font-bold text-red-600">{formatIndianCurrency(invoice.total - invoice.paidAmount)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions</h4>
        <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-1">
          <li>Payment is due within 15 days from the invoice date.</li>
          <li>All services are non-refundable once provided.</li>
          <li>This is a computer-generated invoice and does not require a signature.</li>
          {invoice.includeGst && (
            <>
              <li>GST Registration Number: {invoice.clinicId?.gstNumber || 'XXXXXXXXXXXX'}</li>
              <li>All disputes are subject to local jurisdiction.</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
};

export default IndianBillingDetail;
