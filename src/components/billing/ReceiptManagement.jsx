import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaEye,
  FaPrint,
  FaFileInvoiceDollar,
  FaEnvelope,
  FaWhatsapp,
  FaRupeeSign,
  FaReceipt
} from 'react-icons/fa';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const ReceiptManagement = ({ 
  receipts = [], 
  onViewReceipt,
  onPrintReceipt,
  onEmailReceipt,
  onWhatsappReceipt,
  onViewInvoice,
  isLoading = false,
  error = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptDetailModalOpen, setIsReceiptDetailModalOpen] = useState(false);
  
  const { user } = useAuth();
  const [realReceipts, setRealReceipts] = useState([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  
  useEffect(() => {
    // Fetch real receipt data if no receipts are provided as props
    if (receipts.length === 0 && user) {
      fetchReceipts();
    }
  }, [receipts.length, user]);
  
  // Function to fetch receipts from the API
  const fetchReceipts = async () => {
    setIsLoadingReceipts(true);
    setReceiptError(null);
    
    try {
      let result;
      
      // Fetch receipts based on user role
      if (user.role === 'Admin' || user.role === 'Doctor') {
        result = await billingService.getReceiptsByClinic(user.clinicId);
      } else if (user.role === 'Patient') {
        // For patients, we'll get their invoices and then filter for those with receipts
        const invoices = await billingService.getInvoicesByPatient(user._id);
        if (invoices && !invoices.error) {
          // Extract receipts from invoices that have payments
          const patientReceipts = [];
          for (const invoice of invoices) {
            if (invoice.payments && invoice.payments.length > 0) {
              for (const payment of invoice.payments) {
                if (payment.receipt) {
                  patientReceipts.push({
                    ...payment.receipt,
                    invoiceId: invoice,
                    paymentId: payment
                  });
                }
              }
            }
          }
          result = patientReceipts;
        } else {
          result = { error: invoices?.error || 'Failed to fetch patient invoices' };
        }
      } else {
        result = await billingService.getReceipts();
      }
      
      if (result && result.success) {
        setRealReceipts(result);
      } else {
        setReceiptError(result?.error || 'Failed to fetch receipts');
      }
    } catch (error) {
      setReceiptError('An error occurred while fetching receipts');
      console.error('Error fetching receipts:', error);
    } finally {
      setIsLoadingReceipts(false);
    }
  };
  
  // Function to generate mock receipt data
  const generateMockReceipts = () => {
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `rec_${Math.random().toString(36).substring(2, 10)}`,
      receiptNumber: `REC-${2023}${String(i + 1).padStart(4, '0')}`,
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      paymentId: {
        _id: `pay_${Math.random().toString(36).substring(2, 10)}`,
        amount: Math.floor(Math.random() * 10000) + 500,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`
      },
      invoiceId: {
        _id: `inv_${Math.random().toString(36).substring(2, 10)}`,
        invoiceNumber: `INV-${2023}${String(i + 1).padStart(4, '0')}`,
        patientId: {
          name: `Patient ${i + 1}`
        }
      },
      issuedBy: 'Dr. Smith',
      notes: 'Receipt generated for payment',
      isEmailed: Math.random() > 0.5,
      isWhatsapped: Math.random() > 0.7
    }));
  };
  
  // Use real data from API if no receipts are provided as props
  // Ensure displayReceipts is always an array
  const displayReceipts = receipts.length > 0 ? receipts : (realReceipts?.data || []);
  
  // Show loading state if we're fetching receipts
  if (isLoadingReceipts) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Show error state if there was an error fetching receipts
  if (receiptError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{receiptError}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading receipts: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format currency in Indian format
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle viewing receipt details
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptDetailModalOpen(true);
    
    if (onViewReceipt) {
      onViewReceipt(receipt);
    }
  };
  
  // Handle printing receipt
  const handlePrintReceipt = (receipt) => {
    try {
      // Get clinic info from user context
      const clinicInfo = {
        name: user?.clinic?.name || 'Your Clinic Name',
        address: user?.clinic?.address || 'Clinic Address, City, State, PIN',
        phone: user?.clinic?.phone || '+91 1234567890',
        email: user?.clinic?.email || 'info@yourclinic.com',
        gstNumber: user?.clinic?.gstNumber || 'GSTIN: 27XXXXX1234X1Z5',
        logo: user?.clinic?.logo || null
      };
      
      // Generate PDF
      const pdf = generateReceiptPDF(receipt, clinicInfo);
      
      // Open PDF in a new window and print
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
      
      if (onPrintReceipt) {
        onPrintReceipt(receipt);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Failed to print receipt. Please try again.');
    }
  };
  
  // Handle emailing receipt
  const handleEmailReceipt = (receipt) => {
    try {
      // Get clinic info from user context
      const clinicInfo = {
        name: user?.clinic?.name || 'Your Clinic Name',
        address: user?.clinic?.address || 'Clinic Address, City, State, PIN',
        phone: user?.clinic?.phone || '+91 1234567890',
        email: user?.clinic?.email || 'info@yourclinic.com',
        gstNumber: user?.clinic?.gstNumber || 'GSTIN: 27XXXXX1234X1Z5',
        logo: user?.clinic?.logo || null
      };
      
      // Generate PDF
      const pdf = generateReceiptPDF(receipt, clinicInfo);
      
      // In a real app, you would send this to your backend to email
      // For now, we'll just download it
      pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
      
      if (onEmailReceipt) {
        onEmailReceipt(receipt);
      }
    } catch (error) {
      console.error('Error emailing receipt:', error);
      alert('Failed to email receipt. Please try again.');
    }
  };
  
  // Handle sharing receipt via WhatsApp
  const handleWhatsappReceipt = (receipt) => {
    try {
      // Get clinic info from user context
      const clinicInfo = {
        name: user?.clinic?.name || 'Your Clinic Name',
        address: user?.clinic?.address || 'Clinic Address, City, State, PIN',
        phone: user?.clinic?.phone || '+91 1234567890',
        email: user?.clinic?.email || 'info@yourclinic.com',
        gstNumber: user?.clinic?.gstNumber || 'GSTIN: 27XXXXX1234X1Z5',
        logo: user?.clinic?.logo || null
      };
      
      // Generate PDF
      const pdf = generateReceiptPDF(receipt, clinicInfo);
      
      // In a real app, you would upload this to a temporary URL and share via WhatsApp API
      // For now, we'll just download it
      pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
      
      if (onWhatsappReceipt) {
        onWhatsappReceipt(receipt);
      }
    } catch (error) {
      console.error('Error sharing receipt via WhatsApp:', error);
      alert('Failed to share receipt via WhatsApp. Please try again.');
    }
  };
  
  // Filter and sort receipts
  const filteredReceipts = displayReceipts
    .filter(receipt => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (receipt.receiptNumber && receipt.receiptNumber.toLowerCase().includes(searchLower)) ||
          (receipt.invoiceId?.invoiceNumber && receipt.invoiceId.invoiceNumber.toLowerCase().includes(searchLower)) ||
          (receipt.invoiceId?.patientId?.name && receipt.invoiceId.patientId.name.toLowerCase().includes(searchLower)) ||
          (receipt.paymentId?.transactionId && receipt.paymentId.transactionId.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Handle sorting
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'receiptNumber':
          comparison = a.receiptNumber.localeCompare(b.receiptNumber);
          break;
        case 'invoiceNumber':
          comparison = (a.invoiceId?.invoiceNumber || '').localeCompare(b.invoiceId?.invoiceNumber || '');
          break;
        case 'amount':
          comparison = (a.paymentId?.amount || 0) - (b.paymentId?.amount || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (filteredReceipts.length === 0) {
    return (
      <div className="text-center py-10">
        <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm ? 'Try adjusting your search criteria.' : 'No receipt records available.'}
        </p>
      </div>
    );
  }

  // Generate receipt preview HTML
  const generateReceiptHTML = (receipt) => {
    if (!receipt) return '';
    
    return `
      <div class="p-6 max-w-md mx-auto bg-white">
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold">PAYMENT RECEIPT</h1>
          <p class="text-gray-600">Clinic Management System</p>
        </div>
        
        <div class="border-t border-b border-gray-200 py-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="font-medium">Receipt No:</span>
            <span>${receipt.receiptNumber}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-medium">Date:</span>
            <span>${format(new Date(receipt.date), 'dd-MM-yyyy')}</span>
          </div>
        </div>
        
        <div class="mb-4">
          <div class="flex justify-between mb-2">
            <span class="font-medium">Patient:</span>
            <span>${receipt.invoiceId?.patientId?.name || 'N/A'}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-medium">Invoice No:</span>
            <span>${receipt.invoiceId?.invoiceNumber || 'N/A'}</span>
          </div>
        </div>
        
        <div class="border-t border-b border-gray-200 py-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="font-medium">Payment Method:</span>
            <span>${receipt.paymentId?.paymentMethod || 'N/A'}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-medium">Transaction ID:</span>
            <span>${receipt.paymentId?.transactionId || 'N/A'}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-medium">Amount:</span>
            <span>${formatIndianCurrency(receipt.paymentId?.amount || 0)}</span>
          </div>
        </div>
        
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">Thank you for your payment!</p>
          <p class="text-sm text-gray-600">This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipts..."
              className="pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="h-4 w-4 mr-1" /> Filters
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="date"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Receipts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('receiptNumber')}
              >
                <div className="flex items-center">
                  Receipt #
                  {sortField === 'receiptNumber' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center">
                  Invoice #
                  {sortField === 'invoiceNumber' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {sortField === 'amount' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {receipt.receiptNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(receipt.date), 'dd-MM-yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.invoiceId?.invoiceNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.invoiceId?.patientId?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaRupeeSign className="h-3 w-3 mr-1" />
                    {(receipt.paymentId?.amount || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.paymentId?.paymentMethod || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleViewReceipt(receipt)}
                    title="View Receipt"
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handlePrintReceipt(receipt)}
                    title="Print Receipt"
                  >
                    <FaPrint className="h-4 w-4" />
                  </Button>
                  
                  {onViewInvoice && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onViewInvoice(receipt.invoiceId)}
                      title="View Invoice"
                    >
                      <FaFileInvoiceDollar className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleEmailReceipt(receipt)}
                    title="Email Receipt"
                  >
                    <FaEnvelope className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleWhatsappReceipt(receipt)}
                    title="Send via WhatsApp"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="secondary" size="sm">Previous</Button>
          <Button variant="secondary" size="sm">Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReceipts.length}</span> of{' '}
              <span className="font-medium">{filteredReceipts.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Receipt Detail Modal */}
      <Modal
        isOpen={isReceiptDetailModalOpen}
        onClose={() => setIsReceiptDetailModalOpen(false)}
        title="Receipt Details"
        size="lg"
      >
        {selectedReceipt && (
          <div className="p-4">
            <div className="mb-6 border rounded-lg p-4">
              <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML(selectedReceipt) }} />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {onPrintReceipt && (
                <Button 
                  variant="secondary" 
                  onClick={() => onPrintReceipt(selectedReceipt)}
                >
                  <FaPrint className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              )}
              
              {onEmailReceipt && !selectedReceipt.isEmailed && (
                <Button 
                  variant="secondary" 
                  onClick={() => onEmailReceipt(selectedReceipt)}
                >
                  <FaEnvelope className="mr-2 h-4 w-4" /> Email Receipt
                </Button>
              )}
              
              {onWhatsappReceipt && !selectedReceipt.isWhatsapped && (
                <Button 
                  variant="secondary" 
                  onClick={() => onWhatsappReceipt(selectedReceipt)}
                >
                  <FaWhatsapp className="mr-2 h-4 w-4" /> Send via WhatsApp
                </Button>
              )}
              
              {onViewInvoice && (
                <Button 
                  variant="primary" 
                  onClick={() => onViewInvoice(selectedReceipt.invoiceId)}
                >
                  <FaFileInvoiceDollar className="mr-2 h-4 w-4" /> View Invoice
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReceiptManagement;
