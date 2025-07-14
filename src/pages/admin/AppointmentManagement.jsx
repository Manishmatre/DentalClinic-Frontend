import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import AppointmentDashboard from '../../components/appointments/AppointmentDashboard';
import AppointmentCalendarTab from '../../components/appointments/AppointmentCalendarTab';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentSettings from '../../components/appointments/AppointmentSettings';
import AppointmentFormExport from '../../components/appointments/AppointmentForm';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';

// Icons
import { 
  FaCalendarAlt, 
  FaList, 
  FaPlus, 
  FaCog, 
  FaChartPie
} from 'react-icons/fa';

// Services
import appointmentService from '../../api/appointments/appointmentService';
import staffService from '../../api/staff/staffService';
import patientService from '../../api/patients/patientService';
import clinicService from "../../api/clinic/clinicService";

const AppointmentManagement = () => {
  const { user, clinic } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [clinicId, setClinicId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'calendar', 'list', 'settings'
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [appointmentFormInitialData, setAppointmentFormInitialData] = useState(null);
  
  // Appointment analytics state
  const [appointmentAnalytics, setAppointmentAnalytics] = useState({
    totalScheduled: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    totalNoShow: 0,
    recentAppointments: [],
    upcomingAppointments: [],
    appointmentsByStatus: {
      labels: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
      data: [0, 0, 0, 0]
    },
    appointmentsByDoctor: {
      labels: [],
      data: []
    },
    appointmentTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [0, 0, 0, 0, 0, 0, 0]
    }
  });
  
  // Settings state
  const [appointmentSettings, setAppointmentSettings] = useState(null);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Update URL with the tab parameter for all tabs consistently
    navigate(`/admin/appointment-management?tab=${tab}`, { replace: true });
  };
  
  // Set active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    // Valid tab values: 'dashboard', 'calendar', 'list', 'settings'
    if (tabParam && ['dashboard', 'calendar', 'list', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      // Default to dashboard if no valid tab is specified
      setActiveTab('dashboard');
    }
  }, [location.search]);

  // Monitor clinic and user data changes
  useEffect(() => {
    let resolvedClinicId = null;
    if (clinic?._id) {
      resolvedClinicId = clinic._id;
    } else if (user?.clinicId) {
      resolvedClinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
    }
    if (resolvedClinicId) {
      setClinicId(resolvedClinicId);
      // Also set in localStorage for global access
      localStorage.setItem('clinicId', resolvedClinicId);
    }
  }, [clinic, user]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Set clinic ID with better fallback logic
        let currentClinicId = clinic?._id;
        
        if (!currentClinicId) {
          // Try to get from user's clinicId
          currentClinicId = user?.clinicId;
          if (typeof currentClinicId === 'object') {
            currentClinicId = currentClinicId._id;
          }
        }
        
        if (!currentClinicId) {
          // Try localStorage
          currentClinicId = localStorage.getItem('defaultClinicId');
        }
        
        if (!currentClinicId) {
          // Try to get from stored clinic data
          const storedClinicData = localStorage.getItem('clinicData');
          if (storedClinicData) {
            try {
              const parsedClinicData = JSON.parse(storedClinicData);
              currentClinicId = parsedClinicData._id;
            } catch (e) {
              console.error('Error parsing stored clinic data:', e);
            }
          }
        }
        
        console.log('Clinic ID resolution:', {
          clinicId: clinic?._id,
          userClinicId: user?.clinicId,
          localStorageClinicId: localStorage.getItem('defaultClinicId'),
          finalClinicId: currentClinicId,
          user,
          clinic
        });
        
        if (!currentClinicId) {
          console.error('No clinic ID available for appointment management');
          setError('Unable to determine clinic information. Please refresh the page or contact support.');
          return;
        }
        
        setClinicId(currentClinicId);
        
        // Fetch appointments
        await fetchAppointments(currentClinicId);
        
        // Fetch doctors
        const staffResponse = await staffService.getStaff({ role: 'Doctor', status: 'Active' });
        const doctorsList = Array.isArray(staffResponse) ? staffResponse.filter(staff => staff.role === 'Doctor') : [];
        setDoctors(doctorsList);
        
        // Fetch patients
        const patientsResponse = await patientService.getPatients({ clinicId: currentClinicId });
        if (!patientsResponse.error) {
          setPatients(patientsResponse.data || []);
        }
        
        // Fetch appointment analytics
        await fetchAppointmentAnalytics(currentClinicId);
        
        // Fetch appointment settings
        // This would be implemented in a real application
        // For now, we'll use default settings
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [clinic, user, refreshTrigger]);
  
  // Fetch appointments
  const fetchAppointments = async (clinicId) => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments for clinicId:', clinicId);
      const response = await appointmentService.getAppointments({ clinicId });
      if (response.error) {
        console.error('Error fetching appointments:', response.message);
        setError(response.details || 'Failed to fetch appointments. Please try again later.');
        toast.error(response.message || 'Failed to fetch appointments');
        setAppointments([]);
      } else {
        setAppointments(Array.isArray(response) ? response : (response.data && Array.isArray(response.data)) ? response.data : []);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments. Please try again later.');
      toast.error('Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointment analytics
  const fetchAppointmentAnalytics = async (clinicId) => {
    try {
      // Get current date and 30 days ago for analytics
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Pass params as an object
      const response = await appointmentService.getAppointmentStats({ clinicId, startDate, endDate });
      
      if (response.error) {
        console.error('Error fetching appointment analytics:', response.message);
        toast.error('Failed to fetch appointment analytics');
        return;
      }
      
      // Process analytics data from backend
      const analytics = {
        totalScheduled: response.totalAppointments || 0,
        totalCompleted: 0,
        totalCancelled: 0,
        totalNoShow: 0,
        appointmentsByStatus: {
          labels: [],
          data: []
        },
        appointmentsByDoctor: {
          labels: [],
          data: []
        },
        appointmentTrend: {
          labels: [],
          data: []
        },
        recentAppointments: [],
        upcomingAppointments: []
      };
      
      // Process status breakdown
      if (response.statusBreakdown && Array.isArray(response.statusBreakdown)) {
        // Map all statuses dynamically
        analytics.appointmentsByStatus.labels = response.statusBreakdown.map(s => s._id || 'Unknown');
        analytics.appointmentsByStatus.data = response.statusBreakdown.map(s => s.count || 0);
        
        // Extract counts for common statuses (case-insensitive)
        const getStatusCount = (status) => {
          const found = response.statusBreakdown.find(s => (s._id || '').toLowerCase() === status.toLowerCase());
          return found ? found.count : 0;
        };
        analytics.totalScheduled = getStatusCount('Scheduled');
        analytics.totalCompleted = getStatusCount('Completed');
        analytics.totalCancelled = getStatusCount('Cancelled');
        analytics.totalNoShow = getStatusCount('No Show');
      } else {
        // Fallback if no status breakdown
        analytics.appointmentsByStatus.labels = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
        analytics.appointmentsByStatus.data = [0, 0, 0, 0];
      }
      
      // Process doctor breakdown
      if (response.doctorBreakdown && Array.isArray(response.doctorBreakdown)) {
        analytics.appointmentsByDoctor.labels = response.doctorBreakdown.map(d => d.doctorName || 'Unknown');
        analytics.appointmentsByDoctor.data = response.doctorBreakdown.map(d => d.count || 0);
      }
      
      // Process daily counts
      if (response.dailyCounts && Array.isArray(response.dailyCounts)) {
        // Format dates for display
        analytics.appointmentTrend.labels = response.dailyCounts.map(d => {
          const date = new Date(d._id);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        analytics.appointmentTrend.data = response.dailyCounts.map(d => d.count || 0);
      } else {
        // Create last 7 days as fallback
        const labels = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        analytics.appointmentTrend.labels = labels;
        analytics.appointmentTrend.data = [0, 0, 0, 0, 0, 0, 0];
      }
      
      // Set appointment analytics with what we have so far
      setAppointmentAnalytics(analytics);
      
      // Fetch recent and upcoming appointments with limit
      try {
        const pastResponse = await appointmentService.getPastAppointments({ clinicId, limit: 5 });
        const upcomingResponse = await appointmentService.getUpcomingAppointments({ clinicId, limit: 5 });
        
        if (!pastResponse.error && pastResponse) {
          const recentAppointments = Array.isArray(pastResponse) ? pastResponse : 
                                    (pastResponse.data && Array.isArray(pastResponse.data)) ? pastResponse.data : [];
          
          analytics.recentAppointments = recentAppointments.map(apt => ({
            patientName: apt.patientName || 
                        (apt.patient?.name) || 
                        (apt.patient?.firstName && apt.patient?.lastName ? 
                          `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient'),
            date: apt.startTime || apt.date || new Date(),
            status: (apt.status || 'scheduled').toLowerCase()
          }));
        }
        
        if (!upcomingResponse.error && upcomingResponse) {
          const upcomingAppointments = Array.isArray(upcomingResponse) ? upcomingResponse : 
                                      (upcomingResponse.data && Array.isArray(upcomingResponse.data)) ? upcomingResponse.data : [];
          
          analytics.upcomingAppointments = upcomingAppointments.map(apt => ({
            patientName: apt.patientName || 
                        (apt.patient?.name) || 
                        (apt.patient?.firstName && apt.patient?.lastName ? 
                          `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient'),
            date: apt.startTime || apt.date || new Date(),
            doctorName: apt.doctorName || 
                       (apt.doctor?.name) || 
                       (apt.doctor?.firstName && apt.doctor?.lastName ? 
                         `${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown Doctor')
          }));
        }
        
        // Update analytics with recent and upcoming appointments
        setAppointmentAnalytics(analytics);
      } catch (error) {
        console.error('Error fetching recent/upcoming appointments:', error);
      }
    } catch (error) {
      console.error('Error fetching appointment analytics:', error);
      toast.error('Failed to fetch appointment analytics');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment update
  const handleUpdateAppointment = async (appointmentData) => {
    if (!selectedAppointment?._id) {
      toast.error('No appointment selected for update');
      return;
    }
    
    setIsLoading(true);
    try {
      // Format dates properly
      const formattedData = { ...appointmentData };
      
      if (formattedData.startTime && !(formattedData.startTime instanceof Date)) {
        formattedData.startTime = new Date(formattedData.startTime);
      }
      
      if (formattedData.endTime && !(formattedData.endTime instanceof Date)) {
        formattedData.endTime = new Date(formattedData.endTime);
      }
      
      const response = await appointmentService.updateAppointment(
        selectedAppointment._id,
        formattedData
      );
      
      if (response.error) {
        setError(response.message || 'Failed to update appointment');
        toast.error(response.message || 'Failed to update appointment');
        return;
      }
      
      toast.success('Appointment updated successfully');
      setSuccess('Appointment updated successfully');
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
      setRefreshTrigger(prev => prev + 1);
      
      // Refresh appointments list
      fetchAppointments(clinicId);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again later.');
      toast.error('Failed to update appointment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment deletion
  const confirmDeleteAppointment = async () => {
    if (!selectedAppointment?._id) {
      toast.error('No appointment selected for deletion');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await appointmentService.deleteAppointment(selectedAppointment._id, { clinicId });
      
      if (response.error) {
        let errorMessage = response.message || 'Failed to delete appointment';
        
        // Handle specific error cases
        if (response.status === 403) {
          errorMessage = 'Permission denied: Only Admin and Receptionist can delete appointments';
          
          // Check if the user is not an Admin or Receptionist
          if (user && !['Admin', 'Receptionist'].includes(user.role)) {
            errorMessage = `Your role (${user.role}) does not have permission to delete appointments. Only Admin and Receptionist can delete appointments.`;
          }
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setIsDeleteModalOpen(false); // Close the delete modal on error
        return;
      }
      
      toast.success('Appointment deleted successfully');
      setSuccess('Appointment deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
      
      // Refresh appointments list
      fetchAppointments(clinicId);
      
      // Refresh analytics data
      fetchAppointmentAnalytics(clinicId);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      
      // Check if it's a 403 error
      let errorMessage = 'Failed to delete appointment. Please try again later.';
      if (error.response && error.response.status === 403) {
        errorMessage = 'Permission denied: Only Admin and Receptionist can delete appointments';
        
        // Check if the user is not an Admin or Receptionist
        if (user && !['Admin', 'Receptionist'].includes(user.role)) {
          errorMessage = `Your role (${user.role}) does not have permission to delete appointments. Only Admin and Receptionist can delete appointments.`;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleteModalOpen(false); // Close the delete modal on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment status update
  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    if (!appointmentId) {
      toast.error('No appointment selected for status update');
      return;
    }
    
    // Check if user has permission to update appointment status based on role
    if (user) {
      const allowedRoles = ['Admin', 'Receptionist', 'Doctor', 'Nurse'];
      
      // Only certain roles can mark appointments as completed or cancelled
      if ((status === 'completed' || status === 'cancelled') && 
          !['Admin', 'Doctor', 'Receptionist'].includes(user.role)) {
        const errorMessage = `Your role (${user.role}) does not have permission to mark appointments as ${status}. Only Admin, Doctor, and Receptionist can perform this action.`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      // General permission check for other status updates
      if (!allowedRoles.includes(user.role)) {
        const errorMessage = `Your role (${user.role}) does not have permission to update appointment status.`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // For direct status updates, we'll use the updateAppointment method
      // with just the status field to avoid overwriting other fields
      const response = await appointmentService.updateAppointment(appointmentId, { status });
      
      if (response.error) {
        let errorMessage = response.message || 'Failed to update appointment status';
        
        // Handle specific error cases
        if (response.status === 403) {
          errorMessage = `Permission denied: You don't have permission to update this appointment's status`;
        } else if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        return response; // Return error to modal
      }
      
      toast.success(`Appointment marked as ${status}`);
      setSuccess(`Appointment marked as ${status}`);
      setSelectedAppointment(prev => prev ? { ...prev, status } : prev);
      fetchAppointments(clinicId);
      fetchAppointmentAnalytics(clinicId);
      setTimeout(() => setSuccess(null), 3000);
      return response; // Return success to modal
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // Check for specific error types
      let errorMessage = 'Failed to update appointment status. Please try again later.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = `Permission denied: You don't have permission to update this appointment's status`;
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: true, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment creation
  const handleCreateAppointment = (slot) => {
    console.log('Received slot data from calendar:', slot);
    
    // Ensure we have proper Date objects for the times
    const startTime = slot.startTime ? new Date(slot.startTime) : null;
    const endTime = slot.endTime ? new Date(slot.endTime) : null;
    
    console.log('Processed times:', {
      originalStart: slot.startTime,
      originalEnd: slot.endTime,
      processedStart: startTime?.toISOString(),
      processedEnd: endTime?.toISOString(),
      startLocal: startTime?.toLocaleString(),
      endLocal: endTime?.toLocaleString()
    });
    
    // Always use the current user's clinic ID for consistency
    const currentClinicId = user?.clinicId ? 
      (typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId) : 
      (clinic?._id || clinic?.id);
    
    console.log('Using current user clinic ID:', currentClinicId);
    
    setAppointmentFormInitialData({
      startTime: startTime,
      endTime: endTime,
      clinicId: currentClinicId
    });
    setShowAppointmentForm(true);
  };
  
  const handleCreateAppointmentSubmit = async (appointmentData) => {
    setIsLoading(true);
    try {
      const formattedData = { ...appointmentData };
      if (formattedData.startTime && !(formattedData.startTime instanceof Date)) {
        formattedData.startTime = new Date(formattedData.startTime);
      }
      if (formattedData.endTime && !(formattedData.endTime instanceof Date)) {
        formattedData.endTime = new Date(formattedData.endTime);
      }
      if (!formattedData.clinicId && clinic) {
        formattedData.clinicId = clinic._id || clinic.id;
      }
      // Ensure serviceType is a string and not empty
      if (!formattedData.serviceType || typeof formattedData.serviceType !== 'string' || formattedData.serviceType.trim() === '') {
        toast.error('Service type is required to create an appointment');
        setIsLoading(false);
        return;
      }
      // Add detailed logging of request payload
      console.log('Creating appointment with payload:', JSON.stringify(formattedData, null, 2));
      const response = await appointmentService.createAppointment(formattedData);
      if (response.error) {
        // Log backend error details
        console.error('Backend error response:', response);
        toast.error(response.details || response.message || 'Failed to create appointment');
      } else {
        toast.success('Appointment created successfully');
        setRefreshTrigger(prev => prev + 1);
        setShowAppointmentForm(false);
        setAppointmentFormInitialData(null);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'An error occurred while creating the appointment');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment rescheduling
  const handleRescheduleAppointment = async (appointmentId, newDate) => {
    if (!appointmentId) {
      toast.error('No appointment selected for rescheduling');
      return;
    }
    
    setIsLoading(true);
    try {
      // Format the new date if it's not already a Date object
      const formattedDate = newDate instanceof Date ? newDate : new Date(newDate);
      
      // Calculate new end time based on the appointment duration
      // First, get the current appointment to determine its duration
      const currentAppointment = appointments.find(a => a._id === appointmentId);
      
      if (!currentAppointment) {
        toast.error('Appointment not found');
        setIsLoading(false);
        return;
      }
      
      // Calculate the duration of the current appointment
      const currentStart = new Date(currentAppointment.startTime);
      const currentEnd = new Date(currentAppointment.endTime);
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      
      // Calculate the new end time by adding the same duration to the new start time
      const newStartTime = formattedDate;
      const newEndTime = new Date(newStartTime.getTime() + durationMs);
      
      // Use the rescheduleAppointment method with the new start and end times
      const response = await appointmentService.rescheduleAppointment(appointmentId, { 
        startTime: newStartTime,
        endTime: newEndTime,
        reason: 'Rescheduled by ' + user?.role
      });
      
      if (response.error) {
        setError(response.message || 'Failed to reschedule appointment');
        toast.error(response.message || 'Failed to reschedule appointment');
        return;
      }
      
      toast.success('Appointment rescheduled successfully');
      setSuccess('Appointment rescheduled successfully');
      setShowAppointmentDetailsModal(false);
      setSelectedAppointment(null);
      
      // Refresh appointments list
      fetchAppointments(clinicId);
      
      // Refresh analytics data
      fetchAppointmentAnalytics(clinicId);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setError('Failed to reschedule appointment. Please try again later.');
      toast.error('Failed to reschedule appointment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle view appointment details
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailsModal(true);
  };
  
  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    // Deep clone and normalize date fields for the form
    const cloned = JSON.parse(JSON.stringify(appointment));
    if (cloned.startTime) cloned.startTime = new Date(cloned.startTime);
    if (cloned.endTime) cloned.endTime = new Date(cloned.endTime);
    // Normalize patientId and doctorId to string IDs for the form
    if (cloned.patientId && typeof cloned.patientId === 'object') {
      cloned.patientId = cloned.patientId._id || cloned.patientId.id || '';
    }
    if (cloned.doctorId && typeof cloned.doctorId === 'object') {
      cloned.doctorId = cloned.doctorId._id || cloned.doctorId.id || '';
    }
    setSelectedAppointment(cloned);
    setShowAppointmentForm(true);
  };
  
  // Handle date change in calendar
  const handleDateChange = (date) => {
    setCurrentDate(date);
  };
  
  // Handle save settings
  const handleSaveSettings = (settings) => {
    // In a real application, this would be an API call
    setAppointmentSettings(settings);
    setSuccess('Appointment settings saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  // Add this handler for AppointmentList delete
  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600 mt-1">Manage all appointments, scheduling, and calendar settings</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {/* Only Admin, Receptionist, and Doctor can add new appointments */}
          {user && ['Admin', 'Receptionist', 'Doctor'].includes(user.role) && (
            <Button onClick={() => setShowAppointmentForm(true)} className="flex items-center">
              <FaPlus className="mr-2" /> Add New Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {success && (
        <Alert
          variant="success"
          title="Success"
          message={success}
          onClose={() => setSuccess(null)}
          className="mb-6"
        />
      )}

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaChartPie className="inline-block mr-2" /> Dashboard
          </button>
          
          <button
            onClick={() => handleTabChange('calendar')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaCalendarAlt className="inline-block mr-2" /> Calendar
          </button>
          
          <button
            onClick={() => handleTabChange('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'list'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaList className="inline-block mr-2" /> List View
          </button>
          
          <button
            onClick={() => handleTabChange('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaCog className="inline-block mr-2" /> Settings
          </button>
        </nav>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="error" title="Error" message={error} />
        </div>
      ) : (
        /* Tab Content */
        <div>
          {activeTab === 'dashboard' && (
            <AppointmentDashboard analytics={appointmentAnalytics} />
          )}
          {activeTab === 'calendar' && (
            <AppointmentCalendarTab
              appointments={appointments || []}
              onViewAppointment={handleViewAppointment}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={(appointment) => {
                setSelectedAppointment(appointment);
                setIsDeleteModalOpen(true);
              }}
              onDateChange={handleDateChange}
              currentDate={currentDate}
              doctors={doctors}
              filterDoctor={filterDoctor}
              setFilterDoctor={setFilterDoctor}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onCreateAppointment={handleCreateAppointment}
              clinicId={clinicId}
            />
          )}
          {activeTab === 'list' && (
            <div className="space-y-6">
              <AppointmentList
                appointments={appointments}
                onView={handleViewAppointment}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                onUpdateStatus={handleUpdateAppointmentStatus}
                isLoading={isLoading}
                error={error}
                userRole={user?.role || 'Admin'}
              />
            </div>
          )}
          {activeTab === 'settings' && (
            <AppointmentSettings
              settings={appointmentSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {/* Appointment Form Modal */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedAppointment(null);
          setAppointmentFormInitialData(null);
        }}
        title={selectedAppointment?._id ? "Edit Appointment" : "New Appointment"}
        size="lg"
      >
        <AppointmentFormExport
          onSubmit={selectedAppointment?._id ? handleUpdateAppointment : handleCreateAppointmentSubmit}
          initialData={selectedAppointment || appointmentFormInitialData}
          isLoading={isLoading}
          error={error}
          clinicId={clinic?._id || localStorage.getItem('defaultClinicId')}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
            setAppointmentFormInitialData(null);
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
          onEdit={handleEditAppointment}
          onDelete={() => {
            setIsDeleteModalOpen(true);
          }}
          onUpdateStatus={(appointment, status) => handleUpdateAppointmentStatus(appointment._id, status)}
          onReschedule={handleRescheduleAppointment}
          userRole={user?.role || "Admin"}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAppointment && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteAppointment}
          title="Delete Appointment"
          message={`Are you sure you want to delete this appointment? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
