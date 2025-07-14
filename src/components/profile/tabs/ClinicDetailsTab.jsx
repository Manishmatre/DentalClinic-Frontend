import React, { useState, useEffect } from 'react';
import { 
  FaHospital, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaClock, 
  FaImage, 
  FaUpload,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
import clinicService from '../../../api/clinic/clinicService';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Clinic Details Tab Component
 * Allows admin users to manage clinic information
 */
const ClinicDetailsTab = ({ formData, isEditing, handleInputChange, handleArrayInputChange, handleFileUpload }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  
  // Initialize clinic details from the Admin model or fetched data
  const clinicDetails = formData.clinicDetails || {
    name: '',
    logo: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contactNumber: '',
    email: '',
    website: '',
    registrationNumber: '',
    taxIdentificationNumber: '',
    establishedYear: '',
    operatingHours: [
      { day: 'Monday', open: '09:00', close: '17:00', closed: false },
      { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
      { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
      { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
      { day: 'Friday', open: '09:00', close: '17:00', closed: false },
      { day: 'Saturday', open: '10:00', close: '14:00', closed: false },
      { day: 'Sunday', open: '00:00', close: '00:00', closed: true }
    ],
    specialties: [],
    facilities: [],
    insuranceAccepted: [],
    images: []
  };
  
  // Fetch clinic data from the database
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!user || !user.clinicId) {
        console.log('No user or clinicId available');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching clinic data for clinicId:', user.clinicId);
        
        const response = await clinicService.getClinicDetails(user.clinicId);
        console.log('Clinic data fetched successfully:', response);
        
        // Extract clinic data
        const fetchedClinicData = response.data || response;
        setClinicData(fetchedClinicData);
        
        // Update form data with fetched clinic details
        if (fetchedClinicData) {
          // Prepare clinic details object
          const updatedClinicDetails = {
            ...clinicDetails,
            name: fetchedClinicData.name || '',
            logo: fetchedClinicData.logo || '',
            contactNumber: fetchedClinicData.clinicContact || fetchedClinicData.contact || '',
            email: fetchedClinicData.email || '',
            website: fetchedClinicData.website || '',
            registrationNumber: fetchedClinicData.registrationNumber || '',
            taxIdentificationNumber: fetchedClinicData.taxIdentificationNumber || '',
            establishedYear: fetchedClinicData.establishedYear || '',
            // Keep existing operating hours if not provided in fetched data
            operatingHours: fetchedClinicData.operatingHours || clinicDetails.operatingHours,
            specialties: fetchedClinicData.specialties || [],
            facilities: fetchedClinicData.facilities || [],
            insuranceAccepted: fetchedClinicData.insuranceAccepted || [],
            images: fetchedClinicData.images || []
          };
          
          // Update form data with fetched clinic details
          handleInputChange({
            target: {
              name: 'clinicDetails',
              value: updatedClinicDetails
            }
          });
          
          // Update other form fields
          if (fetchedClinicData.address1) {
            handleInputChange({
              target: {
                name: 'clinicAddressLine1',
                value: fetchedClinicData.address1
              }
            });
          }
          
          if (fetchedClinicData.address2) {
            handleInputChange({
              target: {
                name: 'clinicAddressLine2',
                value: fetchedClinicData.address2
              }
            });
          }
          
          if (fetchedClinicData.city) {
            handleInputChange({
              target: {
                name: 'clinicCity',
                value: fetchedClinicData.city
              }
            });
          }
          
          if (fetchedClinicData.state) {
            handleInputChange({
              target: {
                name: 'clinicState',
                value: fetchedClinicData.state
              }
            });
          }
          
          if (fetchedClinicData.zipcode) {
            handleInputChange({
              target: {
                name: 'clinicZipCode',
                value: fetchedClinicData.zipcode
              }
            });
          }
          
          if (fetchedClinicData.country) {
            handleInputChange({
              target: {
                name: 'clinicCountry',
                value: fetchedClinicData.country
              }
            });
          }
          
          // Update contact information
          if (fetchedClinicData.clinicContact || fetchedClinicData.contact) {
            handleInputChange({
              target: {
                name: 'clinicPhone',
                value: fetchedClinicData.clinicContact || fetchedClinicData.contact
              }
            });
          }
          
          if (fetchedClinicData.email) {
            handleInputChange({
              target: {
                name: 'clinicEmail',
                value: fetchedClinicData.email
              }
            });
          }
          
          if (fetchedClinicData.website) {
            handleInputChange({
              target: {
                name: 'clinicWebsite',
                value: fetchedClinicData.website
              }
            });
          }
          
          // Update additional information
          if (fetchedClinicData.specialties) {
            handleInputChange({
              target: {
                name: 'clinicSpecialties',
                value: Array.isArray(fetchedClinicData.specialties) 
                  ? fetchedClinicData.specialties.join(', ')
                  : fetchedClinicData.specialties
              }
            });
          }
          
          if (fetchedClinicData.insuranceAccepted) {
            handleInputChange({
              target: {
                name: 'clinicInsurance',
                value: Array.isArray(fetchedClinicData.insuranceAccepted) 
                  ? fetchedClinicData.insuranceAccepted.join(', ')
                  : fetchedClinicData.insuranceAccepted
              }
            });
          }
          
          if (fetchedClinicData.facilities) {
            handleInputChange({
              target: {
                name: 'clinicAmenities',
                value: Array.isArray(fetchedClinicData.facilities) 
                  ? fetchedClinicData.facilities.join(', ')
                  : fetchedClinicData.facilities
              }
            });
          }
          
          if (fetchedClinicData.policies) {
            handleInputChange({
              target: {
                name: 'clinicPolicies',
                value: fetchedClinicData.policies
              }
            });
          }
          
          // Update services if available
          if (fetchedClinicData.services && Array.isArray(fetchedClinicData.services)) {
            handleArrayInputChange('services', fetchedClinicData.services);
          }
        }
      } catch (error) {
        console.error('Error fetching clinic data:', error);
        toast.error('Failed to fetch clinic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClinicData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  const operatingHours = clinicDetails.operatingHours || [];
  const services = formData.services || [];
  const images = clinicDetails.images || [];
  
  // Update operating hours
  const updateOperatingHours = (index, field, value) => {
    const updatedHours = [...operatingHours];
    
    if (field === 'closed') {
      updatedHours[index].closed = value;
    } else {
      updatedHours[index][field] = value;
    }
    
    // Update the clinicDetails object
    const updatedClinicDetails = {
      ...clinicDetails,
      operatingHours: updatedHours
    };
    
    handleInputChange({
      target: {
        name: 'clinicDetails',
        value: updatedClinicDetails
      }
    });
  };
  
  // Add a new service
  const addService = () => {
    const newServices = [...services, { name: '', category: '', price: '', description: '' }];
    handleArrayInputChange('services', newServices);
  };
  
  // Remove a service
  const removeService = (index) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    handleArrayInputChange('services', newServices);
  };
  
  // Update a service
  const updateService = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    handleArrayInputChange('services', newServices);
  };
  
  // Add a clinic image
  const addClinicImage = (file) => {
    if (file) {
      handleFileUpload('clinicImage', file, (imageUrl) => {
        const newImages = [...images, { url: imageUrl, caption: '' }];
        
        // Update the clinicDetails object
        const updatedClinicDetails = {
          ...clinicDetails,
          images: newImages
        };
        
        handleInputChange({
          target: {
            name: 'clinicDetails',
            value: updatedClinicDetails
          }
        });
      });
    }
  };
  
  // Remove a clinic image
  const removeClinicImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // Update the clinicDetails object
    const updatedClinicDetails = {
      ...clinicDetails,
      images: newImages
    };
    
    handleInputChange({
      target: {
        name: 'clinicDetails',
        value: updatedClinicDetails
      }
    });
  };
  
  // Update a clinic image caption
  const updateClinicImageCaption = (index, caption) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    
    // Update the clinicDetails object
    const updatedClinicDetails = {
      ...clinicDetails,
      images: newImages
    };
    
    handleInputChange({
      target: {
        name: 'clinicDetails',
        value: updatedClinicDetails
      }
    });
  };
  
  // Format day name
  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  return (
    <div className="space-y-8">
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}
      {/* Basic Clinic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Information</h3>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
              Clinic Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicName"
                name="clinicDetails.name"
                value={clinicDetails.name || ''}
                onChange={(e) => {
                  const updatedClinicDetails = {
                    ...clinicDetails,
                    name: e.target.value
                  };
                  handleInputChange({
                    target: {
                      name: 'clinicDetails',
                      value: updatedClinicDetails
                    }
                  });
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="clinicDescription" className="block text-sm font-medium text-gray-700">
              Clinic Description
            </label>
            <div className="mt-1">
              <textarea
                id="clinicDescription"
                name="clinicDescription"
                rows={3}
                value={formData.clinicDescription || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Brief description of your clinic for patients and visitors.
            </p>
          </div>
          
          <div>
            <label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="clinicPhone"
                name="clinicPhone"
                value={formData.clinicPhone || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full pl-10 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="clinicEmail"
                name="clinicEmail"
                value={formData.clinicEmail || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full pl-10 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="clinicWebsite" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="clinicWebsite"
                name="clinicWebsite"
                value={formData.clinicWebsite || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full pl-10 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="clinicTaxId" className="block text-sm font-medium text-gray-700">
              Tax ID / Registration Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicTaxId"
                name="clinicTaxId"
                value={formData.clinicTaxId || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Clinic Address */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Address</h3>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
          <div className="sm:col-span-3">
            <label htmlFor="clinicAddressLine1" className="block text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicAddressLine1"
                name="clinicAddressLine1"
                value={formData.clinicAddressLine1 || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="clinicAddressLine2" className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicAddressLine2"
                name="clinicAddressLine2"
                value={formData.clinicAddressLine2 || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="clinicCity" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicCity"
                name="clinicCity"
                value={formData.clinicCity || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="clinicState" className="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicState"
                name="clinicState"
                value={formData.clinicState || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="clinicZipCode" className="block text-sm font-medium text-gray-700">
              ZIP / Postal Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="clinicZipCode"
                name="clinicZipCode"
                value={formData.clinicZipCode || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="clinicCountry" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="mt-1">
              <select
                id="clinicCountry"
                name="clinicCountry"
                value={formData.clinicCountry || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="clinicMapLink" className="block text-sm font-medium text-gray-700">
              Google Maps Link
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                id="clinicMapLink"
                name="clinicMapLink"
                value={formData.clinicMapLink || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="block w-full pl-10 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Link to your clinic's location on Google Maps
            </p>
          </div>
        </div>
      </div>
      
      {/* Clinic Hours */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Clinic Hours</h3>
          <FaClock className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {operatingHours.map((hours) => (
              <li key={hours.day}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="w-1/4">
                      <p className="text-sm font-medium text-gray-900">{formatDayName(hours.day)}</p>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center space-x-4 w-3/4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => updateOperatingHours(operatingHours.findIndex(h => h.day === hours.day), 'closed', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Closed</span>
                        </label>
                        
                        {!hours.closed && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => updateOperatingHours(operatingHours.findIndex(h => h.day === hours.day), 'open', e.target.value)}
                              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => updateOperatingHours(operatingHours.findIndex(h => h.day === hours.day), 'close', e.target.value)}
                              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-3/4">
                        {hours.closed ? (
                          <span className="text-sm text-red-600">Closed</span>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {hours.open} - {hours.close}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Clinic Services */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Clinic Services</h3>
          {isEditing && (
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-1" /> Add Service
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          List the services offered by your clinic, along with descriptions and pricing.
        </p>
        
        {services.length === 0 && !isEditing ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No services added yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <li key={index}>
                  <div className="px-4 py-4 sm:px-6">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label htmlFor={`serviceName-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Service Name
                          </label>
                          <input
                            type="text"
                            id={`serviceName-${index}`}
                            value={service.name || ''}
                            onChange={(e) => updateClinicService(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`serviceDescription-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            id={`serviceDescription-${index}`}
                            value={service.description || ''}
                            onChange={(e) => updateClinicService(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-end space-x-2">
                          <div className="flex-grow">
                            <label htmlFor={`servicePrice-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Price
                            </label>
                            <input
                              type="text"
                              id={`servicePrice-${index}`}
                              value={service.price || ''}
                              onChange={(e) => updateClinicService(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeClinicService(index)}
                            className="mb-1 inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{service.name || 'Unnamed Service'}</h4>
                          <p className="mt-1 text-sm text-gray-500">{service.description || 'No description provided'}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.price ? `$${service.price}` : 'Price not specified'}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Clinic Images */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Clinic Images</h3>
          {isEditing && (
            <label className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
              <FaUpload className="mr-1" /> Upload Image
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => addClinicImage(e.target.files[0])}
              />
            </label>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Upload images of your clinic to showcase your facilities to patients.
        </p>
        
        {images.length === 0 && !isEditing ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No clinic images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={image.url} 
                    alt={image.caption || `Clinic image ${index + 1}`}
                    className="object-cover"
                  />
                </div>
                
                {isEditing && (
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => removeClinicImage(index)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
                
                {isEditing ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Add a caption"
                      value={image.caption || ''}
                      onChange={(e) => updateClinicImageCaption(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  image.caption && (
                    <div className="mt-2 text-sm text-gray-500">
                      {image.caption}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Additional Information */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="clinicSpecialties" className="block text-sm font-medium text-gray-700">
              Clinic Specialties
            </label>
            <div className="mt-1">
              <textarea
                id="clinicSpecialties"
                name="clinicSpecialties"
                rows={3}
                value={formData.clinicSpecialties || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g. Cardiology, Pediatrics, Orthopedics"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              List the medical specialties your clinic focuses on.
            </p>
          </div>
          
          <div>
            <label htmlFor="clinicInsurance" className="block text-sm font-medium text-gray-700">
              Accepted Insurance Providers
            </label>
            <div className="mt-1">
              <textarea
                id="clinicInsurance"
                name="clinicInsurance"
                rows={3}
                value={formData.clinicInsurance || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g. Blue Cross, Aetna, Medicare"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              List the insurance providers your clinic accepts.
            </p>
          </div>
          
          <div>
            <label htmlFor="clinicAmenities" className="block text-sm font-medium text-gray-700">
              Clinic Amenities
            </label>
            <div className="mt-1">
              <textarea
                id="clinicAmenities"
                name="clinicAmenities"
                rows={3}
                value={formData.clinicAmenities || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g. Free WiFi, Wheelchair accessible, Parking available"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              List amenities available at your clinic.
            </p>
          </div>
          
          <div>
            <label htmlFor="clinicPolicies" className="block text-sm font-medium text-gray-700">
              Clinic Policies
            </label>
            <div className="mt-1">
              <textarea
                id="clinicPolicies"
                name="clinicPolicies"
                rows={3}
                value={formData.clinicPolicies || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g. 24-hour cancellation policy, No-show fee policy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Describe important policies that patients should be aware of.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetailsTab;
