import React, { useState, useEffect, useMemo } from 'react';
import { formatDate, formatTime, formatDateTime } from '../../utils/dateUtils';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';
import { 
  FaSort, FaSortUp, FaSortDown, FaFilter, FaSearch, 
  FaFileExport, FaPrint, FaEye, FaEdit, FaTrash, 
  FaCalendarAlt, FaUser, FaUserMd, FaClock, FaInfoCircle,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle
} from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_BADGE_CLASSES } from '../../constants/appointmentConstants';
import serviceService from '../../api/services/serviceService';
import treatmentService from '../../api/treatments';

// Helper function to get status badge variant
const getStatusVariant = (status) => {
  switch (status) {
    case APPOINTMENT_STATUS.SCHEDULED:
      return 'primary';
    case APPOINTMENT_STATUS.CONFIRMED:
      return 'success';
    case APPOINTMENT_STATUS.CANCELLED:
      return 'danger';
    case APPOINTMENT_STATUS.COMPLETED:
      return 'info';
    case APPOINTMENT_STATUS.NO_SHOW:
      return 'warning';
    default:
      return 'secondary';
  }
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case APPOINTMENT_STATUS.SCHEDULED:
      return <FaCalendarAlt className="text-blue-500" />;
    case APPOINTMENT_STATUS.CONFIRMED:
      return <FaCheckCircle className="text-green-500" />;
    case APPOINTMENT_STATUS.CANCELLED:
      return <FaTimesCircle className="text-red-500" />;
    case APPOINTMENT_STATUS.COMPLETED:
      return <FaCheckCircle className="text-purple-500" />;
    case APPOINTMENT_STATUS.NO_SHOW:
      return <FaExclamationCircle className="text-orange-500" />;
    default:
      return <FaInfoCircle className="text-gray-500" />;
  }
};

