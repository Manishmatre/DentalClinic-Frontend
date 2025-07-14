import api from '../axios';
import axios from 'axios';
import { getToken } from '../axios';
import { calculateTrend } from '../../utils/chartUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a silent axios instance that doesn't log errors to console
const silentAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
silentAxios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // Silently handle request errors
    return Promise.resolve({ data: null });
  }
);

// Add response interceptor to silently handle errors
silentAxios.interceptors.response.use(
  response => response,
  error => {
    // Silently handle response errors and return a resolved promise
    // to prevent console errors
    return Promise.resolve({ data: null, silentError: error });
  }
);

const dashboardService = {
  /**
   * Get admin dashboard statistics and data
   */
  getAdminDashboardData: async (clinicId) => {
    // Enhanced clinic ID resolution with debugging
    let resolvedClinicId = clinicId;
    
    if (!resolvedClinicId) {
      console.log('🔍 No clinic ID provided, attempting to resolve from multiple sources...');
      
      // Try to get from localStorage
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        try {
          const parsedClinicData = JSON.parse(storedClinicData);
          resolvedClinicId = parsedClinicData._id;
          console.log('✅ Found clinic ID from localStorage clinicData:', resolvedClinicId);
        } catch (e) {
          console.warn('❌ Failed to parse clinicData from localStorage:', e);
        }
      }
      
      // Try to get from userData
      if (!resolvedClinicId) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              resolvedClinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
              console.log('✅ Found clinic ID from localStorage userData:', resolvedClinicId);
            }
          } catch (e) {
            console.warn('❌ Failed to parse userData from localStorage:', e);
          }
        }
      }
      
      // Try to get from defaultClinicId
      if (!resolvedClinicId) {
        resolvedClinicId = localStorage.getItem('defaultClinicId');
        if (resolvedClinicId) {
          console.log('✅ Found clinic ID from localStorage defaultClinicId:', resolvedClinicId);
        }
      }
    }
    
    if (!resolvedClinicId) {
      console.warn('❌ No clinic ID available from any source, using mock dashboard data');
      return generateMockAdminData();
    }
    
    console.log('🚀 Fetching real dashboard data for clinic ID:', resolvedClinicId);
    
    try {
      // Use silentAxios to prevent console errors
      const response = await silentAxios.get(`/dashboard/admin?clinicId=${resolvedClinicId}`);
      
      // If we got a successful response with data
      if (response.data && !response.silentError) {
        console.log('✅ Successfully fetched real dashboard data');
        return response.data;
      } else {
        // Log the error for debugging
        if (response.silentError) {
          console.warn('❌ API call failed:', response.silentError.message);
        }
        console.log('⚠️ Using mock dashboard data due to API failure');
        return generateMockAdminData();
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.log('⚠️ Using mock dashboard data due to error');
      return generateMockAdminData();
    }
  },

  /**
   * Get doctor dashboard statistics and data
   */
  getDoctorDashboardData: async (doctorId, clinicId) => {
    // Enhanced clinic ID resolution with debugging
    let resolvedClinicId = clinicId;
    
    if (!resolvedClinicId) {
      console.log('🔍 No clinic ID provided for doctor dashboard, attempting to resolve...');
      
      // Try to get from localStorage
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        try {
          const parsedClinicData = JSON.parse(storedClinicData);
          resolvedClinicId = parsedClinicData._id;
          console.log('✅ Found clinic ID from localStorage clinicData:', resolvedClinicId);
        } catch (e) {
          console.warn('❌ Failed to parse clinicData from localStorage:', e);
        }
      }
      
      // Try to get from userData
      if (!resolvedClinicId) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              resolvedClinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
              console.log('✅ Found clinic ID from localStorage userData:', resolvedClinicId);
            }
          } catch (e) {
            console.warn('❌ Failed to parse userData from localStorage:', e);
          }
        }
      }
    }
    
    // Check if required parameters are undefined or null
    if (!doctorId || !resolvedClinicId) {
      console.warn('❌ Missing doctor ID or clinic ID, using mock doctor dashboard data');
      console.log('Doctor ID:', doctorId, 'Clinic ID:', resolvedClinicId);
      return generateMockDoctorData();
    }
    
    console.log('🚀 Fetching real doctor dashboard data for doctor ID:', doctorId, 'clinic ID:', resolvedClinicId);
    
    try {
      // Use silentAxios to prevent console errors
      const response = await silentAxios.get(`/dashboard/doctor?doctorId=${doctorId}&clinicId=${resolvedClinicId}`);
      
      // If we got a successful response with data
      if (response.data && !response.silentError) {
        console.log('✅ Successfully fetched real doctor dashboard data');
        return response.data;
      } else {
        // Log the error for debugging
        if (response.silentError) {
          console.warn('❌ API call failed:', response.silentError.message);
        }
        console.log('⚠️ Using mock doctor dashboard data due to API failure');
        return generateMockDoctorData();
      }
    } catch (error) {
      console.error('❌ Error fetching doctor dashboard data:', error);
      console.log('⚠️ Using mock doctor dashboard data due to error');
      return generateMockDoctorData();
    }
  },

  /**
   * Get patient dashboard statistics and data
   */
  getPatientDashboardData: async (patientId) => {
    // Check if patientId is undefined or null
    if (!patientId) {
      console.warn('❌ No patient ID available, using mock patient dashboard data');
      return generateMockPatientData();
    }
    
    console.log('🚀 Fetching real patient dashboard data for patient ID:', patientId);
    
    try {
      // Use silentAxios to prevent console errors
      const response = await silentAxios.get(`/dashboard/patient?patientId=${patientId}`);
      
      // If we got a successful response with data
      if (response.data && !response.silentError) {
        console.log('✅ Successfully fetched real patient dashboard data');
        return response.data;
      } else {
        // Log the error for debugging
        if (response.silentError) {
          console.warn('❌ API call failed:', response.silentError.message);
        }
        console.log('⚠️ Using mock patient dashboard data due to API failure');
        return generateMockPatientData();
      }
    } catch (error) {
      console.error('❌ Error fetching patient dashboard data:', error);
      console.log('⚠️ Using mock patient dashboard data due to error');
      return generateMockPatientData();
    }
  },

  /**
   * Get receptionist dashboard statistics and data
   */
  getReceptionistDashboardData: async (clinicId) => {
    // Enhanced clinic ID resolution with debugging
    let resolvedClinicId = clinicId;
    
    if (!resolvedClinicId) {
      console.log('🔍 No clinic ID provided for receptionist dashboard, attempting to resolve...');
      
      // Try to get from localStorage
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        try {
          const parsedClinicData = JSON.parse(storedClinicData);
          resolvedClinicId = parsedClinicData._id;
          console.log('✅ Found clinic ID from localStorage clinicData:', resolvedClinicId);
        } catch (e) {
          console.warn('❌ Failed to parse clinicData from localStorage:', e);
        }
      }
      
      // Try to get from userData
      if (!resolvedClinicId) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              resolvedClinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
              console.log('✅ Found clinic ID from localStorage userData:', resolvedClinicId);
            }
          } catch (e) {
            console.warn('❌ Failed to parse userData from localStorage:', e);
          }
        }
      }
    }
    
    // Check if clinicId is undefined or null
    if (!resolvedClinicId) {
      console.warn('❌ No clinic ID available, using mock receptionist dashboard data');
      return generateMockReceptionistData();
    }
    
    console.log('🚀 Fetching real receptionist dashboard data for clinic ID:', resolvedClinicId);
    
    try {
      // Use silentAxios to prevent console errors
      const response = await silentAxios.get(`/dashboard/receptionist?clinicId=${resolvedClinicId}`);
      
      // If we got a successful response with data
      if (response.data && !response.silentError) {
        console.log('✅ Successfully fetched real receptionist dashboard data');
        return response.data;
      } else {
        // Log the error for debugging
        if (response.silentError) {
          console.warn('❌ API call failed:', response.silentError.message);
        }
        console.log('⚠️ Using mock receptionist dashboard data due to API failure');
        return generateMockReceptionistData();
      }
    } catch (error) {
      console.error('❌ Error fetching receptionist dashboard data:', error);
      console.log('⚠️ Using mock receptionist dashboard data due to error');
      return generateMockReceptionistData();
    }
  }
};

