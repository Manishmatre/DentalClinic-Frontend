import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaVenusMars, 
  FaMapMarkerAlt, 
  FaNotesMedical, 
  FaIdCard,
  FaTimes,
  FaEdit,
  FaFilePdf,
  FaHistory,
  FaClipboardList,
  FaUserInjured,
  FaHeartbeat,
  FaStethoscope,
  FaPrint,
  FaFileInvoiceDollar,
  FaCalendarCheck
} from 'react-icons/fa';
import Button from '../ui/Button';

const PatientDetailsModal = ({ isOpen, onClose, patient, onEdit }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('patientDetailsModalActiveTab') || 'overview';
  });
  
  // If modal is not open or no patient, don't render anything
  if (!isOpen || !patient) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate age from date of birth
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

  React.useEffect(() => {
    localStorage.setItem('patientDetailsModalActiveTab', activeTab);
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full" style={{ position: 'relative', zIndex: 10000 }}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FaUserInjured className="mr-2 text-blue-600" /> Patient Details
              </h3>
              <div className="flex items-center">
                <button
                  onClick={() => window.print()}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                  title="Print Patient Details"
                >
                  <FaPrint className="h-5 w-5" />
                </button>
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(patient);
                      onClose();
                    }}
                    className="mr-3 text-blue-600 hover:text-blue-800"
                    title="Edit Patient"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Patient Header */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mr-4 mb-4 md:mb-0">
                  <span className="text-3xl font-semibold text-blue-600">
                    {patient.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                  <div className="flex flex-wrap items-center mt-1">
                    <span className="flex items-center text-sm text-gray-600 mr-4">
                      <FaIdCard className="mr-1" /> ID: {patient.patientId || patient._id?.substring(0, 8)}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 mr-4">
                      <FaVenusMars className="mr-1" /> {patient.gender || 'Not specified'}
                    </span>
                    <span className="flex items-center text-sm text-gray-600 mr-4">
                      <FaCalendarAlt className="mr-1" /> {calculateAge(patient.dateOfBirth)} years
                    </span>
                    <span className="flex items-center text-sm text-gray-600">
                      <FaNotesMedical className="mr-1" /> {patient.bloodGroup || 'Blood group not specified'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {patient.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b mt-6 overflow-x-auto">
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaUser className="inline mr-1" /> Overview
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'medical' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('medical')}
              >
                <FaHeartbeat className="inline mr-1" /> Medical Info
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'appointments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('appointments')}
              >
                <FaCalendarCheck className="inline mr-1" /> Appointments
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'billing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('billing')}
              >
                <FaFileInvoiceDollar className="inline mr-1" /> Billing
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('documents')}
              >
                <FaFilePdf className="inline mr-1" /> Documents
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaUser className="mr-2 text-blue-600" /> Personal Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="text-sm font-medium">{patient.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="text-sm font-medium">{formatDate(patient.dateOfBirth)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm font-medium">{patient.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Patient ID</p>
                          <p className="text-sm font-medium">{patient.patientId || patient._id?.substring(0, 8)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaPhone className="mr-2 text-blue-600" /> Contact Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{patient.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{patient.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium">
                          {patient.address ? (
                            <>
                              {patient.address}
                              {(patient.city || patient.state || patient.zipCode) && (
                                <span>
                                  <br />
                                  {[
                                    patient.city,
                                    patient.state,
                                    patient.zipCode
                                  ].filter(Boolean).join(', ')}
                                </span>
                              )}
                              {patient.country && <span><br />{patient.country}</span>}
                            </>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaPhone className="mr-2 text-blue-600" /> Emergency Contact
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {patient.emergencyContact && (
                        patient.emergencyContact.name || patient.emergencyContact.phone || patient.emergencyContact.relationship
                      ) ? (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium">{patient.emergencyContact.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Relationship</p>
                            <p className="text-sm font-medium">{patient.emergencyContact.relationship || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium">{patient.emergencyContact.phone || 'Not provided'}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No emergency contact information provided</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaIdCard className="mr-2 text-blue-600" /> Insurance Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {patient.insuranceInfo && (
                        patient.insuranceInfo.provider || patient.insuranceInfo.policyNumber || patient.insuranceInfo.groupNumber
                      ) ? (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Provider</p>
                            <p className="text-sm font-medium">{patient.insuranceInfo.provider || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Policy Number</p>
                            <p className="text-sm font-medium">{patient.insuranceInfo.policyNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Group Number</p>
                            <p className="text-sm font-medium">{patient.insuranceInfo.groupNumber || 'Not provided'}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No insurance information provided</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Info Tab */}
              {activeTab === 'medical' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaNotesMedical className="mr-2 text-blue-600" /> Medical Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Blood Group</p>
                        <p className="text-sm">{patient.bloodGroup || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Allergies</p>
                        <p className="text-sm">{patient.allergies || 'None reported'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Medical History</p>
                        <p className="text-sm whitespace-pre-line">{patient.medicalHistory || 'No medical history recorded'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder for medical records - would be populated from API in a real implementation */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <FaClipboardList className="mr-2 text-blue-600" /> Medical Records
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-500 text-center py-8">No medical records available</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700 flex items-center">
                      <FaCalendarCheck className="mr-2 text-blue-600" /> Appointment History
                    </h3>
                    <Button variant="primary" className="text-sm px-3 py-1">
                      Schedule New Appointment
                    </Button>
                  </div>
                  <div className="p-4">
                    {/* This would be populated from API in a real implementation */}
                    <p className="text-sm text-gray-500 text-center py-8">No appointment history available</p>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700 flex items-center">
                      <FaFileInvoiceDollar className="mr-2 text-blue-600" /> Billing History
                    </h3>
                    <Button variant="primary" className="text-sm px-3 py-1">
                      Create New Invoice
                    </Button>
                  </div>
                  <div className="p-4">
                    {/* This would be populated from API in a real implementation */}
                    <p className="text-sm text-gray-500 text-center py-8">No billing history available</p>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700 flex items-center">
                      <FaFilePdf className="mr-2 text-blue-600" /> Patient Documents
                    </h3>
                    <Button variant="primary" className="text-sm px-3 py-1">
                      Upload Document
                    </Button>
                  </div>
                  <div className="p-4">
                    {/* This would be populated from API in a real implementation */}
                    <p className="text-sm text-gray-500 text-center py-8">No documents available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
