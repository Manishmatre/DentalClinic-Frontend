import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import clinicService from '../../api/clinic/clinicService';
import branchService from '../../api/clinic/branchService';
import serviceService from '../../api/clinic/serviceService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import BranchForm from '../../components/clinic/BranchForm';
import ServiceForm from '../../components/clinic/ServiceForm';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaCog, 
  FaCreditCard, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaUserMd,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMoneyBillWave,
  FaRegClock
} from 'react-icons/fa';

const ClinicSettings = () => {
  const { user, clinic, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const [clinicData, setClinicData] = useState(null);
  const [formData, setFormData] = useState({
    // Clinic Information
    id: '',
    licenseNumber: '',
    registrationNumber: '',
    taxId: '',
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    // General settings
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    contact: '',
    clinicContact: '',
    doctorName: '',
    email: '',
    about: '',
    // Working hours settings
    settings: {
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      appointmentDuration: 30,
      timezone: 'UTC',
      currency: 'USD'
    }
  });

  useEffect(() => {
    if (user && user.clinicId) {
      fetchClinicDetails(user.clinicId);
      fetchBranches();
      fetchServices();
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await branchService.getBranches();
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await serviceService.getServices();
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClinicDetails = async (clinicId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await clinicService.getClinicDetails(clinicId);
      console.log('Fetched clinic data:', response.data);
      
      // Store the complete clinic data
      setClinicData(response.data);
      
      // Initialize form with the fetched data
      setFormData({
        name: response.data?.name || '',
        address1: response.data?.address1 || '',
        address2: response.data?.address2 || '',
        city: response.data?.city || '',
        state: response.data?.state || '',
        country: response.data?.country || '',
        zipcode: response.data?.zipcode || '',
        contact: response.data?.contact || '',
        clinicContact: response.data?.clinicContact || '',
        doctorName: response.data?.doctorName || '',
        email: response.data?.email || '',
        about: response.data?.about || '',
        settings: {
          workingHours: response.data?.settings?.workingHours || {
            start: '09:00',
            end: '17:00'
          },
          workingDays: response.data?.settings?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          appointmentDuration: response.data?.settings?.appointmentDuration || 30,
          timezone: response.data?.settings?.timezone || 'UTC',
          currency: response.data?.settings?.currency || 'USD'
        }
      });
    } catch (err) {
      console.error('Error fetching clinic details:', err);
      setError(err.response?.data?.message || 'Failed to load clinic details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like settings.workingHours.start
      const parts = name.split('.');
      
      if (parts.length === 2) {
        // Handle settings.appointmentDuration
        setFormData(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            [parts[1]]: value
          }
        }));
      } else if (parts.length === 3) {
        // Handle settings.workingHours.start
        setFormData(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            [parts[1]]: {
              ...prev.settings[parts[1]],
              [parts[2]]: value
            }
          }
        }));
      }
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle working days selection
  const handleWorkingDaysChange = (day) => {
    const currentDays = [...formData.settings.workingDays];
    const index = currentDays.indexOf(day);
    
    if (index === -1) {
      // Add the day if not already selected
      currentDays.push(day);
    } else {
      // Remove the day if already selected
      currentDays.splice(index, 1);
    }
    
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        workingDays: currentDays
      }
    }));
  };

  const handleBranchSubmit = async (branchData) => {
    try {
      setSubmitLoading(true);
      if (selectedBranch) {
        await branchService.updateBranch(selectedBranch._id, branchData);
      } else {
        await branchService.createBranch(branchData);
      }
      setShowBranchModal(false);
      fetchBranches();
      setSuccess('Branch saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleServiceSubmit = async (serviceData) => {
    try {
      setSubmitLoading(true);
      if (selectedService) {
        await serviceService.updateService(selectedService._id, serviceData);
      } else {
        await serviceService.createService(serviceData);
      }
      setShowServiceModal(false);
      fetchServices();
      setSuccess('Service saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleDeleteBranch = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        setIsLoading(true);
        await branchService.deleteBranch(branchId);
        fetchBranches();
        setSuccess('Branch deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete branch');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setIsLoading(true);
        await serviceService.deleteService(serviceId);
        fetchServices();
        setSuccess('Service deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete service');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        settings: formData.settings
      };
      
      // Update clinic settings
      if (user && user.clinicId) {
        await clinicService.updateClinicSettings(user.clinicId, dataToSubmit);
        
        // Refresh auth context to get updated clinic data
        await refreshAuth();
        
        // Refresh clinic data
        await fetchClinicDetails(user.clinicId);
        
        setSuccess('Clinic settings updated successfully');
      } else {
        setError('Clinic ID not found');
      }
    } catch (err) {
      console.error('Error updating clinic settings:', err);
      setError(err.response?.data?.message || 'Failed to update clinic settings');
    } finally {
      setSubmitLoading(false);
    }
  };

  // List of available timezones
  const timezones = [
    'UTC', 'GMT', 'EST', 'CST', 'MST', 'PST', 
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 
    'Australia/Sydney', 'Pacific/Auckland'
  ];

  // List of available currencies
  const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR'
  ];

  // Days of the week for working days selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clinic Settings</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert 
          variant="success" 
          title="Success" 
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      
      {/* Settings Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-md ${activeTab === 'general' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FaCog className="mr-2" /> General
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2 rounded-md ${activeTab === 'branches' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FaBuilding className="mr-2" /> Branches
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md ${activeTab === 'services' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FaUserMd className="mr-2" /> Services
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2 rounded-md ${activeTab === 'hours' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FaClock className="mr-2" /> Working Hours
          </button>
          <button
            onClick={() => setActiveTab('localization')}
            className={`px-4 py-2 rounded-md ${activeTab === 'localization' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FaGlobe className="mr-2" /> Localization
          </button>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* General Settings Tab */}
          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Branch Management</h3>
                <Button onClick={() => {
                  setSelectedBranch(null);
                  setShowBranchModal(true);
                }}>
                  Add Branch
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map(branch => (
                  <Card key={branch.id} className="p-4">
                    <h4 className="font-medium">{branch.name}</h4>
                    <p className="text-sm text-gray-600">{branch.address}</p>
                    <p className="text-sm text-gray-600">{branch.contact}</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowBranchModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Services & Treatments</h3>
                <Button onClick={() => {
                  setSelectedService(null);
                  setShowServiceModal(true);
                }}>
                  Add Service
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <Card key={service.id} className="p-4">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-sm font-medium">${service.price}</p>
                    <p className="text-sm text-gray-600">Duration: {service.duration} mins</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaBuilding className="mr-2 text-indigo-600" /> Clinic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaEnvelope className="mr-1" /> Email</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaPhone className="mr-1" /> Primary Contact</span>
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="clinicContact" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaPhone className="mr-1" /> Clinic Phone</span>
                  </label>
                  <input
                    type="tel"
                    id="clinicContact"
                    name="clinicContact"
                    value={formData.clinicContact}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaUserMd className="mr-1" /> Primary Doctor</span>
                  </label>
                  <input
                    type="text"
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                <textarea
                  id="about"
                  name="about"
                  rows={3}
                  value={formData.about || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter a brief description about your clinic..."
                />
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <FaMapMarkerAlt className="mr-2 text-indigo-600" /> Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                      type="text"
                      id="address1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      value={formData.address2 || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaClock className="mr-2 text-indigo-600" /> Working Hours
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="settings.workingHours.start" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaRegClock className="mr-1" /> Start Time</span>
                  </label>
                  <input
                    type="time"
                    id="settings.workingHours.start"
                    name="settings.workingHours.start"
                    value={formData.settings.workingHours.start}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="settings.workingHours.end" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaRegClock className="mr-1" /> End Time</span>
                  </label>
                  <input
                    type="time"
                    id="settings.workingHours.end"
                    name="settings.workingHours.end"
                    value={formData.settings.workingHours.end}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center"><FaCalendarAlt className="mr-1" /> Working Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkingDaysChange(day)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${formData.settings.workingDays.includes(day) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="settings.appointmentDuration" className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center"><FaClock className="mr-1" /> Appointment Duration (minutes)</span>
                </label>
                <select
                  id="settings.appointmentDuration"
                  name="settings.appointmentDuration"
                  value={formData.settings.appointmentDuration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  {[15, 30, 45, 60, 90, 120].map(duration => (
                    <option key={duration} value={duration}>{duration} minutes</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaGlobe className="mr-2 text-indigo-600" /> Localization Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="settings.timezone" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaGlobe className="mr-1" /> Timezone</span>
                  </label>
                  <select
                    id="settings.timezone"
                    name="settings.timezone"
                    value={formData.settings.timezone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    {timezones.map(timezone => (
                      <option key={timezone} value={timezone}>{timezone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="settings.currency" className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center"><FaMoneyBillWave className="mr-1" /> Currency</span>
                  </label>
                  <select
                    id="settings.currency"
                    name="settings.currency"
                    value={formData.settings.currency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <Button
              type="submit"
              loading={submitLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Branch Modal */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => {
          setShowBranchModal(false);
          setSelectedBranch(null);
        }}
        title={selectedBranch ? 'Edit Branch' : 'Add Branch'}
      >
        <BranchForm
          onSubmit={handleBranchSubmit}
          initialData={selectedBranch}
          isLoading={submitLoading}
        />
      </Modal>

      {/* Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
        title={selectedService ? 'Edit Service' : 'Add Service'}
      >
        <ServiceForm
          onSubmit={handleServiceSubmit}
          initialData={selectedService}
          isLoading={submitLoading}
        />
      </Modal>
    </div>
  );
};

export default ClinicSettings;
