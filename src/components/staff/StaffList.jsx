import React, { useState, useMemo } from 'react';
import { 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendarAlt,
  FaPrint,
  FaSearch,
  FaUser,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';

const StaffList = ({ 
  staff = [], 
  loading = false, 
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onViewStaff,
  onExportData,
  onPrintList,
  totalStaff = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(staff.map(s => s._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-100 text-blue-800';
      case 'Receptionist':
        return 'bg-green-100 text-green-800';
      case 'Nurse':
        return 'bg-purple-100 text-purple-800';
      case 'Lab Technician':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pharmacist':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  // Get sort icon based on current sort state
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-300 ml-1" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="text-blue-500 ml-1" /> : 
      <FaSortDown className="text-blue-500 ml-1" />;
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: '',
      department: '',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Filter staff based on search term and filters
  const filteredStaff = useMemo(() => {
    return staff.filter(staffMember => {
      // Search term filter
      if (searchTerm && !staffMember.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !staffMember.role?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !staffMember.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Role filter
      if (filters.role && staffMember.role !== filters.role) {
        return false;
      }
      
      // Department filter
      if (filters.department && staffMember.department !== filters.department) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && staffMember.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [staff, searchTerm, filters]);
  
  // Handle search form submission (prevent default form submission)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons with Search Bar in single row */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        {/* Left side - Search bar */}
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <FaFilter />
            </button>
          </form>
        </div>

        {/* Right side - all buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex space-x-2">
            <Button
              onClick={() => onExportData('pdf')}
              variant="secondary"
              className="flex items-center text-sm"
              size="sm"
            >
              <FaFilePdf className="mr-1" /> PDF
            </Button>
            <Button
              onClick={() => onExportData('excel')}
              variant="secondary"
              className="flex items-center text-sm"
              size="sm"
            >
              <FaFileExcel className="mr-1" /> Excel
            </Button>
            <Button
              onClick={() => onExportData('csv')}
              variant="secondary"
              className="flex items-center text-sm"
              size="sm"
            >
              <FaFileCsv className="mr-1" /> CSV
            </Button>
            <Button
              onClick={onPrintList}
              variant="secondary"
              className="flex items-center text-sm"
              size="sm"
            >
              <FaPrint className="mr-1" /> Print
            </Button>
          </div>
          
          <Button
            onClick={onAddStaff}
            variant="primary"
            className="flex items-center text-sm ml-2"
          >
            <FaUserPlus className="mr-1" /> Add Staff
          </Button>
          
          {/* Mobile dropdown for export options */}
          <div className="md:hidden ml-2">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const action = e.target.value;
                if (action === 'pdf') onExportData('pdf');
                if (action === 'excel') onExportData('excel');
                if (action === 'csv') onExportData('csv');
                if (action === 'print') onPrintList();
                e.target.value = '';
              }}
            >
              <option value="">Export</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="print">Print</option>
            </select>
          </div>
        </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Staff">Staff</option>
                <option value="Nurse">Nurse</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Pharmacist">Pharmacist</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Date Added</option>
                  <option value="name">Name</option>
                  <option value="role">Role</option>
                  <option value="department">Department</option>
                  <option value="joinedDate">Joined Date</option>
                </select>
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-500 hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center focus:outline-none" 
                  onClick={() => handleSort('name')}
                >
                  Staff {getSortIcon('name')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center focus:outline-none" 
                  onClick={() => handleSort('role')}
                >
                  Role {getSortIcon('role')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center focus:outline-none" 
                  onClick={() => handleSort('department')}
                >
                  Department {getSortIcon('department')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center focus:outline-none" 
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center focus:outline-none" 
                  onClick={() => handleSort('joinedDate')}
                >
                  Joined Date {getSortIcon('joinedDate')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No staff members found
                </td>
              </tr>
            ) : (
              filteredStaff.map((staffMember) => (
                <tr key={staffMember._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(staffMember._id)}
                      onChange={() => handleSelectRow(staffMember._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {staffMember.role === 'Doctor' ? (
                          <FaUserMd className="text-blue-500" />
                        ) : (
                          <FaUser className="text-blue-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {staffMember.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {staffMember.specialization || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staffMember.role)}`}>
                      {staffMember.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaBuilding className="text-gray-400 mr-2" />
                      {staffMember.department || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      {staffMember.email}
                    </div>
                    {staffMember.phone && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FaPhone className="text-gray-400 mr-2" />
                        {staffMember.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(staffMember.status)}`}>
                      {staffMember.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      {formatDate(staffMember.joinedDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onViewStaff(staffMember)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => onEditStaff(staffMember)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteStaff(staffMember)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete"
                      >
                        <FaTrash size={16} />
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
      {!loading && filteredStaff.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between mt-4">
          <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
            <span>Showing </span>
            <select
              className="mx-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span> of {totalStaff || 0} staff members</span>
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

export default StaffList;