// Mock data generators for testing and development
function generateMockAdminData() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Mock current and previous period values for trend calculation
  const currentValues = {
    totalPatients: 1250,
    totalDoctors: 8,
    todayAppointments: 28,
    monthlyRevenue: 156000,
    pendingAppointments: 16,
    completedAppointments: 12,
    staffPresent: 6,
    totalStaff: 10
  };

  const previousValues = {
    totalPatients: 1180,
    totalDoctors: 7,
    todayAppointments: 25,
    monthlyRevenue: 142000,
    pendingAppointments: 18,
    completedAppointments: 10,
    staffPresent: 5,
    totalStaff: 9
  };

  // Calculate trends
  const trends = {
    totalPatients: calculateTrend(currentValues.totalPatients, previousValues.totalPatients),
    totalDoctors: calculateTrend(currentValues.totalDoctors, previousValues.totalDoctors),
    todayAppointments: calculateTrend(currentValues.todayAppointments, previousValues.todayAppointments),
    monthlyRevenue: calculateTrend(currentValues.monthlyRevenue, previousValues.monthlyRevenue),
    pendingAppointments: calculateTrend(currentValues.pendingAppointments, previousValues.pendingAppointments),
    completedAppointments: calculateTrend(currentValues.completedAppointments, previousValues.completedAppointments),
    staffPresent: calculateTrend(currentValues.staffPresent, previousValues.staffPresent)
  };

  // Generate mock appointments for last 30 days
  const recentAppointments = Array(5).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 5));
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
    const services = ['Dental Checkup', 'Teeth Cleaning', 'Root Canal', 'Tooth Extraction', 'Dental Implant'];
    const doctors = ['John Smith', 'Emily Brown', 'Michael Johnson', 'Sarah Davis'];
    const patients = ['Alice Wilson', 'Bob Thompson', 'Carol Martinez', 'David Anderson', 'Eva Rodriguez'];

    return {
      _id: `app-${index}`,
      startTime: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      serviceType: services[Math.floor(Math.random() * services.length)],
      doctorId: {
        _id: `doc-${index}`,
        name: doctors[Math.floor(Math.random() * doctors.length)]
      },
      patientId: {
        _id: `pat-${index}`,
        name: patients[Math.floor(Math.random() * patients.length)]
      }
    };
  });

  // Generate weekly revenue data
  const weeklyRevenue = Array(7).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      date: date.toISOString(),
      value: 15000 + Math.floor(Math.random() * 10000)
    };
  });

  // Generate monthly revenue data
  const monthlyRevenue = Array(12).fill(0).map((_, index) => {
    const date = new Date(currentYear, index, 15);
    return {
      date: date.toISOString(),
      value: 120000 + Math.floor(Math.random() * 60000)
    };
  });

  // Generate appointment statistics by service type
  const appointmentsByService = [
    { service: 'Dental Checkup', count: 45 },
    { service: 'Teeth Cleaning', count: 38 },
    { service: 'Root Canal', count: 12 },
    { service: 'Tooth Extraction', count: 18 },
    { service: 'Dental Implant', count: 8 }
  ];

  // Generate patient demographics data
  const patientDemographics = {
    ageGroups: [
      { group: 'Under 18', count: 210 },
      { group: '18-30', count: 340 },
      { group: '31-45', count: 385 },
      { group: '46-60', count: 215 },
      { group: 'Over 60', count: 100 }
    ],
    gender: {
      male: 585,
      female: 665
    }
  };

  return {
    stats: currentValues,
    trends,
    recentAppointments,
    chartData: {
      weeklyRevenue,
      monthlyRevenue,
      appointmentsByService,
      patientDemographics
    }
  };
}

