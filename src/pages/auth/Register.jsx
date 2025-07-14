import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/ui/Alert';
import api from '../../api/axios';
import { FaSearch, FaSpinner, FaTooth, FaUserPlus } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register, registerStaff, registerPatient } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [showClinicDropdown, setShowClinicDropdown] = useState(false);
  const clinicDropdownRef = useRef(null);
  
  // Initial fetch of clinics for dropdown
  useEffect(() => {
    const fetchInitialClinics = async () => {
      try {
        setLoadingClinics(true);
        const response = await api.get('/clinics/search');
        if (response.data && response.data.data) {
          setClinics(response.data.data);
          setFilteredClinics(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching clinics:', err);
      } finally {
        setLoadingClinics(false);
      }
    };
    
    fetchInitialClinics();
  }, []);
  
  // Search clinics using API when query changes
  useEffect(() => {
    const searchClinics = async () => {
      try {
        setLoadingClinics(true);
        // Always fetch clinics, with or without query
        // If query is empty, it will return all clinics
        const response = await api.get(`/clinics/search${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`);
        if (response.data && response.data.data) {
          setFilteredClinics(response.data.data);
        }
      } catch (err) {
        console.error('Error searching clinics:', err);
        // If search fails, fallback to local filtering
        if (searchQuery.trim() === '') {
          setFilteredClinics(clinics);
        } else {
          const filtered = clinics.filter(clinic => 
            clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredClinics(filtered);
        }
      } finally {
        setLoadingClinics(false);
      }
    };
    
    // Use debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchClinics();
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, clinics]);
  
  // Handle click outside clinic dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clinicDropdownRef.current && !clinicDropdownRef.current.contains(event.target)) {
        setShowClinicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Admin', // Default role is Admin
    specializations: '',
    license: '',
    selectedClinicId: '',
    selectedClinicName: '',
    clinicName: '',
    clinicEmail: '',
    clinicPhone: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicCountry: '',
    clinicZipcode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setError('');
  };
  
  // Handle clinic search input change
  const handleClinicSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Always show dropdown when typing
    setShowClinicDropdown(true);
  };
  
  // Handle clinic selection
  const handleClinicSelect = (clinic) => {
    setFormData(prev => ({
      ...prev,
      selectedClinicId: clinic._id,
      selectedClinicName: clinic.name
    }));
    setShowClinicDropdown(false);
    setSearchQuery('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.name?.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.email?.trim() || !validateEmail(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (!formData.phone?.trim() || !validatePhone(formData.phone)) {
          setError('Please enter a valid phone number');
          return false;
        }
        if (!formData.role) {
          setError('Please select a role');
          return false;
        }
        
        // Role-specific validations
        if (formData.role === 'Doctor') {
          if (!formData.specializations?.trim()) {
            setError('Please enter your specializations');
            return false;
          }
          if (!formData.license?.trim()) {
            setError('License number is required');
            return false;
          }
        }
        
        // Validate clinic selection for non-admin roles
        if (formData.role !== 'Admin' && !formData.selectedClinicId) {
          setError('Please select a clinic');
          return false;
        }
        
        return true;

      case 2:
        // If admin selected an existing clinic, skip clinic info validation
        if (formData.role === 'Admin' && formData.selectedClinicId) {
          return true;
        }
        
        // Only validate clinic information for admin role when creating a new clinic
        if (formData.role === 'Admin') {
          if (!formData.clinicName?.trim()) {
            setError('Clinic name is required');
            return false;
          }
          if (!formData.clinicEmail?.trim() || !validateEmail(formData.clinicEmail)) {
            setError('Please enter a valid clinic email');
            return false;
          }
          if (!formData.clinicPhone?.trim() || !validatePhone(formData.clinicPhone)) {
            setError('Please enter a valid clinic phone number');
            return false;
          }
          if (!formData.clinicAddress?.trim()) {
            setError('Clinic address is required');
            return false;
          }
          if (!formData.clinicCity?.trim()) {
            setError('Clinic city is required');
            return false;
          }
          if (!formData.clinicState?.trim()) {
            setError('Clinic state is required');
            return false;
          }
          if (!formData.clinicCountry?.trim()) {
            setError('Clinic country is required');
            return false;
          }
          if (!formData.clinicZipcode?.trim()) {
            setError('Clinic postal code is required');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // If user is not an admin and has selected a clinic, skip step 2
      if (currentStep === 1 && formData.role !== 'Admin' && formData.selectedClinicId) {
        setCurrentStep(3); // Skip to review step
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      setError('');
      
      let registrationData;
      
      // Create registration data based on role
      if (formData.role === 'Admin') {
        registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        };
        
        // If admin selected an existing clinic, include the clinic ID
        if (formData.selectedClinicId) {
          registrationData.clinicId = formData.selectedClinicId;
        } else {
          // Otherwise include the clinic creation data
          registrationData.clinic = {
            name: formData.clinicName,
            email: formData.clinicEmail,
            phone: formData.clinicPhone,
            address: formData.clinicAddress,
            city: formData.clinicCity,
            state: formData.clinicState,
            country: formData.clinicCountry,
            zipcode: formData.clinicZipcode
          };
        }
      } else if (formData.role === 'Doctor') {
        registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          specializations: formData.specializations.split(',').map(s => s.trim()),
          license: formData.license,
          clinicId: formData.selectedClinicId
        };
      } else {
        // Patient or Receptionist
        registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          clinicId: formData.selectedClinicId
        };
      }

      // Use the appropriate registration endpoint based on role
      let response;
      if (formData.role === 'Admin') {
        response = await register(registrationData);
      } else if (formData.role === 'Patient') {
        response = await registerPatient(registrationData);
      } else {
        // Doctor or Receptionist
        response = await registerStaff(registrationData);
      }
      
      if (response.success) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please check your email to verify your account.',
            role: formData.role
          }
        });
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 ">Full Name *</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500   sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register As *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Admin">Clinic Administrator</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Patient">Patient</option>
              </select>
            </div>
            
            {formData.role === 'Doctor' && (
              <>
                <div>
                  <label htmlFor="specializations" className="block text-sm font-medium text-gray-700">Specializations *</label>
                  <input
                    type="text"
                    name="specializations"
                    id="specializations"
                    placeholder="E.g. Cardiology, Pediatrics (comma separated)"
                    required
                    value={formData.specializations}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="license" className="block text-sm font-medium text-gray-700">License Number *</label>
                  <input
                    type="text"
                    name="license"
                    id="license"
                    required
                    value={formData.license}
                    onChange={handleInputChange}
                    className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </>
            )}
            
            {(formData.role === 'Doctor' || formData.role === 'Receptionist' || formData.role === 'Patient') && (
              <div className="relative" ref={clinicDropdownRef}>
                <label htmlFor="clinicSearch" className="block text-sm font-medium text-gray-700">
                  Select Clinic {formData.role !== 'Admin' ? '*' : '(Optional)'}
                </label>
                <div className="mt-1 relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="clinicSearch"
                      placeholder="Search for a clinic..."
                      value={formData.selectedClinicName || searchQuery}
                      onChange={handleClinicSearchChange}
                      onFocus={() => setShowClinicDropdown(true)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {loadingClinics ? (
                        <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
                      ) : (
                        <FaSearch className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {showClinicDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                      {loadingClinics ? (
                        <div className="py-2 px-3 text-gray-700 text-sm flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading clinics...
                        </div>
                      ) : filteredClinics.length > 0 ? (
                        filteredClinics.map(clinic => (
                          <div
                            key={clinic._id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                            onClick={() => handleClinicSelect(clinic)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium block truncate">{clinic.name}</span>
                              {clinic.location && (
                                <span className="text-xs text-gray-500">{clinic.location}</span>
                              )}
                            </div>
                            {clinic._id === formData.selectedClinicId && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))
                      ) : searchQuery.trim() !== '' ? (
                        <div className="py-4 px-3 text-gray-700 text-sm">
                          <div className="flex flex-col items-center">
                            <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No clinics found matching "{searchQuery}"</p>
                            <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 px-3 text-gray-700 text-sm">
                          <span className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Start typing to search for clinics
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formData.selectedClinicName && (
                  <p className="mt-1 text-sm text-indigo-600">Selected: {formData.selectedClinicName}</p>
                )}
                <input 
                  type="hidden" 
                  name="selectedClinicId" 
                  value={formData.selectedClinicId || ''} 
                />
              </div>
            )}
          </div>
        );

      case 2:
        // If admin selected an existing clinic, show a confirmation message
        if (formData.role === 'Admin' && formData.selectedClinicId) {
          return (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Clinic Selected</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>You've selected an existing clinic: <strong>{formData.selectedClinicName}</strong></p>
                      <p className="mt-1">You'll be registered as an administrator for this clinic.</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">Click "Next" to review your information.</p>
            </div>
          );
        }
        
        // Otherwise show the clinic creation form
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">You're creating a new clinic. Please provide the clinic details below.</p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">Clinic Name *</label>
              <input
                type="text"
                name="clinicName"
                id="clinicName"
                required
                value={formData.clinicName}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700">Clinic Email *</label>
              <input
                type="email"
                name="clinicEmail"
                id="clinicEmail"
                required
                value={formData.clinicEmail}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700">Clinic Phone *</label>
              <input
                type="tel"
                name="clinicPhone"
                id="clinicPhone"
                required
                value={formData.clinicPhone}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700">Street Address *</label>
              <textarea
                name="clinicAddress"
                id="clinicAddress"
                required
                value={formData.clinicAddress}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="clinicCity" className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  name="clinicCity"
                  id="clinicCity"
                  required
                  value={formData.clinicCity}
                  onChange={handleInputChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="clinicState" className="block text-sm font-medium text-gray-700">State/Province *</label>
                <input
                  type="text"
                  name="clinicState"
                  id="clinicState"
                  required
                  value={formData.clinicState}
                  onChange={handleInputChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="clinicCountry" className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  type="text"
                  name="clinicCountry"
                  id="clinicCountry"
                  required
                  value={formData.clinicCountry}
                  onChange={handleInputChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="clinicZipcode" className="block text-sm font-medium text-gray-700">Postal Code *</label>
                <input
                  type="text"
                  name="clinicZipcode"
                  id="clinicZipcode"
                  required
                  value={formData.clinicZipcode}
                  onChange={handleInputChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Your Information</h3>
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <div>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                <p><span className="font-medium">Role:</span> {formData.role}</p>
                
                {formData.role === 'Doctor' && (
                  <>
                    <p><span className="font-medium">Specializations:</span> {formData.specializations}</p>
                    <p><span className="font-medium">License:</span> {formData.license}</p>
                  </>
                )}
                
                {(formData.role === 'Doctor' || formData.role === 'Receptionist' || formData.role === 'Patient') && (
                  <p>
                    <span className="font-medium">Selected Clinic:</span> {
                      clinics.find(c => c._id === formData.selectedClinicId)?.name || 'Not selected'
                    }
                  </p>
                )}
              </div>
              
              {formData.role === 'Admin' && (
                <div>
                  <h4 className="font-medium mb-2">Clinic Information</h4>
                  {formData.selectedClinicId ? (
                    <p>
                      <span className="font-medium">Selected Clinic:</span> {formData.selectedClinicName}
                    </p>
                  ) : (
                    <>
                      <p><span className="font-medium">Name:</span> {formData.clinicName}</p>
                      <p><span className="font-medium">Email:</span> {formData.clinicEmail}</p>
                      <p><span className="font-medium">Phone:</span> {formData.clinicPhone}</p>
                      <p><span className="font-medium">Address:</span> {formData.clinicAddress}</p>
                      <p><span className="font-medium">City:</span> {formData.clinicCity}</p>
                      <p><span className="font-medium">State:</span> {formData.clinicState}</p>
                      <p><span className="font-medium">Country:</span> {formData.clinicCountry}</p>
                      <p><span className="font-medium">Postal Code:</span> {formData.clinicZipcode}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <FaTooth className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DentalOS.AI
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            {formData.role === 'Admin' ? 'Register your clinic' : `Register as ${formData.role}`}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {currentStep} of 3
          </p>
        </div>

        <form className="space-y-6" onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
          {error && (
            <Alert variant="error" message={error} />
          )}

          {renderStep()}

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to Login
            </Link>
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="secondary"
                >
                  Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  variant="primary"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Register;