const AppointmentList = ({ 
  appointments = [], 
  onView,
  onEdit, 
  onDelete,
  onUpdateStatus,
  isLoading = false,
  error = null,
  userRole = 'Admin'
}) => {
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(appointments.length > 0 ? appointments.length : 1000);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [serviceMap, setServiceMap] = useState({});

  useEffect(() => {
    // Fetch all treatments and build a map of ID to name
    const fetchTreatments = async () => {
      const result = await treatmentService.getTreatments();
      const treatments = Array.isArray(result.data) ? result.data : [];
      const map = {};
      treatments.forEach(t => { map[t._id] = t.name; });
      setServiceMap(map);
    };
    fetchTreatments();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...appointments];
    
    console.log('Processing appointments for list view:', result);
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(appointment => {
        // Get patient name from different possible structures
        const patientName = 
          (appointment.patientId && typeof appointment.patientId === 'object' && ((appointment.patientId.firstName ? appointment.patientId.firstName + ' ' : '') + (appointment.patientId.lastName || appointment.patientId.name || ''))) ||
          (appointment.patient && appointment.patient.name) ||
          (appointment.patient && appointment.patient.fullName) ||
          appointment.patientName ||
          '';
        
        // Get doctor name from different possible structures
        const doctorName = 
          (appointment.doctorId && typeof appointment.doctorId === 'object' && ((appointment.doctorId.firstName ? appointment.doctorId.firstName + ' ' : '') + (appointment.doctorId.lastName || appointment.doctorId.name || ''))) ||
          (appointment.doctor && appointment.doctor.name) ||
          (appointment.doctor && appointment.doctor.fullName) ||
          appointment.doctorName ||
          '';
        
        // Get service type
        const serviceType = appointment.serviceType || '';
        
        return (
          patientName.toLowerCase().includes(lowerCaseSearchTerm) ||
          doctorName.toLowerCase().includes(lowerCaseSearchTerm) ||
          serviceType.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(appointment => appointment.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        // Handle nested properties
        if (sortConfig.key === 'patientName') {
          // Get patient name from different possible structures
          aValue = (a.patientId && typeof a.patientId === 'object' && a.patientId.name) ||
            (a.patient && a.patient.name) ||
            (a.patient && a.patient.fullName) ||
            a.patientName || '';
          
          bValue = (b.patientId && typeof b.patientId === 'object' && b.patientId.name) ||
            (b.patient && b.patient.name) ||
            (b.patient && b.patient.fullName) ||
            b.patientName || '';
        } else if (sortConfig.key === 'doctorName') {
          // Get doctor name from different possible structures
          aValue = (a.doctorId && typeof a.doctorId === 'object' && a.doctorId.name) ||
            (a.doctor && a.doctor.name) ||
            (a.doctor && a.doctor.fullName) ||
            a.doctorName || '';
          
          bValue = (b.doctorId && typeof b.doctorId === 'object' && b.doctorId.name) ||
            (b.doctor && b.doctor.name) ||
            (b.doctor && b.doctor.fullName) ||
            b.doctorName || '';
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        // Handle date comparison
        if (sortConfig.key === 'startTime' || sortConfig.key === 'endTime') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredAppointments(result);
  }, [appointments, searchTerm, statusFilter, sortConfig]);

  // Update itemsPerPage if appointments change and 'Show All' is selected
  useEffect(() => {
    if (itemsPerPage === -1) {
      setItemsPerPage(appointments.length > 0 ? appointments.length : 1000);
    }
  }, [appointments]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itemsPerPage === -1 ? filteredAppointments : filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredAppointments.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-1 text-indigo-500" /> : 
      <FaSortDown className="ml-1 text-indigo-500" />;
  };

  // Handle appointment view
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Handle status update
  const handleStatusUpdate = async (appointment, newStatus) => {
    if (!appointment || !appointment._id) {
      toast.error('Invalid appointment data');
      return;
    }
    
    if (onUpdateStatus) {
      try {
        toast.info(`Updating appointment status to ${newStatus}...`);
        
        // Create updated appointment data
        const updatedAppointment = {
          ...appointment,
          status: newStatus
        };
        
        await onUpdateStatus(updatedAppointment);
        toast.success(`Appointment status updated to ${newStatus}`);
      } catch (err) {
        console.error('Error updating appointment status:', err);
        toast.error('Failed to update appointment status: ' + (err.message || 'Unknown error'));
      }
    } else {
      console.warn('No onUpdateStatus handler provided');
    }
  };

  // Prepare data for CSV export
  const csvData = filteredAppointments.map(appointment => ({
    Date: formatDate(appointment.startTime),
    'Start Time': formatTime(appointment.startTime),
    'End Time': formatTime(appointment.endTime),
    Patient: appointment.patientId?.name || 'N/A',
    Doctor: appointment.doctorId?.name || 'N/A',
    Service: appointment.serviceType,
    Status: appointment.status,
    Notes: appointment.notes || ''
  }));

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <p className="font-medium">Error loading appointments</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters and Actions */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
        
        <div className="flex space-x-2 items-center">
          {/* Items per page dropdown */}
          <label htmlFor="itemsPerPage" className="text-xs text-gray-500 mr-1">Rows per page:</label>
          <select
            id="itemsPerPage"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={itemsPerPage === -1 ? '-1' : itemsPerPage}
            onChange={e => {
              const val = e.target.value === '-1' ? -1 : parseInt(e.target.value, 10);
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>Show All</option>
          </select>
          
          <CSVLink 
            data={csvData} 
            filename="appointments.csv"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaFileExport className="mr-2" /> Export
          </CSVLink>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<FaPrint />}
          >
            Print
          </Button>
        </div>
      </div>
      
      {/* Table */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('startTime')}
                >
                  <div className="flex items-center">
                    <span>Date & Time</span>
                    {getSortIcon('startTime')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('patientName')}
                >
                  <div className="flex items-center">
                    Patient {getSortIcon('patientName')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('doctorName')}
                >
                  <div className="flex items-center">
                    Doctor {getSortIcon('doctorName')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('serviceType')}
                >
                  <div className="flex items-center">
                    Service {getSortIcon('serviceType')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <FaCalendarAlt className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.startTime instanceof Date && !isNaN(appointment.startTime.getTime())
                            ? formatDate(appointment.startTime)
                            : 'N/A'}
                          {' '}
                          {appointment.startTime instanceof Date && !isNaN(appointment.startTime.getTime()) && appointment.endTime instanceof Date && !isNaN(appointment.endTime.getTime())
                            ? `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`
                            : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.createdAt instanceof Date && !isNaN(appointment.createdAt.getTime())
                            ? formatDateTime(appointment.createdAt)
                            : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <FaUser className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <Tooltip content={`Patient ID: ${appointment.patientId?._id || appointment.patient?._id || 'Unknown'}`}>
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
  {(appointment.patientId && typeof appointment.patientId === 'object')
    ? `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || appointment.patientId.name || ''}`.trim()
    : (appointment.patient && appointment.patient.name) || (appointment.patient && appointment.patient.fullName) || appointment.patientName || 'N/A'}
</div>
                        </Tooltip>
                        <div className="text-xs text-gray-500">
                          {appointment.patientId?.email ? (
                            <a href={`mailto:${appointment.patientId.email}`} className="hover:text-blue-500">
                              {appointment.patientId.email}
                            </a>
                          ) : 'No email'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.patientId?.phone ? (
                            <a href={`tel:${appointment.patientId.phone}`} className="hover:text-blue-500">
                              {appointment.patientId.phone}
                            </a>
                          ) : 'No phone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <FaUserMd className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <Tooltip content={`Doctor ID: ${appointment.doctorId?._id || appointment.doctor?._id || 'Unknown'}`}>
                          <div className="text-sm font-medium text-gray-900 hover:text-indigo-600">
  Dr. {(appointment.doctorId && typeof appointment.doctorId === 'object')
    ? `${appointment.doctorId.firstName || ''} ${appointment.doctorId.lastName || appointment.doctorId.name || ''}`.trim()
    : (appointment.doctor && appointment.doctor.name) || (appointment.doctor && appointment.doctor.fullName) || appointment.doctorName || 'N/A'}
</div>
                        </Tooltip>
                        <div className="text-xs text-gray-500">
                          {appointment.doctorId?.specialization || 'General'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.doctorId?.email ? (
                            <a href={`mailto:${appointment.doctorId.email}`} className="hover:text-indigo-500">
                              {appointment.doctorId.email}
                            </a>
                          ) : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {serviceMap[appointment.serviceType] || appointment.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      text={appointment.status}
                      variant={getStatusVariant(appointment.status)}
                      icon={getStatusIcon(appointment.status)}
                      pill
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onView(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                        title="View Appointment"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(appointment)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center"
                        title="Edit Appointment"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(appointment)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                        title="Delete Appointment"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredAppointments.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAppointments.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === number + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          appointment={selectedAppointment}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default AppointmentList;
