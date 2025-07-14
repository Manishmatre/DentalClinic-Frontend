import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaStethoscope, 
  FaIdBadge, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaBuilding,
  FaLanguage,
  FaCertificate,
  FaClock,
  FaPlus,
  FaTrash,
  FaUniversity,
  FaAward,
  FaSpinner
} from 'react-icons/fa';
import adminService from '../../../api/admin/adminService';
import { toast } from 'react-toastify';

/**
 * Professional Tab Component
 * Displays professional information for medical staff and administrators
 */
const ProfessionalTab = ({ 
  formData, 
  isEditing, 
  handleInputChange, 
  handleArrayInputChange, 
  userRole,
  refreshData
}) => {
  // State for education and certification forms
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuedBy: '', year: '', expiryDate: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle language input change with comma-separated values
  const handleLanguagesChange = async (e) => {
    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(Boolean);
    
    // Update the local state first for immediate UI feedback
    handleArrayInputChange('languagesSpoken', languages);
    
    // We don't save immediately on each keystroke to avoid too many API calls
    // The parent component will handle saving when the user clicks Save
  };
  
  // Get languages as comma-separated string
  const getLanguagesString = () => {
    return (formData.languagesSpoken || []).join(', ');
  };

  // Handle education input change
  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle certification input change
  const handleCertificationChange = (e) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new education
  const addEducation = async () => {
    if (newEducation.degree && newEducation.institution) {
      try {
        setSaving(true);
        const updatedEducation = [...(formData.education || []), newEducation];
        
        // Update the local state first for immediate UI feedback
        handleArrayInputChange('education', updatedEducation);
        
        // Save to database
        await adminService.updateAdminProfile({
          education: updatedEducation
        });
        
        // Log activity
        await adminService.logActivity({
          action: 'Added education',
          module: 'Profile',
          details: `Added ${newEducation.degree} from ${newEducation.institution}`
        });
        
        setNewEducation({ degree: '', institution: '', year: '' });
        toast.success('Education added successfully');
      } catch (error) {
        console.error('Error adding education:', error);
        toast.error('Failed to add education');
      } finally {
        setSaving(false);
      }
    } else {
      toast.warning('Degree and institution are required');
    }
  };

  // Add new certification
  const addCertification = async () => {
    if (newCertification.name && newCertification.issuedBy) {
      try {
        setSaving(true);
        const updatedCertifications = [...(formData.certifications || []), newCertification];
        
        // Update the local state first for immediate UI feedback
        handleArrayInputChange('certifications', updatedCertifications);
        
        // Save to database
        await adminService.updateAdminProfile({
          certifications: updatedCertifications
        });
        
        // Log activity
        await adminService.logActivity({
          action: 'Added certification',
          module: 'Profile',
          details: `Added ${newCertification.name} from ${newCertification.issuedBy}`
        });
        
        setNewCertification({ name: '', issuedBy: '', year: '', expiryDate: '' });
        toast.success('Certification added successfully');
      } catch (error) {
        console.error('Error adding certification:', error);
        toast.error('Failed to add certification');
      } finally {
        setSaving(false);
      }
    } else {
      toast.warning('Certification name and issuer are required');
    }
  };

  // Remove education
  const removeEducation = async (index) => {
    try {
      setSaving(true);
      const updatedEducation = [...(formData.education || [])];
      const removedItem = updatedEducation[index];
      updatedEducation.splice(index, 1);
      
      // Update the local state first for immediate UI feedback
      handleArrayInputChange('education', updatedEducation);
      
      // Save to database
      await adminService.updateAdminProfile({
        education: updatedEducation
      });
      
      // Log activity
      await adminService.logActivity({
        action: 'Removed education',
        module: 'Profile',
        details: `Removed ${removedItem.degree} from ${removedItem.institution}`
      });
      
      toast.success('Education removed successfully');
    } catch (error) {
      console.error('Error removing education:', error);
      toast.error('Failed to remove education');
    } finally {
      setSaving(false);
    }
  };

  // Remove certification
  const removeCertification = async (index) => {
    try {
      setSaving(true);
      const updatedCertifications = [...(formData.certifications || [])];
      const removedItem = updatedCertifications[index];
      updatedCertifications.splice(index, 1);
      
      // Update the local state first for immediate UI feedback
      handleArrayInputChange('certifications', updatedCertifications);
      
      // Save to database
      await adminService.updateAdminProfile({
        certifications: updatedCertifications
      });
      
      // Log activity
      await adminService.logActivity({
        action: 'Removed certification',
        module: 'Profile',
        details: `Removed ${removedItem.name} from ${removedItem.issuedBy}`
      });
      
      toast.success('Certification removed successfully');
    } catch (error) {
      console.error('Error removing certification:', error);
      toast.error('Failed to remove certification');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Qualifications Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications & Expertise</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Qualification */}
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MBBS, MD, PhD"
              />
            </div>
            
            {/* Specialization (for doctors) */}
            {userRole === 'doctor' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            )}
            
            {/* License Number (for doctors) */}
            {userRole === 'doctor' && (
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {/* Years of Experience */}
            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                max="70"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Languages Spoken */}
            <div className="md:col-span-2">
              <label htmlFor="languagesSpoken" className="block text-sm font-medium text-gray-700 mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                id="languagesSpoken"
                name="languagesSpoken"
                value={getLanguagesString()}
                onChange={handleLanguagesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., English, Hindi, Spanish (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter languages separated by commas
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Qualification */}
            <div className="flex items-start">
              <FaGraduationCap className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Qualification</h4>
                <p className="mt-1 text-base">{formData.qualification || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Specialization (for doctors) */}
            {userRole === 'doctor' && (
              <div className="flex items-start">
                <FaStethoscope className="mt-1 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Specialization</h4>
                  <p className="mt-1 text-base">{formData.specialization || 'Not provided'}</p>
                </div>
              </div>
            )}
            
            {/* License Number (for doctors) */}
            {userRole === 'doctor' && (
              <div className="flex items-start">
                <FaIdBadge className="mt-1 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">License Number</h4>
                  <p className="mt-1 text-base">{formData.licenseNumber || 'Not provided'}</p>
                </div>
              </div>
            )}
            
            {/* Years of Experience */}
            <div className="flex items-start">
              <FaBriefcase className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Years of Experience</h4>
                <p className="mt-1 text-base">
                  {formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : 'Not provided'}
                </p>
              </div>
            </div>
            
            {/* Languages Spoken */}
            <div className="flex items-start md:col-span-2">
              <FaLanguage className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Languages Spoken</h4>
                <p className="mt-1 text-base">
                  {formData.languagesSpoken && formData.languagesSpoken.length > 0
                    ? formData.languagesSpoken.join(', ')
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Education Section */}
      {(userRole === 'admin' || userRole === 'doctor') && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
          
          {isEditing ? (
            <div className="space-y-6">
              {/* Existing Education */}
              {formData.education && formData.education.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Existing Education</h4>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}, {edu.year}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Education */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Add New Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edu-degree" className="block text-sm font-medium text-gray-700 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      id="edu-degree"
                      name="degree"
                      value={newEducation.degree}
                      onChange={handleEducationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., MBA, MBBS, PhD"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edu-institution" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution
                    </label>
                    <input
                      type="text"
                      id="edu-institution"
                      name="institution"
                      value={newEducation.institution}
                      onChange={handleEducationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Harvard University"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edu-year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      id="edu-year"
                      name="year"
                      value={newEducation.year}
                      onChange={handleEducationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2015"
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={addEducation}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlus className="mr-2" /> Add Education
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.education && formData.education.length > 0 ? (
                formData.education.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <FaUniversity className="mt-1 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">{edu.degree}</h4>
                      <p className="mt-1 text-base">{edu.institution}, {edu.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No education information provided</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Certifications Section */}
      {(userRole === 'admin' || userRole === 'doctor') && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
          
          {isEditing ? (
            <div className="space-y-6">
              {/* Existing Certifications */}
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Existing Certifications</h4>
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-600">{cert.issuedBy}, {cert.year}</p>
                        {cert.expiryDate && (
                          <p className="text-xs text-gray-500">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Certification */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Add New Certification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cert-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Certification Name
                    </label>
                    <input
                      type="text"
                      id="cert-name"
                      name="name"
                      value={newCertification.name}
                      onChange={handleCertificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Healthcare Administration Certification"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cert-issuedBy" className="block text-sm font-medium text-gray-700 mb-1">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      id="cert-issuedBy"
                      name="issuedBy"
                      value={newCertification.issuedBy}
                      onChange={handleCertificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Indian Medical Association"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cert-year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      id="cert-year"
                      name="year"
                      value={newCertification.year}
                      onChange={handleCertificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2018"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cert-expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="cert-expiryDate"
                      name="expiryDate"
                      value={newCertification.expiryDate}
                      onChange={handleCertificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={addCertification}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlus className="mr-2" /> Add Certification
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.certifications && formData.certifications.length > 0 ? (
                formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start">
                    <FaAward className="mt-1 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">{cert.name}</h4>
                      <p className="mt-1 text-base">{cert.issuedBy}, {cert.year}</p>
                      {cert.expiryDate && (
                        <p className="text-sm text-gray-500">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No certification information provided</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Employment Information Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Join Date */}
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                Join Date
              </label>
              <input
                type="date"
                id="joinDate"
                name="joinDate"
                value={formData.joinDate ? new Date(formData.joinDate).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Department */}
            <div className="flex items-start">
              <FaBuilding className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Department</h4>
                <p className="mt-1 text-base">{formData.department || 'Not assigned'}</p>
              </div>
            </div>
            
            {/* Position */}
            <div className="flex items-start">
              <FaBriefcase className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Position</h4>
                <p className="mt-1 text-base">{formData.position || 'Not assigned'}</p>
              </div>
            </div>
            
            {/* Join Date */}
            <div className="flex items-start">
              <FaCalendarAlt className="mt-1 text-blue-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Join Date</h4>
                <p className="mt-1 text-base">
                  {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Doctor-specific sections */}
      {userRole === 'doctor' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Availability & Schedule</h3>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Consultation Hours</h4>
              {!isEditing && (
                <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                  {saving ? (
                    <FaSpinner className="animate-spin inline mr-1" />
                  ) : (
                    'Manage Schedule'
                  )}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaClock className="text-blue-500 mr-2" />
                  <span className="font-medium">Monday - Friday</span>
                </div>
                <span>9:00 AM - 5:00 PM</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaClock className="text-blue-500 mr-2" />
                  <span className="font-medium">Saturday</span>
                </div>
                <span>10:00 AM - 2:00 PM</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaClock className="text-blue-500 mr-2" />
                  <span className="font-medium">Sunday</span>
                </div>
                <span className="text-red-500">Closed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTab;
