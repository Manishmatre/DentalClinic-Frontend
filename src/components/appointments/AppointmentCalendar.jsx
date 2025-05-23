import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaList, FaPlus, FaFilter } from 'react-icons/fa';
import './AppointmentCalendar.css';
import { format } from 'date-fns';

// Create the localizer for the calendar
const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ 
  clinicId, 
  doctorId = null, 
  patientId = null,
  userRole = 'Admin',
  onSelectAppointment,
  onCreateAppointment,
  readOnly = false
}) => {
  // Ensure clinicId is a string, not an object
  const [effectiveClinicId, setEffectiveClinicId] = useState(null);
  
  // Process clinicId on mount and when it changes
  useEffect(() => {
    let processedClinicId = null;
    
    // If clinicId is an object with _id property, use that
    if (typeof clinicId === 'object' && clinicId && clinicId._id) {
      processedClinicId = clinicId._id;
      console.log('Converting clinicId object to string:', processedClinicId);
    } 
    // If it's already a string, use it directly
    else if (typeof clinicId === 'string' && clinicId) {
      processedClinicId = clinicId;
      console.log('Using clinicId as string:', processedClinicId);
    }
    // Otherwise try to get clinic ID from localStorage
    else {
      const defaultClinicId = localStorage.getItem('defaultClinicId');
      if (defaultClinicId) {
        processedClinicId = defaultClinicId;
        console.log('Using defaultClinicId from localStorage:', processedClinicId);
      } else {
        console.error('No valid clinicId available');
      }
    }
    
    setEffectiveClinicId(processedClinicId);
  }, [clinicId]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');

  useEffect(() => {
    // Only fetch appointments when we have a valid clinic ID
    if (effectiveClinicId) {
      console.log('Fetching appointments with effective clinicId:', effectiveClinicId);
      fetchAppointments();
    }
  }, [doctorId, patientId, date, view, effectiveClinicId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      // Determine the date range based on the current view
      let startDate, endDate;
      
      if (view === 'day') {
        startDate = moment(date).startOf('day').toDate();
        endDate = moment(date).endOf('day').toDate();
      } else if (view === 'week') {
        startDate = moment(date).startOf('week').toDate();
        endDate = moment(date).endOf('week').toDate();
      } else if (view === 'month') {
        startDate = moment(date).startOf('month').toDate();
        endDate = moment(date).endOf('month').toDate();
      } else {
        // For agenda view, use a reasonable default (e.g., next 30 days)
        startDate = new Date();
        endDate = moment(startDate).add(30, 'days').toDate();
      }
      
      // Build query parameters with the validated effectiveClinicId
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clinicId: effectiveClinicId // Use the validated string clinicId
      };
      
      console.log('Using effectiveClinicId in params:', effectiveClinicId);
      
      if (doctorId) {
        params.doctorId = doctorId;
      }
      
      if (patientId) {
        params.patientId = patientId;
      }
      
      // Fetch appointments
      let data;
      if (doctorId) {
        data = await appointmentService.getAppointmentsByDoctor(doctorId, params);
      } else if (patientId) {
        data = await appointmentService.getAppointmentsByPatient(patientId, params);
      } else {
        data = await appointmentService.getAppointments(params);
      }
      
      // Transform appointments for the calendar
      const formattedAppointments = data.map(appointment => {
        const patientName = appointment.patientId?.name || appointment.patientName || 'Patient';
        const doctorName = appointment.doctorId?.name || appointment.doctorName || 'Doctor';
        
        return {
          id: appointment._id,
          title: `${patientName} - ${doctorName} - ${appointment.serviceType}`,
          start: new Date(appointment.startTime),
          end: new Date(appointment.endTime),
          status: appointment.status,
          resource: appointment, // Store the full appointment data
          patientName,
          doctorName,
          serviceType: appointment.serviceType
        };
      });
      
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    if (onSelectAppointment) {
      onSelectAppointment(event.resource);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    if (onCreateAppointment && !readOnly) {
      console.log('Selected time slot:', { start, end });
      
      // Ensure we're passing proper date objects
      const startTime = new Date(start);
      const endTime = new Date(end);
      
      // Validate the selected time
      const now = new Date();
      if (startTime < now) {
        toast.error('Cannot create appointments in the past');
        return;
      }
      
      // Default to 30-minute appointment if same start/end time (clicking instead of dragging)
      if (startTime.getTime() === endTime.getTime()) {
        endTime.setMinutes(endTime.getMinutes() + 30);
      }
      
      // Format times for display
      const formattedStart = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedDate = startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      
      // Notify user of selected time slot
      toast.info(`Creating appointment for ${formattedDate} at ${formattedStart}`);
      
      // Pass the time slot to the parent component
      onCreateAppointment({
        startTime: startTime,
        endTime: endTime
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

  // Custom event render component
  const EventComponent = ({ event }) => {
    // Get status color from eventStyleGetter
    const { style } = eventStyleGetter(event);
    
    return (
      <div style={{ ...style, padding: '4px' }}>
        <div className="font-medium">{event.patientName}</div>
        <div className="text-xs">Dr. {event.doctorName}</div>
        <div className="text-xs">{event.serviceType}</div>
        <div className="text-xs">
          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
        </div>
      </div>
    );
  };

  return (
    <Card>
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="h-[600px] p-4">
          <Calendar
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
          />
        </div>
      )}
    </Card>
  );
};

export default AppointmentCalendar;
