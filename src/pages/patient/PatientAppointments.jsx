import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import appointmentService from '../../api/appointments/appointmentService';
import doctorService from '../../api/staff/doctorService';
import { medicalServicesData, getFlattenedServices } from '../../data/medicalServices';
import { formatDate } from '../../utils/dateUtils';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { FaCalendarAlt, FaList, FaPlus, FaHistory, FaSearch } from 'react-icons/fa';

const PatientAppointments = ({ view = 'upcoming' }) => {
  const navigate = useNavigate();
  const { user, clinic } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeView, setActiveView] = useState(view); // 'upcoming', 'calendar', 'history'
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the imported medical services data
  const flattenedServices = getFlattenedServices();

  // Fetch patient's appointments and available doctors
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get clinic ID
      let clinicId = clinic?._id;
      
      // If clinic ID is not available from context, try to get it from localStorage
      if (!clinicId) {
        clinicId = localStorage.getItem('defaultClinicId');
        
        if (!clinicId) {
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const userData = JSON.parse(userStr);
              if (userData && userData.clinic && userData.clinic._id) {
                clinicId = userData.clinic._id;
              }
            }
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
          }
          
          if (!clinicId) {
            setError('Missing clinic information. Please try again or contact support.');
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Build filter params
      const params = { 
        clinicId,
        patientId: user._id 
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Fetch all data in parallel for efficiency
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        appointmentService.getAppointments(params),
        doctorService.getDoctors({ clinicId })
      ]);
      
      // Process appointments data
      const formattedAppointments = Array.isArray(appointmentsResponse) 
        ? appointmentsResponse 
        : [];
      
      setAppointments(formattedAppointments);
      setDoctors(doctorsResponse || []);
      
      // Separate upcoming and past appointments
      const now = new Date();
      const upcoming = formattedAppointments.filter(
        apt => new Date(apt.startTime) >= now || apt.status === 'Scheduled' || apt.status === 'Confirmed'
      );
      
      const past = formattedAppointments.filter(
        apt => new Date(apt.startTime) < now || apt.status === 'Completed' || apt.status === 'Cancelled' || apt.status === 'No Show'
      );
      
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
      
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filterStatus, searchTerm]);

  // Set active view based on prop when component mounts
  useEffect(() => {
    if (view === 'book') {
      setSelectedAppointment(null);
      setShowAppointmentForm(true);
    } else if (view === 'history') {
      setActiveView('history');
    } else {
      setActiveView('upcoming');
    }
  }, [view]);

  // Handle booking a new appointment
  const handleBookAppointment = async (appointmentData) => {
    try {
      setIsLoading(true);
      
      // Ensure clinicId is set
      if (!appointmentData.clinicId && clinic?._id) {
        appointmentData.clinicId = clinic._id;
      }
      
      // Ensure patientId is set - this is critical for patient portal
      if (!appointmentData.patientId && user?._id) {
        appointmentData.patientId = user._id;
        console.log('Setting patient ID from user context:', user._id);
      }
      
      console.log('Final appointment data being sent to API:', appointmentData);
      
      // Create appointment
      await appointmentService.createAppointment(appointmentData);
      
      // Show success message
      toast.success('Appointment booked successfully!');
      
      // Close form
      setShowAppointmentForm(false);
      
      // Refresh data
      fetchData();
      
      // Navigate to appointments list
      navigate('/patient/appointments');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating an appointment
  const handleUpdateAppointment = async (appointmentData) => {
    try {
      setIsLoading(true);
      
      // Update appointment
      await appointmentService.updateAppointment(selectedAppointment._id, appointmentData);
      
      // Show success message
      toast.success('Appointment updated successfully!');
      
      // Close form
      setShowAppointmentForm(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancelling an appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update appointment status to cancelled
      await appointmentService.updateAppointment(appointmentId, { status: 'Cancelled' });
      
      // Show success message
      toast.success('Appointment cancelled successfully');
      
      // Close details modal if open
      setShowDetailsModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Helper function to get status class for the badge
  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'No Show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render upcoming appointments
  const renderUpcomingAppointments = () => {
    return (
      <div>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have any upcoming appointments.</p>
            <Link to="/patient/appointments/book">
              <Button variant="primary">Book New Appointment</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatDate(appointment.startTime)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.doctorId?.name || 'Dr. ' + appointment.doctor?.name || 'Unknown Doctor'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.serviceType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      {appointment.status === 'Scheduled' && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAppointmentForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Reschedule
                        </button>
                      )}
                      {['Scheduled', 'Confirmed'].includes(appointment.status) && (
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render past appointments
  const renderPastAppointments = () => {
    return (
      <div>
        {pastAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You don't have any past appointments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatDate(appointment.startTime)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.doctorId?.name || 'Dr. ' + appointment.doctor?.name || 'Unknown Doctor'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.serviceType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="My Appointments"
        description="View and manage your appointments"
        icon={<FaCalendarAlt className="text-indigo-600" />}
      />
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* View Toggle */}
        <div className="inline-flex rounded-md shadow-sm">
          <Link to="/patient/appointments">
            <Button
              type="button"
              variant={activeView === 'upcoming' ? 'primary' : 'secondary'}
              className="rounded-l-md"
            >
              <FaList className="mr-2" /> Upcoming
            </Button>
          </Link>
          <Button
            onClick={() => setActiveView('calendar')}
            variant={activeView === 'calendar' ? 'primary' : 'secondary'}
            className="border-l-0"
          >
            <FaCalendarAlt className="mr-2" /> Calendar
          </Button>
          <Link to="/patient/appointments/history">
            <Button
              type="button"
              variant={activeView === 'history' ? 'primary' : 'secondary'}
              className="rounded-r-md"
            >
              <FaHistory className="mr-2" /> History
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Book New Appointment Button */}
          <Link to="/patient/appointments/book">
            <Button
              type="button"
              variant="success"
              className="flex items-center"
            >
              <FaPlus className="mr-2" /> Book Appointment
            </Button>
          </Link>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search appointments"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {/* Status Filter */}
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <Card>
            {activeView === 'upcoming' && renderUpcomingAppointments()}
            
            {activeView === 'calendar' && (
              <AppointmentCalendar
                appointments={appointments}
                onSelectAppointment={handleViewAppointment}
                onCreateAppointment={() => {
                  setSelectedAppointment(null);
                  setShowAppointmentForm(true);
                }}
                userRole="Patient"
                patientId={user._id}
                clinicId={clinic?._id}
              />
            )}
            
            {activeView === 'history' && renderPastAppointments()}
          </Card>
        )}
      </div>
      
      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          appointment={selectedAppointment}
          onEdit={(appointment) => {
            setShowDetailsModal(false);
            setSelectedAppointment(appointment);
            setShowAppointmentForm(true);
          }}
          onDelete={handleCancelAppointment}
          onUpdateStatus={() => {}} // Patients can't update status
          userRole="Patient"
        />
      )}
      
      {/* Appointment Form Modal */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        title={selectedAppointment ? "Reschedule Appointment" : "Book New Appointment"}
        size="lg"
      >
        <AppointmentForm
          onSubmit={selectedAppointment ? handleUpdateAppointment : handleBookAppointment}
          initialData={selectedAppointment}
          onClose={() => setShowAppointmentForm(false)}
          clinicId={clinic?._id}
          doctors={doctors}
          patientId={user._id}
        />
      </Modal>
    </div>
  );
};

export default PatientAppointments;
