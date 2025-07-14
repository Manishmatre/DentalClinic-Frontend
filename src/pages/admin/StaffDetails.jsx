import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  FaStethoscope,
  FaArrowLeft,
  FaSave,
  FaUserCog,
  FaUserTie,
  FaUserNurse,
  FaAddressCard,
  FaInfoCircle,
  FaHistory,
  FaUserFriends,
  FaFileContract,
  FaFileAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Tabs from '../../components/ui/Tabs';
import { useAuth } from '../../context/AuthContext';
import staffService from '../../api/staff/staffService';

const StaffDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'professional', label: 'Professional', icon: <FaUserMd /> },
    { id: 'qualifications', label: 'Qualifications', icon: <FaGraduationCap /> },
    { id: 'experience', label: 'Experience', icon: <FaBriefcase /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
    { id: 'activity', label: 'Activity', icon: <FaHistory /> }
  ];

  // Fetch staff data when component mounts
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError('Staff ID is required');
          setLoading(false);
          return;
        }
        
        console.log(`Fetching staff details for ID: ${id}`);
        const response = await staffService.getStaffById(id);
        
        // Handle different response formats
        const staffData = response.data || response;
        console.log('Staff data received:', staffData);
        console.log('Raw profile image data from backend:', staffData.profileImage);
        
        // Process and normalize staff data
        const processedData = {
          ...staffData,
          // Ensure employee ID is in the correct format
          employeeId: staffData.employeeId?.startsWith('EMP') 
            ? staffData.employeeId 
            : `EMP${(staffData._id?.toString().replace(/\D/g, '').slice(-3) || new Date().getTime().toString().slice(-3)).padStart(3, '0')}`,
          
          // Process gender - ensure it's properly formatted
          gender: staffData.gender 
            ? staffData.gender.charAt(0).toUpperCase() + staffData.gender.slice(1).toLowerCase() 
            : null,
            
          // Process date of birth
          dateOfBirth: staffData.dateOfBirth || null,
          
          // Process joining date
          joiningDate: staffData.joiningDate || staffData.joinedDate || null,
          
          // Process specialization and department
          specialization: staffData.specialization || null,
          department: staffData.department || null,
          
          // Process profile image data
          profileImage: staffData.profileImage || { url: '', publicId: '' }
        };
        
        console.log('Processed staff data:', processedData);
        setStaff(processedData);
      } catch (err) {
        console.error('Error fetching staff details:', err);
        setError(err.message || 'Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaffData();
  }, [id]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle edit staff
  const handleEdit = () => {
    // Navigate to the edit staff page with the ID as a route parameter
    navigate(`/admin/staff/${id}/edit`);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    // Implement PDF export functionality
    toast.info('PDF export functionality coming soon');
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/staff-management');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="primary"
          onClick={handleBack}
          className="flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Staff Management
        </Button>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-6">
        <Alert type="error" className="mb-4">
          Staff not found
        </Alert>
        <Button
          variant="primary"
          onClick={handleBack}
          className="flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Staff Management
        </Button>
      </div>
    );
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return <FaUserMd className="text-blue-600" />;
      case 'admin':
        return <FaUserTie className="text-purple-600" />;
      case 'receptionist':
        return <FaUserNurse className="text-green-600" />;
      default:
        return <FaUserCog className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Staff Details</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={handleEdit}
            className="flex items-center"
          >
            <FaEdit className="mr-2" /> Edit
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center"
          >
            <FaFilePdf className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Staff Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start p-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
            {console.log('Profile image data in render:', staff.profileImage)}
            {staff.profileImage && staff.profileImage.url && staff.profileImage.url.trim() !== '' ? (
              <>
                {console.log('Displaying profile image with URL:', staff.profileImage.url)}
                <img 
                  src={staff.profileImage.url} 
                  alt={staff.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error loading profile image:', e);
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.style.display = 'none';
                    // Show the default icon when image fails to load
                    e.target.parentNode.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" class="text-gray-400 text-5xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>';
                  }}
                />
              </>
            ) : (
              <>
                {console.log('No profile image URL found, showing default icon')}
                <FaUser className="text-gray-400 text-5xl" />
              </>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800 mr-2">{staff.name}</h2>
              <div className="flex items-center justify-center md:justify-start mt-2 md:mt-0">
                <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${
                  staff.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  staff.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {staff.status === 'Active' ? <FaCheckCircle className="mr-1" /> : <FaExclamationTriangle className="mr-1" />}
                  {staff.status}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-4">
              <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0 md:mr-4">
                {getRoleIcon(staff.role)}
                <span className="ml-1 capitalize">{staff.role}</span>
              </div>
              
              {staff.specialization && (
                <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0 md:mr-4">
                  <FaStethoscope className="text-teal-600 mr-1" />
                  <span>{staff.specialization}</span>
                </div>
              )}
              
              <div className="flex items-center justify-center md:justify-start">
                <FaIdCard className="text-indigo-600 mr-1" />
                <span>ID: {staff.employeeId || `EMP${staff._id?.toString().slice(-3).padStart(3, '0')}` || 'Not Assigned'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center md:justify-start">
                <FaEnvelope className="text-blue-500 mr-2" />
                <span>{staff.email}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <FaPhone className="text-green-500 mr-2" />
                <span>{staff.phone || 'No phone number'}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <FaCalendarAlt className="text-orange-500 mr-2" />
                <span>Joined: {formatDate(staff.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Card className="mb-6 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="border-b border-gray-200" />
        
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaInfoCircle className="mr-2 text-blue-500" /> Personal Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="font-medium">{staff.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="font-medium">{staff.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="font-medium">{staff.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{staff.gender || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="font-medium">{staff.dateOfBirth ? formatDate(staff.dateOfBirth) : 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID Number</p>
                        <p className="font-medium">{staff.idNumber || staff.employeeId || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaAddressCard className="mr-2 text-green-500" /> Contact Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="font-medium">
                          {staff.address ? (
                            typeof staff.address === 'string' ? staff.address : (
                              <>
                                {staff.address.street}, {staff.address.city},<br />
                                {staff.address.state} {staff.address.zipCode}
                              </>
                            )
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                        <p className="font-medium">
                          {staff.emergencyContact ? (
                            typeof staff.emergencyContact === 'string' ? staff.emergencyContact : (
                              <>
                                {staff.emergencyContact.name} ({staff.emergencyContact.relationship})<br />
                                {staff.emergencyContact.phone}
                              </>
                            )
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role & Department */}
              <div>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaUserTag className="mr-2 text-blue-500" /> Role & Department
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <div className="flex items-center mt-1">
                          {getRoleIcon(staff.role)}
                          <p className="font-medium ml-2 capitalize">{staff.role}</p>
                        </div>
                      </div>
                      
                      {staff.specialization && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Specialization</p>
                          <p className="font-medium">{staff.specialization}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="font-medium">{staff.department || 'General'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className="mt-1">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center ${
                            staff.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            staff.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {staff.status === 'Active' ? <FaCheckCircle className="mr-1" /> : <FaExclamationTriangle className="mr-1" />}
                            {staff.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Employment Details */}
              <div>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaFileContract className="mr-2 text-purple-500" /> Employment Details
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Employee ID</p>
                        <p className="font-medium">{staff.employeeId || 'Not assigned'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Joining Date</p>
                        <p className="font-medium">{formatDate(staff.joinedDate)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Experience</p>
                        <p className="font-medium">{staff.experience ? `${staff.experience} years` : 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Qualification</p>
                        <p className="font-medium">{staff.qualification || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Qualifications Tab */}
          {activeTab === 'qualifications' && (
            <div className="space-y-6">
              {/* Education */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-500" /> Education
                  </h3>
                </div>
                <div className="p-4">
                  {staff.education && staff.education.length > 0 ? (
                    <div className="space-y-4">
                      {staff.education.map((edu, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-gray-600">{edu.university}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {edu.completionYear}
                              </span>
                            </div>
                          </div>
                          {edu.additionalDetails && (
                            <p className="mt-2 text-sm text-gray-500">{edu.additionalDetails}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No education records available</p>
                  )}
                </div>
              </div>
              
              {/* Certifications */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaCertificate className="mr-2 text-yellow-500" /> Certifications
                  </h3>
                </div>
                <div className="p-4">
                  {staff.certifications && staff.certifications.length > 0 ? (
                    <div className="space-y-4">
                      {staff.certifications.map((cert, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                              <h4 className="font-semibold">{cert.name}</h4>
                              <p className="text-gray-600">{cert.issuer}</p>
                            </div>
                            <div className="mt-2 md:mt-0 flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-2">
                              {cert.date && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Issued: {formatDate(cert.date)}
                                </span>
                              )}
                              {cert.expiry && (
                                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  Expires: {formatDate(cert.expiry)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No certification records available</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaBriefcase className="mr-2 text-indigo-500" /> Work Experience
                </h3>
              </div>
              <div className="p-4">
                {staff.workExperience && staff.workExperience.length > 0 ? (
                  <div className="space-y-6">
                    {staff.workExperience.map((exp, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.position}</h4>
                            <p className="text-gray-700">{exp.organization}</p>
                          </div>
                          <div className="mt-2 md:mt-0 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-sm">
                            {exp.startDate ? formatDate(exp.startDate) : 'N/A'} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-600 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No work experience records available</p>
                )}
              </div>
            </div>
          )}
          
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-500" /> Documents
                </h3>
              </div>
              <div className="p-4">
                <p className="text-gray-500 italic">No documents available</p>
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                  <p className="flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Document management for staff will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaHistory className="mr-2 text-purple-500" /> Activity History
                </h3>
              </div>
              <div className="p-4">
                <p className="text-gray-500 italic">No activity records available</p>
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                  <p className="flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Staff activity tracking will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StaffDetails;