function generateMockDoctorData() {
  // Generate mock appointments for today
  const todayAppointments = Array(8).fill(0).map((_, index) => {
    const date = new Date();
    date.setHours(9 + Math.floor(index / 2), (index % 2) * 30);

    const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
    const services = ['Dental Checkup', 'Teeth Cleaning', 'Root Canal', 'Tooth Extraction', 'Dental Implant'];
    const patients = ['Alice Wilson', 'Bob Thompson', 'Carol Martinez', 'David Anderson', 'Eva Rodriguez', 'Frank Lewis', 'Grace Hall', 'Henry Wright'];

    return {
      _id: `app-${index}`,
      startTime: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      serviceType: services[Math.floor(Math.random() * services.length)],
      patientId: {
        _id: `pat-${index}`,
        name: patients[index % patients.length]
      }
    };
  });

  // Mock patient demographics for doctor's patients
  const patientDemographics = {
    ageGroups: [
      { group: 'Under 18', count: 32 },
      { group: '18-30', count: 48 },
      { group: '31-45', count: 65 },
      { group: '46-60', count: 38 },
      { group: 'Over 60', count: 17 }
    ],
    gender: {
      male: 95,
      female: 105
    }
  };

  // Mock treatment statistics
  const treatmentStats = {
    cleanings: 35,
    fillings: 42,
    rootCanals: 12,
    extractions: 18,
    implants: 7
  };

  // Weekly appointment count
  const weeklyAppointments = Array(7).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      date: date.toISOString(),
      value: 4 + Math.floor(Math.random() * 6)
    };
  });

  return {
    stats: {
      totalPatients: 200,
      todayAppointments: todayAppointments.length,
      completedToday: todayAppointments.filter(a => a.status === 'Completed').length,
      pendingToday: todayAppointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length,
      averageRating: 4.8,
      weeklyAppointments: weeklyAppointments.reduce((sum, item) => sum + item.value, 0),
      weeklyAppointmentsTrend: calculateTrend(
        weeklyAppointments.reduce((sum, item) => sum + item.value, 0),
        weeklyAppointments.slice(0, 4).reduce((sum, item) => sum + item.value, 0)
      )
    },
    todayAppointments,
    chartData: {
      patientDemographics,
      treatmentStats,
      weeklyAppointments
    }
  };
}

