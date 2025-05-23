export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show'
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: {
    background: '#4299e1',
    text: '#ffffff',
    border: '#4299e1'
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    background: '#48bb78',
    text: '#ffffff',
    border: '#48bb78'
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    background: '#f56565',
    text: '#ffffff',
    border: '#f56565'
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    background: '#805ad5',
    text: '#ffffff',
    border: '#805ad5'
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    background: '#ed8936',
    text: '#ffffff',
    border: '#ed8936'
  }
};

export const APPOINTMENT_STATUS_BADGE_CLASSES = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-purple-100 text-purple-800',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-orange-100 text-orange-800'
};

export const APPOINTMENT_STATUS_BUTTON_CLASSES = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'text-blue-700 border-blue-300 hover:bg-blue-50',
  [APPOINTMENT_STATUS.CONFIRMED]: 'text-green-700 border-green-300 hover:bg-green-50',
  [APPOINTMENT_STATUS.CANCELLED]: 'text-red-700 border-red-300 hover:bg-red-50',
  [APPOINTMENT_STATUS.COMPLETED]: 'text-purple-700 border-purple-300 hover:bg-purple-50',
  [APPOINTMENT_STATUS.NO_SHOW]: 'text-orange-700 border-orange-300 hover:bg-orange-50'
};

export const APPOINTMENT_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda'
};

export const APPOINTMENT_FORM_TABS = [
  { id: 'basic', label: 'Basic Information', icon: 'FaUser' },
  { id: 'schedule', label: 'Schedule', icon: 'FaCalendarAlt' },
  { id: 'details', label: 'Details', icon: 'FaClipboardList' }
];

export const REQUIRED_APPOINTMENT_FIELDS = [
  'patientId',
  'doctorId',
  'startTime',
  'endTime',
  'serviceType',
  'clinicId'
]; 