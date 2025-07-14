import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaList, FaPlus, FaFilter, FaEdit, FaTrash, FaCheck, FaClock, FaUser, FaStethoscope } from 'react-icons/fa';
import './AppointmentCalendar.css';
import { format } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import serviceService from '../../api/services/serviceService';

// Create the localizer for the calendar
const localizer = momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

const AppointmentCalendar = ({ 
  clinicId, 
  doctorId = null, 
  patientId = null,
  userRole = 'Admin',
  onSelectAppointment,
  onCreateAppointment,
  readOnly = false
}) => {
  // Move useAuth to top level
  const { user, clinic } = useAuth();
  const [effectiveClinicId, setEffectiveClinicId] = useState(null);
  const [isClinicLoading, setIsClinicLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [locationPermission, setLocationPermission] = useState(null);
  const [tooltipEvent, setTooltipEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const popoverRef = useRef(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [serviceMap, setServiceMap] = useState({});

  // Set effectiveClinicId with fallback and loading state
  useEffect(() => {
    let processedClinicId = null;
    
    // ALWAYS use the current user's clinic ID from auth context for consistency
    if (user && user.clinicId) {
      processedClinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
      console.log('Using user.clinicId from auth context:', processedClinicId);
    } else if (clinic && clinic._id) {
      processedClinicId = clinic._id;
      console.log('Using clinic._id from auth context:', processedClinicId);
    } else if (clinic && clinic.id) {
      processedClinicId = clinic.id;
      console.log('Using clinic.id from auth context:', processedClinicId);
    } else if (typeof clinicId === 'object' && clinicId && clinicId._id) {
      processedClinicId = clinicId._id;
      console.log('Using clinicId._id from props (fallback):', processedClinicId);
    } else if (typeof clinicId === 'string' && clinicId) {
      processedClinicId = clinicId;
      console.log('Using clinicId from props (fallback):', processedClinicId);
    }
    
    console.log('Clinic ID processing:', {
      clinicId,
      clinic,
      userClinicId: user?.clinicId,
      processedClinicId,
      user
    });
    
    if (processedClinicId) {
      setEffectiveClinicId(processedClinicId);
      setIsClinicLoading(false);
      setError(null);
    } else {
      // Wait for clinic to load, don't show error yet
      setIsClinicLoading(true);
      console.warn('No clinic ID available yet, waiting for data to load...');
    }
  }, [user, clinic, clinicId]);

  // Debug clinic information
  useEffect(() => {
    console.log('Clinic information updated:', {
      clinic,
      effectiveClinicId,
      user,
      isClinicLoading
    });
  }, [clinic, effectiveClinicId, user, isClinicLoading]);

  // Handle location permission
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions && navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      });
    }
  }, []);

  // Fetch appointments when all dependencies are ready
  useEffect(() => {
    if (effectiveClinicId && !isClinicLoading) {
      fetchAppointments();
    }
  }, [effectiveClinicId, isClinicLoading, doctorId, patientId, date, view]);

  // Fetch all services and build a map of ID to name
  useEffect(() => {
    const fetchServices = async () => {
      const result = await serviceService.getServices();
      if (result && Array.isArray(result)) {
        const map = {};
        result.forEach(service => {
          map[service._id] = service.name;
        });
        setServiceMap(map);
      } else if (result && Array.isArray(result.data)) {
        const map = {};
        result.data.forEach(service => {
          map[service._id] = service.name;
        });
        setServiceMap(map);
      }
    };
    fetchServices();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      if (!['Admin', 'Receptionist', 'Doctor', 'Patient'].includes(user.role)) {
        console.error('User does not have permission to view appointments');
        toast.error('You do not have permission to view appointments.');
        setIsLoading(false);
        return;
      }

      // Get current time for filtering
      const now = new Date();
      
      // Determine the date range based on the current view
      let startDate, endDate;
      
      if (view === 'day') {
        startDate = moment(now).startOf('day').toDate();
        endDate = moment(now).endOf('day').toDate();
      } else if (view === 'week') {
        startDate = moment(now).startOf('week').toDate();
        endDate = moment(now).endOf('week').toDate();
      } else if (view === 'month') {
        startDate = moment(now).startOf('month').toDate();
        endDate = moment(now).endOf('month').toDate();
      } else {
        // For agenda view, show next 30 days from now
        startDate = now;
        endDate = moment(now).add(30, 'days').toDate();
      }

      // Validate clinic ID
      if (!effectiveClinicId) {
        console.error('No valid clinic ID available for fetching appointments');
        toast.error('Missing clinic information. Please try again later.');
        setIsLoading(false);
        return;
      }

      // Determine which appointments to show based on user role
      let params = {
        clinicId: effectiveClinicId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: ['Scheduled', 'Confirmed'] // Only show active appointments
      };

      // For patients, only show their own appointments
      if (user.role === 'Patient') {
        params.patientId = user._id;
      }
      
      // For doctors, only show their own appointments
      if (user.role === 'Doctor') {
        params.doctorId = user._id;
      }

      // Fetch appointments with date range and filter out unwanted statuses
      const response = await appointmentService.getAppointments(params);

      if (response.error) {
        console.error('Error response from appointment service:', response.message);
        toast.error(response.message || 'Failed to fetch appointments');
        setIsLoading(false);
        return;
      }
      
      // Ensure data is an array
      const appointmentsArray = Array.isArray(response) ? response : 
                              (response.data && Array.isArray(response.data)) ? response.data : [];

      // Format appointments for the calendar
      const formattedAppointments = appointmentsArray.map(appointment => {
        // Extract patient name from various possible formats
        const patientName = appointment.patientName || 
                          (appointment.patient?.name) || 
                          (appointment.patient?.firstName && appointment.patient?.lastName ? 
                           `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Unknown Patient');
        
        // Extract doctor name from various possible formats
        const doctorName = appointment.doctorName || 
                         (appointment.doctor?.name) || 
                         (appointment.doctor?.firstName && appointment.doctor?.lastName ? 
                           `${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Unknown Doctor');
        
        // Convert times to local timezone
        const startTime = moment(appointment.startTime).toDate();
        const endTime = moment(appointment.endTime).toDate();

        return {
          id: appointment._id,
          title: `${patientName} - ${serviceMap[appointment.serviceType] || appointment.serviceType || 'Appointment'}`,
          start: startTime,
          end: endTime,
          status: appointment.status || 'Scheduled',
          patientName: patientName,
          doctorName: doctorName,
          serviceType: appointment.serviceType || 'General Appointment',
          notes: appointment.notes || '',
          reason: appointment.reason || '',
          ...appointment // include all other fields for tooltip/popover
        };
      });
      
      // Filter out any appointments that are in the past
      const filteredAppointments = formattedAppointments.filter(appointment => {
        return new Date(appointment.start) >= now;
      });

      // Sort appointments by start time
      filteredAppointments.sort((a, b) => new Date(a.start) - new Date(b.start));

      setAppointments(filteredAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error(err.response?.data?.message || 'Failed to load appointments');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced event handler with popover
  const handleSelectEvent = (event, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      // Show details modal on click
      setSelectedAppointment(event.resource || event);
      setShowDetailsModal(true);
      return;
    }
    if (onSelectAppointment) {
      onSelectAppointment(event.resource || event);
    }
  };

  // Tooltip handlers
  const handleEventMouseEnter = (event, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTooltipEvent(event);
  };

  const handleEventMouseLeave = () => {
    setTooltipEvent(null);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick action handlers
  const handleMarkComplete = async (appointmentId) => {
    try {
      const result = await appointmentService.updateAppointment(appointmentId, {
        status: 'Completed'
      });
      
      if (result.error) {
        toast.error(result.message || 'Failed to mark appointment as complete');
        return;
      }
      
      toast.success('Appointment marked as complete');
      setShowPopover(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleMarkNoShow = async (appointmentId) => {
    try {
      const result = await appointmentService.updateAppointment(appointmentId, {
        status: 'No Show'
      });
      
      if (result.error) {
        toast.error(result.message || 'Failed to mark appointment as no-show');
        return;
      }
      
      toast.success('Appointment marked as no-show');
      setShowPopover(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const result = await appointmentService.updateAppointment(appointmentId, {
        status: 'Cancelled'
      });
      
      if (result.error) {
        toast.error(result.message || 'Failed to cancel appointment');
        return;
      }
      
      toast.success('Appointment cancelled');
      setShowPopover(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      // Check if user has permission to delete
      if (!['Admin', 'Receptionist'].includes(user.role)) {
        toast.error('You do not have permission to delete appointments.');
        return;
      }

      // Confirm deletion with user
      const confirmDelete = window.confirm('Are you sure you want to delete this appointment?');
      if (!confirmDelete) return;

      // Call the delete service
      const result = await appointmentService.deleteAppointment(appointmentId);
      
      if (result.error) {
        toast.error(result.message || 'Failed to delete appointment');
        return;
      }

      toast.success('Appointment deleted successfully');
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment. Please try again.');
    }
  };

  const adjustToTimeZone = (date, timeZone) => {
    // Convert date to the specified time zone
    try {
      return new Date(date.toLocaleString('en-US', { timeZone }));
    } catch {
      return date;
    }
  };

  const handleSelectSlot = async (slotInfo) => {
    if (onCreateAppointment && !readOnly) {
      const now = new Date();
      
      // Validate user permissions
      if (!['Admin', 'Receptionist', 'Doctor'].includes(user.role)) {
        toast.error('You do not have permission to create appointments.');
        return;
      }

      // Get clinic ID with multiple fallbacks
      let finalClinicId = effectiveClinicId;
      if (!finalClinicId) {
        // Try to get clinic ID from user data
        if (user && user.clinicId) {
          finalClinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
        }
        // Try to get from clinic prop
        else if (clinic && clinic._id) {
          finalClinicId = clinic._id;
        }
        // Try to get from clinicId prop
        else if (clinicId) {
          finalClinicId = typeof clinicId === 'object' ? clinicId._id : clinicId;
        }
      }

      // Validate clinic existence with better error message
      if (!finalClinicId) {
        console.error('No clinic ID available:', {
          effectiveClinicId,
          userClinicId: user?.clinicId,
          clinicId: clinic?._id,
          clinicIdProp: clinicId,
          user,
          clinic
        });
        
        // Show a more helpful error message
        toast.error('Unable to determine clinic information. Please try refreshing the page or contact support if the issue persists.');
        return;
      }

      console.log('Creating appointment with clinic ID:', finalClinicId);

      // Get the original slot times without timezone conversion
      const startTime = new Date(slotInfo.start);
      const endTime = new Date(slotInfo.end);
      
      console.log('Original slot times:', {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        startLocal: startTime.toLocaleString(),
        endLocal: endTime.toLocaleString()
      });
      
      // Validate business hours (8 AM - 6 PM)
      const startHour = startTime.getHours();
      const endHour = endTime.getHours();
      
      if (startHour < 8 || endHour > 18) {
        toast.error('Appointments can only be scheduled between 8 AM and 6 PM.');
        return;
      }

      // Prevent appointments in the past
      if (startTime < now) {
        toast.error('Cannot create appointments in the past');
        return;
      }

      // Set default appointment duration if not specified (30 minutes)
      let adjustedEndTime = endTime;
      if (startTime.getTime() === endTime.getTime()) {
        adjustedEndTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes
      }

      console.log('Adjusted times for appointment:', {
        start: startTime.toISOString(),
        end: adjustedEndTime.toISOString(),
        startLocal: startTime.toLocaleString(),
        endLocal: adjustedEndTime.toLocaleString()
      });

      // Check for conflicts (optional - continue even if this fails)
      try {
      const conflicts = await appointmentService.checkConflicts({
        doctorId: doctorId || undefined,
          startTime: startTime.toISOString(),
        endTime: adjustedEndTime.toISOString(),
          clinicId: finalClinicId
      });

      if (conflicts.length > 0) {
        toast.error('This time slot is already booked. Please select another time.');
        return;
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
        // Continue with appointment creation even if conflict check fails
        toast.warn('Unable to check for scheduling conflicts. Proceeding with appointment creation.');
      }

      // Call the onCreateAppointment callback with the correct times
      onCreateAppointment({
        startTime: startTime.toISOString(),
        endTime: adjustedEndTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        clinicId: finalClinicId,
        doctorId: doctorId
      });
    }
  };

  // Custom event styling based on status
  const eventStyleGetter = (event) => {
    let backgroundColor;
    
    switch (event.status) {
      case 'Confirmed':
        backgroundColor = '#4CAF50'; // Green
        break;
      case 'Cancelled':
        backgroundColor = '#F44336'; // Red
        break;
      case 'Completed':
        backgroundColor = '#9E9E9E'; // Grey
        break;
      case 'No Show':
        backgroundColor = '#FF9800'; // Orange
        break;
      default:
        backgroundColor = '#2196F3'; // Blue (Scheduled)
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Enhanced Event Component with tooltip support
  const EventComponent = ({ event }) => {
    const { style } = eventStyleGetter(event);
    const canManage = ['Admin', 'Receptionist'].includes(user.role);
    const canEdit = ['Admin', 'Receptionist', 'Doctor'].includes(user.role);
    
    return (
      <div 
        style={{ ...style, padding: '4px', cursor: 'pointer' }}
        onMouseEnter={(e) => handleEventMouseEnter(event, e)}
        onMouseLeave={handleEventMouseLeave}
        onClick={(e) => handleSelectEvent(event, e)}
      >
        <div className="font-medium">{event.patientName}</div>
        <div className="text-xs">Dr. {event.doctorName}</div>
        <div className="text-xs">{serviceMap[event.serviceType] || event.serviceType}</div>
        <div className="text-xs">
          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
        </div>
        <div className="text-xs mt-1">
          <span className={`px-2 py-1 rounded text-xs ${
            event.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
            event.status === 'Cancelled' ? 'bg-red-200 text-red-800' :
            event.status === 'Completed' ? 'bg-gray-200 text-gray-800' :
            event.status === 'No Show' ? 'bg-orange-200 text-orange-800' :
            'bg-blue-200 text-blue-800'
          }`}>
            {event.status}
          </span>
        </div>
      </div>
    );
  };

  // Tooltip Component
  const AppointmentTooltip = () => {
    if (!tooltipEvent) return null;
    // Try to get a better position: show above the event, but clamp to viewport
    const tooltipStyle = {
      left: Math.min(Math.max(tooltipPosition.x, 16), window.innerWidth - 320),
      top: Math.max(tooltipPosition.y - 16, 16),
      transform: 'none',
      pointerEvents: 'none',
      maxWidth: 320,
      wordBreak: 'break-word',
      zIndex: 9999
    };
    // Try to show a human-readable service name if available
    let serviceLabel = tooltipEvent.serviceType;
    if (/^[a-fA-F0-9]{24}$/.test(serviceLabel)) {
      serviceLabel = 'Service selected'; // fallback if it's just an ID
    }
    return (
      <div
        ref={tooltipRef}
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm"
        style={tooltipStyle}
      >
        <div className="font-semibold text-gray-900 mb-2">
          <FaUser className="inline mr-2" />
          {tooltipEvent.patientName}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          <FaStethoscope className="inline mr-2" />
          Dr. {tooltipEvent.doctorName}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          <FaClock className="inline mr-2" />
          {moment(tooltipEvent.start).format('MMM DD, YYYY h:mm A')} - {moment(tooltipEvent.end).format('h:mm A')}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          <span className="font-semibold">Service:</span> {serviceMap[tooltipEvent.serviceType] || tooltipEvent.serviceType}
        </div>
        {tooltipEvent.reason && (
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Reason:</span> {tooltipEvent.reason}
          </div>
        )}
        {tooltipEvent.notes && (
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Notes:</span> {tooltipEvent.notes}
          </div>
        )}
        <div className="text-xs">
          <span className={`px-2 py-1 rounded ${
            tooltipEvent.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
            tooltipEvent.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
            tooltipEvent.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
            tooltipEvent.status === 'No Show' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {tooltipEvent.status}
          </span>
        </div>
      </div>
    );
  };

  // Popover Component
  const AppointmentPopover = () => {
    if (!showPopover || !popoverEvent) return null;

    const canManage = ['Admin', 'Receptionist'].includes(user.role);
    const canEdit = ['Admin', 'Receptionist', 'Doctor'].includes(user.role);

    return (
      <div
        ref={popoverRef}
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-48"
        style={{
          left: popoverPosition.x,
          top: popoverPosition.y,
          transform: 'translateX(-50%) translateY(-100%)'
        }}
      >
        <div className="font-semibold text-gray-900 mb-3 border-b pb-2">
          Quick Actions
        </div>
        
        <div className="space-y-2">
          {canEdit && (
            <button
              onClick={() => {
                setShowPopover(false);
                if (onSelectAppointment) onSelectAppointment(popoverEvent.resource);
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Appointment
            </button>
          )}
          
          {popoverEvent.status === 'Scheduled' && canEdit && (
            <button
              onClick={() => handleMarkComplete(popoverEvent.id)}
              className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center"
            >
              <FaCheck className="mr-2" />
              Mark Complete
            </button>
          )}
          
          {popoverEvent.status === 'Scheduled' && canEdit && (
            <button
              onClick={() => handleMarkNoShow(popoverEvent.id)}
              className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded flex items-center"
            >
              <FaClock className="mr-2" />
              Mark No-Show
            </button>
          )}
          
          {popoverEvent.status === 'Scheduled' && canEdit && (
            <button
              onClick={() => handleCancelAppointment(popoverEvent.id)}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center"
            >
              <FaTrash className="mr-2" />
              Cancel Appointment
            </button>
          )}
          
          {canManage && (
            <button
              onClick={() => handleDeleteAppointment(popoverEvent.id)}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center"
            >
              <FaTrash className="mr-2" />
              Delete Appointment
            </button>
          )}
          </div>
      </div>
    );
  };

  // Drag-and-drop event handler
  const handleEventDrop = async ({ event, start, end, isAllDay }) => {
    // Only allow if user has permission
    if (!['Admin', 'Receptionist', 'Doctor'].includes(user.role)) {
      toast.error('You do not have permission to reschedule appointments.');
      return;
    }
    try {
      // Prevent moving to the past
      if (start < new Date()) {
        toast.error('Cannot move appointments to the past.');
        return;
      }
      // Optionally: check for conflicts here (reuse checkConflicts logic)
      // Update appointment in backend
      const result = await appointmentService.updateAppointment(event.id, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      if (result.error) {
        toast.error(result.message || 'Failed to reschedule appointment');
        return;
      }
      toast.success('Appointment rescheduled successfully');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to reschedule appointment.');
    }
  };

  return (
    <Card>
      {isClinicLoading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <Alert type="error" message={error} />
        </div>
      ) : (
        <div className="h-[600px] p-4 relative">
          <DndProvider backend={HTML5Backend}>
            <DragAndDropCalendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={!readOnly}
            components={{
              event: EventComponent
            }}
            eventPropGetter={eventStyleGetter}
            defaultView={view}
            views={['month', 'week', 'day', 'agenda']}
            step={15}
            timeslots={4}
            popup
              onEventDrop={handleEventDrop}
              draggableAccessor={event => ['Admin', 'Receptionist', 'Doctor'].includes(user.role) && !readOnly}
            />
          </DndProvider>
          {/* Tooltip */}
          <AppointmentTooltip />
          {/* Popover */}
          <AppointmentPopover />
          {/* Details Modal */}
          {showDetailsModal && selectedAppointment && (
            <AppointmentDetailsModal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              appointment={selectedAppointment}
              userRole={userRole}
            />
          )}
          {locationPermission === 'prompt' && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-center">
              Please allow location access to use your local time zone for appointment scheduling.
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AppointmentCalendar;
