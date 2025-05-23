import React, { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import Button from '../ui/Button';
import { FaSort, FaSortUp, FaSortDown, FaFilter, FaSearch, FaFileExport, FaPrint, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { format } from 'date-fns';

const statusColors = {
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Confirmed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'No Show': 'bg-orange-100 text-orange-800'
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
        
        <div className="flex space-x-2">
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
                      {appointment.patientId?.name || 
                       (typeof appointment.patientId === 'string' ? 'Patient ID: ' + appointment.patientId.substring(0, 8) + '...' : '') ||
                       appointment.patientName || 
                       (appointment.patient?.name) || 
                       'Unknown Patient'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.patientId?.phone || 
                       appointment.patient?.phone || 
                       appointment.patientPhone || 
                       'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Dr. {appointment.doctorId?.name || 
                          (typeof appointment.doctorId === 'string' ? 'Doctor ID: ' + appointment.doctorId.substring(0, 8) + '...' : '') ||
                          appointment.doctorName || 
                          (appointment.doctor?.name) || 
                          'Unknown Doctor'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.doctorId?.specialization || 
                       appointment.doctor?.specialization || 
                       appointment.specialization || 
                       'General'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleViewAppointment(appointment)}
                        icon={<FaEye />}
                      >
                        View
                      </Button>
                      {['Admin', 'Receptionist'].includes(userRole) && onEdit && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onEdit(appointment)}
                          icon={<FaEdit />}
                        >
                          Edit
                        </Button>
                      )}
                      {['Admin', 'Receptionist'].includes(userRole) && onDelete && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleDelete(appointment._id)}
                          icon={<FaTrash />}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
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
    </div>
  );
};

export default EnhancedAppointmentList;
