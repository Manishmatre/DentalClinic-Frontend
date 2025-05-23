import React, { useState } from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { 
  FaCreditCard, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaFilePdf, 
  FaFileInvoiceDollar, 
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaRupeeSign
} from 'react-icons/fa';

const IndianBillingList = ({ 
  invoices = [], 
  onView, 
  onEdit, 
  onDelete, 
  onProcessPayment,
  onDownloadInvoice,
  onGenerateGstInvoice,
  isLoading = false,
  error = null,
  showPatient = true,
  showDoctor = true,
  userRole = 'Patient' // Default to most restricted role
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
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
              Error loading invoices: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
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
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      // Apply status filter
      if (filterStatus !== 'all' && invoice.paymentStatus !== filterStatus) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchLower)) ||
          (invoice.patientId?.name && invoice.patientId.name.toLowerCase().includes(searchLower)) ||
          (invoice.doctorId?.name && invoice.doctorId.name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Handle sorting
      let comparison = 0;
      
      switch (sortField) {
        case 'invoiceNumber':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'patientName':
          comparison = (a.patientId?.name || '').localeCompare(b.patientId?.name || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (filteredInvoices.length === 0) {
    return (
      <div className="text-center py-10">
        <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm || filterStatus !== 'all' 
            ? 'Try adjusting your search or filter criteria.' 
            : 'Get started by creating a new invoice.'}
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
              placeholder="Search invoices..."
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
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Rate</label>
              <select
                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="all">All Rates</option>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Invoice Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'createdAt' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              {showPatient && (
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('patientName')}
                >
                  <div className="flex items-center">
                    Patient
                    {sortField === 'patientName' && (
                      sortDirection === 'asc' ? 
                      <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                      <FaSortAmountDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </th>
              )}
              {showDoctor && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
              )}
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center">
                  Amount
                  {sortField === 'total' && (
                    sortDirection === 'asc' ? 
                    <FaSortAmountUp className="ml-1 h-3 w-3" /> : 
                    <FaSortAmountDown className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GST
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.createdAt), 'dd-MM-yyyy')}
                </td>
                {showPatient && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.patientId?.name || 'N/A'}
                  </td>
                )}
                {showDoctor && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.doctorId?.name || 'N/A'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaRupeeSign className="h-3 w-3 mr-1" />
                    {(invoice.total || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaRupeeSign className="h-3 w-3 mr-1" />
                    {((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.paymentStatus)}`}>
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
                  {onDownloadInvoice && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onDownloadInvoice(invoice)}
                      title="Download Invoice"
                    >
                      <FaFilePdf className="h-4 w-4" />
                    </Button>
                  )}
                  {onGenerateGstInvoice && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => onGenerateGstInvoice(invoice)}
                      title="Generate GST Invoice"
                    >
                      <FaFileInvoiceDollar className="h-4 w-4" />
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
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="secondary" size="sm">Previous</Button>
          <Button variant="secondary" size="sm">Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredInvoices.length}</span> of{' '}
              <span className="font-medium">{filteredInvoices.length}</span> results
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
    </div>
  );
};

export default IndianBillingList;
