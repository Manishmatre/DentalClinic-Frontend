import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/auth/authService';
import adminService from '../../api/admin/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaHospital, 
  FaEdit, 
  FaCloudUploadAlt,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaGraduationCap,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaUniversity,
  FaLock,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaPhoneAlt,
  FaClock,
  FaStethoscope,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaRupeeSign,
  FaCrown,
  FaCheckCircle,
  FaArrowRight,
  FaBriefcase,
  FaShieldAlt,
  FaGlobe,
  FaCreditCard,
  FaPlus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaKey,
  FaTools,
  FaTrash,
  FaUserTie,
  FaBell,
  FaCog,
  FaLink,
  FaHistory,
  FaFileExport,
  FaDownload,
  FaChartLine,
  FaExclamationTriangle,
  FaInfoCircle,
  FaQuestion,
  FaQuestionCircle,
  FaSync,
  FaSignOutAlt,
  FaSignInAlt,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSave,
  FaPrint,
  FaExternalLinkAlt,
  FaFileAlt,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaFileCsv
} from 'react-icons/fa';

const AdminProfileNew = () => {
  const { user, clinic, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form data for basic profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    languagesSpoken: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user and admin data
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
          
          // Initialize form with admin data
          if (adminProfileData) {
            setFormData({
              firstName: adminProfileData.firstName || '',
              lastName: adminProfileData.lastName || '',
              email: adminProfileData.email || freshUserData.email || '',
              phone: adminProfileData.phone || freshUserData.phone || '',
              gender: adminProfileData.gender || '',
              dob: adminProfileData.dob ? new Date(adminProfileData.dob).toISOString().split('T')[0] : '',
              qualification: adminProfileData.qualification || '',
              specialization: adminProfileData.specialization || '',
              yearsOfExperience: adminProfileData.yearsOfExperience || '',
              languagesSpoken: adminProfileData.languagesSpoken || [],
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        } catch (adminErr) {
          console.error('Error fetching admin profile data:', adminErr);
          // Create default form data from user data
          setFormData({
            firstName: freshUserData?.name?.split(' ')[0] || '',
            lastName: freshUserData?.name?.split(' ')[1] || '',
            email: freshUserData?.email || '',
            phone: freshUserData?.phone || '',
            gender: '',
            dob: '',
            qualification: '',
            specialization: '',
            yearsOfExperience: '',
            languagesSpoken: [],
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (err) {
        setError('Failed to load user data. Please try refreshing the page.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create profile data object
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        qualification: formData.qualification,
        specialization: formData.specialization,
        yearsOfExperience: formData.yearsOfExperience,
        languagesSpoken: formData.languagesSpoken
      };
      
      // Update admin profile
      const response = await adminService.updateAdminProfile(profileData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        setAdminData(response.data);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
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

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (isLoading && !userData && !adminData) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Dummy data for better visualization
  const dummyClinicData = {
    name: clinic?.name || "City Health Clinic",
    email: clinic?.email || "info@cityhealthclinic.com",
    contact: clinic?.contact || "+91 9876543210",
    address: {
      street: "123 Healthcare Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India"
    },
    registrationNumber: "HC12345678",
    taxId: "TAXID98765432",
    establishedDate: "2018-05-15",
    operatingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    specialties: ["General Medicine", "Pediatrics", "Orthopedics", "Dermatology", "Cardiology"],
    subscriptionPlan: clinic?.subscriptionPlan || "Premium",
    status: clinic?.status || "active",
    staffCount: 24,
    patientsCount: 5280,
    appointmentsThisMonth: 342,
    revenueThisMonth: "₹1,245,600"
  };

  // Use the dummy data if clinic data is not available
  const clinicData = clinic || dummyClinicData;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="text-2xl font-semibold text-blue-600">
                {adminData?.firstName?.charAt(0)?.toUpperCase() || userData?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {adminData ? `${adminData.firstName || ''} ${adminData.lastName || ''}` : userData?.name || 'Admin Profile'}
              </h1>
              <p className="text-blue-100">{userData?.role || 'Admin'} • {clinicData.name}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <Button>
              <FaCloudUploadAlt className="mr-2" /> Export Profile
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="error" message={error} />
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="success" message={success} />
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {/* Main Content */}
        <div className="w-full space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-4 w-full">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'personal' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('personal')}
              >
                <FaUser className="inline mr-2" /> Personal
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'professional' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('professional')}
              >
                <FaBriefcase className="inline mr-2" /> Professional
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'clinic' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('clinic')}
              >
                <FaHospital className="inline mr-2" /> Clinic
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'bank' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('bank')}
              >
                <FaCreditCard className="inline mr-2" /> Banking
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'social' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('social')}
              >
                <FaGlobe className="inline mr-2" /> Social
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabClick('security')}
              >
                <FaShieldAlt className="inline mr-2" /> Security
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <div className="p-6">
                {/* Personal Details Tab */}
                {activeTab === 'personal' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FaUser className="mr-2 text-blue-600" /> Personal Information
                      </h2>
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                        >
                          <FaEdit className="mr-2" /> Edit Profile
                        </Button>
                      ) : (
                        <div className="space-x-2">
                          <Button 
                            variant="secondary" 
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                          >
                            <FaTimes className="mr-2" /> Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            form="personal-form"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                          >
                            <FaCheck className="mr-2" /> Save Changes
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <form id="personal-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                          <p className="text-sm text-blue-800">Update your personal information to keep your profile current.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                disabled
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <FaLock className="text-gray-400" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Email cannot be changed. Contact support for assistance.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="+91 1234567890"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Gender
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200 mt-6">
                          <h3 className="text-md font-medium text-gray-700 mb-3">Additional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Nationality
                              </label>
                              <input
                                type="text"
                                name="nationality"
                                value={formData.nationality || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="e.g. Indian"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Languages Spoken
                              </label>
                              <input
                                type="text"
                                name="languages"
                                value={formData.languages || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="e.g. English, Hindi"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                            <p className="text-lg font-medium">{adminData?.firstName || 'Not provided'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                            <p className="text-lg font-medium">{adminData?.lastName || 'Not provided'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                            <p className="text-lg font-medium">{adminData?.email || userData?.email || 'Not provided'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                            <p className="text-lg font-medium">{adminData?.phone || userData?.phone || 'Not provided'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                            <p className="text-lg font-medium">{adminData?.gender ? adminData.gender.charAt(0).toUpperCase() + adminData.gender.slice(1) : 'Not provided'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
                            <p className="text-lg font-medium">{adminData?.dob ? new Date(adminData.dob).toLocaleDateString() : 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="text-md font-medium text-gray-700 mb-3">Additional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <p className="text-sm font-medium text-gray-500 mb-1">Nationality</p>
                              <p className="text-lg font-medium">{adminData?.nationality || 'Not provided'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <p className="text-sm font-medium text-gray-500 mb-1">Languages Spoken</p>
                              <p className="text-lg font-medium">{adminData?.languagesSpoken?.join(', ') || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              
              {/* Professional Tab */}
              {activeTab === 'professional' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaBriefcase className="mr-2 text-blue-600" /> Professional Information
                    </h2>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Edit Details
                    </Button>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-8">
                    <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Qualifications & Expertise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <FaGraduationCap className="text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-gray-700">Qualification</p>
                        </div>
                        <p className="text-lg font-medium">{adminData?.qualification || 'Not provided'}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <FaUserMd className="text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-gray-700">Specialization</p>
                        </div>
                        <p className="text-lg font-medium">{adminData?.specialization || 'Not provided'}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <FaCalendarAlt className="text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-gray-700">Years of Experience</p>
                        </div>
                        <p className="text-lg font-medium">{adminData?.yearsOfExperience || 'Not provided'}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <FaGlobe className="text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-gray-700">Languages Spoken</p>
                        </div>
                        <p className="text-lg font-medium">
                          {adminData?.languagesSpoken?.length > 0 
                            ? adminData.languagesSpoken.join(', ') 
                            : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <FaHistory className="text-blue-600 mr-2" /> Work Experience
                      </h3>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-200 flex items-center"
                      >
                        <FaPlus className="mr-1" /> Add Experience
                      </Button>
                    </div>
                    
                    {adminData?.experience?.length > 0 ? (
                      <div className="space-y-4">
                        {adminData.experience.map((exp, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-semibold text-lg text-gray-800">{exp.organization}</p>
                                <p className="text-md text-blue-600 font-medium">{exp.position}</p>
                              </div>
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full h-fit text-sm font-medium flex items-center">
                                {new Date(exp.startDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})} - 
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'}) : 'Present'}
                              </div>
                            </div>
                            <p className="mt-3 text-gray-600">{exp.description}</p>
                            <div className="flex mt-3 space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                                <FaEdit className="mr-1" /> Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm flex items-center">
                                <FaTrash className="mr-1" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FaBriefcase className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-2">No experience entries added yet.</p>
                        <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200">
                          <FaPlus className="mr-2" /> Add Your First Experience
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Clinic Information Tab */}
              {activeTab === 'clinic' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center mb-2">
                          <FaHospital className="text-blue-600 mr-2" />
                          <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500">Clinic Name</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.name}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Registration Number</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.registrationNumber}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Tax ID</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.taxId}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Established Date</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.establishedDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center mb-2">
                          <FaPhoneAlt className="text-green-600 mr-2" />
                          <h4 className="text-md font-medium text-gray-900">Contact Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500">Email</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.email}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Phone</label>
                            <p className="text-sm font-medium text-gray-900">{clinicData.contact}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Address</label>
                            <p className="text-sm font-medium text-gray-900">
                              {clinicData?.address?.street || 'N/A'}, {clinicData?.address?.city || 'N/A'}, {clinicData?.address?.state || 'N/A'}, {clinicData?.address?.zipCode || 'N/A'}, {clinicData?.address?.country || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center mb-2">
                          <FaClock className="text-purple-600 mr-2" />
                          <h4 className="text-md font-medium text-gray-900">Operating Hours</h4>
                        </div>
                        <div className="space-y-2">
                          {clinicData?.operatingHours ? (
                            Object.entries(clinicData.operatingHours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between">
                                <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                                <span className="text-sm text-gray-900">{hours}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">Operating hours not available</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <div className="flex items-center mb-2">
                          <FaStethoscope className="text-yellow-600 mr-2" />
                          <h4 className="text-md font-medium text-gray-900">Specialties</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {clinicData?.specialties ? (
                            clinicData.specialties.map(specialty => (
                              <span key={specialty} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No specialties listed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Clinic Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Staff Members</p>
                            <h4 className="text-xl font-semibold text-gray-900">{clinicData.staffCount}</h4>
                          </div>
                          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <FaUserMd size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Total Patients</p>
                            <h4 className="text-xl font-semibold text-gray-900">{clinicData.patientsCount}</h4>
                          </div>
                          <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <FaUsers size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Appointments (Month)</p>
                            <h4 className="text-xl font-semibold text-gray-900">{clinicData.appointmentsThisMonth}</h4>
                          </div>
                          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <FaCalendarCheck size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Revenue (Month)</p>
                            <h4 className="text-xl font-semibold text-gray-900">{clinicData.revenueThisMonth}</h4>
                          </div>
                          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <FaRupeeSign size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h3>
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-6 border border-indigo-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-indigo-900">{clinicData.subscriptionPlan} Plan</h4>
                          <p className="text-sm text-indigo-700">Status: <span className={`font-medium ${clinicData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{clinicData.status === 'active' ? 'Active' : 'Inactive'}</span></p>
                        </div>
                        <div className="p-3 rounded-full bg-white text-indigo-600 shadow-md">
                          <FaCrown size={24} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-800">Unlimited patient records</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-800">Advanced reporting features</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-800">24/7 priority support</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-800">Custom branding options</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button variant="primary" className="w-full">
                          <FaArrowRight className="mr-2" /> Manage Subscription
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Bank Details Tab */}
              {activeTab === 'bank' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaCreditCard className="mr-2 text-blue-600" /> Bank Account Details
                    </h2>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                    >
                      <FaPlus className="mr-2" /> Add New Account
                    </Button>
                  </div>
                  
                  {adminData?.bankAccounts?.length > 0 ? (
                    <div className="space-y-6">
                      {adminData.bankAccounts.map((account, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <FaUniversity className="text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-lg text-gray-800">{account.bankName}</h3>
                            </div>
                            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                              {account.accountType}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Account Number</p>
                              <p className="text-lg font-medium flex items-center">
                                <span className="mr-2">•••• •••• {account.accountNumber.slice(-4)}</span>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  <FaEye className="text-gray-400 hover:text-blue-600 transition-colors" />
                                </button>
                              </p>
                            </div>
                            
                            {account.ifscCode && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                                <p className="text-lg font-medium">{account.ifscCode}</p>
                              </div>
                            )}
                            
                            {account.upiId && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">UPI ID</p>
                                <p className="text-lg font-medium">{account.upiId}</p>
                              </div>
                            )}
                            
                            {account.branchName && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Branch</p>
                                <p className="text-lg font-medium">{account.branchName}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-4 space-x-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm flex items-center">
                              <FaTrash className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <FaCreditCard className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-2">No bank accounts added yet.</p>
                      <p className="text-sm text-gray-400 mb-4">Add your bank account details for seamless financial transactions.</p>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200">
                        <FaPlus className="mr-2" /> Add Bank Account
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Links Tab */}
              {activeTab === 'social' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaGlobe className="mr-2 text-blue-600" /> Social Media Profiles
                    </h2>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Manage Social Links
                    </Button>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <p className="text-gray-600 mb-4">Connect your social media accounts to enhance your professional network and visibility.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                            <p className="text-md font-medium overflow-hidden text-ellipsis">
                              {adminData?.socialLinks?.linkedIn ? (
                                <a href={adminData.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                  {adminData.socialLinks.linkedIn.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-500">Not connected</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Twitter</p>
                            <p className="text-md font-medium overflow-hidden text-ellipsis">
                              {adminData?.socialLinks?.twitter ? (
                                <a href={adminData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                  {adminData.socialLinks.twitter.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-500">Not connected</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Facebook</p>
                            <p className="text-md font-medium overflow-hidden text-ellipsis">
                              {adminData?.socialLinks?.facebook ? (
                                <a href={adminData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                  {adminData.socialLinks.facebook.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-500">Not connected</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Instagram</p>
                            <p className="text-md font-medium overflow-hidden text-ellipsis">
                              {adminData?.socialLinks?.instagram ? (
                                <a href={adminData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                  {adminData.socialLinks.instagram.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-500">Not connected</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200 col-span-1 md:col-span-2">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Personal Website</p>
                            <p className="text-md font-medium overflow-hidden text-ellipsis">
                              {adminData?.socialLinks?.website ? (
                                <a href={adminData.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                  {adminData.socialLinks.website.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-500">Not provided</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Connect New Accounts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        Connect LinkedIn
                      </Button>
                      <Button className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                        Connect Twitter
                      </Button>
                      <Button className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                        Connect Instagram
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaShieldAlt className="mr-2 text-blue-600" /> Security Settings
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2 flex items-center">
                        <FaKey className="mr-2 text-blue-600" /> Change Password
                      </h3>
                      <div className="bg-yellow-50 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
                        <p className="text-sm text-yellow-800">Strong passwords should include a mix of letters, numbers, and special characters.</p>
                      </div>
                      <form className="space-y-5">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaEye className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaEye className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mt-2">
                            <div className={`h-full rounded-full ${formData.newPassword.length > 8 ? 'bg-green-500' : formData.newPassword.length > 4 ? 'bg-yellow-500' : formData.newPassword.length > 0 ? 'bg-red-500' : ''}`} style={{ width: `${Math.min(100, formData.newPassword.length * 10)}%` }}></div>
                          </div>
                          <p className="text-xs text-gray-500">Password strength: {formData.newPassword.length > 8 ? 'Strong' : formData.newPassword.length > 4 ? 'Medium' : formData.newPassword.length > 0 ? 'Weak' : 'None'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaEye className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                            </div>
                          </div>
                          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="text-xs text-red-500">Passwords do not match</p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 w-full flex items-center justify-center"
                          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                        >
                          <FaKey className="mr-2" /> Update Password
                        </Button>
                      </form>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2 flex items-center">
                        <FaHistory className="mr-2 text-blue-600" /> Login History
                      </h3>
                      {adminData?.loginHistory?.length > 0 ? (
                        <div className="space-y-3">
                          {adminData.loginHistory.slice(0, 5).map((login, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                <span className="font-medium">{index === 0 ? 'Current session' : 'Previous login'}</span>
                                {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>}
                              </div>
                              <div className="flex justify-between mt-2">
                                <span className="text-sm text-gray-600">{new Date(login.timestamp).toLocaleString()}</span>
                                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">{login.ip}</span>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <FaUserTie className="mr-1" /> {login.device || 'Unknown device'}
                              </div>
                            </div>
                          ))}
                          <div className="text-center mt-4">
                            <Button className="text-blue-600 hover:text-blue-800 text-sm">
                              View Full Login History
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
                          <p className="text-gray-500 mb-2">No login history available.</p>
                          <p className="text-sm text-gray-400">Your login activity will appear here once you log in from different devices.</p>
                        </div>
                      )}
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-md font-medium mb-3 text-gray-700">Additional Security Options</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                            <div className="flex items-center">
                              <FaBell className="text-blue-600 mr-3" />
                              <div>
                                <p className="font-medium">Login Notifications</p>
                                <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                              </div>
                            </div>
                            <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                              <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                            <div className="flex items-center">
                              <FaShieldAlt className="text-blue-600 mr-3" />
                              <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                              </div>
                            </div>
                            <Button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md">
                              Enable
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminProfileNew;
