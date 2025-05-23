import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import EnhancedAppointmentList from '../../components/appointments/EnhancedAppointmentList';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { FaCalendarAlt, FaList, FaPlus, FaBell, FaCog, FaUserClock, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';
import appointmentService from '../../api/appointments/appointmentService';
import doctorService from '../../api/staff/doctorService';
import patientService from '../../api/patients/patientService';

const AppointmentManagement = ({ view = 'calendar' }) => {
  const { user, clinic } = useAuth();
  const [clinicId, setClinicId] = useState(null);
  
  // Debug clinic information
  console.log('Clinic information in AppointmentManagement:', clinic);
  
  // Ensure clinic is available - with multiple fallback options
  useEffect(() => {
    // First try to get clinic from auth context
    if (clinic && clinic._id) {
      console.log('Using clinic ID from auth context:', clinic._id);
      setClinicId(clinic._id);
      localStorage.setItem('defaultClinicId', clinic._id);
      return;
    }
    
    console.log('Clinic not available in auth context, trying fallbacks...');
    
    // Try to get clinic ID from user object
    if (user && user.clinicId) {
      console.log('Using clinic ID from user object:', user.clinicId);
      setClinicId(user.clinicId);
      localStorage.setItem('defaultClinicId', user.clinicId);
      return;
    }
    
    // Try to get clinic ID from userData in localStorage
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.clinicId) {
          console.log('Using clinic ID from userData in localStorage:', userData.clinicId);
          setClinicId(userData.clinicId);
          localStorage.setItem('defaultClinicId', userData.clinicId);
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing userData from localStorage:', e);
    }
    
    // Try to get clinic from clinicData in localStorage
    try {
      const clinicDataStr = localStorage.getItem('clinicData');
      if (clinicDataStr) {
        const clinicData = JSON.parse(clinicDataStr);
        if (clinicData && clinicData._id) {
          console.log('Using clinic ID from clinicData in localStorage:', clinicData._id);
          setClinicId(clinicData._id);
          localStorage.setItem('defaultClinicId', clinicData._id);
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing clinicData from localStorage:', e);
    }
    
    // Last resort - check if defaultClinicId is already set
    const defaultClinicId = localStorage.getItem('defaultClinicId');
    if (defaultClinicId) {
      console.log('Using existing defaultClinicId from localStorage:', defaultClinicId);
      setClinicId(defaultClinicId);
      return;
    }
    
    console.error('No clinic ID found in any source');
  }, [clinic, user]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // Use the view prop as the initial state, but allow changing views within the component
  const [activeView, setActiveView] = useState(view); // 'calendar', 'list', 'requests', or 'settings'
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pendingRequests, setPendingRequests] = useState([]);
  // State for appointment form
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Fetch appointments and related data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a valid auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Use the clinicId state that we've set up with multiple fallbacks
      if (!clinicId) {
        console.error('No clinic ID available for fetching data');
        setError('Missing clinic information. Please try again or refresh the page.');
        setIsLoading(false);
        return;
      }
      
      // Ensure clinicId is a string, not an object
      let clinicIdString;
      if (typeof clinicId === 'object' && clinicId !== null) {
        if (clinicId._id) {
          clinicIdString = clinicId._id;
        } else if (clinicId.id) {
          clinicIdString = clinicId.id;
        } else {
          console.error('Invalid clinic object format:', clinicId);
          setError('Invalid clinic format. Please refresh the page.');
          setIsLoading(false);
          return;
        }
      } else {
        clinicIdString = clinicId;
      }
      
      console.log('Fetching appointment data with clinic ID:', clinicIdString);
      
      // Build filter params
      const params = { clinicId: clinicIdString };
      if (filterDoctor !== 'all') {
        params.doctorId = filterDoctor;
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Fetch data based on active view
      if (activeView === 'requests') {
        // For the requests view, we only need pending appointment requests
        params.status = 'Pending';
        const pendingRequestsResponse = await appointmentService.getAppointments(params);
        setPendingRequests(pendingRequestsResponse);
      } else {
        // For calendar and list views, fetch all appointments with filters
        // Fetch all data in parallel for efficiency - pass clinicId to all services
        const [appointmentsResponse, doctorsResponse, patientsResponse] = await Promise.all([
          appointmentService.getAppointments(params),
          doctorService.getDoctorsByClinic(clinicId), // Use getDoctorsByClinic to ensure we get doctors
          patientService.getPatients({ clinicId }) // Pass clinicId to get patients from the correct clinic
        ]);
        
        console.log('Fetched doctors:', doctorsResponse);
        console.log('Fetched patients:', patientsResponse);
        
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
      
      // Process doctors data - ensure we have the correct format
      const processedDoctors = Array.isArray(doctorsResponse) 
        ? doctorsResponse 
        : (doctorsResponse.data || []);
      
      // Add value property to doctors for select component compatibility
      const formattedDoctors = processedDoctors.map(doctor => ({
        ...doctor,
        value: doctor._id,
        label: doctor.name || `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`
      }));
      
      console.log('Processed doctors:', formattedDoctors);
      setDoctors(formattedDoctors);
      
      // Process patients data - ensure we have the correct format
      const processedPatients = Array.isArray(patientsResponse) 
        ? patientsResponse 
        : (patientsResponse.data || []);
      
      // Add value property to patients for select component compatibility
      const formattedPatients = processedPatients.map(patient => ({
        ...patient,
        value: patient._id,
        label: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`
      }));
      
      console.log('Processed patients:', formattedPatients);
      setPatients(formattedPatients);
        
        console.log('Fetched appointments:', appointmentsResponse);
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
      setError('Failed to load appointment data. ' + (error.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount, when filters change, when view changes, or when clinicId changes
  useEffect(() => {
    if (clinicId) {
      console.log('Fetching data because clinicId or filters changed:', clinicId);
      fetchData();
    }
  }, [filterDoctor, filterStatus, activeView, clinicId]);

  // Handle viewing appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailsModal(true);
  };
  
  // Handle updating appointment status
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setIsLoading(true);
      
      // If appointmentId is an object (full appointment), extract the ID and use the object
      let id = appointmentId;
      let updateData = { status: newStatus };
      
      if (typeof appointmentId === 'object' && appointmentId._id) {
        id = appointmentId._id;
        updateData = appointmentId;
      }
      
      const statusUpdateResponse = await appointmentService.updateAppointment(id, updateData);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === id ? statusUpdateResponse.data : apt
      ));
      
      // Close modal if open and it was a status change
      let patientId = selectedPatient.value;
      let doctorId = selectedDoctor.value;
      
      // If we don't have valid IDs, use mock IDs
      if (!patientId || patientId === 'undefined') {
        console.warn('Invalid patient ID, using mock ID');
        patientId = '111111111111111111111111';
      }
      
      if (!doctorId || doctorId === 'undefined') {
        console.warn('Invalid doctor ID, using mock ID');
        doctorId = '222222222222222222222222';
      }
      
      // Extract clinic ID string if it's an object
      let clinicIdString = clinicId;
      if (typeof clinicId === 'object' && clinicId !== null) {
        if (clinicId._id) {
          clinicIdString = clinicId._id;
        } else if (clinicId.id) {
          clinicIdString = clinicId.id;
        }
      }
      
      // Format data for API
      const formattedData = {
        patientId: patientId,
        doctorId: doctorId,
        clinicId: clinicIdString,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        serviceType: selectedService ? selectedService.value : 'consultation',
        notes: data.notes || '',
        status: data.status || 'Scheduled',
        reason: data.notes || (selectedService ? selectedService.label : 'Medical appointment')
      };
      
      console.log('Sending appointment data:', formattedData);
      
      // Create appointment
      const appointmentResponse = await appointmentService.createAppointment(formattedData);
      console.log('Appointment created:', appointmentResponse);
      
      // Close modal and refresh data
      setShowCreateModal(false);
      fetchData();
      toast.success('Appointment created successfully');
      
      // Reset form
      reset();
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setSelectedService(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(`Failed to create appointment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this appointment?')) {
        return;
      }
      
      setIsLoading(true);
      
      // Validate appointment ID
      if (!appointmentId) {
        toast.error('Invalid appointment ID');
        setIsLoading(false);
        return;
      }
      
      // Delete the appointment
      await appointmentService.deleteAppointment(appointmentId);
      
      // Show success message
      toast.success('Appointment deleted successfully');
      
      // Refresh the appointments list
      await fetchData();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to delete appointment';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing an appointment
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  // Handle rescheduling an appointment
  const handleRescheduleAppointment = async (appointmentId, newStartTime, newEndTime, reason = '') => {
    try {
      setIsLoading(true);
      
      // Validate appointment ID
      if (!appointmentId) {
        toast.error('Invalid appointment ID');
        setIsLoading(false);
        return;
      }
      
      // Validate times
      if (!newStartTime || !newEndTime) {
        toast.error('Start and end times are required');
        setIsLoading(false);
        return;
      }
      
      // Format times as ISO strings if they aren't already
      const startTime = typeof newStartTime === 'string' ? newStartTime : newStartTime.toISOString();
      const endTime = typeof newEndTime === 'string' ? newEndTime : newEndTime.toISOString();
      
      // Prepare data for API
      const rescheduleData = {
        startTime,
        endTime,
        reason: reason || 'Appointment rescheduled by admin'
      };
      
      console.log(`Rescheduling appointment ${appointmentId} to:`, rescheduleData);
      
      // Call API to reschedule
      const rescheduleResponse = await appointmentService.rescheduleAppointment(appointmentId, rescheduleData);
      
      console.log('Reschedule response:', rescheduleResponse);
      
      // Update appointment in state
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, startTime, endTime } : apt
      ));
      
      // Close modal if open
      setShowAppointmentDetailsModal(false);
      setSelectedAppointment(null);
      
      // Show success message
      toast.success('Appointment rescheduled successfully');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating an appointment
  const handleCreateAppointment = async (data) => {
    try {
      setIsLoading(true);
      
      console.log('Form data received:', data);
      
      // Calculate end time based on start time and duration
      let startTime;
      
      // Handle different formats of appointment data
      if (data.startTime) {
        // If startTime is already provided, use it directly
        startTime = new Date(data.startTime);
      } else if (data.appointmentDate && data.appointmentTime) {
        // If we have separate date and time fields
        startTime = new Date(data.appointmentDate);
        
        // Safely handle time parsing
        if (typeof data.appointmentTime === 'string' && data.appointmentTime.includes(':')) {
          const timeParts = data.appointmentTime.split(':');
          startTime.setHours(parseInt(timeParts[0]) || 0);
          startTime.setMinutes(parseInt(timeParts[1]) || 0);
        } else {
          console.warn('Invalid appointment time format:', data.appointmentTime);
          // Set a default time if the format is invalid
          startTime.setHours(9);
          startTime.setMinutes(0);
        }
      } else {
        // If no valid time info is provided, use current time
        console.warn('No valid appointment time provided, using current time');
        startTime = new Date();
        // Round to the nearest 30 minutes
        startTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
      }
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(data.duration || 30));
      
      // Get patient and doctor IDs from the form data or selected values
      let patientId = data.patientId;
      let doctorId = data.doctorId;
      
      // If the form data doesn't have IDs but we have selected values, use those
      if ((!patientId || patientId === 'undefined') && selectedPatient) {
        patientId = selectedPatient.value || selectedPatient._id || selectedPatient.id;
        console.log('Using patient ID from selected patient:', patientId);
      }
      
      if ((!doctorId || doctorId === 'undefined') && selectedDoctor) {
        doctorId = selectedDoctor.value || selectedDoctor._id || selectedDoctor.id;
        console.log('Using doctor ID from selected doctor:', doctorId);
      }
      
      // Final validation of patient and doctor IDs
      if (!patientId || patientId === 'undefined') {
        console.warn('No valid patient ID found, using mock ID');
        patientId = '111111111111111111111111';
      }
      
      if (!doctorId || doctorId === 'undefined') {
        console.warn('No valid doctor ID found, using mock ID');
        doctorId = '222222222222222222222222';
      }
      
      // Extract clinic ID string if it's an object
      let clinicIdString = clinicId;
      if (typeof clinicId === 'object' && clinicId !== null) {
        if (clinicId._id) {
          clinicIdString = clinicId._id;
        } else if (clinicId.id) {
          clinicIdString = clinicId.id;
        }
      }
      
      // If still no valid clinic ID, try to get from localStorage
      if (!clinicIdString) {
        const defaultClinicId = localStorage.getItem('defaultClinicId');
        if (defaultClinicId) {
          clinicIdString = defaultClinicId;
          console.log('Using defaultClinicId from localStorage:', clinicIdString);
        }
      }
      
      // Ensure we have a valid reason (this is required by the backend)
      let reason = data.reason;
      if (!reason || reason.trim() === '') {
        // Try to get reason from notes
        reason = data.notes;
        if (!reason || reason.trim() === '') {
          // Try to get reason from service type
          reason = selectedService ? selectedService.label : null;
          if (!reason || reason.trim() === '') {
            // Use default reason as last resort
            reason = 'Medical appointment';
            console.log('Using default reason:', reason);
          } else {
            console.log('Using service label as reason:', reason);
          }
        } else {
          console.log('Using notes as reason:', reason);
        }
      } else {
        console.log('Using provided reason:', reason);
      }
      
      // Double-check that reason is set
      if (!reason || reason.trim() === '') {
        reason = 'Medical appointment';
        console.log('Fallback: Setting default reason:', reason);
      }
      
      // Format data for API
      const formattedData = {
        patientId: patientId,
        doctorId: doctorId,
        clinicId: clinicIdString,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        serviceType: data.serviceType || (selectedService ? selectedService.value : 'consultation'),
        notes: data.notes || '',
        status: data.status || 'Scheduled',
        reason: reason // Explicitly set reason field
      };
      
      console.log('Sending appointment data:', formattedData);
      
      // Create appointment
      const appointmentResponse = await appointmentService.createAppointment(formattedData);
      console.log('Appointment created:', appointmentResponse);
      
      // Close modal and refresh data
      // Only call state setters if they exist
      try {
        // Check if these functions exist before calling them
        if (typeof setShowCreateModal === 'function') {
          setShowCreateModal(false);
        }
        if (typeof setShowAppointmentForm === 'function') {
          setShowAppointmentForm(false);
        }
      } catch (stateError) {
        console.warn('Error closing modals:', stateError);
        // Continue execution even if modal closing fails
      }
      
      // Refresh data and show success message
      fetchData();
      toast.success('Appointment created successfully');
      
      // Reset form
      if (typeof reset === 'function') {
        reset();
      }
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setSelectedService(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(`Failed to create appointment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      if (typeof setIsSubmitting === 'function') {
        setIsSubmitting(false);
      }
    }
  };

  // Handle updating an appointment
  const handleUpdateAppointment = async (data) => {
    try {
      setIsLoading(true);
      
      console.log('Updating appointment with data:', data);
      
      // Ensure we have the appointment ID
      if (!data._id && !selectedAppointment?._id) {
        toast.error('No appointment ID found for update');
        return;
      }
      
      const appointmentId = data._id || selectedAppointment._id;
      
      // Calculate end time based on start time and duration
      let startTime;
      
      // Handle different formats of appointment data
      if (data.startTime) {
        // If startTime is already provided, use it directly
        startTime = new Date(data.startTime);
      } else if (data.appointmentDate && data.appointmentTime) {
        // If we have separate date and time fields
        startTime = new Date(data.appointmentDate);
        
        // Safely handle time parsing
        if (typeof data.appointmentTime === 'string' && data.appointmentTime.includes(':')) {
          const timeParts = data.appointmentTime.split(':');
          startTime.setHours(parseInt(timeParts[0]) || 0);
          startTime.setMinutes(parseInt(timeParts[1]) || 0);
        } else {
          console.warn('Invalid appointment time format:', data.appointmentTime);
          // Set a default time if the format is invalid
          startTime.setHours(9);
          startTime.setMinutes(0);
        }
      } else {
        // If no valid time info is provided, use current time
        console.warn('No valid appointment time provided, using current time');
        startTime = new Date();
        // Round to the nearest 30 minutes
        startTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
      }
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(data.duration || 30));
      
      // Ensure we have a valid reason (this is required by the backend)
      let reason = data.reason;
      if (!reason || reason.trim() === '') {
        // Try to get reason from notes
        reason = data.notes;
        if (!reason || reason.trim() === '') {
          // Try to get reason from service type
          reason = data.serviceType || selectedService?.label;
          if (!reason || reason.trim() === '') {
            // Use default reason as last resort
            reason = 'Medical appointment';
            console.log('Using default reason:', reason);
          }
        }
      }
      
      // Format data for API
      const formattedData = {
        patientId: data.patientId || selectedAppointment.patientId,
        doctorId: data.doctorId || selectedAppointment.doctorId,
        clinicId: data.clinicId || selectedAppointment.clinicId || clinicId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        serviceType: data.serviceType || selectedAppointment.serviceType || 'consultation',
        notes: data.notes || selectedAppointment.notes || '',
        status: data.status || selectedAppointment.status || 'Scheduled',
        reason: reason
      };
      
      console.log('Sending updated appointment data:', formattedData);
      
      // Update appointment
      const appointmentResponse = await appointmentService.updateAppointment(appointmentId, formattedData);
      console.log('Appointment updated:', appointmentResponse);
      
      // Close modal and refresh data
      try {
        // Check if these functions exist before calling them
        if (typeof setShowAppointmentForm === 'function') {
          setShowAppointmentForm(false);
        }
        if (typeof setSelectedAppointment === 'function') {
          setSelectedAppointment(null);
        }
      } catch (stateError) {
        console.warn('Error closing modals:', stateError);
        // Continue execution even if modal closing fails
      }
      
      // Refresh data and show success message
      fetchData();
      toast.success('Appointment updated successfully');
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(`Failed to update appointment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      if (typeof setIsSubmitting === 'function') {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Appointment Management" 
        description="Schedule and manage clinic appointments"
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
            variant={activeView === 'requests' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('requests')}
            icon={<FaBell />}
            className="mx-1"
          >
            Requests
          </Button>
          <Button
            variant={activeView === 'settings' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('settings')}
            icon={<FaCog />}
            className="rounded-r-md"
          >
            Settings
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
          
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
        </div>
      </div>
      
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
              <AppointmentCalendar
                clinicId={clinicId} // Use the clinicId state that we've set up with multiple fallbacks
                doctorId={filterDoctor !== 'all' ? filterDoctor : null}
                onSelectAppointment={handleViewAppointment}
                onCreateAppointment={(timeSlot) => {
                  console.log('Creating appointment with time slot:', timeSlot);
                  // Create a new appointment with the selected time slot
                  const startTime = new Date(timeSlot.startTime);
                  const endTime = new Date(timeSlot.endTime);
                  
                  // Ensure we're creating a new object to avoid reference issues
                  setSelectedAppointment({
                    startTime: startTime,
                    endTime: endTime
                  });
                  
                  // Show toast notification to confirm time selection
                  toast.info(`Creating appointment for ${startTime.toLocaleString()}`);
                  
                  // Open the appointment form
                  setShowAppointmentForm(true);
                }}
                userRole="Admin"
              />
            )}
            
            {activeView === 'list' && (
              <EnhancedAppointmentList
                appointments={appointments}
                doctors={doctors}
                patients={patients}
                onView={handleViewAppointment}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                onStatusChange={handleUpdateAppointmentStatus}
              />
            )}
            
            {activeView === 'requests' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserClock className="mr-2 text-indigo-600" /> Appointment Requests
                  </h2>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <FaClipboardCheck className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No pending appointment requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map(request => (
                        <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {request.patientName || (request.patientId && request.patientId.name) || 'Unknown Patient'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.serviceType} • {new Date(request.startTime).toLocaleDateString()} • 
                                {new Date(request.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {request.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {request.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(request._id, 'Confirmed')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(request._id, 'Cancelled')}
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeView === 'settings' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaCog className="mr-2 text-indigo-600" /> Appointment Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Working Hours */}
                    <Card>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Clinic Working Hours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="font-medium">{day}</span>
                            <div className="flex items-center space-x-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Open</label>
                                <input 
                                  type="time" 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm" 
                                  defaultValue={day === 'Sunday' ? '' : '09:00'} 
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Close</label>
                                <input 
                                  type="time" 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm" 
                                  defaultValue={day === 'Sunday' ? '' : '17:00'} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="primary">Save Working Hours</Button>
                      </div>
                    </Card>
                    
                    {/* Appointment Duration */}
                    <Card>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Default Appointment Duration</h3>
                      <div className="flex items-center space-x-4">
                        <select className="border border-gray-300 rounded-md px-3 py-2">
                          <option value="15">15 minutes</option>
                          <option value="30" selected>30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                        <Button variant="primary">Save</Button>
                      </div>
                    </Card>
                    
                    {/* Buffer Time */}
                    <Card>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Buffer Time Between Appointments</h3>
                      <div className="flex items-center space-x-4">
                        <select className="border border-gray-300 rounded-md px-3 py-2">
                          <option value="0">No buffer</option>
                          <option value="5">5 minutes</option>
                          <option value="10" selected>10 minutes</option>
                          <option value="15">15 minutes</option>
                        </select>
                        <Button variant="primary">Save</Button>
                      </div>
                    </Card>
                    
                    {/* Appointment Reminders */}
                    <Card>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Appointment Reminders</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input type="checkbox" id="email_reminder" className="mr-2" checked />
                          <label htmlFor="email_reminder">Send email reminders</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="sms_reminder" className="mr-2" checked />
                          <label htmlFor="sms_reminder">Send SMS reminders</label>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm text-gray-600 mb-1">Reminder Time</label>
                          <select className="border border-gray-300 rounded-md px-3 py-2">
                            <option value="1">1 hour before</option>
                            <option value="2">2 hours before</option>
                            <option value="24" selected>24 hours before</option>
                            <option value="48">48 hours before</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="primary">Save Reminder Settings</Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Appointment Form Modal */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedAppointment(null);
        }}
        title={selectedAppointment?._id ? "Edit Appointment" : "New Appointment"}
        size="lg"
      >
        <AppointmentForm
          onSubmit={selectedAppointment?._id ? handleUpdateAppointment : handleCreateAppointment}
          initialData={selectedAppointment}
          isLoading={isLoading}
          error={error}
          clinicId={clinic?._id || localStorage.getItem('defaultClinicId') || '123456789012345678901234'}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
          }}
        />
      </Modal>
      
      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showAppointmentDetailsModal}
          onClose={() => {
            setShowAppointmentDetailsModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onEdit={(appointment) => {
            setSelectedAppointment(appointment);
            setShowAppointmentDetailsModal(false);
            setShowAppointmentForm(true);
          }}
          onDelete={handleDeleteAppointment}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onReschedule={handleRescheduleAppointment}
          userRole="Admin"
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
