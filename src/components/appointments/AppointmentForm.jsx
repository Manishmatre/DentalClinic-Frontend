import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import serviceService from '../../api/clinic/serviceService';
import Select from 'react-select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import Tabs from '../ui/Tabs';
import { medicalServicesData } from '../../data/medicalServices';
import { 
  FaUser, 
  FaUserMd, 
  FaCalendarAlt, 
  FaClipboardList,
  FaNotesMedical,
  FaInfoCircle,
  FaMagic
} from 'react-icons/fa';
import { formatAppointmentTimeRange, getClinicTimeZone } from '../../utils/timeZoneUtils';
import smartSchedulingService from '../../services/smartSchedulingService';
import AsyncSelect from 'react-select/async';
import treatmentService from '../../api/treatments';

// Form validation schema
const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required').optional(),
  doctorId: z.string().min(1, 'Doctor is required'),
  startTime: z.string().refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid start date/time' })
  .refine(val => {
    const date = new Date(val);
    const now = new Date();
    return date > now;
  }, { message: 'Cannot schedule appointments in the past' }),
  endTime: z.string().refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid end date/time' }),
  serviceType: z.string().min(1, 'Service type is required'),
  notes: z.string().min(1, 'Reason for Appointment is required'),
  status: z.enum(['Scheduled', 'Confirmed', 'Cancelled', 'Completed', 'No Show']).optional()
}).refine(data => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
}).refine(data => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const durationInHours = (end - start) / (1000 * 60 * 60);
  return durationInHours <= 4;
}, {
  message: "Appointment duration cannot exceed 4 hours",
  path: ["endTime"]
}).refine(data => {
  // Ensure patientId is provided before submission
  return data.patientId && data.patientId.trim() !== '';
}, {
  message: "Please select a patient for this appointment",
  path: ["patientId"]
});

// Remove mock data, use real API calls for patients and doctors

