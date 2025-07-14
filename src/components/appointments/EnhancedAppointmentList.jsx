import React, { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ChartCard from '../dashboard/ChartCard';
import { 
  FaSort, FaSortUp, FaSortDown, FaFilter, FaSearch, 
  FaFileExport, FaPrint, FaEye, FaEdit, FaTrash, 
  FaUserInjured, FaUserMd, FaTooth, FaCalendarCheck,
  FaCalendarAlt, FaTimesCircle, FaCheck, FaClock,
  FaDownload, FaClipboardList, FaExclamationTriangle
} from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { format } from 'date-fns';

const statusColors = {
  'Scheduled': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Confirmed': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Cancelled': 'bg-red-100 text-red-800 border border-red-200',
  'Completed': 'bg-green-100 text-green-800 border border-green-200',
  'No Show': 'bg-orange-100 text-orange-800 border border-orange-200'
};

const statusIcons = {
  'Scheduled': <FaClock className="mr-1.5" />,
  'Confirmed': <FaCalendarCheck className="mr-1.5" />,
  'Cancelled': <FaTimesCircle className="mr-1.5" />,
  'Completed': <FaCheck className="mr-1.5" />,
  'No Show': <FaExclamationTriangle className="mr-1.5" />
};

const EnhancedAppointmentList = ({ 
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(appointment => 
        (appointment.patientId?.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (appointment.doctorId?.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (appointment.serviceType?.toLowerCase().includes(lowerCaseSearchTerm))
      );
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
          aValue = a.patientId?.name || '';
          bValue = b.patientId?.name || '';
        } else if (sortConfig.key === 'doctorName') {
          aValue = a.doctorId?.name || '';
          bValue = b.doctorId?.name || '';
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

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

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
      <ChartCard
        title="Appointment Management"
        actions={
          <div className="flex space-x-2">
            {/* Export CSV */}
            <CSVLink 
              data={filteredAppointments.map(appointment => ({
                'Date': format(new Date(appointment.startTime), 'yyyy-MM-dd'),
                'Time': format(new Date(appointment.startTime), 'HH:mm'),
                'Patient': appointment.patientId?.name || 'Unknown',
                'Doctor': appointment.doctorId?.name || 'Unknown',
                'Service': appointment.serviceType || '',
                'Status': appointment.status || '',
                'Notes': appointment.notes || ''
              }))}
              filename={`appointments-${new Date().toISOString().slice(0, 10)}.csv`}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 shadow-sm"
            >
              <FaDownload className="mr-2" /> Export CSV
            </CSVLink>
            
            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm"
            >
              <FaPrint className="mr-2" /> Print
            </button>
          </div>
        }
      >
        <div className="bg-red-50 p-4 mb-6 rounded-lg border border-red-200 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="danger" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Appointment Management"
      actions={
        <div className="flex space-x-2">
          {/* Export CSV */}
          <CSVLink 
            data={filteredAppointments.map(appointment => ({
              'Date': format(new Date(appointment.startTime), 'yyyy-MM-dd'),
              'Time': format(new Date(appointment.startTime), 'HH:mm'),
              'Patient': appointment.patientId?.name || 'Unknown',
              'Doctor': appointment.doctorId?.name || 'Unknown',
              'Service': appointment.serviceType || '',
              'Status': appointment.status || '',
              'Notes': appointment.notes || ''
            }))}
            filename={`appointments-${new Date().toISOString().slice(0, 10)}.csv`}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 shadow-sm"
          >
            <FaDownload className="mr-2" /> Export CSV
          </CSVLink>
          
          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow-sm"
          >
            <FaPrint className="mr-2" /> Print
          </button>
        </div>
      }
    >
      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search patient, doctor or service"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative inline-block">
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredAppointments.length} appointments found
            </span>
          </div>
        </div>
      </div>
      
      {/* Table */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center p-6">
            <FaCalendarAlt className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No appointments found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('startTime')}
                >
                  <div className="flex items-center">
                    Date {getSortIcon('startTime')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(appointment.startTime), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(appointment.startTime), 'p')} - {format(new Date(appointment.endTime), 'p')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.patientName || 
                       appointment.patientId?.name || 
                       appointment.patient?.name || 
                       (typeof appointment.patientId === 'string' && appointment.patientId ? 
                         <span className="text-blue-600 hover:text-blue-800 cursor-pointer" 
                               title="View patient details" 
                               onClick={() => onView && onView(appointment)}>
                           View Patient
                         </span> : 'Unknown Patient')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.patientPhone || 
                       appointment.patientId?.phone || 
                       appointment.patient?.phone || 
                       'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.doctorName ? 
                        `Dr. ${appointment.doctorName}` : 
                        appointment.doctorId?.name ? 
                          `Dr. ${appointment.doctorId.name}` : 
                          appointment.doctor?.name ? 
                            `Dr. ${appointment.doctor.name}` : 
                            (typeof appointment.doctorId === 'string' && appointment.doctorId ? 
                              <span className="text-blue-600 hover:text-blue-800 cursor-pointer" 
                                    title="View doctor details" 
                                    onClick={() => onView && onView(appointment)}>
                                View Doctor
                              </span> : 'Unknown Doctor')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.specialization || 
                       appointment.doctorId?.specialization || 
                       appointment.doctor?.specialization || 
                       'General'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusIcons[appointment.status]}
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="inline-flex items-center p-1.5 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      
                      {/* Status Update Buttons - Only for Admin and Receptionist */}
                      {['Admin', 'Receptionist'].includes(userRole) && onUpdateStatus && (
                        <>
                          {appointment.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment, 'Completed')}
                              className="inline-flex items-center p-1.5 text-green-600 hover:text-green-900 rounded-full hover:bg-green-50 transition-colors duration-150"
                              title="Mark as Completed"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                          )}
                          
                          {appointment.status === 'Scheduled' && (
                            <button
                              onClick={() => handleStatusUpdate(appointment, 'Confirmed')}
                              className="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50 transition-colors duration-150"
                              title="Confirm Appointment"
                            >
                              <FaCalendarCheck className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Edit Button */}
                      {['Admin', 'Receptionist'].includes(userRole) && onEdit && (
                        <button
                          onClick={() => onEdit(appointment)}
                          className="inline-flex items-center p-1.5 text-yellow-600 hover:text-yellow-900 rounded-full hover:bg-yellow-50 transition-colors duration-150"
                          title="Edit Appointment"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Cancel/Delete Button */}
                      {['Admin', 'Receptionist'].includes(userRole) && (
                        <>
                          {appointment.status !== 'Cancelled' && onUpdateStatus && (
                            <button
                              onClick={() => handleStatusUpdate(appointment, 'Cancelled')}
                              className="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors duration-150"
                              title="Cancel Appointment"
                            >
                              <FaTimesCircle className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(appointment._id)}
                              className="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors duration-150"
                              title="Delete Appointment"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
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
    </ChartCard>
  );
};

export default EnhancedAppointmentList;
