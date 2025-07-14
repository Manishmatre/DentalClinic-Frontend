import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FaUserPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSortAmountUp,
  FaSortAmountDown,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrint,
  FaUserInjured,
  FaHeartbeat,
  FaAllergies,
  FaVial,
  FaWeight,
  FaRulerVertical,
  FaUser,
  FaTint,
  FaBirthdayCake,
  FaVenusMars
} from 'react-icons/fa';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';

const PatientList = ({ 
  patients = [], 
  loading = false, 
  onEditPatient,
  onDeletePatient,
  onViewPatient,
  onExportData,
  onPrintList,
  onStatusChange,
  totalPatients = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    ageGroup: '',
    bloodGroup: '',
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
      setSelectedRows(patients.map(p => p._id));
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

  const getGenderColor = (gender) => {
    switch (gender) {
      case 'Male':
        return 'bg-blue-100 text-blue-800';
      case 'Female':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get profile image URL with fallbacks (cloud URL, legacy fields, etc.)
  const getProfileImageUrl = (patient) => {
    if (!patient) return null;
    if (patient.profileImage && patient.profileImage.url) return patient.profileImage.url;
    if (patient.profileImageUrl) return patient.profileImageUrl;
    if (patient.profileImageURL) return patient.profileImageURL;
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
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
      gender: '',
      ageGroup: '',
      bloodGroup: '',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Filter patients based on search term and filters
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Search term filter
      const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`;
      if (searchTerm && 
          !patientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Gender filter
      if (filters.gender && patient.gender !== filters.gender) {
        return false;
      }
      
      // Blood group filter
      if (filters.bloodGroup && patient.bloodGroup !== filters.bloodGroup) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && patient.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [patients, searchTerm, filters]);
  
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
                placeholder="Search patients..."
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
            onClick={() => navigate('/admin/patients/add')}
            variant="primary"
            className="flex items-center text-sm ml-2"
          >
            <FaUserPlus className="mr-1" /> Add Patient
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex items-center">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="dateOfBirth">Date of Birth</option>
                  <option value="createdAt">Registration Date</option>
                </select>
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="px-3 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                    Patient {getSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => handleSort('gender')}
                  >
                    Gender {getSortIcon('gender')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => handleSort('bloodGroup')}
                  >
                    Blood Group {getSortIcon('bloodGroup')}
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
                    onClick={() => handleSort('dateOfBirth')}
                  >
                    Date of Birth {getSortIcon('dateOfBirth')}
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
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`;
                  return (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(patient._id)}
                          onChange={() => handleSelectRow(patient._id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            {getProfileImageUrl(patient) ? (
                              <img
                                src={getProfileImageUrl(patient)}
                                alt={patientName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Hide broken image and show fallback icon container
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="h-full w-full bg-indigo-100 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-5 w-5 text-indigo-500"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm89.6 32h-11.2c-22 10.5-46.7 16-72.4 16s-50.4-5.5-72.4-16h-11.2C66 288 0 354 0 438.4V480c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32v-41.6c0-84.4-66-150.4-146.4-150.4z"/></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaUserInjured className="text-indigo-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/admin/patients/${patient._id}`)}>
                              {patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.patientId || 'No ID'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderColor(patient.gender)}`}>
                          {patient.gender || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaTint className="text-red-500 mr-2" />
                          {patient.bloodGroup || 'Not recorded'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          {patient.email || 'No email'}
                        </div>
                        {patient.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FaPhone className="text-gray-400 mr-2" />
                            {patient.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {onStatusChange ? (
                          <div className="relative inline-block">
                            <select
                              className={`appearance-none px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)} border border-transparent hover:border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                              value={patient.status}
                              onChange={(e) => onStatusChange(patient._id, e.target.value)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
                              <svg className="h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                            {patient.status || 'Unknown'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaBirthdayCake className="text-gray-400 mr-2" />
                          {formatDate(patient.dateOfBirth)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => onViewPatient(patient)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center"
                            title="View Details"
                          >
                            <FaEye size={16} />
                            <span className="ml-1 hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => onEditPatient(patient)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                            title="Edit Patient"
                          >
                            <FaEdit size={16} />
                            <span className="ml-1 hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => onDeletePatient(patient)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                            title="Delete Patient"
                          >
                            <FaTrash size={16} />
                            <span className="ml-1 hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between mt-4">
          <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
            <span>Showing </span>
            <select
              className="mx-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span> of {totalPatients} patients</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis between non-consecutive pages
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <span className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500">
                          ...
                        </span>
                      )}
                      <Button
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  );
                })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;