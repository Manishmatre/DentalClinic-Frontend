import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import patientService from '../../api/patients/patientService';
import uploadService from '../../api/upload/uploadService';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaCamera, 
  FaUserPlus, 
  FaUserInjured, 
  FaTimes, 
  FaPlus, 
  FaSpinner,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaLock,
  FaInfoCircle
} from 'react-icons/fa';

const PatientForm = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const requestMadeRef = useRef(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(!!patientId);
  const [requestInProgress, setRequestInProgress] = useState(false);
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Function to compress image with enhanced compression and error handling
  const compressImage = (dataUrl, maxWidth = 500, maxHeight = 500, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      try {
        // If it's not a data URL, just return it (cloud URL)
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
          console.log('Not a data URL, skipping compression');
          return resolve(dataUrl);
        }

        const img = new Image();
        img.onerror = () => {
          console.error('Error loading image for compression');
          reject(new Error('Failed to load image for compression'));
        };
        
        img.onload = () => {
          try {
            let { width, height } = img;
            
            // For very large images, use more aggressive resizing
            const isVeryLarge = width > 1000 || height > 1000;
            const targetMaxWidth = isVeryLarge ? Math.min(maxWidth, 200) : maxWidth;
            const targetMaxHeight = isVeryLarge ? Math.min(maxHeight, 200) : maxHeight;
            const targetQuality = isVeryLarge ? Math.min(quality, 0.4) : quality;
            
            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > targetMaxWidth) {
                height = Math.round(height * targetMaxWidth / width);
                width = targetMaxWidth;
              }
            } else {
              if (height > targetMaxHeight) {
                width = Math.round(width * targetMaxHeight / height);
                height = targetMaxHeight;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF'; // White background
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get the compressed data URL with appropriate quality
            // Use lower quality for larger dimensions
            const actualQuality = width > 300 ? Math.min(targetQuality, 0.5) : targetQuality;
            const compressedDataUrl = canvas.toDataURL('image/jpeg', actualQuality);
            
            // Check if the compressed image is still too large (>100KB)
            if (compressedDataUrl.length > 100 * 1024) {
              console.warn('Image still large after compression, applying extreme compression');
              // Create a smaller thumbnail version for very large images
              canvas.width = Math.min(width, 150);
              canvas.height = Math.min(height, 150);
              ctx.fillStyle = '#FFFFFF'; // White background
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const finalDataUrl = canvas.toDataURL('image/jpeg', 0.4);
              
              console.log(`Compression results: Original: ${Math.round(dataUrl.length/1024)}KB → ` +
                          `First pass: ${Math.round(compressedDataUrl.length/1024)}KB → ` +
                          `Final: ${Math.round(finalDataUrl.length/1024)}KB`);
              
              resolve(finalDataUrl);
            } else {
              console.log(`Compression results: Original: ${Math.round(dataUrl.length/1024)}KB → ` +
                          `Compressed: ${Math.round(compressedDataUrl.length/1024)}KB`);
              resolve(compressedDataUrl);
            }
          } catch (err) {
            console.error('Error during image compression:', err);
            // Return a tiny transparent pixel as fallback
            resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
          }
        };
        
        img.src = dataUrl;
      } catch (err) {
        console.error('Error in compressImage function:', err);
        // Return a tiny transparent pixel as fallback
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
      }
    });
  };

  // Handle image upload with improved error handling and compression
  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max size
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPG, JPEG, or PNG)');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.warning('Image is large and will be compressed for better performance');
    }
    
    try {
      setUploadingImage(true);
      
      // Track that a new image was uploaded (used to optimize form submission)
      setFormData(prev => ({
        ...prev,
        newImageUploaded: true
      }));
      
      // First try to upload to cloud storage - this is the preferred method
      let cloudUploadSuccess = false;
      let structuredImageData = null;
      
      try {
        // Upload image to cloud storage first
        const response = await uploadService.uploadProfilePicture(file);
        
        // Check if upload was successful and ensure proper data structure
        if (response && response.file) {
          // Ensure the profile image data is properly structured with the correct field names
          structuredImageData = {
            url: response.file.url || response.file.secure_url || '',
            secure_url: response.file.secure_url || response.file.url || '',
            publicId: response.file.public_id || ''
          };
          
          // Update form data with cloud URL
          setFormData(prev => ({
            ...prev,
            profileImage: structuredImageData,
            profileImageUrl: structuredImageData.url, // For backward compatibility
            profileImagePublicId: structuredImageData.publicId, // For backward compatibility
            newImageUploaded: true // Track that a new image was uploaded
          }));
          
          // Set preview with cloud URL
          setImagePreview(structuredImageData.url || structuredImageData.secure_url);
          
          console.log('Profile image uploaded to cloud successfully:', structuredImageData);
          toast.success('Profile image uploaded successfully');
          cloudUploadSuccess = true;
        }
      } catch (uploadErr) {
        console.error('Cloud upload failed, falling back to local image:', uploadErr);
        // Continue with local image handling - don't throw
      }
      
      // If cloud upload failed, use local image as fallback
      if (!cloudUploadSuccess) {
        // Show local preview
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const originalDataUrl = reader.result;
            setImagePreview(originalDataUrl); // Set preview with original for better quality display
            
            // Compress the image for storage/upload to reduce payload size
            // More aggressive compression for local storage
            const compressedDataUrl = await compressImage(originalDataUrl, 200, 200, 0.5);
            console.log('Image compressed. Original size vs compressed:', 
                      Math.round(originalDataUrl.length/1024) + 'KB', 
                      Math.round(compressedDataUrl.length/1024) + 'KB');
            
            // Store the compressed data URL in the form data with consistent structure
            const localImageData = {
              url: compressedDataUrl,
              secure_url: compressedDataUrl, // For consistency
              publicId: 'local-image-' + Date.now() // Temporary ID for local images
            };
            
            setFormData(prev => ({
              ...prev,
              profileImage: localImageData,
              profileImageUrl: compressedDataUrl, // For backward compatibility
              profileImagePublicId: localImageData.publicId, // For backward compatibility
              newImageUploaded: true // Track that a new image was uploaded
            }));
            
            // If the image is still large after compression, show a warning
            if (compressedDataUrl.length > 100 * 1024) { // More than 100KB
              toast.warning('Image is still large. Consider using a smaller image for better performance.');
            } else {
              toast.info('Image compressed and ready for upload');
            }
          } catch (err) {
            console.error('Error compressing image:', err);
            toast.error('Error processing image. Please try a different image.');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error handling image upload:', err);
      toast.error('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Generate a sequential patient ID
  const generatePatientId = async () => {
    try {
      // Get the current count of patients from the API
      const response = await patientService.getPatients({ limit: 1, page: 1 });
      
      // Get the total count or use the response length as a fallback
      let count = response.totalCount || response.length || 0;
      
      // Add 1 to get the next ID
      count += 1;
      
      // Format the ID with padding
      return `PID${count.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating patient ID:', error);
      // Fallback to a timestamp-based ID if API call fails
      const timestamp = new Date().getTime().toString().slice(-4);
      return `PID${timestamp}`;
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: [],
    chronicDiseases: [],
    medications: [],
    password: '',
    confirmPassword: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    occupation: '',
    maritalStatus: '',
    notes: '',
    status: 'active',
    profileImage: {
      url: '',
      publicId: ''
    }
  });
  
  // State for managing allergies, chronic diseases, and medications
  const [newAllergy, setNewAllergy] = useState('');
  const [newChronicDisease, setNewChronicDisease] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Only fetch if we have a patientId and haven't made the request yet
    if (patientId && !requestMadeRef.current) {
      setIsEditMode(true);
      // Mark that we've made the request using the ref
      requestMadeRef.current = true;
      fetchPatient(patientId);
    } else if (!patientId) {
      const getSequentialId = async () => {
        const newId = await generatePatientId();
        setFormData(prev => ({
          ...prev,
          patientId: newId
        }));
      };
      
      getSequentialId();
    }
    
    // Cleanup function
    return () => {
      // No need to reset the ref on cleanup as it will persist
      // This is intentional to prevent duplicate requests in strict mode
    };
  }, [patientId]); // Remove requestInProgress from dependencies

  const fetchPatient = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Loading patient data for ID: ${id}`);
      const patientData = await patientService.getPatientById(id);
      console.log('Patient data received:', JSON.stringify(patientData, null, 2));
      
      // Check if we received an error object from the service
      if (patientData && patientData.error) {
        // Handle specific error types
        if (patientData.status === 403) {
          setError(patientData.message || 'You do not have permission to view this patient');
          toast.error('Access denied: You do not have permission to view this patient');
          // Redirect back to the patients list after a short delay
          setTimeout(() => {
            navigate('/admin/patients');
          }, 3000);
          return;
        } else if (patientData.status === 404) {
          setError(patientData.message || 'Patient not found');
          toast.error('Patient not found');
          // Redirect back to the patients list after a short delay
          setTimeout(() => {
            navigate('/admin/patients');
          }, 3000);
          return;
        } else {
          setError(patientData.message || 'An error occurred while loading patient data');
          toast.error('Failed to load patient data');
          return;
        }
      }
      
      if (patientData) {
        // Extract first and last name from the full name
        let firstName = '';
        let lastName = '';
        
        if (patientData.name) {
          const nameParts = patientData.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Parse address fields if address is a string
        let addressStr = '';
        let city = '';
        let state = '';
        let zipCode = '';
        
        // Handle address field which might be a string or an object
        if (typeof patientData.address === 'object' && patientData.address !== null) {
          addressStr = patientData.address.street || '';
          city = patientData.address.city || '';
          state = patientData.address.state || '';
          zipCode = patientData.address.postalCode || patientData.address.zipCode || '';
        } else if (typeof patientData.address === 'string' && patientData.address) {
          console.log('Parsing address string:', patientData.address);
          // Try to parse address string if it contains commas
          const addressParts = patientData.address.split(',');
          
          // More sophisticated parsing
          if (addressParts.length === 1) {
            // Only street address
            addressStr = addressParts[0].trim();
          } else if (addressParts.length === 2) {
            // Street and city
            addressStr = addressParts[0].trim();
            city = addressParts[1].trim();
          } else if (addressParts.length === 3) {
            // Street, city, and state
            addressStr = addressParts[0].trim();
            city = addressParts[1].trim();
            state = addressParts[2].trim();
          } else if (addressParts.length >= 4) {
            // Street, city, state, and zip
            addressStr = addressParts[0].trim();
            city = addressParts[1].trim();
            state = addressParts[2].trim();
            zipCode = addressParts[3].trim();
          }
        }
        
        // Parse emergency contact if it's a string
        let emergencyContactName = '';
        let emergencyContactRelationship = '';
        let emergencyContactPhone = '';
        
        if (typeof patientData.emergencyContact === 'object' && patientData.emergencyContact !== null) {
          emergencyContactName = patientData.emergencyContact.name || '';
          emergencyContactRelationship = patientData.emergencyContact.relationship || '';
          emergencyContactPhone = patientData.emergencyContact.phone || '';
        } else if (typeof patientData.emergencyContact === 'string' && patientData.emergencyContact) {
          console.log('Parsing emergency contact string:', patientData.emergencyContact);
          
          // Try to parse "Name (Relationship) Phone" format
          const relationshipMatch = patientData.emergencyContact.match(/(.+?)\s*\((.+?)\)\s*(.+)/i);
          
          if (relationshipMatch) {
            emergencyContactName = relationshipMatch[1].trim();
            emergencyContactRelationship = relationshipMatch[2].trim();
            emergencyContactPhone = relationshipMatch[3].trim();
          } else {
            // Try to parse "Name - Phone" format
            const simpleMatch = patientData.emergencyContact.match(/(.+?)\s*-\s*(.+)/i);
            
            if (simpleMatch) {
              emergencyContactName = simpleMatch[1].trim();
              emergencyContactPhone = simpleMatch[2].trim();
            } else {
              // Just use the whole string as the name if no pattern matches
              emergencyContactName = patientData.emergencyContact.trim();
            }
          }
        }
        
        // Normalize profile image data to ensure consistent structure
        let profileImageData = null;
        
        // Case 1: profileImage is an object with url/secure_url
        if (patientData.profileImage && typeof patientData.profileImage === 'object') {
          profileImageData = {
            url: patientData.profileImage.url || patientData.profileImage.secure_url || '',
            secure_url: patientData.profileImage.secure_url || patientData.profileImage.url || '',
            publicId: patientData.profileImage.publicId || patientData.profileImage.public_id || ''
          };
          console.log('Using structured profileImage object');
        }
        // Case 2: profileImage is a string (URL or data URL)
        else if (patientData.profileImage && typeof patientData.profileImage === 'string') {
          profileImageData = {
            url: patientData.profileImage,
            secure_url: patientData.profileImage,
            publicId: patientData.profileImagePublicId || ''
          };
          console.log('Converted string profileImage to structured object');
        }
        // Case 3: No profileImage but has profileImageUrl (legacy format)
        else if (patientData.profileImageUrl) {
          profileImageData = {
            url: patientData.profileImageUrl,
            secure_url: patientData.profileImageUrl,
            publicId: patientData.profileImagePublicId || ''
          };
          console.log('Using legacy profileImageUrl field');
        }
        // Case 4: No profile image data found
        else {
          profileImageData = { url: '', secure_url: '', publicId: '' };
          console.log('No profile image data found');
        }
        
        // Format the data for the form
        const formattedData = {
          patientId: patientData.patientId || patientData._id,
          firstName,
          lastName,
          email: patientData.email || '',
          phone: patientData.phone || '',
          address: addressStr,
          city,
          state,
          zipCode,
          dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: patientData.gender?.toLowerCase() || '',
          bloodGroup: patientData.bloodGroup || '',
          allergies: patientData.allergies || [],
          chronicDiseases: patientData.chronicDiseases || [],
          medications: patientData.medications || [],
          emergencyContactName,
          emergencyContactRelationship,
          emergencyContactPhone,
          insuranceProvider: patientData.insurance?.provider || '',
          insurancePolicyNumber: patientData.insurance?.policyNumber || '',
          insuranceExpiryDate: patientData.insurance?.expiryDate ? new Date(patientData.insurance.expiryDate).toISOString().split('T')[0] : '',
          occupation: patientData.occupation || '',
          maritalStatus: patientData.maritalStatus || '',
          notes: patientData.notes || '',
          status: patientData.status?.toLowerCase() || 'active',
          profileImage: profileImageData,
          // Include legacy fields for backward compatibility
          profileImageUrl: profileImageData.url || '',
          profileImagePublicId: profileImageData.publicId || '',
          // Track that this is not a new image upload
          newImageUploaded: false
        };
        
        console.log('Formatted data for form:', formattedData);
        
        // Set image preview if profile image exists
        if (profileImageData && (profileImageData.url || profileImageData.secure_url)) {
          setImagePreview(profileImageData.url || profileImageData.secure_url);
          console.log('Setting image preview:', profileImageData.url || profileImageData.secure_url);
        }
        
        setFormData(formattedData);
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to load patient data. Please try again.');
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
      // We don't reset the requestMadeRef here because we want to prevent duplicate requests
      // even if the component re-renders due to state changes
    }
  };

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
  
  // The image upload functionality is handled by the handleImageChange function defined earlier
  
  // Handle allergy management
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) {
      toast.error('Please enter an allergy');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    
    setNewAllergy('');
    toast.success('Allergy added successfully');
  };
  
  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
    toast.info('Allergy removed');
  };
  
  // Handle chronic disease management
  const handleAddChronicDisease = () => {
    if (!newChronicDisease.trim()) {
      toast.error('Please enter a chronic disease');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      chronicDiseases: [...prev.chronicDiseases, newChronicDisease.trim()]
    }));
    
    setNewChronicDisease('');
    toast.success('Chronic disease added successfully');
  };
  
  const handleRemoveChronicDisease = (index) => {
    setFormData(prev => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.filter((_, i) => i !== index)
    }));
    toast.info('Chronic disease removed');
  };
  
  // Handle medication management
  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast.error('Medication name and dosage are required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
    
    // Reset medication form
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: ''
    });
    
    toast.success('Medication added successfully');
  };
  
  const handleRemoveMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    toast.info('Medication removed');
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    // Insurance expiry date validation
    if (formData.insuranceExpiryDate) {
      const expiryDate = new Date(formData.insuranceExpiryDate);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.insuranceExpiryDate = 'Insurance has expired';
      }
    }
    
    // Password validation for new patients (not in edit mode)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Format full name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Format address - the Patient model expects a string, not an object
      let addressString = '';
      if (formData.address || formData.city || formData.state || formData.zipCode) {
        // Concatenate the address parts into a single string
        const addressParts = [];
        if (formData.address) addressParts.push(formData.address);
        if (formData.city) addressParts.push(formData.city);
        if (formData.state) addressParts.push(formData.state);
        if (formData.zipCode) addressParts.push(formData.zipCode);
        
        // Join the parts with commas
        addressString = addressParts.join(', ');
        console.log('Formatted address string:', addressString);
      }
      
      // Format emergency contact according to the Patient model
      const emergencyContactData = {
        name: formData.emergencyContactName || '',
        relationship: formData.emergencyContactRelationship || '',
        phone: formData.emergencyContactPhone || ''
      };

      
      // Format insurance data
      const insuranceData = {};
      if (formData.insuranceProvider || formData.insurancePolicyNumber || formData.insuranceExpiryDate) {
        insuranceData.provider = formData.insuranceProvider;
        insuranceData.policyNumber = formData.insurancePolicyNumber;
        insuranceData.expiryDate = formData.insuranceExpiryDate;
      }
      
      // Enhanced profile image handling with standardized structure
      let profileImageData = null;
      
      // For edit mode, if no new image was uploaded, don't send image data at all to reduce payload size
      if (isEditMode && !imagePreview && !formData.newImageUploaded) {
        console.log('Edit mode with no new image - skipping image data to reduce payload size');
        profileImageData = null;
      }
      // Priority 1: Use cloud-hosted image URL if available (most efficient)
      else if (formData.profileImage && 
          typeof formData.profileImage === 'object' && 
          ((formData.profileImage.url && !formData.profileImage.url.startsWith('data:')) || 
           (formData.profileImage.secure_url && !formData.profileImage.secure_url.startsWith('data:')))) {
        
        // Use the cloud-hosted image URL (tiny payload)
        profileImageData = {
          url: formData.profileImage.url || formData.profileImage.secure_url || '',
          secure_url: formData.profileImage.secure_url || formData.profileImage.url || '',
          publicId: formData.profileImage.publicId || ''
        };
        console.log('Using existing cloud image URL');
      }
      // Priority 2: Use image preview if available (user selected a new image)
      else if (imagePreview) {
        try {
          // Check if imagePreview is already a cloud URL
          if (typeof imagePreview === 'string' && !imagePreview.startsWith('data:')) {
            profileImageData = {
              url: imagePreview,
              secure_url: imagePreview,
              publicId: formData.profileImage?.publicId || 'cloud-image'
            };
            console.log('Using cloud image URL from preview');
          } else {
            // Compress the image to ensure it's small enough
            const compressedUrl = await compressImage(imagePreview, 200, 200, 0.5);
            
            // Check if the compressed image is still too large (>100KB)
            if (compressedUrl.length > 100 * 1024) {
              console.warn('Image still too large after compression, applying extreme compression');
              // Apply more extreme compression
              const tinyUrl = await compressImage(compressedUrl, 150, 150, 0.4);
              profileImageData = {
                url: tinyUrl,
                secure_url: tinyUrl,
                publicId: 'compressed-image-' + Date.now()
              };
              console.log('Using extremely compressed image. Size:', Math.round(tinyUrl.length/1024) + 'KB');
            } else {
              profileImageData = {
                url: compressedUrl,
                secure_url: compressedUrl,
                publicId: 'compressed-image-' + Date.now()
              };
              console.log('Using compressed image. Size:', Math.round(compressedUrl.length/1024) + 'KB');
            }
          }
        } catch (err) {
          console.error('Error processing image preview:', err);
          // Use a fallback tiny image or skip image upload
          if (formData.profileImageUrl && !formData.profileImageUrl.startsWith('data:')) {
            // Use existing URL if available
            profileImageData = {
              url: formData.profileImageUrl,
              secure_url: formData.profileImageUrl,
              publicId: formData.profileImagePublicId || ''
            };
            console.log('Falling back to existing profileImageUrl');
          } else {
            // Skip image upload
            profileImageData = null;
            console.log('Skipping image upload due to processing error');
          }
        }
      }
      // Priority 3: Use existing data URL from form data if available
      else if (formData.profileImage && 
               typeof formData.profileImage === 'object' && 
               formData.profileImage.url && 
               formData.profileImage.url.startsWith('data:')) {
        try {
          // Re-compress to make it smaller
          const recompressedUrl = await compressImage(formData.profileImage.url, 150, 150, 0.4);
          profileImageData = {
            url: recompressedUrl,
            secure_url: recompressedUrl,
            publicId: formData.profileImage.publicId || 'recompressed-' + Date.now()
          };
          console.log('Using recompressed image. Size:', Math.round(recompressedUrl.length/1024) + 'KB');
        } catch (err) {
          console.error('Error recompressing image:', err);
          // Skip image if recompression fails
          profileImageData = null;
        }
      }
      // Priority 4: Check for profileImageUrl as fallback (backward compatibility)
      else if (formData.profileImageUrl && typeof formData.profileImageUrl === 'string') {
        if (!formData.profileImageUrl.startsWith('data:')) {
          // It's a cloud URL
          profileImageData = {
            url: formData.profileImageUrl,
            secure_url: formData.profileImageUrl,
            publicId: formData.profileImagePublicId || ''
          };
          console.log('Using profileImageUrl field as fallback');
        } else {
          // It's a data URL, try to compress
          try {
            const compressedUrl = await compressImage(formData.profileImageUrl, 150, 150, 0.4);
            profileImageData = {
              url: compressedUrl,
              secure_url: compressedUrl,
              publicId: formData.profileImagePublicId || 'compressed-fallback-' + Date.now()
            };
            console.log('Using compressed profileImageUrl. Size:', Math.round(compressedUrl.length/1024) + 'KB');
          } catch (err) {
            console.error('Error compressing profileImageUrl:', err);
            profileImageData = null;
          }
        }
      }
      
      console.log('Final profile image data:', profileImageData ? 
        `Image included (${profileImageData.url.startsWith('data:') ? 'data URL' : 'cloud URL'})` : 
        'No image data');
      
      // Get clinic information
      let clinicInfo;
      try {
        // The AuthProvider stores clinic data in 'clinicData'
        clinicInfo = JSON.parse(localStorage.getItem('clinicData') || '{}');
        console.log('Retrieved from localStorage:', { clinicData: clinicInfo });
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        clinicInfo = {};
      }
      
      // Try multiple sources for clinic ID
      const clinicId = currentUser?.clinic?._id || 
                      currentUser?.clinicId || 
                      clinicInfo?._id || 
                      '';
      
      // Ensure status is lowercase as required by the Patient model
      let status = formData.status;
      if (status === 'Active') status = 'active';
      if (status === 'Inactive') status = 'inactive';
      
      console.log('Status value being sent to API:', status);
      
      // Prepare patient data for API
      const patientData = {
        patientId: formData.patientId,
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        address: addressString,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        // Convert arrays to strings for backend compatibility
        allergies: Array.isArray(formData.allergies) ? formData.allergies.join(', ') : formData.allergies || '',
        chronicDiseases: Array.isArray(formData.chronicDiseases) ? formData.chronicDiseases.join(', ') : formData.chronicDiseases || '',
        medications: Array.isArray(formData.medications) ? JSON.stringify(formData.medications) : formData.medications || '',
        emergencyContact: emergencyContactData,
        insurance: Object.keys(insuranceData).length > 0 ? insuranceData : undefined,
        occupation: formData.occupation,
        maritalStatus: formData.maritalStatus,
        notes: formData.notes,
        status: status,
        profileImage: profileImageData,
        // Add these fields for backward compatibility with components that expect them
        profileImageUrl: profileImageData ? profileImageData.url : undefined,
        profileImagePublicId: profileImageData ? profileImageData.publicId : undefined,
        clinicId: clinicId, // Link patient to clinic
        // Include password for new patients so they can log in
        password: !isEditMode ? formData.password : undefined
      };
      
      console.log('Submitting patient data:', patientData);
      
      let response;
      if (isEditMode) {
        // Update existing patient
        response = await patientService.updatePatient(patientId, patientData);
      } else {
        // Create new patient
        response = await patientService.createPatient(patientData);
      }
      
      console.log('API Response:', response);
      
      // Check if response contains an error
      if (response && response.error) {
        // Only use toast notification, no UI error message
        toast.error(response.message || 'Failed to save patient data');
        return;
      }
      
      // Show success message on success
      const successMessage = isEditMode ? 'Patient updated successfully' : 'Patient added successfully';
      toast.success(successMessage);
      
      // Navigate to patient details page after short delay
      setTimeout(() => {
        // If editing, go to patient details page
        if (isEditMode && patientId) {
          navigate(`/admin/patients/${patientId}`);
        } else if (response && response.data && response.data._id) {
          // If creating new patient, go to the new patient's details page
          navigate(`/admin/patients/${response.data._id}`);
        } else {
          // Fallback to patient list if we can't determine the patient ID
          navigate('/admin/patient-management?tab=patients');
        }
      }, 2000);
    } catch (err) {
      console.error('Error saving patient:', err);
      // This catch block should only be reached for unexpected errors
      // that weren't handled by the patientService error handling
      const errorMessage = 'An unexpected error occurred. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Log detailed error information for debugging
      console.debug('Detailed error information:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && patientId) {
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
                <FaUserInjured className="mr-2 text-blue-600" /> Edit Patient
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2 text-green-600" /> Add New Patient
              </>
            )}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update patient information' : 'Register a new patient in the system'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            type="button"
            variant="secondary" 
            onClick={() => navigate('/admin/patient-management?tab=patients')}
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
          Patient {isEditMode ? 'updated' : 'added'} successfully!
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
            onChange={handleImageChange}
          />
          <span className="text-sm text-gray-500 mt-2">
            {uploadingImage ? 'Uploading...' : 'Click to upload profile picture'}
          </span>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'medical' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('medical')}
            >
              Medical Information
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'emergency' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('emergency')}
            >
              Emergency Contact
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'insurance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('insurance')}
            >
              Insurance
            </button>
            {!isEditMode && (
              <button
                type="button"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'credentials' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('credentials')}
              >
                Login Credentials
              </button>
            )}
          </nav>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Patient ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    className={`w-full pl-10 p-2 border rounded-md ${errors.patientId ? 'border-red-500' : 'border-gray-300'} bg-gray-100`}
                    placeholder="Patient ID"
                    readOnly
                  />
                </div>
                {errors.patientId && (
                  <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>
                )}
              </div>
              
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter first name"
                  required
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter last name"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-md ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Address */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                    placeholder="Street Address"
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="City"
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="State/Province"
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Zip/Postal Code"
                />
              </div>
              
              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Occupation"
                />
              </div>
              
              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Marital Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Blood Group</option>
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
              
              {/* Allergies */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    name="newAllergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    placeholder="Add an allergy"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="mr-1">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chronic Diseases */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chronic Diseases
                </label>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    name="newChronicDisease"
                    value={newChronicDisease}
                    onChange={(e) => setNewChronicDisease(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    placeholder="Add a chronic disease"
                  />
                  <button
                    type="button"
                    onClick={handleAddChronicDisease}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.chronicDiseases.map((disease, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="mr-1">{disease}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChronicDisease(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Medications */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    name="newMedication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    placeholder="Add a medication"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="mr-1">{medication}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Additional notes about the patient's medical history"
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Full name"
                />
              </div>
              
              {/* Emergency Contact Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to Patient
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Spouse, Parent, Child"
                />
              </div>
              
              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Login Credentials Tab */}
          {activeTab === 'credentials' && !isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    placeholder="Enter password"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">Password will be used for patient login</p>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Login Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Creating login credentials will allow the patient to access their medical records, appointments, and other information through the patient portal.</p>
                        <p className="mt-1">The patient will use their email address and this password to log in.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Insurance Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Insurance company name"
                />
              </div>
              
              {/* Insurance Policy Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="insurancePolicyNumber"
                  value={formData.insurancePolicyNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Policy number"
                />
              </div>
              
              {/* Insurance Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleChange}
                    className={`w-full pl-10 p-2 border rounded-md ${errors.insuranceExpiryDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.insuranceExpiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.insuranceExpiryDate}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-24"
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Saving</span>
                </div>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientForm;