import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_COLORS } from '../constants/appointmentConstants';

export const formatAppointmentForCalendar = (appointment) => {
  const patientName = appointment.patientId?.name || appointment.patientName || 'Patient';
  const doctorName = appointment.doctorId?.name || appointment.doctorName || 'Doctor';
  
  return {
    id: appointment._id,
    title: `${patientName} - ${doctorName} - ${appointment.serviceType}`,
    start: new Date(appointment.startTime),
    end: new Date(appointment.endTime),
    status: appointment.status,
    resource: appointment,
    patientName,
    doctorName,
    serviceType: appointment.serviceType
  };
};

export const getEventStyle = (event) => {
  const statusColors = APPOINTMENT_STATUS_COLORS[event.status] || APPOINTMENT_STATUS_COLORS[APPOINTMENT_STATUS.SCHEDULED];
  
  return {
    style: {
      backgroundColor: statusColors.background,
      color: statusColors.text,
      borderColor: statusColors.border,
      borderRadius: '4px',
      opacity: 0.8,
      border: '0px',
      display: 'block'
    }
  };
};

export const validateAppointmentDates = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start.getTime())) {
    throw new Error('Invalid start time format');
  }
  if (isNaN(end.getTime())) {
    throw new Error('Invalid end time format');
  }
  if (start < now) {
    throw new Error('Cannot create appointments in the past');
  }
  if (end <= start) {
    throw new Error('End time must be after start time');
  }

  const durationInHours = (end - start) / (1000 * 60 * 60);
  if (durationInHours > 4) {
    throw new Error('Appointment duration cannot exceed 4 hours');
  }

  return true;
};

export const calculateEndTime = (startTime, durationInMinutes) => {
  const start = new Date(startTime);
  return new Date(start.getTime() + durationInMinutes * 60000);
};

export const getDateRangeForView = (date, view) => {
  const startDate = new Date(date);
  let endDate = new Date(date);

  switch (view) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      // For agenda view, use next 30 days
      endDate.setDate(startDate.getDate() + 30);
      break;
  }

  return { startDate, endDate };
}; 