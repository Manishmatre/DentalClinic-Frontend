import React from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaVenusMars, 
  FaBirthdayCake, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

/**
 * Personal Information Tab
 * Displays and allows editing of basic personal information
 */
const PersonalInfoTab = ({ formData, isEditing, handleInputChange, calculateAge, formatDate }) => {
  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            
            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Name */}
            <div className="flex items-start">
              <FaUser className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                <p className="mt-1 text-base">{formData.firstName} {formData.lastName}</p>
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-start">
              <FaEnvelope className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                <p className="mt-1 text-base">{formData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-start">
              <FaPhone className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                <p className="mt-1 text-base">{formData.phone || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Gender */}
            <div className="flex items-start">
              <FaVenusMars className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                <p className="mt-1 text-base capitalize">{formData.gender || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Date of Birth */}
            <div className="flex items-start">
              <FaBirthdayCake className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                <p className="mt-1 text-base">
                  {formData.dob ? (
                    <>
                      {formatDate(formData.dob)} <span className="text-gray-500">({calculateAge(formData.dob)} years old)</span>
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
        
        {isEditing ? (
          <div className="space-y-6">
            {/* Street Address */}
            <div>
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* State/Province */}
              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Zip/Postal Code */}
              <div>
                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Country */}
              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {formData.address && (
              formData.address.street || 
              formData.address.city || 
              formData.address.state || 
              formData.address.postalCode || 
              formData.address.country
            ) ? (
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p className="mt-1 text-base">
                    {formData.address.street && (
                      <span className="block">{formData.address.street}</span>
                    )}
                    {(formData.address.city || formData.address.state || formData.address.postalCode) && (
                      <span className="block">
                        {formData.address.city && `${formData.address.city}, `}
                        {formData.address.state && `${formData.address.state} `}
                        {formData.address.postalCode && formData.address.postalCode}
                      </span>
                    )}
                    {formData.address.country && (
                      <span className="block">{formData.address.country}</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No address information provided</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoTab;