function generateMockPatientData() {
  // Generate mock appointments
  const appointments = Array(4).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index * 7); // One appointment per week
    date.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 4) * 15);

    const statuses = ['Scheduled', 'Confirmed'];
    const services = ['Dental Checkup', 'Teeth Cleaning', 'Root Canal', 'Tooth Extraction'];
    const doctors = ['Dr. John Smith', 'Dr. Emily Brown', 'Dr. Michael Johnson', 'Dr. Sarah Davis'];

    return {
      _id: `app-${index}`,
      startTime: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      serviceType: services[index % services.length],
      doctorId: {
        _id: `doc-${index}`,
        name: doctors[index % doctors.length]
      }
    };
  });

  // Mock medical history data
  const medicalHistory = {
    lastVisit: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    nextFollowUp: appointments[0].startTime,
    ongoingTreatments: [
      {
        name: 'Dental Implant',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        progress: 70,
        nextStep: 'Final Restoration'
      }
    ],
    pastTreatments: [
      {
        name: 'Cavity Filling',
        date: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(),
        doctor: 'Dr. Emily Brown'
      },
      {
        name: 'Teeth Cleaning',
        date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
        doctor: 'Dr. John Smith'
      }
    ],
    allergies: ['Penicillin'],
    medications: ['None'],
    treatmentProgress: [
      { date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), value: 0 },
      { date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), value: 30 },
      { date: new Date().toISOString(), value: 70 },
      { date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(), value: 100 }
    ]
  };

  // Mock billing data
  const billing = {
    pendingAmount: 12000,
    paidAmount: 28000,
    nextPayment: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    paymentHistory: [
      {
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        amount: 15000,
        service: 'Dental Implant - Initial'
      },
      {
        date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        amount: 8000,
        service: 'Cavity Filling'
      },
      {
        date: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(),
        amount: 5000,
        service: 'Teeth Cleaning'
      }
    ]
  };

  return {
    appointments,
    medicalSummary: medicalHistory,
    billing
  };
}

