import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaUserMd, 
  FaBuilding, 
  FaCalendarAlt, 
  FaLock,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';

const StaffModal = ({ isOpen, onClose, onSubmit, staff, mode = 'add' }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'Receptionist',
    specialization: '',
    department: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    education: [],
    certifications: [],
    workExperience: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff && mode === 'edit') {
      // Format date to YYYY-MM-DD for input
      const formattedJoinedDate = staff.joinedDate 
        ? new Date(staff.joinedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        address: staff.address || '',
        role: staff.role || 'Receptionist',
        specialization: staff.specialization || '',
        department: staff.department || '',
        status: staff.status || 'Active',
        joinedDate: formattedJoinedDate,
        password: '',
        confirmPassword: '',
        emergencyContact: staff.emergencyContact || '',
        education: Array.isArray(staff.education) ? staff.education : [],
        certifications: staff.certifications || [],
        workExperience: staff.workExperience || []
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'Receptionist',
        specialization: '',
        department: '',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        password: '',
        confirmPassword: '',
        emergencyContact: '',
        education: [],
        certifications: [],
        workExperience: []
      });
    }
  }, [staff, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (mode === 'add') {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.role) newErrors.role = 'Role is required';
    
    // Role-specific validation
    if (formData.role === 'Doctor' && !formData.specialization) {
      newErrors.specialization = 'Specialization is required for doctors';
    }
    
    // Show toast notifications for validation errors
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n');
      toast.error(errorMessages);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', university: '', completionYear: '' }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAddCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', date: '', expiry: '' }]
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      certifications: updatedCertifications
    }));
  };

  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { 
        organization: '', 
        position: '', 
        startDate: '', 
        endDate: '', 
        description: '' 
      }]
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.workExperience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      workExperience: updatedExperience
    }));
  };

  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Format dates for certifications and work experience
      const formattedCertifications = formData.certifications.map(cert => ({
        ...cert,
        date: cert.date ? new Date(cert.date).toISOString() : null,
        expiry: cert.expiry ? new Date(cert.expiry).toISOString() : null
      }));
      
      const formattedWorkExperience = formData.workExperience.map(exp => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null
      }));
      
      // Remove confirmPassword before submitting and update with formatted data
      const { confirmPassword, ...submitData } = {
        ...formData,
        certifications: formattedCertifications,
        workExperience: formattedWorkExperience
      };
      
      await onSubmit(submitData);
      toast.success(`Staff ${mode === 'add' ? 'added' : 'updated'} successfully`);
      onClose();
    } catch (error) {
      console.error('Error submitting staff data:', error);
      toast.error(error.message || 'Failed to save staff data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FaUser /> },
    { id: 'professional', label: 'Professional', icon: <FaUserMd /> }
  ];

  // Handle tab change with prevention of form submission
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={mode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
      size="lg"
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        
        <form onSubmit={handleSubmit}>
          {/* Form errors are now shown as toast notifications */}
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" /> Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-2" /> Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-2" /> Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>

              {mode === 'add' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" /> Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" /> Confirm Password*
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2" /> Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter emergency contact"
                />
              </div>
              
              {mode === 'add' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" /> Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password"
                    />
                    
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaLock className="inline mr-2" /> Confirm Password*
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm password"
                    />
                    
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUserTag className="inline mr-2" /> Role*
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUserMd className="inline mr-2" /> Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter specialization"
                />
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaBuilding className="inline mr-2" /> Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-2" /> Joined Date
                </label>
                <input
                  type="date"
                  name="joinedDate"
                  value={formData.joinedDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Qualifications Tab */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Education History
                </label>
                <Button 
                  type="button" 
                  onClick={handleAddEducation}
                  variant="outline"
                  size="sm"
                >
                  Add Education
                </Button>
              </div>
              
              {formData.education.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No education history added</p>
              ) : (
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Education #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Degree/Qualification
                          </label>
                          <select
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Degree</option>
                            <optgroup label="School Education">
                              <option value="10th">10th Standard</option>
                              <option value="12th">12th Standard</option>
                            </optgroup>
                            <optgroup label="Medical Degrees">
                              <option value="MBBS">MBBS - Bachelor of Medicine and Bachelor of Surgery</option>
                              <option value="MD">MD - Doctor of Medicine</option>
                              <option value="MS">MS - Master of Surgery</option>
                              <option value="BDS">BDS - Bachelor of Dental Surgery</option>
                              <option value="MDS">MDS - Master of Dental Surgery</option>
                              <option value="BAMS">BAMS - Bachelor of Ayurvedic Medicine and Surgery</option>
                              <option value="MD Ayurveda">MD Ayurveda</option>
                              <option value="BHMS">BHMS - Bachelor of Homeopathic Medicine and Surgery</option>
                              <option value="MD Homeopathy">MD Homeopathy</option>
                              <option value="BUMS">BUMS - Bachelor of Unani Medicine and Surgery</option>
                              <option value="MD Unani">MD Unani</option>
                              <option value="BNYS">BNYS - Bachelor of Naturopathy & Yogic Sciences</option>
                              <option value="DNB">DNB - Diplomate of National Board</option>
                            </optgroup>
                            <optgroup label="Nursing Degrees">
                              <option value="BSc Nursing">BSc Nursing - Bachelor of Science in Nursing</option>
                              <option value="MSc Nursing">MSc Nursing - Master of Science in Nursing</option>
                              <option value="GNM">GNM - General Nursing and Midwifery</option>
                              <option value="ANM">ANM - Auxiliary Nursing and Midwifery</option>
                              <option value="Post Basic BSc Nursing">Post Basic BSc Nursing</option>
                            </optgroup>
                            <optgroup label="Pharmacy Degrees">
                              <option value="D.Pharm">D.Pharm - Diploma in Pharmacy</option>
                              <option value="B.Pharm">B.Pharm - Bachelor of Pharmacy</option>
                              <option value="M.Pharm">M.Pharm - Master of Pharmacy</option>
                              <option value="Pharm.D">Pharm.D - Doctor of Pharmacy</option>
                            </optgroup>
                            <optgroup label="Allied Health Degrees">
                              <option value="BPT">BPT - Bachelor of Physiotherapy</option>
                              <option value="MPT">MPT - Master of Physiotherapy</option>
                              <option value="BOT">BOT - Bachelor of Occupational Therapy</option>
                              <option value="MOT">MOT - Master of Occupational Therapy</option>
                              <option value="BASLP">BASLP - Bachelor in Audiology & Speech Language Pathology</option>
                              <option value="MASLP">MASLP - Master in Audiology & Speech Language Pathology</option>
                              <option value="B.Optom">B.Optom - Bachelor of Optometry</option>
                              <option value="M.Optom">M.Optom - Master of Optometry</option>
                              <option value="BMLT">BMLT - Bachelor of Medical Laboratory Technology</option>
                              <option value="MMLT">MMLT - Master of Medical Laboratory Technology</option>
                              <option value="DMLT">DMLT - Diploma in Medical Laboratory Technology</option>
                              <option value="BRIT">BRIT - Bachelor of Radiation Imaging Technology</option>
                              <option value="MRIT">MRIT - Master of Radiation Imaging Technology</option>
                            </optgroup>
                            <optgroup label="General Degrees">
                              <option value="BA">BA - Bachelor of Arts</option>
                              <option value="BSc">BSc - Bachelor of Science</option>
                              <option value="BCom">BCom - Bachelor of Commerce</option>
                              <option value="BBA">BBA - Bachelor of Business Administration</option>
                              <option value="BCA">BCA - Bachelor of Computer Applications</option>
                              <option value="BTech">BTech - Bachelor of Technology</option>
                              <option value="BE">BE - Bachelor of Engineering</option>
                              <option value="MA">MA - Master of Arts</option>
                              <option value="MSc">MSc - Master of Science</option>
                              <option value="MCom">MCom - Master of Commerce</option>
                              <option value="MBA">MBA - Master of Business Administration</option>
                              <option value="MCA">MCA - Master of Computer Applications</option>
                              <option value="MTech">MTech - Master of Technology</option>
                              <option value="ME">ME - Master of Engineering</option>
                              <option value="PhD">PhD - Doctor of Philosophy</option>
                            </optgroup>
                            <optgroup label="Other">
                              <option value="Diploma">Diploma</option>
                              <option value="Certificate">Certificate Course</option>
                              <option value="Other">Other</option>
                            </optgroup>
                          </select>
                          {edu.degree === 'Other' && (
                            <input
                              type="text"
                              value={edu.otherDegree || ''}
                              onChange={(e) => handleEducationChange(index, 'otherDegree', e.target.value)}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Specify your degree"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Completion Year
                          </label>
                          <select
                            value={edu.completionYear}
                            onChange={(e) => handleEducationChange(index, 'completionYear', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Year</option>
                            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            University/Institution
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={edu.university || ''}
                              onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Start typing to search universities..."
                              list="universities-list"
                            />
                            <datalist id="universities-list">
                              <option value="All India Institute of Medical Sciences (AIIMS), New Delhi"></option>
                              <option value="Christian Medical College (CMC), Vellore"></option>
                              <option value="Armed Forces Medical College (AFMC), Pune"></option>
                              <option value="Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER), Puducherry"></option>
                              <option value="King George's Medical University (KGMU), Lucknow"></option>
                              <option value="Kasturba Medical College (KMC), Manipal"></option>
                              <option value="Maulana Azad Medical College (MAMC), New Delhi"></option>
                              <option value="Seth GS Medical College and KEM Hospital, Mumbai"></option>
                              <option value="Grant Medical College and Sir JJ Group of Hospitals, Mumbai"></option>
                              <option value="University College of Medical Sciences (UCMS), Delhi"></option>
                              <option value="Lady Hardinge Medical College (LHMC), New Delhi"></option>
                              <option value="Madras Medical College (MMC), Chennai"></option>
                              <option value="Stanley Medical College, Chennai"></option>
                              <option value="Government Medical College (GMC), Thiruvananthapuram"></option>
                              <option value="Bangalore Medical College and Research Institute (BMCRI), Bangalore"></option>
                              <option value="Osmania Medical College, Hyderabad"></option>
                              <option value="Gandhi Medical College, Hyderabad"></option>
                              <option value="Government Medical College, Kozhikode"></option>
                              <option value="Rajiv Gandhi University of Health Sciences, Karnataka"></option>
                              <option value="Maharashtra University of Health Sciences, Nashik"></option>
                              <option value="Tamil Nadu Dr. M.G.R. Medical University, Chennai"></option>
                              <option value="Kerala University of Health Sciences, Thrissur"></option>
                              <option value="West Bengal University of Health Sciences, Kolkata"></option>
                              <option value="Banaras Hindu University (BHU), Varanasi"></option>
                              <option value="Aligarh Muslim University (AMU), Aligarh"></option>
                              <option value="Delhi University, Delhi"></option>
                              <option value="Mumbai University, Mumbai"></option>
                              <option value="Calcutta University, Kolkata"></option>
                              <option value="Madras University, Chennai"></option>
                              <option value="Pune University, Pune"></option>
                              <option value="Osmania University, Hyderabad"></option>
                              <option value="Andhra University, Visakhapatnam"></option>
                              <option value="Bangalore University, Bangalore"></option>
                              <option value="Punjab University, Chandigarh"></option>
                              <option value="Gujarat University, Ahmedabad"></option>
                              <option value="Rajasthan University, Jaipur"></option>
                              <option value="Utkal University, Bhubaneswar"></option>
                              <option value="Gauhati University, Guwahati"></option>
                              <option value="Patna University, Patna"></option>
                              <option value="Lucknow University, Lucknow"></option>
                              <option value="Allahabad University, Prayagraj"></option>
                              <option value="Jamia Millia Islamia, New Delhi"></option>
                              <option value="Jawaharlal Nehru University (JNU), New Delhi"></option>
                              <option value="Indian Institute of Technology (IIT), Delhi"></option>
                              <option value="Indian Institute of Technology (IIT), Bombay"></option>
                              <option value="Indian Institute of Technology (IIT), Madras"></option>
                              <option value="Indian Institute of Technology (IIT), Kanpur"></option>
                              <option value="Indian Institute of Technology (IIT), Kharagpur"></option>
                              <option value="Indian Institute of Science (IISc), Bangalore"></option>
                              <option value="Other"></option>
                            </datalist>
                          </div>
                          {edu.university === 'Other' && (
                            <input
                              type="text"
                              value={edu.otherUniversity || ''}
                              onChange={(e) => handleEducationChange(index, 'otherUniversity', e.target.value)}
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter university/institution name"
                            />
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Additional Details (Optional)
                          </label>
                          <textarea
                            value={edu.additionalDetails || ''}
                            onChange={(e) => handleEducationChange(index, 'additionalDetails', e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional details like specialization, grades, achievements, etc."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Certifications & Licenses
                </label>
                <Button 
                  type="button" 
                  onClick={handleAddCertification}
                  variant="outline"
                  size="sm"
                >
                  Add Certification
                </Button>
              </div>
              
              {formData.certifications.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No certifications added</p>
              ) : (
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Certification #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Certification name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Issuer
                          </label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Issuing organization"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={cert.date}
                            onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={cert.expiry}
                            onChange={(e) => handleCertificationChange(index, 'expiry', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Work Experience
              </label>
              <Button 
                type="button" 
                onClick={handleAddExperience}
                variant="outline"
                size="sm"
              >
                Add Experience
              </Button>
            </div>
            
            {formData.workExperience.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No work experience added</p>
            ) : (
              <div className="space-y-3">
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Experience #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => handleExperienceChange(index, 'organization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Job position"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of responsibilities"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'add' ? 'Add Staff Member' : 'Update Staff Member'}
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  );
};

export default StaffModal;
