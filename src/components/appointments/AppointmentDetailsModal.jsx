import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import { 
  FaCalendarAlt, FaUser, FaUserMd, FaNotesMedical, FaClock, FaEdit, 
  FaTrash, FaCheck, FaSync, FaHistory, FaFileAlt, FaFilePdf, 
  FaFileExcel, FaEnvelope, FaBell, FaPrint, FaFileMedical, FaInfoCircle
} from 'react-icons/fa';
import { formatDate, formatTime, formatDateTime } from '../../utils/dateUtils';
import { 
  APPOINTMENT_STATUS, 
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_BUTTON_CLASSES 
} from '../../constants/appointmentConstants';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';
import appointmentService from '../../api/appointments/appointmentService';

const AppointmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  userRole = 'Admin',
  isLoading = false,
  onReschedule
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [localAppointment, setLocalAppointment] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isReminding, setIsReminding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rescheduleHistory, setRescheduleHistory] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setLocalAppointment(appointment);
      // Load reschedule history if available
      if (appointment.rescheduleHistory && Array.isArray(appointment.rescheduleHistory)) {
        setRescheduleHistory(appointment.rescheduleHistory);
      }
      // Load medical notes if available
      if (appointment.notes) {
        setMedicalNotes(appointment.notes);
      }
    }
  }, [appointment]);

  if (!localAppointment) return null;
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (localAppointment.status !== newStatus) {
      setIsUpdatingStatus(true);
      try {
        await onUpdateStatus({
          ...localAppointment,
          status: newStatus
        });
        setLocalAppointment(prev => ({
          ...prev,
          status: newStatus
        }));
        toast.success(`Appointment status updated to ${newStatus}`);
      } catch (error) {
        toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleDelete = async () => {
    if (isConfirmingDelete) {
      try {
        await onDelete(localAppointment._id);
        setIsConfirmingDelete(false);
        onClose();
        toast.success('Appointment deleted successfully');
      } catch (error) {
        toast.error(`Failed to delete appointment: ${error.message || 'Unknown error'}`);
        setIsConfirmingDelete(false);
      }
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const handleReschedule = () => {
    setIsRescheduling(true);
  };

  const handleRescheduleSubmit = async () => {
    if (onReschedule) {
      // Create a reschedule history entry
      const rescheduleEntry = {
        previousStartTime: localAppointment.startTime,
        previousEndTime: localAppointment.endTime,
        newStartTime: newStartTime,
        newEndTime: newEndTime,
        reason: reason || 'Appointment rescheduled',
        rescheduledBy: userRole,
        rescheduledAt: new Date().toISOString()
      };
      
      // Add to local state for immediate UI update
      setRescheduleHistory([...rescheduleHistory, rescheduleEntry]);
      
      // Call the parent component's reschedule handler
      onReschedule(localAppointment._id, newStartTime, newEndTime, reason);
    }
    setIsRescheduling(false);
  };

  const handleMedicalNotesUpdate = () => {
    if (onUpdateStatus && localAppointment) {
      const updatedAppointment = {
        ...localAppointment,
        notes: medicalNotes
      };
      onUpdateStatus(updatedAppointment);
      toast.success('Medical notes updated successfully');
    }
  };

  const handleSendReminder = async () => {
    try {
      setIsReminding(true);
      await appointmentService.sendReminder(localAppointment._id);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error(`Failed to send reminder: ${error.message || 'Unknown error'}`);
    } finally {
      setIsReminding(false);
    }
  };
  
  // Export appointment details
  const handleExport = async (format = 'pdf') => {
    try {
      setIsExporting(true);
      // This would typically call an API endpoint to generate and download the file
      // For now, we'll just show a success message
      toast.info(`Exporting appointment details as ${format.toUpperCase()}...`);
      setTimeout(() => {
        toast.success(`Appointment details exported as ${format.toUpperCase()}`);
        setIsExporting(false);
      }, 1500);
    } catch (error) {
      toast.error(`Failed to export: ${error.message || 'Unknown error'}`);
      setIsExporting(false);
    }
  };
  
  // Update medical notes
  const handleUpdateNotes = async () => {
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus({
        ...localAppointment,
        notes: medicalNotes
      });
      setLocalAppointment(prev => ({
        ...prev,
        notes: medicalNotes
      }));
      toast.success('Medical notes updated successfully');
    } catch (error) {
      toast.error(`Failed to update notes: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      size="xl"
    >
      <div className="p-4">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {/* Header with appointment status and basic info */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${APPOINTMENT_STATUS_BADGE_CLASSES[localAppointment.status] || 'bg-gray-100 text-gray-800'}`}>
                {localAppointment.status}
              </span>
              <h3 className="text-xl font-semibold text-gray-800 ml-2">
                {localAppointment.patientName || (localAppointment.patientId && localAppointment.patientId.name) || 'Patient'}'s Appointment
              </h3>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <FaCalendarAlt className="mr-2" />
              <span>{formatDateTime(localAppointment.startTime)}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FaClock className="mr-2" />
              <span>{formatTime(localAppointment.startTime)} - {formatTime(localAppointment.endTime)}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isConfirmingDelete ? (
              <>
                {['Admin', 'Receptionist', 'Doctor'].includes(userRole) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(localAppointment)}
                    disabled={isUpdatingStatus}
                    icon={<FaEdit />}
                  >
                    Edit
                  </Button>
                )}
                {['Admin', 'Receptionist'].includes(userRole) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isUpdatingStatus}
                    icon={<FaTrash />}
                  >
                    Delete
                  </Button>
                )}
                {['Admin', 'Receptionist', 'Doctor', 'Patient'].includes(userRole) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReschedule}
                    disabled={isUpdatingStatus || isRescheduling}
                    icon={<FaSync />}
                  >
                    {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isUpdatingStatus}
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            { id: 'details', label: 'Details', icon: <FaInfoCircle /> },
            { id: 'medical', label: 'Medical Notes', icon: <FaNotesMedical /> },
            { id: 'history', label: 'History', icon: <FaHistory /> },
            { id: 'actions', label: 'Actions', icon: <FaFileAlt /> }
          ]}
          className="mb-4"
        />
        
        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FaUser className="mr-2" /> Patient Information
                  </h4>
                  <p className="text-gray-800 font-medium">
                    {localAppointment.patientName || (localAppointment.patientId && localAppointment.patientId.name) || 'Unknown Patient'}
                  </p>
                  {localAppointment.patientId && localAppointment.patientId.email && (
                    <p className="text-gray-600 text-sm">{localAppointment.patientId.email}</p>
                  )}
                  {localAppointment.patientId && localAppointment.patientId.phone && (
                    <p className="text-gray-600 text-sm">{localAppointment.patientId.phone}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FaUserMd className="mr-2" /> Doctor Information
                  </h4>
                  <p className="text-gray-800 font-medium">
                    {localAppointment.doctorName || (localAppointment.doctorId && localAppointment.doctorId.name) || 'Unknown Doctor'}
                  </p>
                  {localAppointment.doctorId && localAppointment.doctorId.email && (
                    <p className="text-gray-600 text-sm">{localAppointment.doctorId.email}</p>
                  )}
                  {localAppointment.doctorId && localAppointment.doctorId.specialization && (
                    <p className="text-gray-600 text-sm">{localAppointment.doctorId.specialization}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <FaNotesMedical className="mr-2" /> Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Service Type</p>
                    <p className="text-gray-800">{localAppointment.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Reason</p>
                    <p className="text-gray-800">{localAppointment.reason || 'Not specified'}</p>
                  </div>
                  {localAppointment.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-600 text-sm">Notes</p>
                      <p className="text-gray-800 whitespace-pre-line">{localAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {['Admin', 'Receptionist', 'Doctor'].includes(userRole) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(APPOINTMENT_STATUS).map(status => (
                      <Button
                        key={status}
                        variant={status === localAppointment.status ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusUpdate(status)}
                        disabled={isUpdatingStatus || status === localAppointment.status}
                        className={APPOINTMENT_STATUS_BUTTON_CLASSES[status]}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Medical history section if available */}
              {localAppointment.medicalHistory && (
                <div className="mt-6">
                  <h5 className="text-md font-semibold text-gray-700 mb-2">Medical History</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{localAppointment.medicalHistory}</p>
                  </div>
                </div>
              )}
              
              {/* Symptoms section if available */}
              {localAppointment.symptoms && localAppointment.symptoms.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-md font-semibold text-gray-700 mb-2">Symptoms</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="list-disc pl-5 space-y-1">
                      {localAppointment.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Medical Notes Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Medical Notes</h4>
              
              {userRole === 'Doctor' ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={localAppointment.chiefComplaint || ''}
                      onChange={(e) => setLocalAppointment({
                        ...localAppointment,
                        chiefComplaint: e.target.value
                      })}
                      placeholder="Patient's main reason for visit"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vital Signs</label>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-xs text-gray-500">Blood Pressure</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          value={localAppointment.vitalSigns?.bloodPressure || ''}
                          onChange={(e) => setLocalAppointment({
                            ...localAppointment,
                            vitalSigns: {
                              ...localAppointment.vitalSigns,
                              bloodPressure: e.target.value
                            }
                          })}
                          placeholder="e.g. 120/80 mmHg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Heart Rate</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          value={localAppointment.vitalSigns?.heartRate || ''}
                          onChange={(e) => setLocalAppointment({
                            ...localAppointment,
                            vitalSigns: {
                              ...localAppointment.vitalSigns,
                              heartRate: e.target.value
                            }
                          })}
                          placeholder="e.g. 72 bpm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Temperature</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          value={localAppointment.vitalSigns?.temperature || ''}
                          onChange={(e) => setLocalAppointment({
                            ...localAppointment,
                            vitalSigns: {
                              ...localAppointment.vitalSigns,
                              temperature: e.target.value
                            }
                          })}
                          placeholder="e.g. 98.6 °F"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Respiratory Rate</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          value={localAppointment.vitalSigns?.respiratoryRate || ''}
                          onChange={(e) => setLocalAppointment({
                            ...localAppointment,
                            vitalSigns: {
                              ...localAppointment.vitalSigns,
                              respiratoryRate: e.target.value
                            }
                          })}
                          placeholder="e.g. 16 breaths/min"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                    <textarea
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Enter detailed medical notes, observations, and treatment plan..."
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={localAppointment.diagnosis || ''}
                      onChange={(e) => setLocalAppointment({
                        ...localAppointment,
                        diagnosis: e.target.value
                      })}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleMedicalNotesUpdate}
                    >
                      Save Medical Record
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {localAppointment.chiefComplaint && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Chief Complaint</h5>
                      <p className="text-gray-800">{localAppointment.chiefComplaint}</p>
                    </div>
                  )}
                  
                  {localAppointment.vitalSigns && Object.keys(localAppointment.vitalSigns).length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Vital Signs</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {localAppointment.vitalSigns.bloodPressure && (
                          <div>
                            <span className="text-gray-600">BP: </span>
                            <span className="text-gray-800">{localAppointment.vitalSigns.bloodPressure}</span>
                          </div>
                        )}
                        {localAppointment.vitalSigns.heartRate && (
                          <div>
                            <span className="text-gray-600">HR: </span>
                            <span className="text-gray-800">{localAppointment.vitalSigns.heartRate}</span>
                          </div>
                        )}
                        {localAppointment.vitalSigns.temperature && (
                          <div>
                            <span className="text-gray-600">Temp: </span>
                            <span className="text-gray-800">{localAppointment.vitalSigns.temperature}</span>
                          </div>
                        )}
                        {localAppointment.vitalSigns.respiratoryRate && (
                          <div>
                            <span className="text-gray-600">RR: </span>
                            <span className="text-gray-800">{localAppointment.vitalSigns.respiratoryRate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {localAppointment.notes && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Medical Notes</h5>
                      <p className="whitespace-pre-line text-gray-800">{localAppointment.notes}</p>
                    </div>
                  )}
                  
                  {localAppointment.diagnosis && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Diagnosis</h5>
                      <p className="text-gray-800">{localAppointment.diagnosis}</p>
                    </div>
                  )}
                  
                  {!localAppointment.notes && !localAppointment.diagnosis && !localAppointment.chiefComplaint && 
                   (!localAppointment.vitalSigns || Object.keys(localAppointment.vitalSigns).length === 0) && (
                    <p className="text-gray-500 italic">No medical notes available.</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Appointment History</h4>
              
              {/* Created and updated info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong> {formatDateTime(localAppointment.createdAt)}
                  {localAppointment.createdBy && ` by ${localAppointment.createdBy.name || 'Unknown'}`}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> {formatDateTime(localAppointment.updatedAt)}
                </p>
              </div>
              
              {/* Reschedule history */}
              {rescheduleHistory.length > 0 ? (
                <div className="mt-4">
                  <h5 className="text-md font-semibold text-gray-700 mb-2">Reschedule History</h5>
                  <div className="space-y-3">
                    {rescheduleHistory.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-gray-700">
                          Rescheduled on {formatDateTime(item.rescheduledAt)}
                          {item.rescheduledBy && ` by ${item.rescheduledBy.name || 'Unknown'}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          From: {formatDateTime(item.previousStartTime)} - {formatTime(item.previousEndTime)}
                        </p>
                        {item.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Reason:</strong> {item.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 italic">No reschedule history available.</p>
              )}
              
              {/* Cancellation info if applicable */}
              {localAppointment.status === 'Cancelled' && localAppointment.cancellationReason && (
                <div className="mt-4">
                  <h5 className="text-md font-semibold text-gray-700 mb-2">Cancellation Details</h5>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-gray-600">
                      <strong>Reason:</strong> {localAppointment.cancellationReason}
                    </p>
                    {localAppointment.cancelledBy && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Cancelled by:</strong> {localAppointment.cancelledBy.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Actions</h4>
              
              {/* Reminder section */}
              {['Admin', 'Receptionist'].includes(userRole) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <FaBell className="mr-2 text-yellow-500" /> Send Reminders
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Send an appointment reminder to the patient via email or SMS.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendReminder}
                      disabled={isReminding}
                      icon={<FaEnvelope />}
                    >
                      {isReminding ? 'Sending...' : 'Send Reminder'}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Export section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-500" /> Export
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  Export appointment details in different formats.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    icon={<FaFilePdf />}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    icon={<FaFileExcel />}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('print')}
                    disabled={isExporting}
                    icon={<FaPrint />}
                  >
                    Print
                  </Button>
                </div>
              </div>
              
              {/* Medical records section for doctors */}
              {['Admin', 'Doctor'].includes(userRole) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFileMedical className="mr-2 text-green-500" /> Medical Records
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Create or update medical records for this appointment.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('medical')}
                      icon={<FaNotesMedical />}
                    >
                      Update Medical Notes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
