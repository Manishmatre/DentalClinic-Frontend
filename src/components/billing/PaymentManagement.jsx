import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import { 
  FaRupeeSign, 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaEye,
  FaFileInvoiceDollar,
  FaReceipt,
  FaPrint
} from 'react-icons/fa';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const PaymentManagement = ({ 
  payments = [], 
  onViewPayment,
  onViewInvoice,
  onGenerateReceipt,
  onPrintReceipt,
  isLoading = false,
  error = null,
  userRole = 'Patient'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  
  const { user } = useAuth();
  const [realPayments, setRealPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  useEffect(() => {
    // Fetch real payment data if no payments are provided as props
    if (payments.length === 0 && user) {
      fetchPayments();
    }
  }, [payments.length, user]);
  
  // Function to fetch payments from the API
  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    setPaymentError(null);
    
    try {
      let result;
      
      // Fetch payments based on user role
      if (user.role === 'Admin' || user.role === 'Doctor') {
        result = await billingService.getPaymentsByClinic(user.clinicId);
      } else if (user.role === 'Patient') {
        result = await billingService.getPaymentsByPatient(user._id);
      } else {
        result = await billingService.getPayments();
      }
      
      if (result && result.success) {
        setRealPayments(result);
      } else {
        setPaymentError(result?.error || 'Failed to fetch payments');
      }
    } catch (error) {
      setPaymentError('An error occurred while fetching payments');
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };
  
  // Function to generate mock payment data
  const generateMockPayments = () => {
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'];
    const paymentStatuses = ['Completed', 'Pending', 'Failed', 'Refunded'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `pay_${Math.random().toString(36).substring(2, 10)}`,
      invoiceId: {
        _id: `inv_${Math.random().toString(36).substring(2, 10)}`,
        invoiceNumber: `INV-${2023}${String(i + 1).padStart(4, '0')}`,
        patientId: {
          name: `Patient ${i + 1}`
        }
      },
      amount: Math.floor(Math.random() * 10000) + 500,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      notes: 'Payment received',
      receiptNumber: `REC-${2023}${String(i + 1).padStart(4, '0')}`,
      paidBy: `Patient ${i + 1}`,
      processedBy: 'Dr. Smith'
    }));
  };
  
  // Use real data from API if no payments are provided as props
  // Ensure displayPayments is always an array
  const displayPayments = payments.length > 0 ? payments : (realPayments?.data || []);
  
  // Show loading state if we're fetching payments
  if (isLoadingPayments) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Show error state if there was an error fetching payments
  if (paymentError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{paymentError}</p>
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
              Error loading payments: {error.message}
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
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter and sort payments
  const filteredPayments = displayPayments
    .filter(payment => {
      // Apply status filter
      if (filterStatus !== 'all' && payment.status !== filterStatus) {
        return false;
      }
      
      // Apply payment method filter
      if (filterMethod !== 'all' && payment.paymentMethod !== filterMethod) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (payment.invoiceId?.invoiceNumber && payment.invoiceId.invoiceNumber.toLowerCase().includes(searchLower)) ||
          (payment.invoiceId?.patientId?.name && payment.invoiceId.patientId.name.toLowerCase().includes(searchLower)) ||
          (payment.transactionId && payment.transactionId.toLowerCase().includes(searchLower)) ||
          (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(searchLower))
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
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'invoiceNumber':
          comparison = (a.invoiceId?.invoiceNumber || '').localeCompare(b.invoiceId?.invoiceNumber || '');
          break;
        case 'paymentMethod':
          comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Handle view payment details
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailModalOpen(true);
    
    if (onViewPayment) {
      onViewPayment(payment);
    }
  };

  if (filteredPayments.length === 0) {
    return (
      <div className="text-center py-10">
        <FaRupeeSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm || filterStatus !== 'all' || filterMethod !== 'all'
            ? 'Try adjusting your search or filter criteria.' 
            : 'No payment records available.'}
        </p>
      </div>
    );
  }

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
              placeholder="Search payments..."
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
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700">Amount Range</label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paymentMethod')}
              >
                <div className="flex items-center">
                  Method
                  {sortField === 'paymentMethod' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(payment.date), 'dd-MM-yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.invoiceId?.invoiceNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.invoiceId?.patientId?.name || payment.paidBy || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaRupeeSign className="h-3 w-3 mr-1" />
                    {payment.amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.receiptNumber || 'Not Generated'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleViewPayment(payment)}
                    title="View Payment"
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                  
                  {onViewInvoice && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onViewInvoice(payment.invoiceId)}
                      title="View Invoice"
                    >
                      <FaFileInvoiceDollar className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onGenerateReceipt && payment.status === 'Completed' && !payment.receiptNumber && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onGenerateReceipt(payment)}
                      title="Generate Receipt"
                    >
                      <FaReceipt className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onPrintReceipt && payment.receiptNumber && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onPrintReceipt(payment)}
                      title="Print Receipt"
                    >
                      <FaPrint className="h-4 w-4" />
                    </Button>
                  )}
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPayments.length}</span> of{' '}
              <span className="font-medium">{filteredPayments.length}</span> results
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
      
      {/* Payment Detail Modal */}
      <Modal
        isOpen={isPaymentDetailModalOpen}
        onClose={() => setIsPaymentDetailModalOpen(false)}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment ID:</span>
                    <span className="text-sm text-gray-900">{selectedPayment._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Transaction ID:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.transactionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <span className="text-sm text-gray-900">{format(new Date(selectedPayment.date), 'dd-MM-yyyy HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm text-gray-900">{formatIndianCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Method:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Invoice Number:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.invoiceId?.invoiceNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Patient:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.invoiceId?.patientId?.name || selectedPayment.paidBy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Receipt Number:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.receiptNumber || 'Not Generated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Processed By:</span>
                    <span className="text-sm text-gray-900">{selectedPayment.processedBy || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{selectedPayment.notes || 'No notes available'}</p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {onViewInvoice && (
                <Button 
                  variant="secondary" 
                  onClick={() => onViewInvoice(selectedPayment.invoiceId)}
                >
                  <FaFileInvoiceDollar className="mr-2 h-4 w-4" /> View Invoice
                </Button>
              )}
              
              {onGenerateReceipt && selectedPayment.status === 'Completed' && !selectedPayment.receiptNumber && (
                <Button 
                  variant="secondary" 
                  onClick={() => onGenerateReceipt(selectedPayment)}
                >
                  <FaReceipt className="mr-2 h-4 w-4" /> Generate Receipt
                </Button>
              )}
              
              {onPrintReceipt && selectedPayment.receiptNumber && (
                <Button 
                  variant="primary" 
                  onClick={() => onPrintReceipt(selectedPayment)}
                >
                  <FaPrint className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManagement;
