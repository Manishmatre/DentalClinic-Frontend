import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  FaSave, 
  FaClock, 
  FaBell, 
  FaCalendarAlt, 
  FaUserClock, 
  FaShieldAlt,
  FaCog,
  FaRobot,
  FaPlug,
  FaFileAlt,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AppointmentSettings = ({ settings, onSaveSettings }) => {
  const { user, clinic } = useAuth();
  
  // Enhanced default settings
  const defaultSettings = {
    schedulingHours: {
      monday: { start: '09:00', end: '17:00', isActive: true },
      tuesday: { start: '09:00', end: '17:00', isActive: true },
      wednesday: { start: '09:00', end: '17:00', isActive: true },
      thursday: { start: '09:00', end: '17:00', isActive: true },
      friday: { start: '09:00', end: '17:00', isActive: true },
      saturday: { start: '09:00', end: '13:00', isActive: true },
      sunday: { start: '09:00', end: '13:00', isActive: false }
    },
    appointmentDuration: 30,
    bufferTime: 10,
    allowPatientScheduling: true,
    requireApproval: true,
    notificationSettings: {
      sendReminderEmail: true,
      reminderEmailHours: 24,
      sendReminderSMS: true,
      reminderSMSHours: 2,
      notifyOnCancel: true,
      notifyOnReschedule: true,
      notifyOnNoShow: true,
      sendFollowUpEmail: true,
      followUpEmailDays: 1
    },
    // New advanced settings
    automationRules: {
      autoConfirmAppointments: false,
      autoConfirmConditions: {
        sameDayAppointments: false,
        emergencyAppointments: true,
        returningPatients: false,
        specificServices: []
      },
      conflictResolution: {
        allowOverbooking: false,
        maxOverbookPercentage: 10,
        autoReschedule: true,
        rescheduleBuffer: 15
      }
    },
    rolePermissions: {
      admin: {
        canCreateAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: true,
        canRescheduleAppointments: true,
        canViewAllAppointments: true,
        canManageSettings: true,
        canExportData: true,
        canManageUsers: true
      },
      receptionist: {
        canCreateAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: false,
        canRescheduleAppointments: true,
        canViewAllAppointments: true,
        canManageSettings: false,
        canExportData: true,
        canManageUsers: false
      },
      doctor: {
        canCreateAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: false,
        canRescheduleAppointments: true,
        canViewAllAppointments: false,
        canManageSettings: false,
        canExportData: false,
        canManageUsers: false
      },
      patient: {
        canCreateAppointments: false,
        canEditAppointments: false,
        canDeleteAppointments: false,
        canRescheduleAppointments: false,
        canViewAllAppointments: false,
        canManageSettings: false,
        canExportData: false,
        canManageUsers: false
      }
    },
    integrations: {
      calendarSync: {
        googleCalendar: false,
        outlookCalendar: false,
        appleCalendar: false
      },
      smsProvider: {
        enabled: false,
        provider: 'twilio',
        apiKey: '',
        apiSecret: ''
      },
      emailProvider: {
        enabled: true,
        provider: 'smtp',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: ''
      }
    },
    notificationTemplates: {
      appointmentConfirmation: {
        subject: 'Appointment Confirmed - {clinicName}',
        body: `Dear {patientName},

Your appointment has been confirmed for {appointmentDate} at {appointmentTime} with Dr. {doctorName}.

Location: {clinicAddress}
Service: {serviceType}

Please arrive 10 minutes before your scheduled time.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
{clinicName} Team`
      },
      appointmentReminder: {
        subject: 'Appointment Reminder - {clinicName}',
        body: `Dear {patientName},

This is a friendly reminder about your upcoming appointment:

Date: {appointmentDate}
Time: {appointmentTime}
Doctor: Dr. {doctorName}
Service: {serviceType}

Please arrive 10 minutes before your scheduled time.

If you need to reschedule or cancel, please contact us immediately.

Best regards,
{clinicName} Team`
      },
      appointmentCancellation: {
        subject: 'Appointment Cancelled - {clinicName}',
        body: `Dear {patientName},

Your appointment scheduled for {appointmentDate} at {appointmentTime} has been cancelled.

If you would like to reschedule, please contact us at your earliest convenience.

Best regards,
{clinicName} Team`
      }
    }
  };

  const [formSettings, setFormSettings] = useState(settings || defaultSettings);
  const [activeSection, setActiveSection] = useState('scheduling');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  // Check if user has permission to manage settings
  const canManageSettings = user?.role === 'Admin' || 
    (user?.role === 'Receptionist' && formSettings.rolePermissions?.receptionist?.canManageSettings);

  useEffect(() => {
    if (!canManageSettings) {
      toast.error('You do not have permission to manage appointment settings');
    }
  }, [canManageSettings]);

  const handleSchedulingHoursChange = (day, field, value) => {
    setFormSettings({
      ...formSettings,
      schedulingHours: {
        ...formSettings.schedulingHours,
        [day]: {
          ...formSettings.schedulingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleToggleDayActive = (day) => {
    setFormSettings({
      ...formSettings,
      schedulingHours: {
        ...formSettings.schedulingHours,
        [day]: {
          ...formSettings.schedulingHours[day],
          isActive: !formSettings.schedulingHours[day].isActive
        }
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormSettings({
      ...formSettings,
      [field]: value
    });
  };

  const handleNotificationChange = (field, value) => {
    setFormSettings({
      ...formSettings,
      notificationSettings: {
        ...formSettings.notificationSettings,
        [field]: value
      }
    });
  };

  const handleAutomationChange = (section, field, value) => {
    setFormSettings({
      ...formSettings,
      automationRules: {
        ...formSettings.automationRules,
        [section]: {
          ...formSettings.automationRules[section],
          [field]: value
        }
      }
    });
  };

  const handlePermissionChange = (role, permission, value) => {
    setFormSettings({
      ...formSettings,
      rolePermissions: {
        ...formSettings.rolePermissions,
        [role]: {
          ...formSettings.rolePermissions[role],
          [permission]: value
        }
      }
    });
  };

  const handleIntegrationChange = (service, field, value) => {
    setFormSettings({
      ...formSettings,
      integrations: {
        ...formSettings.integrations,
        [service]: {
          ...formSettings.integrations[service],
          [field]: value
        }
      }
    });
  };

  const handleTemplateChange = (templateType, field, value) => {
    setFormSettings({
      ...formSettings,
      notificationTemplates: {
        ...formSettings.notificationTemplates,
        [templateType]: {
          ...formSettings.notificationTemplates[templateType],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageSettings) {
      toast.error('You do not have permission to save settings');
      return;
    }

    try {
      setSaving(true);
    if (onSaveSettings) {
        await onSaveSettings(formSettings);
      }
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const roles = [
    { key: 'admin', label: 'Administrator', icon: FaShieldAlt },
    { key: 'receptionist', label: 'Receptionist', icon: FaUsers },
    { key: 'doctor', label: 'Doctor', icon: FaUserClock },
    { key: 'patient', label: 'Patient', icon: FaUsers }
  ];

  const permissions = [
    { key: 'canCreateAppointments', label: 'Create Appointments' },
    { key: 'canEditAppointments', label: 'Edit Appointments' },
    { key: 'canDeleteAppointments', label: 'Delete Appointments' },
    { key: 'canRescheduleAppointments', label: 'Reschedule Appointments' },
    { key: 'canViewAllAppointments', label: 'View All Appointments' },
    { key: 'canManageSettings', label: 'Manage Settings' },
    { key: 'canExportData', label: 'Export Data' },
    { key: 'canManageUsers', label: 'Manage Users' }
  ];

  if (!canManageSettings) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You do not have permission to manage appointment settings.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Appointment Settings</h3>
        <p className="text-gray-600">Configure comprehensive appointment management settings</p>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveSection('scheduling')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'scheduling'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaCalendarAlt className="inline-block mr-2" /> Scheduling
          </button>
          <button
            onClick={() => setActiveSection('automation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'automation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaRobot className="inline-block mr-2" /> Automation
          </button>
          <button
            onClick={() => setActiveSection('permissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaShieldAlt className="inline-block mr-2" /> Permissions
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBell className="inline-block mr-2" /> Notifications
          </button>
          <button
            onClick={() => setActiveSection('integrations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaPlug className="inline-block mr-2" /> Integrations
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Scheduling Hours */}
        {activeSection === 'scheduling' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Scheduling Hours</h4>
            <div className="space-y-4">
              {days.map((day) => (
                  <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-32">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`active-${day.key}`}
                        checked={formSettings.schedulingHours[day.key].isActive}
                        onChange={() => handleToggleDayActive(day.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                        <label htmlFor={`active-${day.key}`} className="ml-2 block text-sm font-medium text-gray-900">
                        {day.label}
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`start-${day.key}`} className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id={`start-${day.key}`}
                        value={formSettings.schedulingHours[day.key].start}
                        onChange={(e) => handleSchedulingHoursChange(day.key, 'start', e.target.value)}
                        disabled={!formSettings.schedulingHours[day.key].isActive}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`end-${day.key}`} className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        id={`end-${day.key}`}
                        value={formSettings.schedulingHours[day.key].end}
                        onChange={(e) => handleSchedulingHoursChange(day.key, 'end', e.target.value)}
                        disabled={!formSettings.schedulingHours[day.key].isActive}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Appointment Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="appointmentDuration" className="block text-sm font-medium text-gray-700">
                    Default Duration (minutes)
                </label>
                <select
                  id="appointmentDuration"
                  value={formSettings.appointmentDuration}
                  onChange={(e) => handleInputChange('appointmentDuration', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              <div>
                <label htmlFor="bufferTime" className="block text-sm font-medium text-gray-700">
                    Buffer Time (minutes)
                </label>
                <select
                  id="bufferTime"
                  value={formSettings.bufferTime}
                  onChange={(e) => handleInputChange('bufferTime', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value={0}>No buffer</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Scheduling
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="allowPatientScheduling"
                        type="checkbox"
                        checked={formSettings.allowPatientScheduling}
                        onChange={(e) => handleInputChange('allowPatientScheduling', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowPatientScheduling" className="ml-2 text-sm text-gray-700">
                        Allow self-scheduling
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="requireApproval"
                        type="checkbox"
                        checked={formSettings.requireApproval}
                        onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
                        Require approval
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Automation Rules */}
        {activeSection === 'automation' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Auto-Confirmation Rules</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="autoConfirmAppointments"
                      type="checkbox"
                      checked={formSettings.automationRules.autoConfirmAppointments}
                      onChange={(e) => handleAutomationChange('autoConfirmAppointments', null, e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoConfirmAppointments" className="font-medium text-gray-700">
                      Enable Auto-Confirmation
                    </label>
                    <p className="text-gray-500">Automatically confirm appointments based on rules</p>
                  </div>
                </div>

                {formSettings.automationRules.autoConfirmAppointments && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center">
                      <input
                        id="sameDayAppointments"
                        type="checkbox"
                        checked={formSettings.automationRules.autoConfirmConditions.sameDayAppointments}
                        onChange={(e) => handleAutomationChange('autoConfirmConditions', 'sameDayAppointments', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sameDayAppointments" className="ml-2 text-sm text-gray-700">
                        Same-day appointments
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="emergencyAppointments"
                        type="checkbox"
                        checked={formSettings.automationRules.autoConfirmConditions.emergencyAppointments}
                        onChange={(e) => handleAutomationChange('autoConfirmConditions', 'emergencyAppointments', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emergencyAppointments" className="ml-2 text-sm text-gray-700">
                        Emergency appointments
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="returningPatients"
                        type="checkbox"
                        checked={formSettings.automationRules.autoConfirmConditions.returningPatients}
                        onChange={(e) => handleAutomationChange('autoConfirmConditions', 'returningPatients', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="returningPatients" className="ml-2 text-sm text-gray-700">
                        Returning patients
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Conflict Resolution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="allowOverbooking"
                      type="checkbox"
                      checked={formSettings.automationRules.conflictResolution.allowOverbooking}
                      onChange={(e) => handleAutomationChange('conflictResolution', 'allowOverbooking', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowOverbooking" className="ml-2 text-sm font-medium text-gray-700">
                      Allow overbooking
                    </label>
                  </div>
                  
                  {formSettings.automationRules.conflictResolution.allowOverbooking && (
                    <div>
                      <label htmlFor="maxOverbookPercentage" className="block text-sm font-medium text-gray-700">
                        Max Overbook Percentage
                      </label>
                      <input
                        type="number"
                        id="maxOverbookPercentage"
                        value={formSettings.automationRules.conflictResolution.maxOverbookPercentage}
                        onChange={(e) => handleAutomationChange('conflictResolution', 'maxOverbookPercentage', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="autoReschedule"
                      type="checkbox"
                      checked={formSettings.automationRules.conflictResolution.autoReschedule}
                      onChange={(e) => handleAutomationChange('conflictResolution', 'autoReschedule', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoReschedule" className="ml-2 text-sm font-medium text-gray-700">
                      Auto-reschedule conflicts
                    </label>
                  </div>
                  
                  {formSettings.automationRules.conflictResolution.autoReschedule && (
                    <div>
                      <label htmlFor="rescheduleBuffer" className="block text-sm font-medium text-gray-700">
                        Reschedule Buffer (minutes)
                      </label>
                      <input
                        type="number"
                        id="rescheduleBuffer"
                        value={formSettings.automationRules.conflictResolution.rescheduleBuffer}
                        onChange={(e) => handleAutomationChange('conflictResolution', 'rescheduleBuffer', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Role Permissions */}
        {activeSection === 'permissions' && (
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Role-Based Permissions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission
                    </th>
                    {roles.map(role => (
                      <th key={role.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1">
                          <role.icon className="text-gray-400" />
                          <span>{role.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map(permission => (
                    <tr key={permission.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {permission.label}
                      </td>
                      {roles.map(role => (
                        <td key={role.key} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={formSettings.rolePermissions[role.key][permission.key]}
                            onChange={(e) => handlePermissionChange(role.key, permission.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                  <h5 className="font-medium text-gray-700">Email Notifications</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                  <input
                    id="sendReminderEmail"
                    type="checkbox"
                    checked={formSettings.notificationSettings.sendReminderEmail}
                    onChange={(e) => handleNotificationChange('sendReminderEmail', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                      <label htmlFor="sendReminderEmail" className="ml-2 text-sm text-gray-700">
                        Send email reminders
                  </label>
              </div>
              {formSettings.notificationSettings.sendReminderEmail && (
                      <div>
                  <label htmlFor="reminderEmailHours" className="block text-sm font-medium text-gray-700">
                          Reminder timing (hours before)
                  </label>
                  <select
                    id="reminderEmailHours"
                    value={formSettings.notificationSettings.reminderEmailHours}
                    onChange={(e) => handleNotificationChange('reminderEmailHours', parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                  </select>
                </div>
              )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-700">SMS Notifications</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                  <input
                    id="sendReminderSMS"
                    type="checkbox"
                    checked={formSettings.notificationSettings.sendReminderSMS}
                    onChange={(e) => handleNotificationChange('sendReminderSMS', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                      <label htmlFor="sendReminderSMS" className="ml-2 text-sm text-gray-700">
                        Send SMS reminders
                  </label>
              </div>
              {formSettings.notificationSettings.sendReminderSMS && (
                      <div>
                  <label htmlFor="reminderSMSHours" className="block text-sm font-medium text-gray-700">
                          Reminder timing (hours before)
                  </label>
                  <select
                    id="reminderSMSHours"
                    value={formSettings.notificationSettings.reminderSMSHours}
                    onChange={(e) => handleNotificationChange('reminderSMSHours', parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </select>
                </div>
              )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h5 className="font-medium text-gray-700 mb-3">Additional Notifications</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                  <input
                    id="notifyOnCancel"
                    type="checkbox"
                    checked={formSettings.notificationSettings.notifyOnCancel}
                    onChange={(e) => handleNotificationChange('notifyOnCancel', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                    <label htmlFor="notifyOnCancel" className="ml-2 text-sm text-gray-700">
                      Notify on cancellation
                  </label>
                </div>
                  <div className="flex items-center">
                  <input
                    id="notifyOnReschedule"
                    type="checkbox"
                    checked={formSettings.notificationSettings.notifyOnReschedule}
                    onChange={(e) => handleNotificationChange('notifyOnReschedule', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                    <label htmlFor="notifyOnReschedule" className="ml-2 text-sm text-gray-700">
                      Notify on reschedule
                    </label>
                </div>
                  <div className="flex items-center">
                    <input
                      id="notifyOnNoShow"
                      type="checkbox"
                      checked={formSettings.notificationSettings.notifyOnNoShow}
                      onChange={(e) => handleNotificationChange('notifyOnNoShow', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyOnNoShow" className="ml-2 text-sm text-gray-700">
                      Notify on no-show
                  </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Notification Templates */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Notification Templates</h4>
              <div className="space-y-4">
                {Object.entries(formSettings.notificationTemplates).map(([templateType, template]) => (
                  <div key={templateType} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-700 capitalize">
                        {templateType.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTemplate(editingTemplate === templateType ? null : templateType)}
                      >
                        <FaEdit className="mr-1" />
                        {editingTemplate === templateType ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                    
                    {editingTemplate === templateType ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subject</label>
                          <input
                            type="text"
                            value={template.subject}
                            onChange={(e) => handleTemplateChange(templateType, 'subject', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Body</label>
                          <textarea
                            value={template.body}
                            onChange={(e) => handleTemplateChange(templateType, 'body', e.target.value)}
                            rows={6}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Available variables: {'{patientName} {doctorName} {appointmentDate} {appointmentTime} {clinicName} {clinicAddress} {serviceType}'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Subject:</span>
                          <span className="ml-2 text-sm text-gray-600">{template.subject}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Body:</span>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{template.body}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </Card>
          </div>
        )}

        {/* Integrations */}
        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Calendar Integrations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    id="googleCalendar"
                    type="checkbox"
                    checked={formSettings.integrations.calendarSync.googleCalendar}
                    onChange={(e) => handleIntegrationChange('calendarSync', 'googleCalendar', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="googleCalendar" className="ml-2 text-sm text-gray-700">
                    Google Calendar
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="outlookCalendar"
                    type="checkbox"
                    checked={formSettings.integrations.calendarSync.outlookCalendar}
                    onChange={(e) => handleIntegrationChange('calendarSync', 'outlookCalendar', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="outlookCalendar" className="ml-2 text-sm text-gray-700">
                    Outlook Calendar
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="appleCalendar"
                    type="checkbox"
                    checked={formSettings.integrations.calendarSync.appleCalendar}
                    onChange={(e) => handleIntegrationChange('calendarSync', 'appleCalendar', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="appleCalendar" className="ml-2 text-sm text-gray-700">
                    Apple Calendar
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">SMS Provider Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="smsEnabled"
                    type="checkbox"
                    checked={formSettings.integrations.smsProvider.enabled}
                    onChange={(e) => handleIntegrationChange('smsProvider', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsEnabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enable SMS notifications
                  </label>
                </div>
                
                {formSettings.integrations.smsProvider.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="smsProvider" className="block text-sm font-medium text-gray-700">
                        SMS Provider
                      </label>
                      <select
                        id="smsProvider"
                        value={formSettings.integrations.smsProvider.provider}
                        onChange={(e) => handleIntegrationChange('smsProvider', 'provider', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="aws-sns">AWS SNS</option>
                        <option value="nexmo">Nexmo</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="smsApiKey" className="block text-sm font-medium text-gray-700">
                        API Key
                      </label>
                      <input
                        type="password"
                        id="smsApiKey"
                        value={formSettings.integrations.smsProvider.apiKey}
                        onChange={(e) => handleIntegrationChange('smsProvider', 'apiKey', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
            </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            variant="primary"
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
            <FaSave className="mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentSettings;
