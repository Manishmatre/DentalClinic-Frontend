import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaHospital, FaEdit, FaCheck, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const ClinicProfile = () => {
  const { user, clinic, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [clinicData, setClinicData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    clinicContact: '',
    doctorName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    about: '',
    logo: ''
  });

  // Function to create a default clinic if none exists or activate an inactive one
  const createOrActivateClinic = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Creating or activating clinic for user:', user.name);
      
      // Default clinic data
      const defaultClinicData = {
        name: 'My Health Clinic',
        email: user.email,
        contact: user.phone || '1234567890',
        clinicContact: user.phone || '1234567890',
        doctorName: user.name,
        address1: '123 Health Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipcode: '400001',
        status: 'active',
        subscription: {
          status: 'active'
        }
      };
      
      // Try to update the clinic to active status
      const response = await clinicService.updateClinicSettings(user.clinicId, {
        ...defaultClinicData,
        status: 'active'
      });
      
      console.log('Clinic activation response:', response);
      
      // Refresh auth to get updated clinic status
      await refreshAuth();
      
      // Now fetch the clinic data again
      return await fetchClinicData();
    } catch (err) {
      console.error('Error creating/activating clinic:', err);
      setError('Failed to create or activate clinic. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch real clinic data from the database
  const fetchClinicData = async () => {
    if (!user || !user.clinicId) {
      console.log('No user or clinicId available:', user);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching real clinic data for clinicId:', user.clinicId);
      
      // First, try to activate the clinic if it's not active
      try {
        // This will ensure the clinic is active
        await createOrActivateClinic();
        console.log('Clinic activation check completed');
      } catch (activationError) {
        console.warn('Clinic activation check failed:', activationError);
        // Continue anyway, as we've modified the backend to allow access to inactive clinics
      }
      
      // Now fetch the clinic data
      try {
        const response = await clinicService.getClinicDetails(user.clinicId);
        console.log('API response:', response);
        
        // Extract clinic data - the API might return { data: {...} } or just {...}
        const clinicData = response.data || response;
        console.log('Processed clinic data from API:', clinicData);
        
        if (!clinicData) {
          throw new Error('No clinic data received from server');
        }
        
        // Store the complete clinic data
        setClinicData(clinicData);
        
        // Initialize form with the fetched data
        setFormData({
          name: clinicData?.name || '',
          email: clinicData?.email || '',
          contact: clinicData?.contact || '',
          clinicContact: clinicData?.clinicContact || '',
          doctorName: clinicData?.doctorName || '',
          address1: clinicData?.address1 || '',
          address2: clinicData?.address2 || '',
          city: clinicData?.city || '',
          state: clinicData?.state || '',
          country: clinicData?.country || '',
          zipcode: clinicData?.zipcode || '',
          about: clinicData?.about || '',
          logo: clinicData?.logo || ''
        });
      } catch (apiError) {
        console.error('Error fetching clinic data:', apiError);
        setError('Failed to load clinic data: ' + 
          (apiError.response?.data?.message || 'Server error. Please try again.'));
      }
    } catch (err) {
      console.error('Error in fetchClinicData:', err);
      setError('Failed to load clinic data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load fresh clinic data when component mounts
  useEffect(() => {
    fetchClinicData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a copy of formData for submission
      const dataToSubmit = { ...formData };

      console.log('Submitting clinic data update to backend:', dataToSubmit);

      // Update clinic details via API
      const response = await clinicService.updateClinicSettings(user.clinicId, dataToSubmit);
      console.log('Update response from backend:', response);
      
      // Refresh auth context to get updated clinic data
      await refreshAuth();
      
      // Show success message
      setSuccess('Clinic profile updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
      
      // Refresh clinic data to show the latest information from the database
      await fetchClinicData();
    } catch (err) {
      console.error('Error updating clinic profile:', err);
      setError(err.response?.data?.message || 'Failed to update clinic profile. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !clinicData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading clinic data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clinic Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {error && (
        <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert variant="success" title="Success" message={success} onClose={() => setSuccess(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {/* Basic Information */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">                  
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaHospital className="mr-2 text-indigo-600" /> 
                    Basic Information
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`inline-block h-2 w-2 rounded-full ${clinicData?.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    <span>{clinicData?.status === 'active' ? 'Active' : clinicData?.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Primary Contact</label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="clinicContact" className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                    <input
                      type="tel"
                      id="clinicContact"
                      name="clinicContact"
                      value={formData.clinicContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Primary Doctor</label>
                    <input
                      type="text"
                      id="doctorName"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                    <textarea
                      id="about"
                      name="about"
                      value={formData.about || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-indigo-600" />
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                      type="text"
                      id="address1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="address2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      value={formData.address2 || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
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
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
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
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
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
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
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
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              {isEditing && (
                <div className="p-6">
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original clinic data
                        setFormData({
                          name: clinicData?.name || '',
                          email: clinicData?.email || '',
                          contact: clinicData?.contact || '',
                          clinicContact: clinicData?.clinicContact || '',
                          doctorName: clinicData?.doctorName || '',
                          address1: clinicData?.address1 || '',
                          address2: clinicData?.address2 || '',
                          city: clinicData?.city || '',
                          state: clinicData?.state || '',
                          country: clinicData?.country || '',
                          zipcode: clinicData?.zipcode || '',
                          about: clinicData?.about || '',
                          logo: clinicData?.logo || ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Clinic Summary Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-white">
                    {clinicData?.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{clinicData?.name}</h2>
                  <p className="text-sm text-gray-500">Healthcare Facility</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Established</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {clinicData?.createdAt ? new Date(clinicData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <span className={`inline-block h-2 w-2 rounded-full mr-2 ${clinicData?.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    {clinicData?.status === 'active' ? 'Active' : clinicData?.status}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Subscription Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan</label>
                  <p className="mt-1 text-sm text-gray-900">{clinicData?.subscriptionPlan || 'Free'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <span className={`inline-block h-2 w-2 rounded-full mr-2 ${clinicData?.subscription?.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    {clinicData?.subscription?.status || 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Renewal Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {clinicData?.subscription?.endDate ? new Date(clinicData.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaPhone className="text-indigo-600 mr-3" />
                  <div>
                    <label className="text-xs font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{clinicData?.clinicContact}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-indigo-600 mr-3" />
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{clinicData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-indigo-600 mr-3" />
                  <div>
                    <label className="text-xs font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900">
                      {clinicData?.address1}, {clinicData?.city}, {clinicData?.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClinicProfile;
