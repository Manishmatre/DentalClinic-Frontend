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
import serviceService from '../../api/services/serviceService';
import treatmentService from '../../api/treatments';
import { useAuth } from '../../hooks/useAuth';

const AppointmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onEdit, 
  onDelete, 
  onUpdateStatus = () => {}, 
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
  const [serviceName, setServiceName] = useState('');
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceMap, setServiceMap] = useState({});
  const [treatmentMap, setTreatmentMap] = useState({});
  const { clinic, user } = useAuth();

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

  useEffect(() => {
    // Fetch all treatments for the current clinic and build a map of ID to name
    const fetchTreatments = async () => {
      let clinicId = null;
      if (user && user.clinicId) {
        clinicId = typeof user.clinicId === 'object' ? user.clinicId._id : user.clinicId;
      } else if (clinic && clinic._id) {
        clinicId = clinic._id;
      }
      if (!clinicId) return;
      const result = await treatmentService.getTreatments({ clinicId });
      const treatments = Array.isArray(result.data) ? result.data : [];
      const map = {};
      treatments.forEach(t => { map[t._id] = t.name; });
      setTreatmentMap(map);
    };
    fetchTreatments();
  }, [clinic, user]);

  if (!localAppointment) return null;
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleStatusUpdate = async (status) => {
    if (status === localAppointment.status) return;
    
    // Check if user has permission to update to this status
    let canUpdateToStatus = false;
    let errorMessage = '';
    
    switch(userRole) {
      case 'Admin':
        // Admin can update to any status
        canUpdateToStatus = true;
        break;
      case 'Receptionist':
        // Receptionist can mark as Scheduled, Cancelled, No Show, but not Completed
        if (status === 'Completed') {
          errorMessage = 'Receptionists cannot mark appointments as Completed. Only Doctors and Admins can do this.';
        } else {
          canUpdateToStatus = true;
        }
        break;
      case 'Doctor':
        // Doctor can mark as Completed or Scheduled, but not Cancelled or No Show
        if (['Cancelled', 'No Show'].includes(status)) {
          errorMessage = 'Doctors cannot mark appointments as Cancelled or No Show. Please contact a Receptionist or Admin.';
        } else {
          canUpdateToStatus = true;
        }
        break;
      case 'Nurse':
        // Nurses can only mark as Scheduled
        if (status !== 'Scheduled') {
          errorMessage = 'Nurses can only mark appointments as Scheduled. Please contact a Doctor or Admin for other status changes.';
        } else {
          canUpdateToStatus = true;
        }
        break;
      default:
        errorMessage = `Your role (${userRole}) does not have permission to update appointment status.`;
        canUpdateToStatus = false;
    }
    
    // Additional rules based on current status
    if (localAppointment.status === 'Completed' && status !== 'Completed') {
      // Only Admin can change from Completed to another status
      if (userRole !== 'Admin') {
        errorMessage = 'Only Admins can change an appointment status from Completed to another status.';
        canUpdateToStatus = false;
      }
    }
    
    if (!canUpdateToStatus) {
      toast.error(errorMessage);
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      const result = await onUpdateStatus(localAppointment, status);
      if (result && result.error) {
        toast.error(result.message || 'Failed to update status');
        return;
      }
      setLocalAppointment(prev => ({
        ...prev,
        status: status
      }));
      toast.success(`Appointment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Handle specific error types
      let errorMsg = 'Failed to update status';
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'Permission denied: You do not have permission to update this appointment\'s status';
        } else if (error.response.status === 401) {
          errorMsg = 'Authentication required. Please log in again.';
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    // Check if user has permission to delete appointments
    if (!['Admin', 'Receptionist'].includes(userRole)) {
      toast.error(`Your role (${userRole}) does not have permission to delete appointments. Only Admin and Receptionist can delete appointments.`);
      return;
    }
    
    if (isConfirmingDelete) {
      // User has confirmed deletion
      try {
        onDelete(localAppointment._id);
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
    // Check if user has permission to reschedule appointments based on role and appointment status
    if (userRole) {
      // Only certain roles can reschedule appointments
      const canReschedule = 
        (['Admin', 'Receptionist', 'Doctor'].includes(userRole) && 
         !['Completed', 'Cancelled', 'No Show'].includes(localAppointment.status)) ||
        (userRole === 'Patient' && localAppointment.status === 'Scheduled');
      
      if (!canReschedule) {
        let errorMessage = '';
        
        if (['Completed', 'Cancelled', 'No Show'].includes(localAppointment.status)) {
          errorMessage = `Cannot reschedule: Appointments with status '${localAppointment.status}' cannot be rescheduled.`;
        } else {
          errorMessage = `Your role (${userRole}) does not have permission to reschedule this appointment.`;
        }
        
        toast.error(errorMessage);
        return;
      }
    }
    
    setIsRescheduling(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!onReschedule || !localAppointment || !localAppointment._id) {
      toast.error('Cannot reschedule: Missing appointment information');
      return;
    }
    
    // Double-check permissions before submitting
    const canReschedule = 
      (['Admin', 'Receptionist', 'Doctor'].includes(userRole) && 
       !['Completed', 'Cancelled', 'No Show'].includes(localAppointment.status)) ||
      (userRole === 'Patient' && localAppointment.status === 'Scheduled');
    
    if (!canReschedule) {
      toast.error(`You don't have permission to reschedule this appointment.`);
      setIsRescheduling(false);
      return;
    }
    
    // Get the new date from the form
    const rescheduleDate = document.getElementById('reschedule-date')?.value;
    const rescheduleTime = document.getElementById('reschedule-time')?.value;
    const rescheduleReason = document.getElementById('reschedule-reason')?.value || 'Appointment rescheduled';
    
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select a new date and time');
      return;
    }
    
    try {
      // Create a new Date object from the form values
      const [year, month, day] = rescheduleDate.split('-').map(Number);
      const [hours, minutes] = rescheduleTime.split(':').map(Number);
      
      const newStartTime = new Date(year, month - 1, day, hours, minutes);
      
      // Validate the new date
      if (isNaN(newStartTime.getTime())) {
        toast.error('Invalid date or time format');
        return;
      }
      
      // Check if the new date is in the past
      if (newStartTime < new Date()) {
        toast.error('Cannot reschedule to a date/time in the past');
        return;
      }
      
      // Create a reschedule history entry for UI update
      const rescheduleEntry = {
        previousStartTime: localAppointment.startTime,
        previousEndTime: localAppointment.endTime,
        reason: rescheduleReason,
        rescheduledBy: userRole,
        rescheduledAt: new Date().toISOString()
      };
      
      // Add to local state for immediate UI update
      setRescheduleHistory([...rescheduleHistory, rescheduleEntry]);
      
      // Call the parent component's reschedule handler
      await onReschedule(localAppointment._id, newStartTime);
      
      // Close the reschedule form
      setIsRescheduling(false);
      toast.success('Appointment rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment: ' + (error.message || 'Unknown error'));
    }
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
                {localAppointment.patientName || 
                 (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.name) || 
                 (localAppointment.patient && localAppointment.patient.name) || 
                 'Patient'}'s Appointment
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
                {/* Edit button - Admin, Receptionist, Doctor (only if appointment is not completed/cancelled) */}
                {['Admin', 'Receptionist', 'Doctor'].includes(userRole) && 
                 !['Completed', 'Cancelled', 'No Show'].includes(localAppointment.status) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(localAppointment)}
                    disabled={isUpdatingStatus}
                    icon={<FaEdit />}
                    title="Edit appointment details"
                  >
                    Edit
                  </Button>
                )}
                
                {/* Delete button - Admin, Receptionist (only if appointment is not completed) */}
                {['Admin', 'Receptionist'].includes(userRole) && 
                 localAppointment.status !== 'Completed' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isUpdatingStatus}
                    icon={<FaTrash />}
                    title="Delete this appointment"
                  >
                    Delete
                  </Button>
                )}
                
                {/* Reschedule button - All roles except Patient can only reschedule upcoming appointments */}
                {((['Admin', 'Receptionist', 'Doctor'].includes(userRole) && 
                   !['Completed', 'Cancelled', 'No Show'].includes(localAppointment.status)) ||
                  (userRole === 'Patient' && localAppointment.status === 'Scheduled')) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReschedule}
                    disabled={isUpdatingStatus || isRescheduling}
                    icon={<FaSync />}
                    title="Reschedule this appointment"
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
        
        {/* Rescheduling Form */}
        {isRescheduling && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
              <FaSync className="mr-2" /> Reschedule Appointment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  id="reschedule-date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label htmlFor="reschedule-time" className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  id="reschedule-time"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="reschedule-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rescheduling
              </label>
              <textarea
                id="reschedule-reason"
                rows="2"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Reason for rescheduling"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRescheduling(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRescheduleSubmit}
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        )}
        
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
                    {localAppointment.patientName || 
                     (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.name) || 
                     (localAppointment.patient && localAppointment.patient.name) || 
                     'Unknown Patient'}
                  </p>
                  {/* Email */}
                  {(localAppointment.patientEmail || 
                    (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.email) || 
                    (localAppointment.patient && localAppointment.patient.email)) && (
                    <p className="text-gray-600 text-sm">
                      {localAppointment.patientEmail || 
                       (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.email) || 
                       (localAppointment.patient && localAppointment.patient.email)}
                    </p>
                  )}
                  {/* Phone */}
                  {(localAppointment.patientPhone || 
                    (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.phone) || 
                    (localAppointment.patient && localAppointment.patient.phone)) && (
                    <p className="text-gray-600 text-sm">
                      {localAppointment.patientPhone || 
                       (localAppointment.patientId && typeof localAppointment.patientId === 'object' && localAppointment.patientId.phone) || 
                       (localAppointment.patient && localAppointment.patient.phone)}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FaUserMd className="mr-2" /> Doctor Information
                  </h4>
                  <p className="text-gray-800 font-medium">
                    Dr. {localAppointment.doctorName || 
                       (localAppointment.doctorId && typeof localAppointment.doctorId === 'object' && localAppointment.doctorId.name) || 
                       (localAppointment.doctor && localAppointment.doctor.name) || 
                       'Unknown Doctor'}
                  </p>
                  {/* Email */}
                  {(localAppointment.doctorEmail || 
                    (localAppointment.doctorId && typeof localAppointment.doctorId === 'object' && localAppointment.doctorId.email) || 
                    (localAppointment.doctor && localAppointment.doctor.email)) && (
                    <p className="text-gray-600 text-sm">
                      {localAppointment.doctorEmail || 
                       (localAppointment.doctorId && typeof localAppointment.doctorId === 'object' && localAppointment.doctorId.email) || 
                       (localAppointment.doctor && localAppointment.doctor.email)}
                    </p>
                  )}
                  {/* Specialization */}
                  {(localAppointment.specialization || 
                    (localAppointment.doctorId && typeof localAppointment.doctorId === 'object' && localAppointment.doctorId.specialization) || 
                    (localAppointment.doctor && localAppointment.doctor.specialization)) && (
                    <p className="text-gray-600 text-sm">
                      {localAppointment.specialization || 
                       (localAppointment.doctorId && typeof localAppointment.doctorId === 'object' && localAppointment.doctorId.specialization) || 
                       (localAppointment.doctor && localAppointment.doctor.specialization)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <FaNotesMedical className="mr-2" /> Appointment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Type */}
                  <div className="mb-2">
                    <span className="font-semibold">Service Type: </span>
                    {treatmentMap[localAppointment.serviceType] || localAppointment.serviceType}
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
              
              {/* Status Update Section with Role-Based Permissions */}
              {['Admin', 'Receptionist', 'Doctor', 'Nurse'].includes(userRole) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(APPOINTMENT_STATUS).map(status => {
                      // Define permission rules for each status
                      let canUpdateToStatus = false;
                      let tooltipMessage = '';
                      
                      switch(userRole) {
                        case 'Admin':
                          // Admin can update to any status
                          canUpdateToStatus = true;
                          tooltipMessage = `Mark as ${status}`;
                          break;
                        case 'Receptionist':
                          // Receptionist can mark as Scheduled, Cancelled, No Show, but not Completed
                          if (status === 'Completed') {
                            canUpdateToStatus = false;
                            tooltipMessage = 'Receptionists cannot mark appointments as Completed';
                          } else {
                            canUpdateToStatus = true;
                            tooltipMessage = `Mark as ${status}`;
                          }
                          break;
                        case 'Doctor':
                          // Doctor can mark as Completed or Scheduled, but not Cancelled or No Show
                          if (['Cancelled', 'No Show'].includes(status)) {
                            canUpdateToStatus = false;
                            tooltipMessage = `Doctors cannot mark appointments as ${status}`;
                          } else {
                            canUpdateToStatus = true;
                            tooltipMessage = `Mark as ${status}`;
                          }
                          break;
                        case 'Nurse':
                          // Nurses can only mark as Scheduled
                          if (status !== 'Scheduled') {
                            canUpdateToStatus = false;
                            tooltipMessage = `Nurses can only mark appointments as Scheduled`;
                          } else {
                            canUpdateToStatus = true;
                            tooltipMessage = `Mark as ${status}`;
                          }
                          break;
                        default:
                          canUpdateToStatus = false;
                          tooltipMessage = `${userRole} cannot update appointment status`;
                      }
                      
                      // Additional rules based on current status
                      if (localAppointment.status === 'Completed' && status !== 'Completed') {
                        // Only Admin can change from Completed to another status
                        if (userRole !== 'Admin') {
                          canUpdateToStatus = false;
                          tooltipMessage = 'Only Admins can change from Completed status';
                        }
                      }
                      
                      // Disable button if it's the current status
                      if (status === localAppointment.status) {
                        canUpdateToStatus = false;
                        tooltipMessage = 'Current status';
                      }
                      
                      return (
                        <Button
                          key={status}
                          variant={status === localAppointment.status ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleStatusUpdate(status)}
                          disabled={isUpdatingStatus || !canUpdateToStatus}
                          className={APPOINTMENT_STATUS_BUTTON_CLASSES[status]}
                          title={tooltipMessage}
                        >
                          {status}
                        </Button>
                      );
                    })}
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
