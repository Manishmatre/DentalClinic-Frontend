import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../../api/staff/staffService';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import uploadService from '../../api/upload/uploadService'; // Added import for uploadService
import axios from 'axios';
import { 
  FaUser, 
  FaCamera, 
  FaUserPlus, 
  FaUserTie, 
  FaTimes, 
  FaPlus, 
  FaSpinner,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaGraduationCap,
  FaCertificate,
  FaBriefcase,
  FaKey,
  FaUserMd,
  FaTrash,
  FaHospital,
  FaUserFriends,
  FaLock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const StaffForm = ({ staffId: propStaffId }) => {
  // Use the staffId prop if provided, otherwise try to get it from URL params
  const { id: paramStaffId } = useParams();
  const staffId = propStaffId || paramStaffId;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(!!staffId);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageData, setProfileImageData] = useState(null);
  
  // Debug profile image data
  useEffect(() => {
    console.log('Current profile image data state:', profileImageData);
  }, [profileImageData]);
  
  // Education, certification, and work experience state
  const [newEducation, setNewEducation] = useState({
    degree: '',
    university: '',
    completionYear: '',
    additionalDetails: ''
  });
  
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: ''
  });
  
  const [newWorkExperience, setNewWorkExperience] = useState({
    position: '',
    organization: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // Generate a sequential employee ID using the backend service
  const generateEmployeeId = async () => {
    try {
      console.log('Requesting next sequential employee ID from server...');
      const nextId = await staffService.getNextEmployeeId();
      console.log(`Received next employee ID from server: ${nextId}`);
      return nextId;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      // Fallback to a timestamp-based ID if API call fails
      const timestamp = new Date().getTime().toString().slice(-3);
      const fallbackId = `EMP${timestamp}`;
      console.log(`Using fallback employee ID: ${fallbackId}`);
      return fallbackId;
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: '',
    specialization: '',
    department: '',
    joiningDate: '',
    education: [],
    certifications: [],
    workExperience: [],
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    profileImage: { url: '', publicId: '' }
  });
  
  // Fetch staff data if in edit mode or generate sequential ID for new staff
  useEffect(() => {
    console.log('StaffForm useEffect triggered with staffId:', staffId);
    
    if (staffId) {
      console.log('Edit mode detected, fetching staff data for ID:', staffId);
      // Set edit mode flag
      setIsEditMode(true);
      // Fetch staff data
      fetchStaffData();
    } else {
      console.log('Add mode detected, generating new employee ID');
      // Reset edit mode flag
      setIsEditMode(false);
      // Generate sequential ID for new staff
      const getSequentialId = async () => {
        const newId = await generateEmployeeId();
        setFormData(prev => ({
          ...prev,
          employeeId: newId
        }));
      };
      
      getSequentialId();
    }
  }, [staffId]); // Re-run when staffId changes
  
  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      toast.error('No file selected');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG, WEBP)');
      return;
    }

    // Check file size
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 2MB`);
      return;
    }

    try {
      setUploadingImage(true);
      
      console.log('Starting file upload...');
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.onerror = (error) => {
        console.error('Error creating preview:', error);
      };
      reader.readAsDataURL(file);

      // Log file details before upload
      console.log('File details before upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });

      // Upload the file using the profile picture endpoint
      console.log('Starting file upload...');
      const response = await uploadService.uploadProfilePicture(
        file,
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );

      console.log('Upload completed. Response:', response);

      // Get the image URL and public ID from the response
      const imageUrl = response.url || response.secure_url;
      const publicId = response.public_id;

      console.log('Extracted image data:', { imageUrl, publicId });

      if (!imageUrl || !publicId) {
        console.error('Invalid response from server. Full response:', response);
        throw new Error('Invalid response from server: Missing image URL or public ID');
      }

      const imageData = {
        url: imageUrl,
        publicId: publicId,
        fileName: file.name
      };

      // Update the form state with the new image data
      setFormData(prev => ({
        ...prev,
        profileImage: imageData
      }));
      
      // Also update the profile image state
      setProfileImageData(imageData);

      // Show success message
      toast.success('Profile picture uploaded successfully');
      console.log('Profile picture uploaded successfully:', imageData);
    } catch (error) {
      console.error('Error uploading image:', {
        error,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to upload profile picture';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Fetch staff data from API
  const fetchStaffData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching staff data for ID: ${staffId}`);
      const response = await staffService.getStaffById(staffId);
      
      // Handle different response formats
      const staffData = response.data || response;
      
      console.log('Staff data received:', staffData);
    
    // Initialize profile image data if available
    if (staffData.profileImage) {
      console.log('Setting profile image data from staff record:', staffData.profileImage);
      setProfileImageData({
        url: staffData.profileImage.url || '',
        publicId: staffData.profileImage.publicId || ''
      });
      
      // Set image preview if URL exists
      if (staffData.profileImage.url) {
        setImagePreview(staffData.profileImage.url);
      }
    }
    
    if (staffData) {
        // Extract first and last name from the full name
        let firstName = '';
        let lastName = '';
        
        if (staffData.name) {
          const nameParts = staffData.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        } else if (staffData.firstName && staffData.lastName) {
          // If first and last name are already separated
          firstName = staffData.firstName;
          lastName = staffData.lastName;
        }
        
        // Parse address fields if address is a string
        let addressStr = '';
        let city = '';
        let state = '';
        let zipCode = '';
        
        console.log('Processing address:', staffData.address);
        
        // Handle address field which might be a string or an object
        if (typeof staffData.address === 'object' && staffData.address !== null) {
          addressStr = staffData.address.street || '';
          city = staffData.address.city || '';
          state = staffData.address.state || '';
          zipCode = staffData.address.zipCode || '';
          console.log('Address is an object, parsed as:', { addressStr, city, state, zipCode });
        } else if (typeof staffData.address === 'string' && staffData.address) {
          // Improved address parsing logic
          try {
            console.log('Parsing address string:', staffData.address);
            
            // First, try to handle common patterns
            const addressRegex = /^([^,]+),\s*([^,]+),\s*([^,]+),\s*(.+)$/;
            const addressMatch = staffData.address.match(addressRegex);
            
            if (addressMatch) {
              // Full match with all components
              addressStr = addressMatch[1].trim();
              city = addressMatch[2].trim();
              state = addressMatch[3].trim();
              zipCode = addressMatch[4].trim();
              console.log('Address matched regex pattern with 4 parts');
            } else {
              // Fallback to simple splitting
              const addressParts = staffData.address.split(',').map(part => part.trim());
              console.log('Address parts after splitting:', addressParts);
              
              if (addressParts.length === 1) {
                // Just the street address
                addressStr = addressParts[0];
              } else if (addressParts.length === 2) {
                // Street and city
                addressStr = addressParts[0];
                city = addressParts[1];
              } else if (addressParts.length === 3) {
                // Street, city, and state
                addressStr = addressParts[0];
                city = addressParts[1];
                state = addressParts[2];
              } else if (addressParts.length >= 4) {
                // Street, city, state, and zip
                addressStr = addressParts[0];
                city = addressParts[1];
                state = addressParts[2];
                zipCode = addressParts[3];
              }
            }
            
            // Handle cases where state and zip are combined (for Indian addresses)
            if (state && !zipCode) {
              console.log('Checking for combined state and PIN code:', state);
              
              // Look for Indian PIN code pattern (6 digits) in the state field
              const pinCodeMatch = state.match(/(.*?)[,\s]+(\d{6})/);
              
              if (pinCodeMatch) {
                // Extract state and PIN code
                state = pinCodeMatch[1].trim();
                zipCode = pinCodeMatch[2].trim();
                console.log('Found Indian PIN code pattern. State:', state, 'PIN:', zipCode);
              } else {
                // Try to find any numeric part at the end that could be a PIN code
                const generalMatch = state.match(/(.*?)[,\s]+(\d+)$/);
                if (generalMatch) {
                  state = generalMatch[1].trim();
                  zipCode = generalMatch[2].trim();
                  console.log('Found general numeric PIN pattern. State:', state, 'PIN:', zipCode);
                }
              }
            }
            
            // Check if zipCode still contains state information
            if (zipCode && zipCode.includes(',')) {
              console.log('ZIP code contains commas, attempting to extract just the PIN code:', zipCode);
              const zipParts = zipCode.split(',').map(part => part.trim());
              // Take the last part which should be the PIN code
              zipCode = zipParts[zipParts.length - 1];
              console.log('Extracted PIN code:', zipCode);
            }
            
            // Check for PIN code pattern in zipCode field
            if (zipCode) {
              const pinMatch = zipCode.match(/(\d{6})/);
              if (pinMatch) {
                // Just keep the 6-digit PIN code
                zipCode = pinMatch[1];
                console.log('Extracted 6-digit PIN code:', zipCode);
              }
            }
            
            // Check if city contains state information (common in Indian addresses)
            if (city && !state) {
              console.log('Checking for combined city and state:', city);
              
              // Look for city, state pattern
              const cityStateMatch = city.match(/([^,]+),\s*([^,]+)/);
              
              if (cityStateMatch) {
                city = cityStateMatch[1].trim();
                state = cityStateMatch[2].trim();
                console.log('Split combined city and state. City:', city, 'State:', state);
              }
            }
            
            console.log('Final parsed address components:', { addressStr, city, state, zipCode });
          } catch (error) {
            console.error('Error parsing address:', error);
            // If parsing fails, just use the whole string as the address
            addressStr = staffData.address;
          }
        }
        
        // Parse emergency contact if it's a string
        let emergencyContactName = '';
        let emergencyContactRelationship = '';
        let emergencyContactPhone = '';
        
        console.log('Processing emergency contact:', staffData.emergencyContact);
        
        if (typeof staffData.emergencyContact === 'object' && staffData.emergencyContact !== null) {
          emergencyContactName = staffData.emergencyContact.name || '';
          emergencyContactRelationship = staffData.emergencyContact.relationship || '';
          emergencyContactPhone = staffData.emergencyContact.phone || '';
          console.log('Emergency contact is an object, parsed as:', { emergencyContactName, emergencyContactRelationship, emergencyContactPhone });
        } else if (typeof staffData.emergencyContact === 'string' && staffData.emergencyContact) {
          try {
            console.log('Parsing emergency contact string:', staffData.emergencyContact);
            
            // Try to parse "Name (Relationship) Phone" format
            const relationshipMatch = staffData.emergencyContact.match(/(.+?)\s*\((.+?)\)\s*(.+)/i);
            
            if (relationshipMatch) {
              emergencyContactName = relationshipMatch[1].trim();
              emergencyContactRelationship = relationshipMatch[2].trim();
              emergencyContactPhone = relationshipMatch[3].trim();
              console.log('Emergency contact matched Name (Relationship) Phone pattern');
            } else {
              // Try to parse "Name - Phone" format
              const simpleMatch = staffData.emergencyContact.match(/(.+?)\s*-\s*(.+)/i);
              
              if (simpleMatch) {
                emergencyContactName = simpleMatch[1].trim();
                emergencyContactPhone = simpleMatch[2].trim();
                console.log('Emergency contact matched Name - Phone pattern');
              } else if (staffData.emergencyContact.includes(',')) {
                // Try comma-separated format
                const parts = staffData.emergencyContact.split(',').map(part => part.trim());
                console.log('Emergency contact parts after splitting by comma:', parts);
                
                if (parts.length >= 1) emergencyContactName = parts[0];
                if (parts.length >= 2) {
                  // Check if second part has a relationship in parentheses
                  const relMatch = parts[1].match(/(.+?)\s*\((.+?)\)/i);
                  if (relMatch) {
                    emergencyContactPhone = relMatch[1].trim();
                    emergencyContactRelationship = relMatch[2].trim();
                  } else {
                    emergencyContactPhone = parts[1];
                  }
                }
                if (parts.length >= 3) emergencyContactRelationship = parts[2];
              } else {
                // Just use the whole string as the name if no pattern matches
                emergencyContactName = staffData.emergencyContact.trim();
                console.log('No pattern matched, using entire string as name');
              }
            }
            
            console.log('Parsed emergency contact components:', { emergencyContactName, emergencyContactRelationship, emergencyContactPhone });
          } catch (error) {
            console.error('Error parsing emergency contact:', error);
            // If parsing fails, just use the whole string as the name
            emergencyContactName = staffData.emergencyContact.trim();
          }
        }
        
        // Format the data for the form
        // Handle employee ID - ensure it's in the EMP### format
        let employeeId = staffData.employeeId || '';
        
        // If employee ID doesn't exist or doesn't match the EMP format, create one
        if (!employeeId || !employeeId.startsWith('EMP')) {
          // Try to use the _id field or create a new one based on timestamp
          if (staffData._id) {
            // Extract numeric part if possible
            const idNum = staffData._id.replace(/\D/g, '');
            if (idNum) {
              // Use last 3 digits or pad with zeros
              const paddedNum = idNum.slice(-3).padStart(3, '0');
              employeeId = `EMP${paddedNum}`;
            } else {
              // Fallback to timestamp
              const timestamp = new Date().getTime().toString().slice(-3);
              employeeId = `EMP${timestamp}`;
            }
          } else {
            // Fallback to timestamp
            const timestamp = new Date().getTime().toString().slice(-3);
            employeeId = `EMP${timestamp}`;
          }
          console.log(`Created formatted employee ID: ${employeeId} for staff member`);
        }
        
        // Final cleanup for Indian PIN codes
        // Ensure zipCode only contains the 6-digit PIN code
        if (zipCode) {
          // Look for a 6-digit PIN code pattern
          const pinMatch = zipCode.match(/(\d{6})/);
          if (pinMatch) {
            zipCode = pinMatch[1];
            console.log('Final PIN code cleanup - extracted 6-digit PIN:', zipCode);
          }
        }
        
        // Ensure state doesn't contain PIN code
        if (state && state.includes(',')) {
          state = state.split(',')[0].trim();
          console.log('Final state cleanup - removed comma and anything after it:', state);
        }
        
        // Process date fields properly
        let dateOfBirth = '';
        if (staffData.dateOfBirth) {
          try {
            dateOfBirth = new Date(staffData.dateOfBirth).toISOString().split('T')[0];
            console.log('Processed date of birth:', dateOfBirth);
          } catch (error) {
            console.error('Error formatting date of birth:', error);
          }
        }
        
        let joiningDate = '';
        if (staffData.joiningDate) {
          try {
            joiningDate = new Date(staffData.joiningDate).toISOString().split('T')[0];
            console.log('Processed joining date:', joiningDate);
          } catch (error) {
            console.error('Error formatting joining date:', error);
          }
        }
        
        // Process gender field - ensure it's lowercase for form selection
        const gender = staffData.gender ? staffData.gender.toLowerCase() : '';
        console.log('Processed gender:', gender);
        
        // Process role field - ensure proper capitalization
        let role = staffData.role || '';
        if (role) {
          // Normalize role to match the options in the dropdown
          if (role.toLowerCase() === 'doctor') role = 'Doctor';
          if (role.toLowerCase() === 'receptionist') role = 'Receptionist';
          if (role.toLowerCase() === 'admin') role = 'Admin';
          console.log('Processed role:', role);
        }
        
        // Process status field - ensure it's lowercase for form selection
        const status = staffData.status ? staffData.status.toLowerCase() : 'active';
        console.log('Processed status:', status);
        
        // Process specialization and department
        const specialization = staffData.specialization || '';
        const department = staffData.department || '';
        console.log('Processed specialization:', specialization);
        console.log('Processed department:', department);
        
        // Process profile image
        if (staffData.profileImage && staffData.profileImage.url) {
          console.log('Profile image found:', staffData.profileImage);
          setImagePreview(staffData.profileImage.url);
          setProfileImageData(staffData.profileImage);
        } else {
          console.log('No profile image found');
        }
        
        const formattedData = {
          employeeId,
          firstName,
          lastName,
          email: staffData.email || '',
          phone: staffData.phone || '',
          address: addressStr,
          city,
          state,
          zipCode,
          dateOfBirth,
          gender,
          role,
          specialization,
          department,
          joiningDate,
          education: Array.isArray(staffData.education) ? staffData.education : [],
          certifications: Array.isArray(staffData.certifications) ? staffData.certifications : [],
          workExperience: Array.isArray(staffData.workExperience) ? staffData.workExperience : [],
          emergencyContactName,
          emergencyContactRelationship,
          emergencyContactPhone,
          status,
          profileImage: staffData.profileImage || { url: '', publicId: '' }
        };
        
        // Set image preview if profile image exists
        if (staffData.profileImage && staffData.profileImage.url) {
          setImagePreview(staffData.profileImage.url);
        }
        
        setFormData(formattedData);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff data. Please try again.');
      toast.error('Failed to load staff data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle image selection
  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG, or WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.onerror = (error) => {
      console.error('Error creating preview:', error);
      toast.error('Error creating image preview');
    };
    reader.readAsDataURL(file);
    
    try {
      setUploadingImage(true);
      
      console.log('Starting file upload...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });
      
      // Upload the image
      const response = await uploadService.uploadProfilePicture(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      console.log('Upload response:', response);
      
      if (!response || (!response.url && !response.secure_url) || !response.public_id) {
        throw new Error('Invalid response from server: Missing required image data');
      }
      
      const imageData = {
        url: response.url || response.secure_url,
        publicId: response.public_id,
        fileName: file.name
      };
      
      console.log('Processed image data:', imageData);
      
      // Update the form data with the image URL and public ID
      setFormData(prev => ({
        ...prev,
        profileImage: imageData
      }));
      
      // Also update the profileImageData state
      setProfileImageData(imageData);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reset the image preview
      setImagePreview(null);
      setProfileImageData({ url: '', publicId: '' });
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle education form changes
  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    
    // If index is provided, update an existing education item
    if (index !== undefined) {
      const updatedEducation = [...formData.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [name]: value
      };
      
      setFormData(prev => ({
        ...prev,
        education: updatedEducation
      }));
    } else {
      // Otherwise, update the new education form
      setNewEducation(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add education to form data
  const handleAddEducation = () => {
    if (!newEducation.degree) {
      toast.error('Degree is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    // Reset education form
    setNewEducation({
      degree: '',
      university: '',
      completionYear: '',
      additionalDetails: ''
    });
    
    toast.success('Education added successfully');
  };
  
  // Remove education from form data
  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    toast.success('Education removed');
  };
  
  // Handle certification form changes
  const handleCertificationChange = (index, e) => {
    const { name, value } = e.target;
    
    // If index is provided, update an existing certification item
    if (index !== undefined) {
      const updatedCertifications = [...formData.certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [name]: value
      };
      
      setFormData(prev => ({
        ...prev,
        certifications: updatedCertifications
      }));
    } else {
      // Otherwise, update the new certification form
      setNewCertification(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add certification to form data
  const handleAddCertification = () => {
    if (!newCertification.name) {
      toast.error('Certification name is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    
    // Reset certification form
    setNewCertification({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: ''
    });
    
    toast.success('Certification added successfully');
  };
  
  // Remove certification from form data
  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
    toast.success('Certification removed');
  };
  
  // Handle work experience form changes
  const handleWorkExperienceChange = (index, e) => {
    const { name, value } = e.target;
    
    // If index is provided, update an existing work experience item
    if (index !== undefined) {
      const updatedWorkExperience = [...formData.workExperience];
      updatedWorkExperience[index] = {
        ...updatedWorkExperience[index],
        [name]: value
      };
      
      setFormData(prev => ({
        ...prev,
        workExperience: updatedWorkExperience
      }));
    } else {
      // Otherwise, update the new work experience form
      setNewWorkExperience(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add work experience to form data
  const handleAddWorkExperience = () => {
    if (!newWorkExperience.position || !newWorkExperience.organization) {
      toast.error('Position and organization are required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newWorkExperience]
    }));
    
    // Reset work experience form
    setNewWorkExperience({
      position: '',
      organization: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    
    toast.success('Work experience added successfully');
  };
  
  // Remove work experience from form data
  const handleRemoveWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
    toast.success('Work experience removed');
  };
  
  // Generate a sequential employee ID based on existing staff count
  const generateSequentialEmployeeId = async () => {
    try {
      console.log('Generating sequential employee ID...');
      
      // Fetch all staff to analyze existing employee IDs
      const response = await staffService.getStaff({ limit: 1000 }); // Get a large number to ensure we get all staff
      const staffList = response.data || [];
      
      console.log(`Found ${staffList.length} existing staff members`);
      
      // Extract all employee IDs and find the highest number
      let highestNumber = 0;
      
      staffList.forEach(staff => {
        if (staff.employeeId && staff.employeeId.startsWith('EMP')) {
          // Extract the numeric part
          const match = staff.employeeId.match(/EMP(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > highestNumber) {
              highestNumber = num;
            }
          }
        }
      });
      
      // Increment the highest number by 1 for the new ID
      const nextNumber = highestNumber + 1;
      
      // Format with leading zeros to ensure 3 digits
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      const newEmployeeId = `EMP${formattedNumber}`;
      
      console.log(`Generated sequential employee ID: ${newEmployeeId} (next after ${highestNumber})`);
      return newEmployeeId;
    } catch (error) {
      console.error('Error generating sequential employee ID:', error);
      throw error;
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone validation
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    // Password validation for new staff
    if (!isEditMode) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare staff data
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Format address for Indian format
      // Clean up the individual address components
      const cleanAddress = formData.address?.trim() || '';
      const cleanCity = formData.city?.trim() || '';
      const cleanState = formData.state?.trim() || '';

      // Format PIN code - ensure it's just the 6-digit code for Indian addresses
      let cleanPinCode = formData.zipCode?.trim() || '';
      // Extract just the 6-digit PIN code if it contains other text
      const pinMatch = cleanPinCode.match(/(\d{6})/);
      if (pinMatch) {
        cleanPinCode = pinMatch[1];
      }

      // Format address in Indian style: Street, City, State - PIN
      const addressString = [
        cleanAddress,
        cleanCity,
        cleanState && cleanPinCode ? `${cleanState} - ${cleanPinCode}` : (cleanState || cleanPinCode)
      ].filter(Boolean).join(', ');

      console.log('Formatted Indian address:', addressString);

      // Format emergency contact as a string (as required by the backend model)
      let emergencyContactStr = '';
      if (formData.emergencyContactName) {
        emergencyContactStr = formData.emergencyContactName;

        if (formData.emergencyContactRelationship) {
          emergencyContactStr += ` (${formData.emergencyContactRelationship})`;
        }

        if (formData.emergencyContactPhone) {
          emergencyContactStr += ` - ${formData.emergencyContactPhone}`;
        }
      }

      // Get clinic info
      let clinicInfo = {};
      try {
        clinicInfo = JSON.parse(localStorage.getItem('clinicData') || '{}');
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        clinicInfo = {};
      }

      // Try multiple sources for clinic ID
      const clinicId = currentUser?.clinic?._id ||
        currentUser?.clinicId ||
        clinicInfo?._id ||
        '';

      // Ensure status is properly capitalized to match backend enum values
      let status = formData.status;
      if (status?.toLowerCase() === 'active') status = 'Active';
      if (status?.toLowerCase() === 'inactive') status = 'Inactive';
      if (status?.toLowerCase() === 'on leave') status = 'On Leave';

      // Ensure employee ID is properly formatted (EMP###)
      let employeeId = formData.employeeId || '';

      // Only generate a new ID if we're creating a new staff member and the ID is missing or invalid
      if ((!employeeId || !employeeId.startsWith('EMP')) && !isEditMode) {
        try {
          // Get the next sequential employee ID
          employeeId = await generateSequentialEmployeeId();
          console.log(`Generated sequential employee ID: ${employeeId}`);
        } catch (error) {
          console.error('Error generating sequential employee ID:', error);
          // Fallback to timestamp-based ID if there's an error
          const timestamp = new Date().getTime().toString().slice(-3);
          employeeId = `EMP${timestamp}`;
          console.log(`Fallback to timestamp-based employee ID: ${employeeId}`);
        }
      } else if (isEditMode && employeeId) {
        // Keep the existing ID for edit mode
        console.log(`Using existing employee ID for edit: ${employeeId}`);
      } else if (isEditMode && (!employeeId || !employeeId.startsWith('EMP'))) {
        // Generate a new ID for edit mode if missing or invalid
        try {
          employeeId = await generateSequentialEmployeeId();
          console.log(`Generated sequential employee ID for edit: ${employeeId}`);
        } catch (error) {
          console.error('Error generating sequential employee ID for edit:', error);
          // Fallback to timestamp-based ID if there's an error
          const timestamp = new Date().getTime().toString().slice(-3);
          employeeId = `EMP${timestamp}`;
          console.log(`Fallback to timestamp-based employee ID for edit: ${employeeId}`);
        }
      }

      // Process gender - ensure it's properly formatted for the database
      let gender = formData.gender?.trim() || null;
      if (gender) {
        // Capitalize first letter for consistency
        gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      }

      // Process date fields
      const dateOfBirth = formData.dateOfBirth || null;
      const joiningDate = formData.joiningDate || null;

      // Process specialization and department
      const specialization = formData.specialization?.trim() || null;
      const department = formData.department?.trim() || null;

      // Format staff data with profile image
      const staffData = {
        employeeId: employeeId,
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        address: addressString,
        dateOfBirth: dateOfBirth,
        gender: gender,
        role: formData.role,
        specialization: specialization,
        department: department,
        joiningDate: joiningDate,
        education: formData.education,
        certifications: formData.certifications,
        workExperience: formData.workExperience,
        emergencyContact: emergencyContactStr,
        status: status,
        profileImage: formData.profileImage,
        clinic: clinicId
      };

      // Ensure profile image data is properly formatted
      if (staffData.profileImage) {
        staffData.profileImage = {
          url: staffData.profileImage.url || '',
          publicId: staffData.profileImage.publicId || '',
          fileName: staffData.profileImage.fileName || ''
        };
      }

      console.log('Final staffData object being sent to API:', staffData);
      console.log('Profile image in staffData:', staffData.profileImage);

      // Add password only for new staff
      if (!isEditMode && formData.password) {
        staffData.password = formData.password;
      }

      let response;
      let newStaffId;

      if (isEditMode) {
        // Update existing staff
        response = await staffService.updateStaff(staffId, staffData);
        newStaffId = staffId;
        toast.success('Staff updated successfully');
        console.log('Staff updated successfully:', response);
      } else {
        // Create new staff
        response = await staffService.createStaff(staffData);
        // Extract the new staff ID from the response
        newStaffId = response.data?._id || response._id;
        toast.success('Staff added successfully');
        console.log('Staff added successfully:', response);
      }

      // Show success message and reset form
      setSuccess(true);
      setError(null);

      // Navigate based on the action performed
      setTimeout(() => {
        // Log navigation information for debugging
        console.log('Navigation after staff save:', {
          isEditMode,
          newStaffId,
          staffId
        });

        // Always navigate to staff management page after any operation
        // This ensures we don't hit a 404 page
        navigate('/admin/staff-management');

        /* Commented out problematic navigation
        if (isEditMode) {
          // After editing, go to the staff details page
          navigate(`/admin/staff/${newStaffId}`);
        } else {
          // After adding, go to the staff management page
          navigate('/admin/staff-management');
        }
        */
      }, 1500);
    } catch (err) {
      console.error('Error saving staff:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save staff data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && staffId) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            {isEditMode ? (
              <>
                <FaUserTie className="mr-2 text-blue-600" /> Edit Staff Member
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2 text-green-600" /> Add New Staff Member
              </>
            )}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update staff information' : 'Register a new staff member in the system'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            type="button"
            variant="secondary" 
            onClick={() => navigate('/admin/staff-management')}
            icon={<FaTimes />}
          >
            Cancel
          </Button>
        </div>
      </div>
      
      {isLoading && <LoadingSpinner />}
      
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert type="success" className="mb-4">
          Staff {isEditMode ? 'updated' : 'added'} successfully!
        </Alert>
      )}

      <Card className="mb-6">
        {/* Profile Image Upload */}
        <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-5xl" />
              )}
            </div>
            <button 
              type="button" 
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <FaCamera />
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <span className="text-sm text-gray-500 mt-2">
            {uploadingImage ? 'Uploading...' : 'Click to upload profile picture'}
          </span>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'personal' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'professional' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('professional')}
            >
              Professional Details
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'emergency' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('emergency')}
            >
              Emergency Contact
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'credentials' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('credentials')}
            >
              Credentials
            </button>
          </nav>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border bg-gray-100 ${errors.employeeId ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    placeholder="EMP001"
                    readOnly
                  />
                </div>
                {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
              </div>
              
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.firstName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.lastName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${errors.phone ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="123 Main St"
                  />
                </div>
              </div>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="New York"
                />
              </div>
              
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="NY"
                />
              </div>
              
              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="10001"
                />
              </div>
            </div>
          )}
          
          {/* Professional Details Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              {/* Role, Specialization, Department */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`block w-full py-2 px-3 border ${errors.role ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm focus:outline-none sm:text-sm`}
                  >
                    <option value="">Select Role</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                </div>
                
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Cardiology"
                  />
                </div>
                
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Medical"
                  />
                </div>
              </div>
              
              {/* Joining Date */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Education */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Education
                  </label>
                </div>
                
                {/* Form for adding new education */}
                <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Degree <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="degree"
                        value={newEducation.degree}
                        onChange={(e) => handleEducationChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="MD"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">University/Institution</label>
                      <input
                        type="text"
                        name="university"
                        value={newEducation.university}
                        onChange={(e) => handleEducationChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Completion Year</label>
                      <input
                        type="text"
                        name="completionYear"
                        value={newEducation.completionYear}
                        onChange={(e) => handleEducationChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Additional Details</label>
                      <input
                        type="text"
                        name="additionalDetails"
                        value={newEducation.additionalDetails}
                        onChange={(e) => handleEducationChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Additional information"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaPlus className="mr-1" /> Add Education
                    </button>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mb-2">Education History</h4>
                {formData.education.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
                            <input
                              type="text"
                              name="degree"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="MD"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Institution</label>
                            <input
                              type="text"
                              name="institution"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="University Name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                            <input
                              type="text"
                              name="year"
                              value={edu.year}
                              onChange={(e) => handleEducationChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="2020"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No education records added</p>
                )}
              </div>
              
              {/* Work Experience */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Work Experience
                  </label>
                </div>
                
                {/* Form for adding new work experience */}
                <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Work Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Position <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="position"
                        value={newWorkExperience.position}
                        onChange={(e) => handleWorkExperienceChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Senior Doctor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Organization <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="organization"
                        value={newWorkExperience.organization}
                        onChange={(e) => handleWorkExperienceChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Hospital Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={newWorkExperience.startDate}
                        onChange={(e) => handleWorkExperienceChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={newWorkExperience.endDate}
                        onChange={(e) => handleWorkExperienceChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={newWorkExperience.description}
                        onChange={(e) => handleWorkExperienceChange(undefined, e)}
                        className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Brief description of responsibilities and achievements"
                        rows="2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddWorkExperience}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaPlus className="mr-1" /> Add Work Experience
                    </button>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mb-2">Work Experience History</h4>
                {formData.workExperience.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    {formData.workExperience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                            <input
                              type="text"
                              name="position"
                              value={exp.position}
                              onChange={(e) => handleWorkExperienceChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Senior Doctor"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Organization</label>
                            <input
                              type="text"
                              name="organization"
                              value={exp.organization}
                              onChange={(e) => handleWorkExperienceChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Hospital Name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <input
                              type="date"
                              name="from"
                              value={exp.from}
                              onChange={(e) => handleWorkExperienceChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <input
                              type="date"
                              name="to"
                              value={exp.to}
                              onChange={(e) => handleWorkExperienceChange(index, e)}
                              className="block w-full py-1.5 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkExperience(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No work experience records added</p>
                )}
              </div>
            </div>
          )}
          
          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              
              {/* Emergency Contact Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserFriends className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Spouse"
                  />
                </div>
              </div>
              
              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {!isEditMode && (
                <>
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-2 rounded-md border ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-2 rounded-md border ${errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm`}
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/staff-management')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              icon={isLoading ? <FaSpinner className="animate-spin" /> : (isEditMode ? <FaSave /> : <FaUserPlus />)}
            >
              {isEditMode ? 'Update Staff' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StaffForm;
