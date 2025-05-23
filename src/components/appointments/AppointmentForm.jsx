import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import patientService from '../../api/patients/patientService';
import clinicService from '../../api/clinic/clinicService';
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
  FaClock,
  FaNotesMedical,
  FaInfoCircle
} from 'react-icons/fa';
// Form validation schema
const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
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
  notes: z.string().optional(),
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
});

// Mock data for fallback when API calls fail
const MOCK_PATIENTS = [
  { value: 'mock-patient-1', label: 'John Doe', data: { _id: 'mock-patient-1', name: 'John Doe' } },
  { value: 'mock-patient-2', label: 'Jane Smith', data: { _id: 'mock-patient-2', name: 'Jane Smith' } },
];

const MOCK_DOCTORS = [
  { value: 'mock-doctor-1', label: 'Dr. House', data: { _id: 'mock-doctor-1', name: 'Dr. House', role: 'Doctor' } },
  { value: 'mock-doctor-2', label: 'Dr. Smith', data: { _id: 'mock-doctor-2', name: 'Dr. Smith', role: 'Doctor' } },
];

const MOCK_SERVICES = [
  { value: 'mock-service-1', label: 'General Checkup', data: { _id: 'mock-service-1', name: 'General Checkup' } },
  { value: 'mock-service-2', label: 'Dental Cleaning', data: { _id: 'mock-service-2', name: 'Dental Cleaning' } },
];

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
  
  // Get clinic ID from auth context if not provided as prop
  const { clinic, user } = useAuth();
  
  // Check if we have a valid clinic ID from the auth context
  let clinicId = null;
  
  // Process the clinic ID with multiple fallbacks
  if (clinic && clinic.id) {
    // If clinic object has an id property
    clinicId = clinic.id;
    console.log('Using clinic.id from auth context:', clinicId);
  } else if (clinic && clinic._id) {
    // If clinic object has an _id property
    clinicId = clinic._id;
    console.log('Using clinic._id from auth context:', clinicId);
  } else if (propClinicId) {
    // If clinic ID was passed as a prop - handle object or string
    if (typeof propClinicId === 'object' && propClinicId._id) {
      clinicId = propClinicId._id;
      console.log('Using clinicId._id from props:', clinicId);
    } else if (typeof propClinicId === 'object' && propClinicId.id) {
      clinicId = propClinicId.id;
      console.log('Using clinicId.id from props:', clinicId);
    } else if (typeof propClinicId === 'string') {
      clinicId = propClinicId;
      console.log('Using clinicId string from props:', clinicId);
    } else {
      console.warn('Invalid clinicId prop format:', propClinicId);
    }
  }
  
  console.log('Initial clinicId check:', { propClinicId, clinicFromAuth: clinic?.id || clinic?._id, clinicId });
  
  // If we still don't have a clinicId, check if it's in the initialData
  if (!clinicId && initialData && initialData.clinicId) {
    clinicId = initialData.clinicId;
    console.log('Using clinicId from initialData:', clinicId);
  }
  
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
  
  // Form validation and state
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
      startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().substring(0, 16) : '',
      endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().substring(0, 16) : '',
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
        const [patientsResponse, doctorsResponse, servicesResponse] = await Promise.all([
          patientService.getPatients({ clinicId }),
          clinicService.getStaffByRole('Doctor', clinicId),
          serviceService.getServices({ clinicId })
        ]);
        
        // Process patient data
        const patientsData = Array.isArray(patientsResponse) ? patientsResponse : (patientsResponse?.data || []);
        if (patientsData.length > 0) {
          console.log(`Loaded ${patientsData.length} patients`);
          const patientOptions = patientsData.map(patient => ({
            value: patient._id,
            label: `${patient.name || 'Unknown'} ${patient.email ? `(${patient.email})` : ''}`,
            data: patient
          }));
          setPatients(patientOptions);
        } else {
          console.warn('No patients found in your clinic');
          setFetchError(prevError => prevError ? `${prevError}. No patients found.` : 'No patients found. Please add patients first.');
          setPatients([]);
        }
        
        // Process doctor data
        const doctorsData = Array.isArray(doctorsResponse) ? doctorsResponse : (doctorsResponse?.data || []);
        if (doctorsData.length > 0) {
          console.log(`Loaded ${doctorsData.length} doctors`);
          const doctorOptions = doctorsData.map(doctor => ({
            value: doctor._id,
            label: `${doctor.name || 'Dr.'} ${doctor.specialization ? `(${doctor.specialization})` : ''}`,
            data: doctor
          }));
          setDoctors(doctorOptions);
        } else {
          console.warn('No doctors found in your clinic');
          setFetchError(prevError => prevError ? `${prevError}. No doctors found.` : 'No doctors found. Please add doctors first.');
          setDoctors([]);
        }
        
        // Process service data
        const servicesData = Array.isArray(servicesResponse) ? servicesResponse : (servicesResponse?.data || []);
        
        // Use our comprehensive medical services list if no services found in the database
        if (servicesData.length > 0) {
          console.log(`Loaded ${servicesData.length} services from database`);
          
          // Group services by category
          const servicesByCategory = servicesData.reduce((acc, service) => {
            const category = service.category || 'Other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(service);
            return acc;
          }, {});
          
          // Create grouped options for the select input with clean labels
          const serviceOptions = Object.keys(servicesByCategory).map(category => ({
            label: category,
            options: servicesByCategory[category].map(service => ({
              value: service._id,
              // Clean label showing just the service name for better readability
              label: service.name || 'Service',
              // Store all service data for reference
              data: service
            }))
          }));
          
          setServices(serviceOptions);
        } else {
          console.log('No services found in database, using comprehensive medical services list');
          
          // Create service options from our comprehensive medical services list
          const serviceOptions = Object.keys(medicalServicesData).map(category => ({
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
          
          setServices(serviceOptions);
        }
        
        // Check if we have all required data to create appointments
        const errors = [];
        if (patientsData.length === 0) errors.push('No patients found');
        if (doctorsData.length === 0) errors.push('No doctors found');
        // We don't need to check for services anymore since we have our comprehensive list
        
        if (errors.length > 0) {
          const errorMessage = `Cannot create appointment: ${errors.join('. ')}. Please add the missing data first.`;
          setFetchError(errorMessage);
        } else {
          setFetchError(null);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setFetchError('Failed to load form data. Please refresh and try again.');
        // Do not use mock data as it causes validation errors
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
      
      // Set basic form fields
      setValue('patientId', initialData.patientId || '');
      setValue('doctorId', initialData.doctorId || '');
      setValue('serviceType', initialData.serviceType || '');
      setValue('notes', initialData.notes || '');
      setValue('status', initialData.status || 'Scheduled');
      
      // Format dates for datetime-local input
      if (initialData.startTime) {
        // Convert to proper date object if it's not already
        const startDate = new Date(initialData.startTime);
        console.log('Setting start time:', startDate);
        
        try {
          // Format for datetime-local input (YYYY-MM-DDTHH:MM)
          // Handle timezone issues by using local timezone format
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          const hours = String(startDate.getHours()).padStart(2, '0');
          const minutes = String(startDate.getMinutes()).padStart(2, '0');
          
          const formattedStartDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          setValue('startTime', formattedStartDate);
          console.log('Formatted start time for input:', formattedStartDate);
        } catch (error) {
          console.error('Error formatting start date:', error);
          // Fallback to ISO string method
          const formattedStartDate = startDate.toISOString().substring(0, 16);
          setValue('startTime', formattedStartDate);
        }
      }
      
      if (initialData.endTime) {
        // Convert to proper date object if it's not already
        const endDate = new Date(initialData.endTime);
        console.log('Setting end time:', endDate);
        
        try {
          // Format for datetime-local input (YYYY-MM-DDTHH:MM)
          // Handle timezone issues by using local timezone format
          const year = endDate.getFullYear();
          const month = String(endDate.getMonth() + 1).padStart(2, '0');
          const day = String(endDate.getDate()).padStart(2, '0');
          const hours = String(endDate.getHours()).padStart(2, '0');
          const minutes = String(endDate.getMinutes()).padStart(2, '0');
          
          const formattedEndDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          setValue('endTime', formattedEndDate);
          console.log('Formatted end time for input:', formattedEndDate);
        } catch (error) {
          console.error('Error formatting end date:', error);
          // Fallback to ISO string method
          const formattedEndDate = endDate.toISOString().substring(0, 16);
          setValue('endTime', formattedEndDate);
        }
      }
    }
  }, [initialData, setValue]);
  


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
    
    return { isValid: true };
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Run custom validation first
      const validation = validateForm();
      if (!validation.isValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Validate required selections
      const validationErrors = [];
      
      // Get the selected items with detailed logging
      console.log('Finding patient with ID:', data.patientId);
      console.log('Available patients:', patients);
      const selectedPatient = patients.find(p => p.value === data.patientId);
      console.log('Selected patient:', selectedPatient);
      
      console.log('Finding doctor with ID:', data.doctorId);
      console.log('Available doctors:', doctors);
      const selectedDoctor = doctors.find(d => d.value === data.doctorId);
      console.log('Selected doctor:', selectedDoctor);
      
      // Handle grouped services - search through all groups
      console.log('Finding service with ID:', data.serviceType);
      console.log('Available services:', services);
      let selectedService = null;
      
      if (services && services.length > 0) {
        // Check if services is grouped (has options property)
        if (services[0].options) {
          console.log('Services are grouped, searching through groups');
          // Search through each group's options
          for (const group of services) {
            if (group.options) {
              const found = group.options.find(option => option.value === data.serviceType);
              if (found) {
                selectedService = found;
                console.log('Found service in group:', group.label);
                break;
              }
            }
          }
        } else {
          // Not grouped, direct search
          console.log('Services are not grouped, direct search');
          selectedService = services.find(s => s.value === data.serviceType);
        }
      }
      
      console.log('Selected service:', selectedService);
      
      // Check each selection individually for better error messages
      if (!data.patientId || !selectedPatient) {
        validationErrors.push('Please select a valid patient');
      }
      if (!data.doctorId || !selectedDoctor) {
        validationErrors.push('Please select a valid doctor');
      }
      if (!data.serviceType || !selectedService) {
        validationErrors.push('Please select a valid service');
      }
      
      // Show all validation errors if any
      if (validationErrors.length > 0) {
        toast.error(
          <div>
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 pl-4 list-disc">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>,
          { autoClose: 5000 }
        );
        setIsSubmitting(false);
        return;
      }

      // Format dates properly with timezone handling
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      console.log('Original date objects:', { startTime, endTime });
      
      // Create formatted data object - IMPORTANT: Use the actual IDs, not the value properties
      const formattedData = {
        patientId: selectedPatient?.value || data.patientId,
        doctorId: selectedDoctor?.value || data.doctorId,
        clinicId: clinicId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        serviceType: selectedService.value,
        notes: data.notes || '',
        status: data.status || 'Scheduled',
        // Add the required reason field - use service type or notes as fallback
        reason: data.notes || selectedService.label || 'Medical appointment'
      };
      
      console.log('Patient ID being sent:', formattedData.patientId);
      console.log('Doctor ID being sent:', formattedData.doctorId);
      
      // Add service name if available
      if (selectedService && selectedService.data) {
        formattedData.serviceName = selectedService.data.name;
      } else if (selectedService) {
        formattedData.serviceName = selectedService.label;
      }
      
      // Add patient and doctor names for display purposes
      if (selectedPatient && (selectedPatient.data?.name || selectedPatient.label)) {
        formattedData.patientName = selectedPatient.data?.name || selectedPatient.label;
      }
      
      if (selectedDoctor && (selectedDoctor.data?.name || selectedDoctor.label)) {
        formattedData.doctorName = selectedDoctor.data?.name || selectedDoctor.label;
      }
      
      console.log('Submitting appointment data:', formattedData);
      
      // Submit the form
      await onSubmit(formattedData);
      
      // Show success message with appointment details
      const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedDate = startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      
      toast.success(
        <div>
          <strong>Appointment created successfully!</strong>
          <p>Date: {formattedDate}</p>
          <p>Time: {formattedStartTime}</p>
          <p>Patient: {selectedPatient.label}</p>
          <p>Doctor: {selectedDoctor.label}</p>
        </div>,
        { autoClose: 5000 }
      );
      
      // Reset form if creating a new appointment
      if (!initialData) {
        reset();
      }
      
      // Close the form if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting appointment form:', error);
      toast.error(
        <div>
          <strong>Failed to save appointment</strong>
          <p>{error.message || 'Please try again.'}</p>
        </div>,
        { autoClose: 5000 }
      );
    } finally {
      setIsSubmitting(false);
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
                <Select
                  inputId="patientId"
                  options={patients}
                  value={findInitialValue(patients, field.value)}
                  onChange={(option) => field.onChange(option ? option.value : '')}
                  placeholder="Search for a patient..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className={errors.patientId ? 'react-select-error' : ''}
                  noOptionsMessage={() => "No patients found"}
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
                <Select
                  inputId="doctorId"
                  options={doctors}
                  value={findInitialValue(doctors, field.value)}
                  onChange={(option) => field.onChange(option ? option.value : '')}
                  placeholder="Search for a doctor..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                  className={errors.doctorId ? 'react-select-error' : ''}
                  noOptionsMessage={() => "No doctors found"}
                />
              )}
            />
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>}
          </div>
          
          {/* Service Type */}
          <div className="mb-4">
            <label htmlFor="serviceType" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaNotesMedical className="text-gray-400 mr-2" /> Service Type
            </label>
            <Controller
              name="serviceType"
              control={control}
              render={({ field }) => (
                <Select
                  inputId="serviceType"
                  options={services}
                  value={findInitialValue(services, field.value, true)}
                  onChange={handleServiceChange}
                  placeholder="Select a service..."
                  isClearable
                  isSearchable
                  formatOptionLabel={(option) => (
                    <div className="flex flex-col">
                      <div className="font-medium">{option.label}</div>
                      {option.data && (
                        <div className="text-xs text-gray-500 flex justify-between">
                          {option.data.duration && (
                            <span>Duration: {option.data.duration} min</span>
                          )}
                          {option.data.price && (
                            <span className="ml-2">Price: ${option.data.price}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  styles={{
                    ...customSelectStyles,
                    // Add styling for group headers
                    group: (base) => ({
                      ...base,
                      paddingTop: 8,
                      paddingBottom: 8,
                    }),
                    groupHeading: (base) => ({
                      ...base,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#4b5563',
                      textTransform: 'none',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.25rem',
                      marginBottom: '0.5rem'
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#E2E8F0' : provided.backgroundColor,
                      color: state.isSelected ? 'white' : provided.color,
                      padding: '8px 12px',
                    })
                  }}
                  className={errors.serviceType ? 'react-select-error' : ''}
                  noOptionsMessage={() => "No services found"}
                />
              )}
            />
            {errors.serviceType && <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>}
          </div>
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium">Appointment Schedule</h3>
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startTime" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FaClock className="text-gray-400 mr-2" /> Start Time
              </label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleStartTimeChange(e);
                    }}
                    className={errors.startTime ? 'border-red-500' : ''}
                    min={new Date().toISOString().substring(0, 16)}
                    onFocus={(e) => {
                      // Ensure the min attribute is always up-to-date when the field is focused
                      e.target.min = new Date().toISOString().substring(0, 16);
                    }}
                  />
                )}
              />
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
            </div>

            <div>
              <label htmlFor="endTime" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <FaClock className="text-gray-400 mr-2" /> End Time
              </label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...field}
                    className={errors.endTime ? 'border-red-500' : ''}
                    min={watch('startTime') || new Date().toISOString().substring(0, 16)}
                  />
                )}
              />
              {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
            </div>
          </div>
          
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
                      className={`cursor-pointer border rounded-md px-3 py-2 text-center ${
                        field.value === option.value
                          ? `${option.color} border-2`
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {option.value}
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FaNotesMedical className="text-gray-400 mr-2" /> Notes
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <textarea
                    {...field}
                    id="notes"
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add any additional notes about the appointment here..."
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{field.value?.length || 0}/500 characters</span>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        const templates = [
                          'Follow-up appointment for previous treatment.',
                          'New patient initial consultation.',
                          'Routine check-up appointment.',
                          'Patient requested urgent appointment.',
                          'Referral from Dr. '
                        ];
                        const template = window.prompt(
                          'Select a template number or enter custom text:\n' +
                          templates.map((t, i) => `${i + 1}. ${t}`).join('\n')
                        );
                        if (template) {
                          if (!isNaN(template) && templates[parseInt(template) - 1]) {
                            field.onChange(templates[parseInt(template) - 1]);
                          } else {
                            field.onChange(template);
                          }
                        }
                      }}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Summary section before submission */}
      {(watch('patientId') && watch('doctorId') && watch('serviceType') && watch('startTime') && watch('endTime')) && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">Appointment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Patient:</span> {
                patients.find(p => p.value === watch('patientId'))?.label || 'Not selected'
              }
            </div>
            <div>
              <span className="text-gray-600">Doctor:</span> {
                doctors.find(d => d.value === watch('doctorId'))?.label || 'Not selected'
              }
            </div>
            <div>
              <span className="text-gray-600">Service:</span> {
                // Handle grouped services
                services.some(s => s.options)
                  ? services.flatMap(g => g.options || []).find(s => s.value === watch('serviceType'))?.label
                  : services.find(s => s.value === watch('serviceType'))?.label || 'Not selected'
              }
            </div>
            <div>
              <span className="text-gray-600">Date:</span> {
                watch('startTime') ? new Date(watch('startTime')).toLocaleDateString() : 'Not set'
              }
            </div>
            <div>
              <span className="text-gray-600">Time:</span> {
                watch('startTime') ? new Date(watch('startTime')).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not set'
              } - {
                watch('endTime') ? new Date(watch('endTime')).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not set'
              }
            </div>
            <div>
              <span className="text-gray-600">Status:</span> <span className={`
                ${watch('status') === 'Scheduled' ? 'text-blue-700' : ''}
                ${watch('status') === 'Confirmed' ? 'text-green-700' : ''}
                ${watch('status') === 'Completed' ? 'text-purple-700' : ''}
                ${watch('status') === 'Cancelled' ? 'text-red-700' : ''}
                ${watch('status') === 'No Show' ? 'text-orange-700' : ''}
              `}>{watch('status')}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              console.log('No onClose handler provided');
            }
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || isLoading || isLoading2}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {initialData?._id ? 'Updating...' : 'Scheduling...'}
            </>
          ) : initialData?._id ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
    </div>
  );
};

export default AppointmentForm;
