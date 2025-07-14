import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import EnhancedAppointmentList from '../../components/appointments/EnhancedAppointmentList';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { FaCalendarAlt, FaList, FaClipboardList, FaUserClock, FaNotesMedical, FaPlus } from 'react-icons/fa';
import appointmentService from '../../api/appointments/appointmentService';
import patientService from '../../api/patients/patientService';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const DoctorAppointmentManagement = ({ view = 'calendar' }) => {
  const { user, clinic } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [activeView, setActiveView] = useState(view); // 'calendar', 'list', 'today', or 'notes'
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState({});

  // Fetch doctor's appointments and related data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have a valid auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Get clinic ID
      let clinicId = clinic?._id;
      
      // If clinic ID is not available from context, try to get it from localStorage
      if (!clinicId) {
        clinicId = localStorage.getItem('defaultClinicId');
        if (!clinicId) {
          setError('Missing clinic information. Please try again.');
          setIsLoading(false);
          return;
        }
      }
      
      // Build filter params
      const params = { 
        clinicId,
        doctorId: user._id 
      };
      
      console.log('Fetching appointments with params:', params);
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Fetch data based on active view
      if (activeView === 'notes') {
        // For the medical notes view, fetch appointments with completed status
        params.status = 'Completed';
        const completedAppointments = await appointmentService.getAppointments(params);
        setAppointments(completedAppointments);
        
        // Fetch patients for the doctor
        const patientsData = await patientService.getPatients({ clinicId });
        setPatients(patientsData);
      } else {
        // For calendar and list views, fetch all appointments with filters
        // Fetch all data in parallel for efficiency
        const [appointmentsResponse, patientsResponse] = await Promise.all([
          appointmentService.getAppointments(params),
          patientService.getPatients({ clinicId })
        ]);
        
        // Process appointments data
        const formattedAppointments = Array.isArray(appointmentsResponse) 
          ? appointmentsResponse 
          : (appointmentsResponse.data || []);
        
        // Format dates and add titles
        const processedAppointments = formattedAppointments.map(appointment => ({
          ...appointment,
          startTime: new Date(appointment.startTime),
          endTime: new Date(appointment.endTime),
          title: `${appointment.patientName || 'Patient'} - ${appointment.serviceName || appointment.serviceType || 'Appointment'}`
        }));
        
        setAppointments(processedAppointments);
        setPatients(patientsResponse);
        
        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysApts = processedAppointments.filter(apt => {
          const aptDate = new Date(apt.startTime);
          return aptDate >= today && aptDate < tomorrow;
        });
        
        // Sort by time
        todaysApts.sort((a, b) => a.startTime - b.startTime);
        setTodayAppointments(todaysApts);
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      setError('Failed to load appointment data. ' + (error.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount, when filters change, or when view changes
  useEffect(() => {
    fetchData();
  }, [filterStatus, activeView, user._id]);

  // Handle updating appointment status
  const handleUpdateAppointmentStatus = async (appointmentData) => {
    try {
      const response = await appointmentService.updateAppointment(
        appointmentData._id,
        appointmentData
      );
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === appointmentData._id ? response.data : apt
      ));
      
      // Show success message
      toast.success(`Appointment ${appointmentData.notes ? 'notes' : 'status'} updated successfully`);
      
      // Close modal if open
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error('Failed to update appointment');
    }
  };
  
  // Handle viewing appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };
  
  // Handle creating a new appointment
  const handleCreateAppointment = async (appointmentData) => {
    try {
      // Add doctor ID to the appointment data
      const newAppointmentData = {
        ...appointmentData,
        doctorId: user._id,
        clinicId: clinic?._id || localStorage.getItem('defaultClinicId')
      };
      
      const response = await appointmentService.createAppointment(newAppointmentData);
      
      // Update local state
      setAppointments([...appointments, response.data]);
      
      // Show success message
      toast.success('Appointment created successfully');
      
      // Close form modal
      setShowAppointmentForm(false);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast.error('Failed to create appointment: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Handle updating an appointment
  const handleUpdateAppointment = async (appointmentData) => {
    try {
      const response = await appointmentService.updateAppointment(
        appointmentData._id,
        appointmentData
      );
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === appointmentData._id ? response.data : apt
      ));
      
      // Show success message
      toast.success('Appointment updated successfully');
      
      // Close form modal
      setShowAppointmentForm(false);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error('Failed to update appointment: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Handle deleting an appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.deleteAppointment(appointmentId);
      
      // Update local state
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
      
      // Show success message
      toast.success('Appointment deleted successfully');
      
      // Close modals if open
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error('Failed to delete appointment: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Render today's appointments
  const renderTodayAppointments = () => {
    return (
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaUserClock className="mr-2 text-indigo-600" /> Today's Schedule - {formatDate(new Date())}
        </h3>
        
        {todayAppointments.map(appointment => (
          <div 
            key={appointment._id} 
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewAppointment(appointment)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{appointment.patientId?.name || 'Unknown Patient'}</p>
                <p className="text-sm text-gray-500">{appointment.serviceType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className={`inline-flex mt-1 px-2 py-1 text-xs rounded-full ${getStatusClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
            
            {appointment.notes && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Notes: {appointment.notes}</p>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateAppointmentStatus({
                    ...appointment,
                    status: 'Completed'
                  });
                }}
                className="text-green-600 border-green-200 hover:bg-green-50"
                disabled={appointment.status === 'Completed' || appointment.status === 'Cancelled'}
              >
                Complete
              </Button>
              
              <Button
                variant="outline"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateAppointmentStatus({
                    ...appointment,
                    status: 'No Show'
                  });
                }}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                disabled={appointment.status === 'Completed' || appointment.status === 'Cancelled' || appointment.status === 'No Show'}
              >
                No Show
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render medical notes view for completed appointments
  const renderMedicalNotesView = () => {
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
    
    // Group appointments by patient for better organization
    const appointmentsByPatient = {};
    appointments
      .filter(apt => apt.status === 'Completed')
      .forEach(apt => {
        const patientId = apt.patientId?._id || apt.patientId;
        const patientName = apt.patientName || (apt.patientId && apt.patientId.name) || 'Unknown Patient';
        
        if (!appointmentsByPatient[patientId]) {
          appointmentsByPatient[patientId] = {
            patientName,
            appointments: []
          };
        }
        
        appointmentsByPatient[patientId].appointments.push(apt);
      });
      
    // Sort each patient's appointments by date (newest first)
    Object.values(appointmentsByPatient).forEach(patient => {
      patient.appointments.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    });
    
    if (Object.keys(appointmentsByPatient).length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-500">No completed appointments found</p>
        </div>
      );
    }
    
    return (
      <div className="p-6 space-y-8">
        {Object.entries(appointmentsByPatient).map(([patientId, patient]) => (
          <div key={patientId} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{patient.patientName}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {patient.appointments.map(appointment => (
                <div key={appointment._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {appointment.serviceType} • {formatDateTime(appointment.startTime)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleViewAppointment(appointment)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      View Details
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                    <textarea
                      className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={medicalNotes[appointment._id] || appointment.notes || ''}
                      onChange={(e) => setMedicalNotes({
                        ...medicalNotes,
                        [appointment._id]: e.target.value
                      })}
                      placeholder="Enter medical notes for this appointment..."
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateAppointmentStatus({
                          ...appointment,
                          notes: medicalNotes[appointment._id] || appointment.notes
                        })}
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to get status class for the badge
  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'No Show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="My Appointments" 
        description="View and manage your scheduled appointments"
        icon={<FaCalendarAlt className="text-indigo-600" />}
      />
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-md">
          <Button
            variant={activeView === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('calendar')}
            icon={<FaCalendarAlt />}
            className="rounded-l-md"
          >
            Calendar
          </Button>
          <Button
            variant={activeView === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('list')}
            icon={<FaList />}
            className="mx-1"
          >
            List
          </Button>
          <Button
            variant={activeView === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('today')}
            icon={<FaClipboardList />}
            className="mx-1"
          >
            Today
          </Button>
          <Button
            variant={activeView === 'notes' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('notes')}
            icon={<FaNotesMedical />}
            className="rounded-r-md"
          >
            Medical Notes
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Create Appointment Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedAppointment(null);
              setShowAppointmentForm(true);
            }}
            icon={<FaPlus />}
          >
            New Appointment
          </Button>
          
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
          <>
            {activeView === 'calendar' && (
              <Card>
                <AppointmentCalendar
                  appointments={appointments}
                  onSelectAppointment={handleViewAppointment}
                  onCreateAppointment={(slot) => {
                    setSelectedAppointment({
                      startTime: slot.startTime || slot.start,
                      endTime: slot.endTime || slot.end,
                      doctorId: user._id,
                      clinicId: clinic?._id
                    });
                    setShowAppointmentForm(true);
                  }}
                  userRole="Doctor"
                  doctorId={user._id}
                  clinicId={clinic?._id}
                />
              </Card>
            )}
            
            {activeView === 'list' && (
              <Card>
                <EnhancedAppointmentList
                  appointments={appointments}
                  patients={patients}
                  onView={handleViewAppointment}
                  onEdit={(appointment) => {
                    setSelectedAppointment(appointment);
                    setShowAppointmentForm(true);
                  }}
                  onDelete={handleDeleteAppointment}
                  onStatusChange={handleUpdateAppointmentStatus}
                  userRole="Doctor"
                  showDoctor={false}
                />
              </Card>
            )}
            
            {activeView === 'today' && (
              <Card>
                {renderTodayAppointments()}
              </Card>
            )}
            
            {activeView === 'notes' && (
              <Card>
                {renderMedicalNotesView()}
              </Card>
            )}
          </>
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
          onDelete={handleDeleteAppointment}
          onUpdateStatus={handleUpdateAppointmentStatus}
          userRole="Doctor"
        />
      )}
      
      {/* Appointment Form Modal */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        title={selectedAppointment ? "Edit Appointment" : "New Appointment"}
        size="lg"
      >
        <AppointmentForm
          onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
          initialData={selectedAppointment}
          onClose={() => setShowAppointmentForm(false)}
          clinicId={clinic?._id}
        />
      </Modal>
    </div>
  );
};

export default DoctorAppointmentManagement;
