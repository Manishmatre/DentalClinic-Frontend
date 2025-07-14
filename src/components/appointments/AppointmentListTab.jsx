import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  FaFilter, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaPrint 
} from 'react-icons/fa';

const AppointmentListTab = ({
  appointments,
  onViewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  doctors,
  patients,
  filterDoctor,
  setFilterDoctor,
  filterStatus,
  setFilterStatus
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleViewAppointment = (appointment) => {
    if (onViewAppointment) {
      onViewAppointment(appointment);
    }
  };

  const handleEditAppointment = (appointment) => {
    if (onEditAppointment) {
      onEditAppointment(appointment);
    }
  };

  const handleDeleteAppointment = (appointment) => {
    if (onDeleteAppointment) {
      onDeleteAppointment(appointment);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterAppointments = () => {
    if (!appointments || !Array.isArray(appointments)) {
      console.warn('No appointments array provided or invalid format');
      return [];
    }
    
    let filteredAppointments = [...appointments];
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredAppointments = filteredAppointments.filter(appointment => {
        // Handle different property formats from API
        const patientName = appointment.patientName || 
          (appointment.patient?.name) || 
          (appointment.patient?.firstName && appointment.patient?.lastName ? 
            `${appointment.patient.firstName} ${appointment.patient.lastName}` : '') || '';
            
        const doctorName = appointment.doctorName || 
          (appointment.doctor?.name) || 
          (appointment.doctor?.firstName && appointment.doctor?.lastName ? 
            `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '') || '';
            
        const reason = appointment.reason || '';
        const serviceType = appointment.serviceType || '';
        
        return (
          patientName.toLowerCase().includes(searchLower) ||
          doctorName.toLowerCase().includes(searchLower) ||
          reason.toLowerCase().includes(searchLower) ||
          serviceType.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply doctor filter
    if (filterDoctor && filterDoctor !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDoctorId = appointment.doctorId || 
          (appointment.doctor?._id) || 
          (appointment.doctor?.id);
        return appointmentDoctorId === filterDoctor;
      });
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment => {
        // Normalize status case for comparison
        const appointmentStatus = appointment.status?.toLowerCase() || '';
        return appointmentStatus === filterStatus.toLowerCase();
      });
    }
    
    // Apply sorting
    filteredAppointments.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          // Handle different date formats
          const dateA = a.startTime || a.date || new Date();
          const dateB = b.startTime || b.date || new Date();
          comparison = new Date(dateA) - new Date(dateB);
          break;
        case 'patientName':
          const patientNameA = a.patientName || 
            (a.patient?.name) || 
            (a.patient?.firstName && a.patient?.lastName ? 
              `${a.patient.firstName} ${a.patient.lastName}` : '') || '';
          const patientNameB = b.patientName || 
            (b.patient?.name) || 
            (b.patient?.firstName && b.patient?.lastName ? 
              `${b.patient.firstName} ${b.patient.lastName}` : '') || '';
          comparison = patientNameA.localeCompare(patientNameB);
          break;
        case 'doctorName':
          const doctorNameA = a.doctorName || 
            (a.doctor?.name) || 
            (a.doctor?.firstName && a.doctor?.lastName ? 
              `${a.doctor.firstName} ${a.doctor.lastName}` : '') || '';
          const doctorNameB = b.doctorName || 
            (b.doctor?.name) || 
            (b.doctor?.firstName && b.doctor?.lastName ? 
              `${b.doctor.firstName} ${b.doctor.lastName}` : '') || '';
          comparison = doctorNameA.localeCompare(doctorNameB);
          break;
        case 'status':
          const statusA = a.status || '';
          const statusB = b.status || '';
          comparison = statusA.localeCompare(statusB);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filteredAppointments;
  };

  const filteredAppointments = filterAppointments();
  
  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header and Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-lg font-medium text-gray-900">Appointment List</h3>
          <p className="text-sm text-gray-600">View and manage all appointments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <Button
            variant="outline"
            onClick={toggleFilters}
            className="flex items-center"
          >
            <FaFilter className="mr-2" /> Filters
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              className="p-2"
              title="Export as PDF"
            >
              <FaFilePdf />
            </Button>
            <Button
              variant="outline"
              className="p-2"
              title="Export as Excel"
            >
              <FaFileExcel />
            </Button>
            <Button
              variant="outline"
              className="p-2"
              title="Export as CSV"
            >
              <FaFileCsv />
            </Button>
            <Button
              variant="outline"
              className="p-2"
              title="Print"
            >
              <FaPrint />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="this-month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Appointment List */}
      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date & Time
                  {sortField === 'date' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('patientName')}
                >
                  Patient
                  {sortField === 'patientName' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('doctorName')}
                >
                  Doctor
                  {sortField === 'doctorName' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.length > 0 ? (
                paginatedAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()}{' '}
                      {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAppointment(appointment)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAppointments.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAppointments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppointmentListTab;