function generateMockReceptionistData() {
  // Generate today's appointments
  const todayAppointments = Array(15).fill(0).map((_, index) => {
    const date = new Date();
    date.setHours(9 + Math.floor(index / 3), (index % 3) * 20);

    const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
    const statusWeights = [0.3, 0.3, 0.3, 0.1]; // 30% each for first 3, 10% for cancelled
    const statusIndex = weightedRandom(statusWeights);

    const services = ['Dental Checkup', 'Teeth Cleaning', 'Root Canal', 'Tooth Extraction', 'Dental Implant'];
    const doctors = ['Dr. John Smith', 'Dr. Emily Brown', 'Dr. Michael Johnson', 'Dr. Sarah Davis'];
    const patients = ['Alice Wilson', 'Bob Thompson', 'Carol Martinez', 'David Anderson', 'Eva Rodriguez', 'Frank Lewis', 'Grace Hall', 'Henry Wright'];

    return {
      _id: `app-${index}`,
      startTime: date.toISOString(),
      status: statuses[statusIndex],
      serviceType: services[Math.floor(Math.random() * services.length)],
      doctorId: {
        _id: `doc-${index % doctors.length}`,
        name: doctors[index % doctors.length]
      },
      patientId: {
        _id: `pat-${index % patients.length}`,
        name: patients[index % patients.length]
      },
      checkedIn: Math.random() > 0.5 && statuses[statusIndex] !== 'Cancelled'
    };
  });

  // Generate waiting room status
  const waitingRoom = todayAppointments
    .filter(a => a.checkedIn && a.status !== 'Completed')
    .map(a => ({
      appointmentId: a._id,
      patientName: a.patientId.name,
      doctorName: a.doctorId.name,
      serviceType: a.serviceType,
      scheduledTime: a.startTime,
      waitingSince: new Date(new Date(a.startTime).getTime() - Math.floor(Math.random() * 20) * 60000).toISOString() // Random check-in time up to 20 minutes before appointment
    }));

  // Today's revenue
  const todayPayments = Array(8).fill(0).map((_, index) => {
    const date = new Date();
    date.setHours(9 + Math.floor(index / 2), Math.floor(Math.random() * 60));

    const amounts = [1500, 2500, 5000, 8000, 12000, 15000, 25000];
    const paymentMethods = ['Cash', 'Credit Card', 'Insurance', 'Online'];

    return {
      _id: `pay-${index}`,
      time: date.toISOString(),
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      patientName: todayAppointments[Math.floor(Math.random() * todayAppointments.length)].patientId.name
    };
  });

  const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const yesterdayRevenue = todayRevenue * (0.8 + Math.random() * 0.4); // +/- 20% of today's revenue

  return {
    stats: {
      totalAppointments: todayAppointments.length,
      confirmedAppointments: todayAppointments.filter(a => a.status === 'Confirmed').length,
      pendingPayments: 5,
      todayRevenue,
      todayRevenueTrend: calculateTrend(todayRevenue, yesterdayRevenue),
      checkedIn: waitingRoom.length,
      noShows: 2
    },
    todayAppointments,
    waitingRoom,
    todayPayments,
    doctorSchedule: [
      { doctorId: 'doc-0', doctorName: 'Dr. John Smith', availableSlots: 3, bookedSlots: 5 },
      { doctorId: 'doc-1', doctorName: 'Dr. Emily Brown', availableSlots: 2, bookedSlots: 6 },
      { doctorId: 'doc-2', doctorName: 'Dr. Michael Johnson', availableSlots: 4, bookedSlots: 4 },
      { doctorId: 'doc-3', doctorName: 'Dr. Sarah Davis', availableSlots: 1, bookedSlots: 7 }
    ]
  };
}

// Utility for weighted random selection
function weightedRandom(weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return i;
  }
  
  return weights.length - 1;
}

export default dashboardService;
