import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/auth/authService';
import adminService from '../../api/admin/adminService';
import staffService from '../../api/staff/staffService';
import patientService from '../../api/patients/patientService';
import uploadService from '../../api/upload/uploadService';
import { toast } from 'react-toastify';


// UI Components
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import SecurityTab from './tabs/SecurityTab';
import ActivityTab from './tabs/ActivityTab';
import ProfessionalTab from './tabs/ProfessionalTab';
import MedicalTab from './tabs/MedicalTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import PaymentMethodsTab from './tabs/PaymentMethodsTab';
import ClinicDetailsTab from './tabs/ClinicDetailsTab';
import NotificationsTab from './tabs/NotificationsTab';

// Icons
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
  FaShieldAlt,
  FaBell,
  FaHistory,
  FaCog
} from 'react-icons/fa';

/**
 * Universal Profile Component
 * A responsive, role-adaptive profile component for all user types
 */
const UniversalProfile = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, refreshAuth, logout } = auth;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form data for profile
  const [formData, setFormData] = useState({
    // Common fields for all roles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    profileImage: '',
    
    // Role-specific fields
    // Medical professionals (doctors, nurses)
    qualification: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    languagesSpoken: [],
    
    // Admin/Staff
    department: '',
    position: '',
    joinDate: '',
    
    // Patient-specific
    bloodGroup: '',
    allergies: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Password change fields
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Determine user role for role-specific UI and functionality
  const userRole = user?.role?.toLowerCase() || 'guest';
  
  // Load user profile data based on role
  useEffect(() => {
    fetchProfileData();
  }, [user]);



  /**
   * Fetch profile data based on user role
   */
  const fetchProfileData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get basic user data
      const userData = await authService.getCurrentUser();
      
      let roleSpecificData = {};
      
      // Fetch role-specific data based on user role
      try {
        switch (userRole) {
          case 'admin':
            roleSpecificData = await adminService.getAdminProfile();
            break;
          case 'doctor':
            roleSpecificData = await staffService.getStaffById(user.id);
            break;
          case 'staff':
          case 'receptionist':
            roleSpecificData = await staffService.getStaffById(user.id);
            break;
          case 'patient':
            roleSpecificData = await patientService.getPatientById(user.id);
            break;
          default:
            console.log(`No specific profile data handler for role: ${userRole}`);
            roleSpecificData = {};
        }
      } catch (roleError) {
        console.error(`Error fetching role-specific data: ${roleError.message}`);
        toast.error(`Could not load all profile data for ${userRole} role.`);
      }
      
      // Combine user data with role-specific data
      const combinedData = { ...userData, ...roleSpecificData };
      
      // Ensure we have at least the basic user data
      if (!combinedData.name && user.name) {
        combinedData.name = user.name;
      }
      
      if (!combinedData.email && user.email) {
        combinedData.email = user.email;
      }
      
      // Set profile data and initialize form
      setProfileData(combinedData);
      initializeFormData(combinedData);
      
    } catch (err) {
      console.error('Error fetching profile data:', err);
      toast.error('Failed to load profile data. Please try again.');
      
      // Use basic user data from auth context if API fails
      const basicData = {
        name: user.name || '',
        email: user.email || '',
        role: user.role || ''
      };
      
      setProfileData(basicData);
      initializeFormData(basicData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize form data with profile data
   */
  const initializeFormData = (data) => {
    // Create a base form data object with common fields
    const baseFormData = {
      // Common fields
      firstName: data.firstName || data.name?.split(' ')[0] || '',
      lastName: data.lastName || (data.name?.split(' ').slice(1).join(' ')) || '',
      email: data.email || '',
      phone: data.phone || '',
      gender: data.gender || '',
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      // Store profile picture URL
      profilePicture: data.profilePicture || data.avatar || '',
      
      // Password fields always empty for security
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Add role-specific fields based on user role
    if (userRole === 'admin') {
      // Admin-specific fields
      Object.assign(baseFormData, {
        // Professional information
        designation: data.designation || '',
        department: data.department || '',
        employeeId: data.employeeId || '',
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '',
        qualification: data.qualification || '',
        specialization: data.specialization || '',
        yearsOfExperience: data.yearsOfExperience || '',
        languagesSpoken: data.languagesSpoken || [],
        education: data.education || [],
        certifications: data.certifications || [],
        
        // Financial information
        bankAccounts: data.bankAccounts || [],
        paymentMethods: data.paymentMethods || [],
        
        // Social and clinic information
        socialLinks: data.socialLinks || [],
        clinicDetails: data.clinicDetails || {
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
          operatingHours: [],
          specialties: [],
          facilities: [],
          insuranceAccepted: [],
          images: []
        },
        
        // Notification preferences
        notificationPreferences: data.notificationPreferences || {
          email: {
            appointments: true,
            reminders: true,
            billing: true,
            marketing: false,
            systemUpdates: true
          },
          sms: {
            appointments: true,
            reminders: true,
            billing: false,
            marketing: false,
            systemUpdates: false
          },
          push: {
            appointments: true,
            reminders: true,
            billing: true,
            marketing: false,
            systemUpdates: true
          }
        },
        appointmentReminderTime: data.appointmentReminderTime || '24',
        quietHoursStart: data.quietHoursStart || '',
        quietHoursEnd: data.quietHoursEnd || '',
        newsletterSubscription: data.newsletterSubscription || false,
        healthTipsSubscription: data.healthTipsSubscription || false,
        appointmentDigest: data.appointmentDigest || false,
        
        // Activity logs
        activityLog: data.activityLog || [],
        loginHistory: data.loginHistory || []
      });
    } else if (userRole === 'doctor') {
      // Doctor-specific fields
      Object.assign(baseFormData, {
        qualification: data.qualification || '',
        specialization: data.specialization || '',
        licenseNumber: data.licenseNumber || '',
        yearsOfExperience: data.yearsOfExperience || '',
        languagesSpoken: data.languagesSpoken || [],
        education: data.education || [],
        certifications: data.certifications || [],
        availability: data.availability || {}
      });
    } else if (userRole === 'staff' || userRole === 'receptionist') {
      // Staff-specific fields
      Object.assign(baseFormData, {
        department: data.department || '',
        position: data.position || '',
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : ''
      });
    } else if (userRole === 'patient') {
      // Patient-specific fields
      Object.assign(baseFormData, {
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || [],
        emergencyContact: data.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        medicalHistory: data.medicalHistory || []
      });
    }
    
    setFormData(baseFormData);
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (address, emergencyContact)
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

  /**
   * Handle array input changes (languages, allergies)
   */
  const handleArrayInputChange = (field, values) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      // Create profile data object excluding password fields
      const { currentPassword, newPassword, confirmPassword, ...profileData } = formData;
      
      // Ensure profilePicture is included in the data sent to the backend
      if (formData.profilePicture) {
        profileData.profilePicture = formData.profilePicture;
      }
      
      console.log('Submitting profile data:', profileData);
      console.log('Profile picture URL in submit:', profileData.profilePicture);
      
      let response;
      
      // Update profile based on role
      switch (userRole) {
        case 'admin':
          response = await adminService.updateAdminProfile(profileData);
          break;
        case 'doctor':
          response = await staffService.updateStaff(user.id, profileData);
          break;
        case 'staff':
          response = await staffService.updateStaff(user.id, profileData);
          break;
        case 'patient':
          response = await patientService.updatePatient(user.id, profileData);
          break;
        default:
          throw new Error('Unknown user role');
      }
      
      // Handle password change if requested
      if (isChangingPassword && currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        
        await authService.changePassword({
          currentPassword,
          newPassword
        });
        
        toast.success('Password updated successfully');
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setIsChangingPassword(false);
      
      // Refresh auth context to update user data
      refreshAuth();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Handle profile photo upload
   */
  const handleProfilePhotoUpload = async (file) => {
    console.log('handleProfilePhotoUpload - file:', file);
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    setUploadingPhoto(true);
    
    try {
      // Upload photo
      const result = await uploadService.uploadProfilePicture(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to upload profile picture');
      }
      
      // Get the image URL from the upload result
      const imageUrl = result.file.url;
      console.log('Upload result:', result);
      console.log('Profile image URL:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('No image URL returned from upload');
      }
      
      // Create a copy of the form data with the updated profile image
      const updatedFormData = {
        ...formData,
        profileImage: imageUrl
      };
      
      console.log('Form data before update:', formData);
      
      // Update the form data state
      setFormData(updatedFormData);
      
      // Also update the profile data directly to ensure it's reflected immediately
      setProfileData(prev => {
        const updated = {
          ...prev,
          profileImage: imageUrl
        };
        console.log('Updated profile data:', updated);
        return updated;
      });
      
      console.log('Updated form data:', updatedFormData);
      
      // Save the profile picture URL to localStorage to prevent loss during refresh
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.profileImage = imageUrl;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Save changes to profile
      try {
        await handleSubmit({ preventDefault: () => {} });
        
        // Update the user data in the auth context
        console.log('Updating user data with new profile picture:', imageUrl);
        
        // Force refresh user data to ensure the new profile picture is loaded everywhere
        try {
          if (typeof refreshAuth === 'function') {
            console.log('Refreshing auth data after profile picture update');
            await refreshAuth(true);
          }
        } catch (refreshError) {
          console.error('Error refreshing auth data:', refreshError);
          // Continue anyway, we've already saved to localStorage
        }
        
        // Add a small delay to allow the UI to update
        setTimeout(() => {
          // Trigger a UI refresh by updating a state variable
          setUploadingPhoto(false);
          
          // Also update the profile data directly in the component state
          setProfileData(prev => ({
            ...prev,
            profileImage: imageUrl
          }));
        }, 500);
        
        toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('Error saving profile changes:', error);
        // Even if the submit fails, we've saved the profile picture to localStorage
        toast.info('Profile picture saved locally. Refresh to see changes if needed.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setUploadingPhoto(false);
    }
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
        {/* Profile Header with user info and avatar */}
        <ProfileHeader 
          profileData={profileData}
          formData={formData}
          userRole={userRole}
          isEditing={isEditing}
          uploadingPhoto={uploadingPhoto}
          handleProfilePhotoUpload={handleProfilePhotoUpload}
          setIsEditing={setIsEditing}
          uploadService={uploadService}
          setFormData={setFormData}
        />
        
        {/* Profile Content */}
        <div className="p-6">
          {/* Profile Tabs */}
          <ProfileTabs 
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            userRole={userRole}
          />
          
          {/* Tab Content */}
          <div className="mt-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <PersonalInfoTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                calculateAge={calculateAge}
                formatDate={formatDate}
              />
            )}
            
            {/* Professional Information Tab (for staff, doctors, admin) */}
            {activeTab === 'professional' && ['admin', 'doctor', 'staff'].includes(userRole) && (
              <ProfessionalTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleArrayInputChange={handleArrayInputChange}
                userRole={userRole}
              />
            )}
            
            {/* Social Links Tab (for admin) */}
            {activeTab === 'social' && userRole === 'admin' && (
              <SocialLinksTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleArrayInputChange={handleArrayInputChange}
              />
            )}
            
            {/* Payment Methods Tab (for admin) */}
            {activeTab === 'payments' && userRole === 'admin' && (
              <PaymentMethodsTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleArrayInputChange={handleArrayInputChange}
              />
            )}
            
            {/* Clinic Details Tab (for admin) */}
            {activeTab === 'clinic' && userRole === 'admin' && (
              <ClinicDetailsTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleArrayInputChange={handleArrayInputChange}
                handleFileUpload={(field, file, callback) => {
                  // Handle file upload for clinic images
                  if (file) {
                    setUploadingPhoto(true);
                    uploadService.uploadFile(file, (progress) => {
                      console.log(`Upload progress: ${progress}%`);
                    })
                    .then(result => {
                      if (callback && typeof callback === 'function') {
                        callback(result.url);
                      }
                      toast.success('File uploaded successfully');
                    })
                    .catch(error => {
                      toast.error('Failed to upload file: ' + error.message);
                    })
                    .finally(() => {
                      setUploadingPhoto(false);
                    });
                  }
                }}
              />
            )}
            
            {/* Notifications Tab (for admin) */}
            {activeTab === 'notifications' && userRole === 'admin' && (
              <NotificationsTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
              />
            )}
            
            {/* Medical Information Tab (for patients) */}
            {activeTab === 'medical' && userRole === 'patient' && (
              <MedicalTab 
                formData={formData}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                handleArrayInputChange={handleArrayInputChange}
              />
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <SecurityTab 
                formData={formData}
                isEditing={isEditing}
                isChangingPassword={isChangingPassword}
                setIsChangingPassword={setIsChangingPassword}
                handleInputChange={handleInputChange}
              />
            )}
            
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <ActivityTab 
                profileData={profileData}
                userRole={userRole}
              />
            )}
          </div>
          
          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <Button 
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => {
                  setIsEditing(false);
                  setIsChangingPassword(false);
                  initializeFormData(profileData);
                }}
              >
                <FaTimes className="mr-2" /> Cancel
              </Button>
              
              <Button 
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalProfile;
