import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import { toast } from 'react-toastify';

const PayrollList = ({
  payrolls = [],
  loading = false,
  onAddPayroll,
  onEditPayroll,
  onDeletePayroll,
  totalPayrolls = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-300 ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500 ml-1" /> : <FaSortDown className="text-blue-500 ml-1" />;
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ month: '', year: '', status: 'all', sortBy: 'createdAt', sortOrder: 'desc' });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Filter payrolls based on search term and filters
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(payroll => {
      // Search term filter
      if (searchTerm && !payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Month filter
      if (filters.month && payroll.month !== filters.month) {
        return false;
      }
      // Year filter
      if (filters.year && payroll.year !== filters.year) {
        return false;
      }
      // Status filter
      if (filters.status !== 'all' && payroll.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [payrolls, searchTerm, filters]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons with Search Bar */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        {/* Search bar */}
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employee..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <FaFilter />
            </button>
          </form>
        </div>
        {/* Add Payroll Button */}
        <Button
          onClick={onAddPayroll}
          variant="primary"
          className="flex items-center text-sm ml-2"
        >
          <FaPlus className="mr-1" /> Add Payroll
        </Button>
      </div>
      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <Button
              onClick={resetFilters}
              variant="secondary"
              size="sm"
              className="flex items-center text-sm"
            >
              <FaFilter className="mr-1" /> Remove Filters
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Months</option>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Processed">Processed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="createdAt">Date Processed</option>
                  <option value="employeeName">Employee Name</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-500 hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payroll Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none" onClick={() => handleSort('employeeName')}>
                  Employee {getSortIcon('employeeName')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none" onClick={() => handleSort('month')}>
                  Month {getSortIcon('month')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none" onClick={() => handleSort('year')}>
                  Year {getSortIcon('year')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none" onClick={() => handleSort('amount')}>
                  Amount {getSortIcon('amount')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none" onClick={() => handleSort('status')}>
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredPayrolls.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No payroll records found
                </td>
              </tr>
            ) : (
              filteredPayrolls.map((payroll) => (
                <tr key={payroll._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payroll.employeeName}</div>
                    <div className="text-xs text-gray-500">{payroll.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payroll.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payroll.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payroll.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payroll.status === 'Processed' ? 'bg-green-100 text-green-800' : payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onEditPayroll(payroll)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                        title="Edit Payroll"
                      >
                        <FaEdit size={16} />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => onDeletePayroll(payroll)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                        title="Delete Payroll"
                      >
                        <FaTrash size={16} />
                        <span className="ml-1 hidden sm:inline">Delete</span>
                      </button>
                      <button
                        onClick={() => {}}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center"
                        title="View Payroll"
                      >
                        <FaEye size={16} />
                        <span className="ml-1 hidden sm:inline">View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {!loading && filteredPayrolls.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between mt-4">
          <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
            <span>Showing </span>
            <select
              className="mx-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span> of {totalPayrolls || 0} payroll records</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PayrollList; 