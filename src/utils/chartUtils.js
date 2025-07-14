// Chart configuration utilities for dashboard visualizations
import { format } from 'date-fns';

// Common color schemes for charts
export const chartColors = {
  primary: ['#4f46e5', '#818cf8', '#c7d2fe'],
  success: ['#10b981', '#6ee7b7', '#d1fae5'],
  warning: ['#f59e0b', '#fcd34d', '#fef3c7'],
  danger: ['#ef4444', '#fca5a5', '#fee2e2'],
  neutral: ['#6b7280', '#d1d5db', '#f3f4f6'],
  // Dental specific colors
  dental: ['#00a4bd', '#59cbe8', '#b3e7f2']
};

// Format data for appointment statistics by status
export const formatAppointmentStatusData = (appointments) => {
  const statusCounts = {
    Scheduled: 0,
    Confirmed: 0,
    Completed: 0,
    Cancelled: 0,
    'No Show': 0
  };
  
  appointments.forEach(appointment => {
    if (statusCounts.hasOwnProperty(appointment.status)) {
      statusCounts[appointment.status]++;
    }
  });
  
  return {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Appointments',
        data: Object.values(statusCounts),
        backgroundColor: [
          '#818cf8', // Scheduled - indigo
          '#60a5fa', // Confirmed - blue
          '#34d399', // Completed - green
          '#f87171', // Cancelled - red
          '#fbbf24'  // No Show - amber
        ],
        borderWidth: 1
      }
    ]
  };
};

// Format data for revenue over time
export const formatRevenueData = (data, period = 'week') => {
  const labels = [];
  const values = [];
  
  // Sort by date
  data.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  data.forEach(item => {
    let formattedDate;
    const date = new Date(item.date);
    
    if (period === 'day') {
      formattedDate = format(date, 'HH:mm');
    } else if (period === 'week') {
      formattedDate = format(date, 'EEE');
    } else if (period === 'month') {
      formattedDate = format(date, 'dd MMM');
    } else if (period === 'year') {
      formattedDate = format(date, 'MMM');
    }
    
    labels.push(formattedDate);
    values.push(item.value);
  });
  
  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: values,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4f46e5'
      }
    ]
  };
};

// Format data for patient demographics
export const formatPatientDemographicsData = (patients) => {
  const ageGroups = {
    'Under 18': 0,
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    'Over 60': 0
  };
  
  patients.forEach(patient => {
    const birthDate = new Date(patient.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18) ageGroups['Under 18']++;
    else if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['Over 60']++;
  });
  
  return {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: 'Patients by Age Group',
        data: Object.values(ageGroups),
        backgroundColor: chartColors.dental,
        borderWidth: 1
      }
    ]
  };
};

// Format data for service popularity
export const formatServicePopularityData = (appointments) => {
  const serviceCounts = {};
  
  // Count services
  appointments.forEach(appointment => {
    const service = appointment.serviceType;
    if (service) {
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    }
  });
  
  // Sort by popularity and take top 5
  const sortedServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return {
    labels: sortedServices.map(([service]) => service),
    datasets: [
      {
        label: 'Service Popularity',
        data: sortedServices.map(([_, count]) => count),
        backgroundColor: chartColors.dental,
        borderWidth: 1
      }
    ]
  };
};

// Format appointments by day of week
export const formatAppointmentsByDayData = (appointments) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCount = Array(7).fill(0);
  
  appointments.forEach(appointment => {
    const day = new Date(appointment.startTime).getDay();
    dayCount[day]++;
  });
  
  return {
    labels: dayNames,
    datasets: [
      {
        label: 'Appointments by Day',
        data: dayCount,
        backgroundColor: '#4f46e5',
        borderColor: '#4338ca',
        borderWidth: 1
      }
    ]
  };
};

// Format trend data with percentage change
export const calculateTrend = (current, previous) => {
  if (!previous) return { value: 0, direction: 'neutral' };
  
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
  
  return {
    value: Math.abs(percentChange).toFixed(1),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
};
