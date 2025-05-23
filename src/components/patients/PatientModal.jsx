import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaVenusMars, 
  FaMapMarkerAlt, 
  FaNotesMedical, 
  FaIdCard,
  FaTimes,
  FaSave,
  FaLock,
  FaUserTag,
  FaHeartbeat,
  FaAllergies,
  FaHistory,
  FaAddressCard,
  FaHospital,
  FaUserMd
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';

const PatientModal = ({ isOpen, onClose, onSubmit, patient, mode = 'add' }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    },
    password: '',
    confirmPassword: '',
    createAccount: false,
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with patient data when editing
  useEffect(() => {
    if (patient && mode === 'edit') {
      try {
        // Format date properly if it exists
        let formattedDate = '';
        if (patient.dateOfBirth) {
          const date = new Date(patient.dateOfBirth);
          if (!isNaN(date.getTime())) { // Check if date is valid
            formattedDate = date.toISOString().split('T')[0];
          }
        }
        
        setFormData({
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          dateOfBirth: formattedDate,
          gender: patient.gender || '',
          address: patient.address || '',
          city: patient.city || '',
          state: patient.state || '',
          zipCode: patient.zipCode || '',
          country: patient.country || '',
          bloodGroup: patient.bloodGroup || '',
          allergies: patient.allergies || '',
          medicalHistory: patient.medicalHistory || '',
          emergencyContact: {
            name: patient.emergencyContact?.name || '',
            relationship: patient.emergencyContact?.relationship || '',
            phone: patient.emergencyContact?.phone || ''
          },
          insuranceInfo: {
            provider: patient.insuranceInfo?.provider || '',
            policyNumber: patient.insuranceInfo?.policyNumber || '',
            groupNumber: patient.insuranceInfo?.groupNumber || ''
          },
          password: '',
          confirmPassword: '',
          createAccount: false,
          status: patient.status || 'active'
        });
      } catch (error) {
        console.error('Error initializing form data:', error);
        resetForm();
      }
    } else {
      resetForm();
    }
    setErrors({});
    setActiveTab('basic');
  }, [patient, mode, isOpen]);
  
  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      bloodGroup: '',
      allergies: '',
      medicalHistory: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      insuranceInfo: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      },
      password: '',
      confirmPassword: '',
      createAccount: false,
      status: 'active'
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation for patient accounts
    if (formData.createAccount) {
      if (!formData.email) {
        newErrors.email = 'Email is required for patient account';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Show toast notifications for validation errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n');
      toast.error(errorMessages);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
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
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Create a copy of the form data for submission
      const submissionData = { ...formData };
      
      // We're not setting clinicId here - the backend will handle it
      // This is a temporary solution until we implement proper clinic selection
      console.log('Submitting patient data without clinicId - backend will handle it');
      
      // Format date properly
      if (formData.dateOfBirth) {
        submissionData.dateOfBirth = new Date(formData.dateOfBirth);
      }
      
      // Handle password for patient account
      if (!formData.createAccount) {
        // Remove password fields if not creating an account
        delete submissionData.password;
        delete submissionData.confirmPassword;
      } else {
        // Remove confirmPassword as it's not needed on the server
        delete submissionData.confirmPassword;
      }
      
      // Remove the createAccount flag as it's not needed on the server
      delete submissionData.createAccount;
      
      console.log('Submitting patient data:', submissionData);
      
      try {
        // Submit the data
        const result = onSubmit(submissionData);
        
        // Check if onSubmit returns a Promise
        if (result && typeof result.then === 'function') {
          // If it's a Promise, handle it properly
          result
            .then(() => {
              toast.success(mode === 'add' ? 'Patient added successfully' : 'Patient updated successfully');
              onClose();
            })
            .catch(error => {
              console.error('Error submitting patient:', error);
              toast.error(`Failed to ${mode === 'add' ? 'add' : 'update'} patient: ${error.message || 'Unknown error'}`);
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        } else {
          // If it's not a Promise, handle it synchronously
          toast.success(mode === 'add' ? 'Patient added successfully' : 'Patient updated successfully');
          onClose();
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error submitting patient:', error);
        toast.error(`Failed to ${mode === 'add' ? 'add' : 'update'} patient: ${error.message || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    }
  };

  // Handle tab change with prevention of form submission
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FaUser className="mr-1" /> },
    { id: 'medical', label: 'Medical Info', icon: <FaNotesMedical className="mr-1" /> },
    { id: 'additional', label: 'Additional Info', icon: <FaAddressCard className="mr-1" /> },
    { id: 'account', label: 'Account', icon: <FaLock className="mr-1" /> }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Patient' : 'Edit Patient'}
      size="xl"
    >
      <div className="mt-4">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={handleTabChange}
        />
        
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUser className="mr-1 text-gray-500" /> Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter patient's full name"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-1 text-gray-500" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaPhone className="mr-1 text-gray-500" /> Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaCalendarAlt className="mr-1 text-gray-500" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaVenusMars className="mr-1 text-gray-500" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUserTag className="mr-1 text-gray-500" /> Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaHeartbeat className="mr-1 text-gray-500" /> Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaAllergies className="mr-1 text-gray-500" /> Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any allergies"
                ></textarea>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaHistory className="mr-1 text-gray-500" /> Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Relevant medical history"
                ></textarea>
              </div>
            </div>
          )}

          {/* Additional Info Tab */}
          {activeTab === 'additional' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="col-span-2">
                <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" /> Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State/Province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Zip/Postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FaUserMd className="mr-2 text-gray-500" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Relationship to patient"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FaHospital className="mr-2 text-gray-500" /> Insurance Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <input
                      type="text"
                      name="insuranceInfo.provider"
                      value={formData.insuranceInfo.provider}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Insurance provider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                    <input
                      type="text"
                      name="insuranceInfo.policyNumber"
                      value={formData.insuranceInfo.policyNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Policy number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                    <input
                      type="text"
                      name="insuranceInfo.groupNumber"
                      value={formData.insuranceInfo.groupNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Group number"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="createAccount"
                  name="createAccount"
                  checked={formData.createAccount}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="createAccount" className="ml-2 block text-sm text-gray-700">
                  Create patient account for portal access
                </label>
              </div>
              
              {formData.createAccount && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaLock className="mr-1 text-gray-500" /> Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter password for patient account"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaLock className="mr-1 text-gray-500" /> Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md mt-2">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Creating a patient account will allow the patient to access the patient portal using their email and password. They will be able to view their medical records, appointments, and other information.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              <FaTimes className="mr-2" /> Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <FaSave className="mr-2" /> {mode === 'add' ? 'Add Patient' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PatientModal;