// Helper to format date for datetime-local input in a specific time zone
const formatDateTimeLocal = (date, timeZone) => {
  if (!date) return '';
  try {
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    const year = tzDate.getFullYear();
    const month = String(tzDate.getMonth() + 1).padStart(2, '0');
    const day = String(tzDate.getDate()).padStart(2, '0');
    const hours = String(tzDate.getHours()).padStart(2, '0');
    const minutes = String(tzDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return date instanceof Date ? date.toISOString().substring(0, 16) : '';
  }
};

const AppointmentForm = ({ 
  onSubmit, 
  initialData = null,
  isLoading = false,
  error = null,
  clinicId: propClinicId,
  onClose
}) => {

  // State for active tab
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]); // NEW
  const [recentDoctors, setRecentDoctors] = useState([]); // NEW

  // Add state for conflict checking and warning (moved to top)
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Get clinic ID from auth context if not provided as prop
  const { clinic, user } = useAuth();

  // State for clinic ID to ensure it updates when initialData changes
  const [clinicId, setClinicId] = useState(null);

  // Update clinic ID when initialData or other dependencies change
  useEffect(() => {
    let newClinicId = null;
    
    // ALWAYS use the current user's clinic ID from auth context for consistency
    if (user && user.clinicId) {
      newClinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
      console.log('Using user.clinicId from auth context:', newClinicId);
    } else if (clinic && clinic._id) {
      newClinicId = clinic._id;
      console.log('Using clinic._id from auth context:', newClinicId);
    } else if (clinic && clinic.id) {
      newClinicId = clinic.id;
      console.log('Using clinic.id from auth context:', newClinicId);
    } else if (propClinicId) {
      // Fallback to props only if no auth context available
      newClinicId = propClinicId;
      console.log('Using clinicId from props (fallback):', newClinicId);
    } else {
      // No clinicId found, log error for debugging
      console.error('[AppointmentForm] No clinicId found in user, clinic, or props', { user, clinic, propClinicId });
    }

    // Debug log all context for troubleshooting
    console.warn('[AppointmentForm] ClinicId resolution context:', {
      user,
      clinic,
      propClinicId,
      resolved: newClinicId
    });

    setClinicId(newClinicId);
  }, [user, clinic, propClinicId]);

  // Prevent form submission if clinicId is missing
  // if (!clinicId) {
  //   return (
  //     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
  //       <strong className="font-bold">Error:</strong>
  //       <span className="block sm:inline ml-2">No clinic ID found. Cannot create appointment. Please check your login, user profile, and clinic assignment.</span>
  //     </div>
  //   );
  // }

  // --- DO NOT RETURN EARLY BEFORE HOOKS ---
  // Place the early return for missing clinicId BELOW all hooks

  // ... (all hooks, useEffect, useForm, etc. must be called here, unconditionally)

  // ... (all hooks, useEffect, useForm, etc. must be called here, unconditionally)

  // All hooks must be called here, unconditionally, before any return or conditional logic

  // Fetch recent patients on mount
  useEffect(() => {
    if (!clinicId) return;
    patientService.getPatients({ clinicId, limit: 10, sort: '-createdAt' }).then(res => {
      const options = (res.data || []).map(p => ({
        value: p._id,
        label: p.name || (p.firstName + ' ' + p.lastName),
        data: p
      }));
      setRecentPatients(options);
    });
  }, [clinicId]);

  // ... all other useEffect, useState, useForm, etc. hooks ...

  // Place this block just before your main return statement (AFTER all hooks):





  // Fetch recent patients on mount
  useEffect(() => {
    if (!clinicId) return;
    patientService.getPatients({ clinicId, limit: 10, sort: '-createdAt' }).then(res => {
      const options = (res.data || []).map(p => ({
        value: p._id,
        label: p.name || (p.firstName + ' ' + p.lastName),
        data: p
      }));
      setRecentPatients(options);
    });
  }, [clinicId]);

  console.log('Initial clinicId check:', { propClinicId, clinicFromAuth: clinic?.id || clinic?._id, clinicId });
  
  // Check if we have a valid auth token
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token found in localStorage');
  } else {
    console.log('Auth token found in localStorage');
  }
  
  // State for dropdown options and loading
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timeZone, setTimeZone] = useState(getClinicTimeZone(initialData?.clinic));
  
  // Form validation and state
  const formTimeZone = initialData?.timeZone || timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    register
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: initialData?.patientId || '',
      doctorId: initialData?.doctorId || '',
      startTime: initialData?.startTime ? formatDateTimeLocal(new Date(initialData.startTime), formTimeZone) : '',
      endTime: initialData?.endTime ? formatDateTimeLocal(new Date(initialData.endTime), formTimeZone) : '',
      serviceType: initialData?.serviceType || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'Scheduled'
    }
  });
  
  // Watch form values for validation
  const watchedValues = watch();
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Load patients, doctors, and services
  useEffect(() => {
    // Log the current clinicId for debugging
    console.log('Current clinicId in AppointmentForm:', clinicId);
    
    const fetchData = async () => {
      try {
        setIsLoading2(true);
        setFetchError(null);
        
        // Check if we have a valid auth token and clinic ID
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No auth token found. Cannot fetch data.');
          setFetchError('Authentication required. Please log in again.');
          setIsLoading2(false);
          return;
        }

        if (!clinicId) {
          console.error('No clinic ID found. Cannot fetch data.');
          setFetchError('Missing clinic information. Please try again.');
          setIsLoading2(false);
          return;
        }
        
        // Fetch all data in parallel for efficiency
        console.log('Fetching appointment form data for clinic:', clinicId);
        const [patientsResponse, staffResponse, treatmentsResponse] = await Promise.all([
          patientService.getPatients({ clinicId, status: 'active' }),
          staffService.getStaff({ clinic: clinicId, role: 'Doctor', status: 'Active', limit: 100 }),
          treatmentService.getTreatments({ clinicId })
        ]);
        
        // Process patient data
        const patientsData = Array.isArray(patientsResponse) ? patientsResponse : (patientsResponse?.data || []);
        if (patientsData.length > 0) {
          console.log(`Loaded ${patientsData.length} patients`);
          const patientOptions = patientsData.map(patient => ({
            value: patient._id,
            label: `${patient.name || 'Unknown'}${patient.email ? ` (${patient.email})` : ''}`,
            data: patient
          }));
          setPatients(patientOptions);
        } else {
          console.warn('No patients found in your clinic');
          setFetchError(prevError => prevError ? `${prevError}. No patients found.` : 'No patients found. Please add patients first.');
          setPatients([]);
        }
        
        // Debug: log staff response to inspect structure
        console.log('Staff API response:', staffResponse);
        const doctorsData = Array.isArray(staffResponse?.data) ? staffResponse.data : [];
        if (doctorsData.length > 0) {
          console.log(`Loaded ${doctorsData.length} doctors`);
          const doctorOptions = doctorsData.map(doctor => ({
            value: doctor._id,
            label: `${doctor.name || 'Dr.'} ${doctor.specialization ? `(${doctor.specialization})` : ''}`,
            data: doctor
          }));
          setDoctors(doctorOptions);
          setRecentDoctors(doctorOptions);
        } else {
          console.warn('No doctors found in your clinic');
          setFetchError(prevError => prevError ? `${prevError}. No doctors found.` : 'No doctors found. Please add doctors first.');
          setDoctors([]);
        }
        
        // Process services
        const treatmentsData = Array.isArray(treatmentsResponse.data) ? treatmentsResponse.data : [];
        if (treatmentsData.length > 0) {
          const servicesByCategory = treatmentsData.reduce((acc, treatment) => {
            const category = treatment.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(treatment);
            return acc;
          }, {});
          const serviceOptions = Object.keys(servicesByCategory).map(category => ({
            label: category,
            options: servicesByCategory[category].map(treatment => ({
              value: treatment._id,
              label: treatment.name || 'Service',
              data: treatment
            }))
          }));
          setServices(serviceOptions);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setFetchError('Failed to load form data. Please refresh and try again.');
        setPatients([]);
        setDoctors([]);
        setServices([]);
      } finally {
        setIsLoading2(false);
      }
    };
    
    fetchData();
  }, [clinicId]);
  
  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting form values from initialData:', initialData);
      
      // Debug time processing
      if (initialData.startTime) {
        const startDate = new Date(initialData.startTime);
        const formattedStart = formatDateTimeLocal(startDate, formTimeZone);
        console.log('Start time processing:', {
          original: initialData.startTime,
          parsed: startDate.toISOString(),
          formatted: formattedStart,
          timeZone: formTimeZone
        });
      }
      
      if (initialData.endTime) {
        const endDate = new Date(initialData.endTime);
        const formattedEnd = formatDateTimeLocal(endDate, formTimeZone);
        console.log('End time processing:', {
          original: initialData.endTime,
          parsed: endDate.toISOString(),
          formatted: formattedEnd,
          timeZone: formTimeZone
        });
      }
      
      // Set basic form fields
      setValue('patientId', initialData.patientId || '');
      setValue('doctorId', initialData.doctorId || '');
      setValue('startTime', initialData.startTime ? formatDateTimeLocal(new Date(initialData.startTime), formTimeZone) : '');
      setValue('endTime', initialData.endTime ? formatDateTimeLocal(new Date(initialData.endTime), formTimeZone) : '');
      setValue('serviceType', initialData.serviceType || '');
      setValue('notes', initialData.notes || '');
      setValue('status', initialData.status || 'Scheduled');
    }
  }, [initialData, setValue, formTimeZone]);
  
  // Auto-calculate end time when a service is selected
  const handleServiceChange = (option) => {
    console.log('Service selected:', option);
    setValue('serviceType', option ? option.value : '');
    
    // If service has a duration, update end time based on start time and duration
    if (option && option.data && option.data.duration) {
      const startTimeValue = watch('startTime');
      if (startTimeValue) {
        try {
          const startTime = new Date(startTimeValue);
          if (!isNaN(startTime.getTime())) {
            // Calculate end time by adding duration in minutes
            const endTime = new Date(startTime.getTime() + option.data.duration * 60000);
            
            // Format end time for datetime-local input
            const year = endTime.getFullYear();
            const month = String(endTime.getMonth() + 1).padStart(2, '0');
            const day = String(endTime.getDate()).padStart(2, '0');
            const hours = String(endTime.getHours()).padStart(2, '0');
            const minutes = String(endTime.getMinutes()).padStart(2, '0');
            
            const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
            setValue('endTime', formattedEndTime);
            console.log('Auto-calculated end time:', formattedEndTime);
            
            // Format duration for display
            let durationText = `${option.data.duration} minutes`;
            if (option.data.duration >= 60) {
              const hours = Math.floor(option.data.duration / 60);
              const minutes = option.data.duration % 60;
              durationText = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`;
            }
            
            // Format price for display
            const priceText = option.data.price ? `$${option.data.price.toFixed(2)}` : 'Price not set';
            
            // Show toast notification with service details
            toast.info(
              <div>
                <strong>{option.label} selected</strong>
                <p>Duration: {durationText}</p>
                <p>Price: {priceText}</p>
              </div>,
              { autoClose: 4000 }
            );
          }
        } catch (error) {
          console.error('Error calculating end time:', error);
        }
      }
    }
  };
  
  // Update end time when start time changes
  const handleStartTimeChange = (e) => {
    try {
      console.log('Start time changed:', e.target.value);
      const startTime = new Date(e.target.value);
      
      if (isNaN(startTime.getTime())) {
        console.error('Invalid start time:', e.target.value);
        return;
      }
      
      // Find selected service and its duration
      const serviceTypeValue = watch('serviceType');
      console.log('Current service type:', serviceTypeValue);
      
      // Find the selected service in the services array (handling grouped services)
      let selectedService = null;
      
      if (services && services.length > 0) {
        // Check if services is grouped (has options property)
        if (services[0].options) {
          // Search through each group's options
          for (const group of services) {
            if (group.options) {
              const found = group.options.find(option => option.value === serviceTypeValue);
              if (found) {
                selectedService = found;
                break;
              }
            }
          }
        } else {
          // Not grouped, direct search
          selectedService = services.find(s => s.value === serviceTypeValue);
        }
      }
      
      console.log('Selected service for duration calculation:', selectedService);
      
      if (selectedService && selectedService.data && selectedService.data.duration) {
        // Calculate end time by adding duration in minutes
        const endTime = new Date(startTime.getTime() + selectedService.data.duration * 60000);
        
        // Format end time for datetime-local input
        const year = endTime.getFullYear();
        const month = String(endTime.getMonth() + 1).padStart(2, '0');
        const day = String(endTime.getDate()).padStart(2, '0');
        const hours = String(endTime.getHours()).padStart(2, '0');
        const minutes = String(endTime.getMinutes()).padStart(2, '0');
        
        const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        setValue('endTime', formattedEndTime);
        console.log('Updated end time based on start time change:', formattedEndTime);
      }
    } catch (error) {
      console.error('Error updating end time:', error);
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const data = watchedValues;
    const errors = {};
    
    // Validate required fields
    if (!data.patientId) errors.patientId = 'Patient is required';
    if (!data.doctorId) errors.doctorId = 'Doctor is required';
    if (!data.serviceType) errors.serviceType = 'Service type is required';
    if (!data.startTime) errors.startTime = 'Start time is required';
    if (!data.endTime) errors.endTime = 'End time is required';
    
    // Validate dates
    if (data.startTime && data.endTime) {
      try {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const now = new Date();
        
        // Log the date objects for debugging
        console.log('Validating dates:', {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          now: now.toISOString()
        });
        
        if (isNaN(startTime.getTime())) {
          errors.startTime = 'Invalid start date/time';
        } else if (startTime < now) {
          // Calculate minutes difference for a small grace period (5 minutes)
          const minutesDiff = Math.floor((startTime - now) / (1000 * 60));
          if (minutesDiff < -5) { // Allow a 5-minute grace period
            errors.startTime = 'Cannot schedule appointments in the past';
          }
        }
        
        if (isNaN(endTime.getTime())) {
          errors.endTime = 'Invalid end date/time';
        }
        
        if (!errors.startTime && !errors.endTime && startTime >= endTime) {
          errors.endTime = 'End time must be after start time';
        }
      } catch (error) {
        console.error('Error validating dates:', error);
        errors.startTime = 'Error validating appointment times';
      }
    }
    
    // Show toast for errors
    if (Object.keys(errors).length > 0) {
      // Display each error on a new line in the toast
      const errorMessages = Object.values(errors).join('\n');
      toast.error(
        <div>
          <strong>Please fix the following errors:</strong>
          <ul className="mt-1 pl-4 list-disc">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 } // Keep the toast visible longer
      );
      return { isValid: false, message: errorMessages };
    }
    
    return { isValid: true, message: null };
  };

  // Handle form submission
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);
  const handleFormSubmit = async (data) => {
    // Additional validation before submission
    if (!data.patientId || data.patientId.trim() === '') {
      toast.error('Please select a patient for this appointment');
      return;
    }
    
    if (!data.doctorId || data.doctorId.trim() === '') {
      toast.error('Please select a doctor for this appointment');
      return;
    }
    
    if (!data.serviceType || data.serviceType.trim() === '') {
      toast.error('Please select a service type for this appointment');
      return;
    }
    
    if (!data.notes || data.notes.trim() === '') {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    // Ensure patientId and doctorId are always string IDs
    let patientId = data.patientId;
    if (typeof patientId === 'object' && patientId !== null) {
      patientId = patientId._id || patientId.value || '';
    }
    let doctorId = data.doctorId;
    if (typeof doctorId === 'object' && doctorId !== null) {
      doctorId = doctorId._id || doctorId.value || '';
    }

    // Always include reason in the payload
    const payload = {
      ...data,
      patientId,
      doctorId,
      notes: data.notes, // Keep notes as notes for backend
      reason: data.notes || data.serviceType || 'Medical appointment',
      serviceType: typeof data.serviceType === 'object' ? data.serviceType.label : data.serviceType, // Use label if using react-select
      clinicId: clinicId // Use the clinic ID from the form's state
    };
    
    console.log('Submitting appointment with clinic ID:', clinicId);
    
    // Submit payload as before
    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#6366F1' : provided.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : provided.boxShadow,
      '&:hover': {
        borderColor: state.isFocused ? '#6366F1' : '#CBD5E0',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#E2E8F0' : provided.backgroundColor,
      color: state.isSelected ? 'white' : provided.color,
    }),
  };

  // Find initial values for react-select (handles grouped options)
  const findInitialValue = (options, id, isGrouped = false) => {
    if (!id || !options || options.length === 0) return null;
    
    if (isGrouped) {
      // For grouped options (like services grouped by category)
      for (const group of options) {
        if (group.options) {
          const found = group.options.find(option => option.value === id);
          if (found) return found;
        }
      }
      return null;
    } else {
      // For flat options (like patients and doctors)
      return options.find(option => option.value === id) || null;
    }
  };
  
  // Define tabs for the form
  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: <FaUser className="mr-2" /> },
    { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt className="mr-2" /> },
    { id: 'details', label: 'Details', icon: <FaClipboardList className="mr-2" /> }
  ];

  // Add this function to get smart suggestions
  const getSmartSuggestions = async () => {
    try {
      const suggestions = await smartSchedulingService.getSuggestions({
        doctorId: watchedValues.doctorId,
        patientId: watchedValues.patientId,
        preferredDate: watchedValues.startTime,
        preferredTime: watchedValues.startTime,
        duration: 30,
        timeZone,
        businessHours: initialData?.clinic?.businessHours
      });
      
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get appointment suggestions');
    }
  };

  // Add this function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setValue('startTime', suggestion.start);
    setValue('endTime', suggestion.end);
    setShowSuggestions(false);
  };

  // Update the time input fields to show time zone
  const renderTimeInputs = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <FaInfoCircle className="inline mr-1" />
          Appointments can only be scheduled between 8:00 AM and 6:00 PM
        </p>
      </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Time ({formTimeZone})
        </label>
        <input
          type="datetime-local"
          name="startTime"
          value={watch('startTime')}
          onChange={(e) => {
            setValue('startTime', e.target.value);
            handleStartTimeChange(e);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Time ({formTimeZone})
        </label>
        <input
          type="datetime-local"
          name="endTime"
          value={watch('endTime')}
          onChange={(e) => {
            setValue('endTime', e.target.value);
            handleStartTimeChange(e);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        </div>
      </div>
    </div>
  );

  // Add suggestions section
  const renderSuggestions = () => (
    showSuggestions && suggestions.length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900">Suggested Times</h3>
        <div className="mt-2 space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full text-left p-3 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <span>
                  {formatAppointmentTimeRange(suggestion.start, suggestion.end, formTimeZone)}
                </span>
                <span className="text-sm text-gray-500">
                  Score: {suggestion.score}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  );

  // Add smart scheduling button
  const renderSmartSchedulingButton = () => (
    watchedValues.doctorId && watchedValues.patientId && (
      <button
        type="button"
        onClick={getSmartSuggestions}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <FaMagic className="mr-2" />
        Get Smart Suggestions
      </button>
    )
  );

  // Conflict check on time/doctor change
  useEffect(() => {
    const checkConflict = async () => {
      if (!watchedValues.startTime || !watchedValues.endTime || !watchedValues.doctorId) return;
      setCheckingConflict(true);
      setConflictWarning(null);
      try {
        const res = await smartSchedulingService.checkConflict({
          doctorId: watchedValues.doctorId,
          startTime: watchedValues.startTime,
          endTime: watchedValues.endTime,
          appointmentId: initialData?._id
        });
        if (res.conflict) {
          setConflictWarning(res.message || 'This time slot is already booked.');
        }
      } catch (e) {
        setConflictWarning('Could not check for conflicts.');
      } finally {
        setCheckingConflict(false);
      }
    };
    checkConflict();
  }, [watchedValues.startTime, watchedValues.endTime, watchedValues.doctorId]);

  // Update async load options for patients
  const loadPatientOptions = async (inputValue) => {
    if (!inputValue) {
      console.log('[PatientDropdown] No inputValue, returning recentPatients:', recentPatients);
      return recentPatients;
    }
    try {
      const params = { search: inputValue, clinicId, limit: 20 };
      console.log('[PatientDropdown] Fetching patients with params:', params);
      const res = await patientService.getPatients(params);
      console.log('[PatientDropdown] Raw API response:', res);
      const patients = Array.isArray(res?.data) ? res.data : [];
      console.log('[PatientDropdown] Patients array after API:', patients);
      const mapped = patients.map(p => ({
        value: p._id,
        label: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        data: p
      }));
      console.log('[PatientDropdown] Mapped patient options:', mapped);
      return mapped;
    } catch (err) {
      console.error('[PatientDropdown] Error loading patients:', err);
      return [];
    }
  };

  // Update async load options for doctors
  const loadDoctorOptions = async (inputValue) => {
    if (!inputValue) {
      console.log('[DoctorDropdown] No inputValue, returning recentDoctors:', recentDoctors);
      return recentDoctors;
    }
    try {
      const params = { clinicId, role: 'Doctor', status: 'active' };
      if (inputValue) params.search = inputValue;
      console.log('[DoctorDropdown] Fetching doctors with params:', params);
      const res = await staffService.getStaff(params);
      console.log('[DoctorDropdown] Raw API response:', res);
      const staffArray = Array.isArray(res?.data) ? res.data : [];
      console.log('[DoctorDropdown] Staff array after API:', staffArray);
      const doctors = staffArray.filter(staff => {
        const role = staff.role || staff.type || '';
        return typeof role === 'string' && role.toLowerCase() === 'doctor';
      });
      console.log('[DoctorDropdown] Filtered doctors:', doctors);
      const mapped = doctors.map(d => ({
        value: d._id,
        label: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        data: d
      }));
      console.log('[DoctorDropdown] Mapped doctor options:', mapped);
      return mapped;
    } catch (err) {
      console.error('[DoctorDropdown] Error loading doctors:', err);
      return [];
    }
  };

  const loadServiceOptions = async (inputValue) => {
    try {
      // Use getServices for all, filter on client if needed
      const allServices = await serviceService.getServices({ clinicId });
      let filtered = allServices;
      if (inputValue) {
        filtered = allServices.filter(s => s.name && s.name.toLowerCase().includes(inputValue.toLowerCase()));
      }
      return filtered.map(s => ({ value: s._id, label: s.name, data: s }));
    } catch {
      return [];
    }
  };

  // If no services exist or fetchError is about services, use mock services as fallback
  let effectiveServices = services;
  if (services.length === 0 || (fetchError && fetchError.toLowerCase().includes('service'))) {
    effectiveServices = Object.keys(medicalServicesData).map(category => ({
      label: category,
      options: medicalServicesData[category].map((serviceName, index) => ({
        value: `${category.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        label: serviceName,
        data: {
          _id: `${category.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          name: serviceName,
          category: category,
          description: `${serviceName} service`,
          duration: 30, // Default duration in minutes
          price: 0 // Default price
        }
      }))
    }));
  }

  // If still no services, show a message and a button to seed default services (admin only)
  if (effectiveServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">No services found for this clinic.</p>
          <p className="text-gray-500 mb-4">You must add at least one service before you can create appointments.</p>
          <Button
            type="button"
            variant="primary"
            onClick={async () => {
              try {
                await serviceService.seedDefaultServices();
                toast.success('Default services added!');
                // Refetch services
                const newServices = await serviceService.getServices({ clinicId });
                const servicesData = Array.isArray(newServices) ? newServices : (newServices?.data || []);
                if (servicesData.length > 0) {
                  const servicesByCategory = servicesData.reduce((acc, service) => {
                    const category = service.category || 'Other';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(service);
                    return acc;
                  }, {});
                  const serviceOptions = Object.keys(servicesByCategory).map(category => ({
                    label: category,
                    options: servicesByCategory[category].map(service => ({
                      value: service._id,
                      label: service.name || 'Service',
                      data: service
                    }))
                  }));
                  setServices(serviceOptions);
                }
              } catch (err) {
                toast.error('Failed to add default services.');
              }
            }}
          >
            Add Default Services
          </Button>
        </div>
      </div>
    );
  }

  // Loading and error states
  if (isLoading2) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Loading form data...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
        <Button 
          type="button" 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Show fetch error but continue with form if it's just the clinic ID issue
  if (fetchError) {
    // If it's the missing clinic information error, we'll show a warning but still render the form
    const isMissingClinicError = fetchError.includes('Missing clinic information');
    
    if (isMissingClinicError && clinicId) {
      // We found a clinicId after the error was set, so we can continue
      console.log('Found clinicId after error was set:', clinicId);
    } else if (isMissingClinicError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          <p className="font-medium">Warning</p>
          <p className="text-sm mb-3">{fetchError}</p>
          <p className="text-sm mb-3">Please try one of the following:</p>
          <ul className="list-disc pl-5 mb-3 text-sm">
            <li>Refresh the page to reload your clinic information</li>
            <li>Log out and log back in to restore your session</li>
            <li>Check if you're connected to the correct clinic</li>
          </ul>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose ? onClose() : null}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    } else {
      // For other errors, show a warning but continue with the form
      console.warn('Non-critical fetch error:', fetchError);
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4">
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <FaUser className="text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium">Patient & Doctor Information</h3>
          </div>
          
          {/* Patient Selection */}
          <div className="mb-4">
            <label htmlFor="patientId" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaUser className="text-gray-400 mr-2" /> Patient
            </label>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <AsyncSelect
                  inputId="patientId"
                  options={patients}
                  value={findInitialValue(patients, field.value) || findInitialValue(recentPatients, field.value)}
                  onChange={(option) => field.onChange(option ? option.value : '')}
                  placeholder="Search for a patient..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className={errors.patientId ? 'react-select-error' : ''}
                  noOptionsMessage={() => "No patients found"}
                  loadOptions={loadPatientOptions}
                  defaultOptions={recentPatients}
                />
              )}
            />
            {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>}
          </div>

          {/* Doctor Selection */}
          <div className="mb-4">
            <label htmlFor="doctorId" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaUserMd className="text-gray-400 mr-2" /> Doctor
            </label>
            <Controller
              name="doctorId"
              control={control}
              render={({ field }) => (
                <AsyncSelect
                  inputId="doctorId"
                  options={doctors}
                  value={findInitialValue(doctors, field.value) || findInitialValue(recentDoctors, field.value)}
                  onChange={(option) => field.onChange(option ? option.value : '')}
                  placeholder="Search for a doctor..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className={errors.doctorId ? 'react-select-error' : ''}
                  noOptionsMessage={() => "No doctors found"}
                  loadOptions={loadDoctorOptions}
                  defaultOptions={recentDoctors}

                />
              )}
            />
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>}
          </div>
          
          {/* Service Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Service <span className="text-red-500">*</span></label>
            <Controller
              name="serviceType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={effectiveServices}
                  isClearable
                  isSearchable
                  placeholder="Select a service"
                  value={findInitialValue(effectiveServices, field.value, true)}
                  onChange={option => {
                    field.onChange(option ? option.value : '');
                    handleServiceChange(option);
                  }}
                  styles={customSelectStyles}
                />
              )}
            />
            {errors.serviceType && <span className="text-red-500 text-xs">{errors.serviceType.message}</span>}
          </div>
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium">Appointment Schedule</h3>
          </div>
          
          {renderTimeInputs()}
          {renderSmartSchedulingButton()}
          {renderSuggestions()}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-2" />
              <div>
                <p className="text-sm text-blue-800">Scheduling Tips:</p>
                <ul className="text-xs text-blue-700 list-disc pl-5 mt-1">
                  <li>Select a service first to auto-calculate appointment duration</li>
                  <li>Standard appointments are typically 30-60 minutes</li>
                  <li>Allow buffer time between appointments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <FaClipboardList className="text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium">Appointment Details</h3>
          </div>
          
          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaClipboardList className="text-gray-400 mr-2" /> Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { value: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                    { value: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-300' },
                    { value: 'Completed', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                    { value: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300' },
                    { value: 'No Show', color: 'bg-orange-100 text-orange-800 border-orange-300' }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => field.onChange(option.value)}
                      className={`cursor-pointer border rounded-md px-3 py-2 text-center ${field.value === option.value ? option.color + ' border-2' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {option.value}
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
          </div>

          {/* Conflict Warning */}
          {checkingConflict && <p className="mt-2 text-sm text-yellow-600">{conflictWarning || 'Checking for conflicts...'}</p>}
          {conflictWarning && <p className="mt-2 text-sm text-red-600">{conflictWarning}</p>}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {initialData ? 'Update Appointment' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  </div>
  );
};

import AppointmentFormClinicGuard from './AppointmentFormClinicGuard';

const AppointmentFormExport = (props) => {
  // useAuth must be called at the top level of the component
  const { clinic, user } = useAuth();
  const { clinicId: propClinicId } = props;
  // clinicId logic must match form logic
  let clinicId = null;
  if (user && user.clinicId) {
    clinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
  } else if (clinic && clinic._id) {
    clinicId = clinic._id;
  } else if (clinic && clinic.id) {
    clinicId = clinic.id;
  } else {
    clinicId = propClinicId;
  }
  return (
    <AppointmentFormClinicGuard clinicId={clinicId} user={user} clinic={clinic} propClinicId={propClinicId}>
      <AppointmentForm {...props} />
    </AppointmentFormClinicGuard>
  );
};

export default AppointmentFormExport;
