import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaEdit, FaUserMd, FaUserTie, FaUser, FaUserNurse, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Profile Header Component
 * Displays user avatar, name, role, and basic info
 */
const ProfileHeader = ({ 
  profileData, 
  formData, 
  userRole, 
  isEditing, 
  uploadingPhoto, 
  handleProfilePhotoUpload,
  setIsEditing,
  uploadService,
  setFormData
}) => {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const photoUploadRef = useRef(null);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverUploadRef = useRef(null);
  
  // Close photo upload dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (photoUploadRef.current && !photoUploadRef.current.contains(event.target)) {
        setShowPhotoUpload(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get role icon based on user role
  const getRoleIcon = () => {
    switch (userRole) {
      case 'doctor':
        return <FaUserMd className="text-blue-600" />;
      case 'admin':
        return <FaUserTie className="text-purple-600" />;
      case 'staff':
        return <FaUserNurse className="text-green-600" />;
      case 'patient':
        return <FaUser className="text-teal-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };
  
  // Get role color based on user role
  const getRoleColor = () => {
    switch (userRole) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'patient':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  
  // Get background gradient based on user role
  const getBackgroundGradient = () => {
    switch (userRole) {
      case 'doctor':
        return 'from-blue-500 to-indigo-600';
      case 'admin':
        return 'from-purple-500 to-indigo-600';
      case 'staff':
        return 'from-green-500 to-teal-600';
      case 'patient':
        return 'from-teal-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };
  
  // Get role-specific subtitle
  const getRoleSubtitle = () => {
    if (!profileData) return '';
    
    switch (userRole) {
      case 'doctor':
        return profileData.specialization || 'Medical Doctor';
      case 'admin':
        return profileData.position || 'Administrator';
      case 'staff':
        return profileData.department || 'Staff Member';
      case 'patient':
        return 'Patient';
      default:
        return '';
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProfilePhotoUpload(e.target.files[0]);
    }
  };

  // Handler for cover image upload
  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleCoverImageUpload(e.target.files[0]);
    }
  };

  // Add a handler for uploading the cover image
  const handleCoverImageUpload = async (file) => {
    setUploadingCover(true);
    try {
      // Use the uploadService to upload the cover image (reuse uploadFile with type 'cover-image')
      const result = await uploadService.uploadFile(file, 'cover-image', null, { folder: 'cover_images' });
      if (!result || result.error) {
        throw new Error(result?.error || 'Failed to upload cover image');
      }
      // Update the formData with the new cover image URL
      setFormData((prev) => ({ ...prev, coverImage: result.file.url }));
      setShowCoverUpload(false);
    } catch (error) {
      console.error('Error uploading cover image:', error);
    } finally {
      setUploadingCover(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Background Cover */}
      <div 
        className={`h-52 bg-gradient-to-r ${getBackgroundGradient()}`}
        style={{
          backgroundImage: formData.coverImage
            ? `url('${formData.coverImage}')`
            : "url('https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
        {/* Cover Image Upload Overlay */}
        <div 
          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer hover:bg-opacity-70 z-20"
          onClick={() => setShowCoverUpload(true)}
          title="Change Cover Image"
        >
          <FaCamera className="text-white text-xl" />
        </div>
        {/* Cover Image Upload Input */}
        {showCoverUpload && (
          <div 
            ref={coverUploadRef}
            className="absolute top-12 right-2 bg-white rounded-lg shadow-xl p-4 z-30 w-72 border border-gray-100 animate-fadeIn"
          >
            <div className="flex flex-col space-y-3">
              <h4 className="font-medium text-gray-800">Update Cover Image</h4>
              <p className="text-xs text-gray-500">Upload a new cover image (JPEG, PNG, GIF, etc.)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-3"
                  onClick={() => setShowCoverUpload(false)}
                >
                  Cancel
                </Button>
                {uploadingCover && (
                  <div className="flex items-center text-xs text-blue-600">
                    <LoadingSpinner size="xs" className="mr-1" /> Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Info Container */}
      <div className="flex flex-col md:flex-row px-6 relative">
        {/* Avatar */}
        <div className="absolute -top-20 left-6 md:left-10">
          <div className="relative group">
            <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {console.log('ProfileHeader - Profile Picture URL:', formData.profilePicture)}
              {formData.profilePicture ? (
                <img 
                  src={`${formData.profilePicture}?${new Date().getTime()}`} 
                  alt={`${formData.firstName} ${formData.lastName}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', formData.profilePicture);
                    e.target.onerror = null;
                    // Display first letter of name instead of placeholder
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800 text-4xl font-bold">${formData.firstName?.charAt(0) || ''}</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <FaUser size={54} />
                </div>
              )}
            </div>
            
            {/* Photo Upload Overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full border-4 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              onClick={() => setShowPhotoUpload(true)}
            >
              <FaCamera className="text-white text-2xl" />
            </div>
            
            {/* Photo Upload Input */}
            {showPhotoUpload && (
              <div 
                ref={photoUploadRef}
                className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-10 w-72 border border-gray-100 animate-fadeIn"
              >
                <div className="flex flex-col space-y-3">
                  <h4 className="font-medium text-gray-800">Update Profile Photo</h4>
                  <p className="text-xs text-gray-500">Upload a new profile photo (JPEG, PNG, or GIF)</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="flex justify-between items-center">
                    <Button 
                      type="button" 
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-3"
                      onClick={() => setShowPhotoUpload(false)}
                    >
                      Cancel
                    </Button>
                    {uploadingPhoto && (
                      <div className="flex items-center text-xs text-blue-600">
                        <LoadingSpinner size="xs" className="mr-1" /> Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* User Info */}
        <div className="mt-20 md:mt-0 md:ml-44 py-6 flex-grow">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {formData.firstName} {formData.lastName}
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor()}`}>
                  {getRoleIcon()}
                  <span className="ml-1 capitalize">{userRole}</span>
                </span>
              </h1>
              
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-gray-700">
                  {getRoleSubtitle()}
                </span>
              </div>
              
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {formData.email}
                </div>
                
                {formData.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" />
                    {formData.phone}
                  </div>
                )}
                
                {formData.address?.city && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    {formData.address.city}, {formData.address.country || ''}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {userRole === 'doctor' && formData.specialization && (
                  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                    {formData.specialization}
                  </span>
                )}
                
                {userRole === 'doctor' && formData.languagesSpoken?.length > 0 && 
                  formData.languagesSpoken.map((lang, index) => (
                    <span key={index} className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {lang}
                    </span>
                  ))
                }
                
                {userRole === 'patient' && formData.bloodGroup && (
                  <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                    Blood: {formData.bloodGroup}
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            {!isEditing && (
              <Button
                type="button"
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
