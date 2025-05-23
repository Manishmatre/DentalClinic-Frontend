import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaUserMd,
  FaBuilding,
  FaGraduationCap,
  FaBriefcase,
  FaCertificate,
  FaUserTag,
  FaEdit,
  FaPrint,
  FaFilePdf,
  FaStethoscope
} from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';

const StaffDetailsModal = ({ isOpen, onClose, staff, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!staff) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    onClose();
    onEdit(staff);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Export to PDF');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'professional', label: 'Professional', icon: <FaUserMd /> },
    { id: 'qualifications', label: 'Qualifications', icon: <FaGraduationCap /> },
    { id: 'experience', label: 'Experience', icon: <FaBriefcase /> },
    { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt /> }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{staff.name} <span className="text-sm font-normal text-gray-500">({staff.role})</span></h3>
            
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleEdit}
                icon={<FaEdit />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                icon={<FaPrint />}
                className="text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                icon={<FaFilePdf />}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Export PDF
              </Button>
            </div>
          </div>
          
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="border-b border-gray-200" />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Staff Profile Card */}
              <div className="md:col-span-1">
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white text-center">
                    <div className="mx-auto w-24 h-24 bg-white rounded-full p-1 mb-3">
                      <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-3xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{staff.name}</h3>
                    <p className="text-blue-100">{staff.role}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-center mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        staff.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        staff.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {staff.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaIdCard className="text-blue-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">ID Number</p>
                          <p className="font-medium">{staff.idNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-blue-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Joined Date</p>
                          <p className="font-medium">{formatDate(staff.joinedDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="md:col-span-2">
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                        <FaEnvelope className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{staff.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                        <FaPhone className="text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-600">{staff.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-red-100 p-2 rounded-md">
                        <FaMapMarkerAlt className="text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-600">
                          {staff.address ? (
                            <>
                              {staff.address.street}, {staff.address.city},<br />
                              {staff.address.state} {staff.address.zipCode},<br />
                              {staff.address.country}
                            </>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-purple-100 p-2 rounded-md">
                        <FaUserMd className="text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Specialization</p>
                        <p className="text-sm text-gray-600">{staff.specialization || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-md">
                        <FaBuilding className="text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Department</p>
                        <p className="text-sm text-gray-600">{staff.department || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Emergency Contact</h3>
              </div>
              <div className="p-4">
                {staff.emergencyContact ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-orange-100 p-2 rounded-md">
                        <FaUser className="text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">{staff.emergencyContact.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-orange-100 p-2 rounded-md">
                        <FaPhone className="text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{staff.emergencyContact.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-orange-100 p-2 rounded-md">
                        <FaUserTag className="text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Relationship</p>
                        <p className="font-medium">{staff.emergencyContact.relationship || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No emergency contact information provided</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-white">
                <h3 className="text-lg font-semibold">Professional Information</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                      <FaUserTag className="text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium text-gray-500">Role</p>
                      <p className="text-lg font-semibold text-gray-800">{staff.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <FaUserMd className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium text-gray-500">Specialization</p>
                      <p className="text-lg font-semibold text-gray-800">{staff.specialization || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                      <FaBuilding className="text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-medium text-gray-500">Department</p>
                      <p className="text-lg font-semibold text-gray-800">{staff.department || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm mt-4">
                  <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full">
                    <FaCalendarAlt className="text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-gray-500">Joined Date</p>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(staff.joinedDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {staff.role === 'Doctor' && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mt-6">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 text-white">
                  <h3 className="text-lg font-semibold">Doctor Information</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full">
                        <FaUserMd className="text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs font-medium text-gray-500">Specialization</p>
                        <p className="text-lg font-semibold text-gray-800">{staff.specialization || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                        <FaStethoscope className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs font-medium text-gray-500">License Number</p>
                        <p className="text-lg font-semibold text-gray-800">{staff.licenseNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {/* Additional doctor-specific information can be added here */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Qualifications Tab */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Education</h3>
              {Array.isArray(staff.education) && staff.education.length > 0 ? (
                <div className="space-y-3">
                  {staff.education.map((edu, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center mb-2">
                        <FaGraduationCap className="text-blue-500 mr-2" />
                        <h4 className="font-medium">{edu.degree}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Degree/Qualification</p>
                          <p className="text-gray-600">{edu.degree || 'Not specified'}</p>
                          {edu.otherDegree && <p className="text-gray-600">{edu.otherDegree}</p>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">University/Institution</p>
                          <p className="text-gray-600">{edu.university || 'Not specified'}</p>
                          {edu.otherUniversity && <p className="text-gray-600">{edu.otherUniversity}</p>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Completion Year</p>
                          <p className="text-gray-600">{edu.completionYear || 'Not specified'}</p>
                        </div>
                        {edu.additionalDetails && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700">Additional Details</p>
                            <p className="text-gray-600">{edu.additionalDetails}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No education information provided.</p>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Certifications & Licenses</h3>
              {staff.certifications && staff.certifications.length > 0 ? (
                <div className="space-y-3">
                  {staff.certifications.map((cert, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center mb-2">
                        <FaCertificate className="text-blue-500 mr-2" />
                        <h4 className="font-medium">{cert.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Issuer</p>
                          <p className="text-gray-600">{cert.issuer || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Issue Date</p>
                          <p className="text-gray-600">{formatDate(cert.date)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Expiry Date</p>
                          <p className="text-gray-600">{formatDate(cert.expiry) || 'No expiry'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No certifications added</p>
              )}
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Work Experience</h3>
              {staff.workExperience && staff.workExperience.length > 0 ? (
                <div className="space-y-4">
                  {staff.workExperience.map((exp, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center mb-2">
                        <FaBriefcase className="text-blue-500 mr-2" />
                        <h4 className="font-medium">{exp.position} at {exp.organization}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <p className="font-medium text-gray-700">Organization</p>
                          <p className="text-gray-600">{exp.organization}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Position</p>
                          <p className="text-gray-600">{exp.position}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Start Date</p>
                          <p className="text-gray-600">{formatDate(exp.startDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">End Date</p>
                          <p className="text-gray-600">{formatDate(exp.endDate) || 'Present'}</p>
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-2">
                          <p className="font-medium text-gray-700 text-sm">Description</p>
                          <p className="text-sm text-gray-600">{exp.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No work experience added</p>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Work Schedule</h3>
              <p className="text-sm text-gray-500 italic">
                Schedule information not available. This feature will be implemented in a future update.
              </p>
              {/* Schedule implementation will go here */}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default StaffDetailsModal;
