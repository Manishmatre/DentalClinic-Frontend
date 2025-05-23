import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/auth/authService';
import adminService from '../../api/admin/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  FaUser, 
  FaHospital, 
  FaEdit, 
  FaCheck, 
  FaTimes, 
  FaKey, 
  FaIdCard, 
  FaGraduationCap, 
  FaUniversity, 
  FaMoneyBillWave, 
  FaTools, 
  FaLink, 
  FaCreditCard,
  FaHistory,
  FaCog
} from 'react-icons/fa';

const AdminProfile = () => {
  const { user, clinic, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specializations: [],
    license: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    profileImage: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Load fresh user data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user data from auth service
        const freshUserData = await authService.getCurrentUser();
        console.log('Fetched user data:', freshUserData);
        
        if (!freshUserData) {
          throw new Error('No user data returned from server');
        }
        
        setUserData(freshUserData);
        
        // Try to fetch admin profile data
        try {
          const adminProfileData = await adminService.getAdminProfile();
          console.log('Fetched admin profile data:', adminProfileData);
          setAdminData(adminProfileData);
        } catch (adminErr) {
          console.error('Error fetching admin profile data:', adminErr);
          // Create a new admin profile with default values if not found
          const defaultAdminData = {
            firstName: freshUserData?.name?.split(' ')[0] || '',
            lastName: freshUserData?.name?.split(' ')[1] || '',
            email: freshUserData?.email || '',
            phone: freshUserData?.phone || '',
            role: freshUserData?.role || 'Admin',
            status: 'active',
            isVerified: freshUserData?.isEmailVerified || false,
            preferences: {
              language: 'English',
              timezone: 'UTC+5:30',
              currency: 'INR',
              notifications: {
                email: true,
                sms: false,
                inApp: true
              }
            }
          };
          
          // Create admin profile
          try {
            const createdProfile = await adminService.updateAdminProfile(defaultAdminData);
            console.log('Created admin profile:', createdProfile);
            setAdminData(createdProfile.data);
          } catch (createErr) {
            console.error('Error creating admin profile:', createErr);
          }
        }
        
        // Initialize form with fresh data
        setFormData({
          name: freshUserData?.name || '',
          email: freshUserData?.email || '',
          phone: freshUserData?.phone || '',
          specializations: freshUserData?.specializations || [],
          license: freshUserData?.license || '',
          emergencyContact: freshUserData?.emergencyContact || {
            name: '',
            phone: '',
            relationship: ''
          },
          address: freshUserData?.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          profileImage: freshUserData?.profileImage || null,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        setError('Failed to load user data. Please try refreshing the page.');
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate password if changing
      if (isChangingPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (formData.newPassword.length < 8) {
          setError('New password must be at least 8 characters');
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a copy of formData without password fields if not changing password
      const dataToSubmit = { ...formData };
      
      if (!isChangingPassword) {
        delete dataToSubmit.currentPassword;
        delete dataToSubmit.newPassword;
        delete dataToSubmit.confirmPassword;
      }

      console.log('Submitting profile update:', dataToSubmit);
      const response = await authService.updateProfile(dataToSubmit);
      console.log('Profile update response:', response);
      
      // Update local user context with the updated data
      if (response.success) {
        setUserData(response.user);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setIsChangingPassword(false);
        
        // Refresh auth context if needed
        if (refreshAuth) refreshAuth();
        
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error(response.message || 'Update failed with unknown error');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>
      
      {error && <Alert variant="error" message={error} className="mb-4" />}
      {success && <Alert variant="success" message={success} className="mb-4" />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white shadow rounded overflow-hidden">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'personal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('personal')}
              >
                <FaUser className="inline mr-2" /> Personal Details
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'professional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('professional')}
              >
                <FaGraduationCap className="inline mr-2" /> Professional
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'bank' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('bank')}
              >
                <FaCreditCard className="inline mr-2" /> Bank Details
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'social' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('social')}
              >
                <FaLink className="inline mr-2" /> Social Links
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('preferences')}
              >
                <FaCog className="inline mr-2" /> Preferences
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabClick('security')}
              >
                <FaKey className="inline mr-2" /> Security
              </button>
            </div>
          </div>
          <Card>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {/* Personal Information */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">                  
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaUser className="mr-2 text-indigo-600" /> 
                    Personal Information
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`inline-block h-2 w-2 rounded-full ${userData?.isEmailVerified ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    <span>{userData?.isEmailVerified ? 'Verified Account' : 'Pending Verification'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={true} // Name cannot be changed directly
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                    {isEditing && (
                      <p className="mt-1 text-xs text-gray-500">Name cannot be changed directly for security reasons.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true} // Email cannot be changed directly
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      required
                    />
                    {isEditing && (
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed directly for security reasons.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={true} // Phone cannot be changed directly
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {isEditing && (
                      <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed directly for security reasons.</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      id="role"
                      value={userData?.role || ''}
                      disabled={true}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">Account Status</label>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userData?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {userData?.isActive ? (
                          <>
                            <FaCheck className="mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <FaTimes className="mr-1" /> Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {userData?.role === 'Doctor' && (
                    <>
                      <div>
                        <label htmlFor="license" className="block text-sm font-medium text-gray-700">License Number</label>
                        <input
                          type="text"
                          id="license"
                          name="license"
                          value={formData.license}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="specializations" className="block text-sm font-medium text-gray-700">Specializations</label>
                        <input
                          type="text"
                          id="specializations"
                          name="specializations"
                          value={formData.specializations.join(', ')}
                          onChange={(e) => {
                            const specializations = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData(prev => ({
                              ...prev,
                              specializations
                            }));
                          }}
                          disabled={!isEditing}
                          className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="e.g. Cardiology, Neurology (comma separated)"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      id="emergencyContact.name"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      type="tel"
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input
                      type="text"
                      id="emergencyContact.relationship"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Password Change Section */}
              {isEditing && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Password Settings</h2>
                    <Button 
                      type="button" 
                      variant={isChangingPassword ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                    >
                      {isChangingPassword ? "Cancel Password Change" : "Change Password"}
                    </Button>
                  </div>
                  
                  {isChangingPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required={isChangingPassword}
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required={isChangingPassword}
                          minLength="8"
                        />
                        <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required={isChangingPassword}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              {isEditing && (
                <div className="p-6">
                  <div className="flex justify-end space-x-3">                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: userData?.name || '',
                          email: userData?.email || '',
                          phone: userData?.phone || '',
                          specializations: userData?.specializations || [],
                          license: userData?.license || '',
                          address: userData?.address || {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: ''
                          },
                          emergencyContact: userData?.emergencyContact || {
                            name: '',
                            phone: '',
                            relationship: ''
                          },
                          profileImage: userData?.profileImage || null
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
          {/* Profile Summary Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-white">
                    {userData?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userData?.name || user?.name}</h2>
                  <p className="text-sm text-gray-500">{userData?.role || user?.role}</p>
                  <p className="text-sm text-gray-500">{userData?.email || user?.email}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {userData?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {userData?.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {userData.address.street ? userData.address.street + ', ' : ''}
                      {userData.address.city ? userData.address.city + ', ' : ''}
                      {userData.address.state ? userData.address.state + ' ' : ''}
                      {userData.address.zipCode || ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Clinic Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Clinic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Name</label>
                  <p className="mt-1 text-sm text-gray-900">{clinic?.name || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Email</label>
                  <p className="mt-1 text-sm text-gray-900">{clinic?.email || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{clinic?.contact || clinic?.clinicContact || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
                  <p className="mt-1 text-sm text-gray-900">{clinic?.subscriptionPlan || 'Free'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clinic?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {clinic?.status === 'active' ? 'Active' : clinic?.status || 'Unknown'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Your Role</label>
                  <p className="mt-1 text-sm text-gray-900">{userData?.role || user?.role}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;