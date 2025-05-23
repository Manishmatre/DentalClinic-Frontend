import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/apiClient';

const TenantRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Clinic information
  const [clinicInfo, setClinicInfo] = useState({
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
    website: '',
    about: '',
    subscriptionPlan: 'Free'
  });
  
  // Admin information
  const [adminInfo, setAdminInfo] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  // Handle clinic info change
  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setClinicInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle admin info change
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate clinic information
  const validateClinicInfo = () => {
    const requiredFields = ['name', 'address1', 'city', 'state', 'country', 'zipcode', 'contact', 'clinicContact', 'doctorName', 'email'];
    
    for (const field of requiredFields) {
      if (!clinicInfo[field]) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clinicInfo.email)) {
      toast.error('Please enter a valid email address for the clinic');
      return false;
    }
    
    return true;
  };
  
  // Validate admin information
  const validateAdminInfo = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'phone'];
    
    for (const field of requiredFields) {
      if (!adminInfo[field]) {
        toast.error(`Please enter admin ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminInfo.email)) {
      toast.error('Please enter a valid email address for the admin');
      return false;
    }
    
    // Validate password match
    if (adminInfo.password !== adminInfo.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    // Validate password strength
    if (adminInfo.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateClinicInfo()) {
      setStep(2);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setStep(1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAdminInfo()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Combine clinic and admin info
      const registrationData = {
        clinic: clinicInfo,
        admin: {
          name: adminInfo.name,
          email: adminInfo.email,
          password: adminInfo.password,
          phone: adminInfo.phone,
          role: 'Admin'
        }
      };
      
      // Send registration request
      const response = await api.post('/api/clinics/register', registrationData);
      
      if (response.data.success) {
        toast.success('Registration successful! You can now log in.');
        
        // Store tenant ID and token
        if (response.data.data.clinic._id) {
          api.setTenantId(response.data.data.clinic._id);
        }
        
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        toast.error(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? 'Register Your Clinic' : 'Create Admin Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Step 1 of 2: Clinic Information' : 'Step 2 of 2: Admin Information'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            // Clinic Information Form
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Clinic Name *
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={clinicInfo.name}
                    onChange={handleClinicChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Clinic Email *
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={clinicInfo.email}
                    onChange={handleClinicChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                    Address Line 1 *
                  </label>
                  <div className="mt-1">
                    <input
                      id="address1"
                      name="address1"
                      type="text"
                      required
                      value={clinicInfo.address1}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <div className="mt-1">
                    <input
                      id="address2"
                      name="address2"
                      type="text"
                      value={clinicInfo.address2}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <div className="mt-1">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={clinicInfo.city}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province *
                  </label>
                  <div className="mt-1">
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={clinicInfo.state}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <div className="mt-1">
                    <input
                      id="country"
                      name="country"
                      type="text"
                      required
                      value={clinicInfo.country}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
                    Postal/Zip Code *
                  </label>
                  <div className="mt-1">
                    <input
                      id="zipcode"
                      name="zipcode"
                      type="text"
                      required
                      value={clinicInfo.zipcode}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                    Contact Person *
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact"
                      name="contact"
                      type="text"
                      required
                      value={clinicInfo.contact}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="clinicContact" className="block text-sm font-medium text-gray-700">
                    Clinic Phone *
                  </label>
                  <div className="mt-1">
                    <input
                      id="clinicContact"
                      name="clinicContact"
                      type="text"
                      required
                      value={clinicInfo.clinicContact}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
                    Primary Doctor *
                  </label>
                  <div className="mt-1">
                    <input
                      id="doctorName"
                      name="doctorName"
                      type="text"
                      required
                      value={clinicInfo.doctorName}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1">
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={clinicInfo.website}
                      onChange={handleClinicChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                  About Clinic
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows="3"
                    value={clinicInfo.about}
                    onChange={handleClinicChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>

              <div>
                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">
                  Subscription Plan
                </label>
                <div className="mt-1">
                  <select
                    id="subscriptionPlan"
                    name="subscriptionPlan"
                    value={clinicInfo.subscriptionPlan}
                    onChange={handleClinicChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Free">Free</option>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            // Admin Information Form
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1">
                  <input
                    id="adminName"
                    name="name"
                    type="text"
                    required
                    value={adminInfo.name}
                    onChange={handleAdminChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1">
                  <input
                    id="adminEmail"
                    name="email"
                    type="email"
                    required
                    value={adminInfo.email}
                    onChange={handleAdminChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1">
                  <input
                    id="adminPhone"
                    name="phone"
                    type="text"
                    required
                    value={adminInfo.phone}
                    onChange={handleAdminChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={adminInfo.password}
                    onChange={handleAdminChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={adminInfo.confirmPassword}
                    onChange={handleAdminChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantRegistration;
