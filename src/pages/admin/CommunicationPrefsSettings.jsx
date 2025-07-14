import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaBell, 
  FaEnvelope, 
  FaSms, 
  FaFileAlt, 
  FaSpinner, 
  FaSave, 
  FaEye 
} from 'react-icons/fa';

const CommunicationPrefsSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('appointmentConfirmation');
  
  // Communication settings state
  const [settings, setSettings] = useState({
    // Notification settings
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    notifyAppointmentBooking: true,
    notifyAppointmentReminder: true,
    notifyAppointmentCancellation: true,
    notifyAppointmentReschedule: true,
    notifyPaymentReceived: true,
    notifyPrescriptionIssued: true,
    notifyTestResultsAvailable: true,
    appointmentReminderTime: 24,
    followupReminderEnabled: true,
    followupReminderDays: 7,
    
    // Email settings
    senderName: 'Smile Dental Care',
    senderEmail: 'notifications@smiledentalcare.com',
    replyToEmail: 'info@smiledentalcare.com',
    emailFooter: 'This is an automated message from Smile Dental Care. Please do not reply to this email.',
    emailProvider: 'smtp',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'username@example.com',
    smtpPassword: 'password123',
    smtpEncryption: 'tls',
    
    // SMS settings
    smsProvider: 'textlocal',
    senderPhoneNumber: '+919876543210',
    smsSenderId: 'SMILE',
    twilioAccountSid: 'AC123456789',
    twilioAuthToken: 'auth123456',
    smsApiKey: 'api123456',
    smsCharacterLimit: true,
    smsOptInRequired: true,
    
    // Message templates
    templates: {
      appointmentConfirmation: {
        emailSubject: 'Your appointment with {doctorName} is confirmed',
        emailTemplate: 'Dear {patientName},\n\nYour appointment with {doctorName} on {appointmentDate} at {appointmentTime} has been confirmed.\n\nThank you for choosing {clinicName}.',
        smsTemplate: 'Your appointment with Dr. {doctorName} on {appointmentDate} at {appointmentTime} is confirmed. - {clinicName}'
      },
      appointmentReminder: {
        emailSubject: 'Reminder: Your appointment tomorrow',
        emailTemplate: 'Dear {patientName},\n\nThis is a reminder about your appointment with {doctorName} tomorrow at {appointmentTime}.\n\nWe look forward to seeing you.\n\nRegards,\n{clinicName}',
        smsTemplate: 'Reminder: Your appointment with Dr. {doctorName} is tomorrow at {appointmentTime}. - {clinicName}'
      },
      appointmentCancellation: {
        emailSubject: 'Your appointment has been cancelled',
        emailTemplate: 'Dear {patientName},\n\nYour appointment with {doctorName} on {appointmentDate} at {appointmentTime} has been cancelled.\n\nPlease contact us if you would like to reschedule.\n\nRegards,\n{clinicName}',
        smsTemplate: 'Your appointment with Dr. {doctorName} on {appointmentDate} has been cancelled. Please call us to reschedule.'
      },
      appointmentReschedule: {
        emailSubject: 'Your appointment has been rescheduled',
        emailTemplate: 'Dear {patientName},\n\nYour appointment with {doctorName} has been rescheduled to {appointmentDate} at {appointmentTime}.\n\nPlease contact us if this new time does not work for you.\n\nRegards,\n{clinicName}',
        smsTemplate: 'Your appointment with Dr. {doctorName} has been rescheduled to {appointmentDate} at {appointmentTime}. - {clinicName}'
      }
    }
  });
  
  useEffect(() => {
    fetchCommunicationSettings();
  }, []);
  
  const fetchCommunicationSettings = () => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch from an API
      // For now, we're using the default state values
      setLoading(false);
    }, 1000);
  };
  
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTemplateChange = (templateId, field, value) => {
    setSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [templateId]: {
          ...prev.templates[templateId],
          [field]: value
        }
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Communication settings saved successfully');
      setSaving(false);
    }, 1500);
  };
  
  const handleCancel = () => {
    // Reset to original settings
    fetchCommunicationSettings();
    toast.info('Changes discarded');
  };
  
  const resetTemplate = (templateId) => {
    // In a real app, you would reset to default template from backend
    toast.info(`Template reset to default`);
  };
  
  const previewTemplate = (templateId) => {
    // In a real app, you would show a preview with actual data
    toast.info(`Preview functionality would be implemented here`);
  };
  
  // Custom Switch component
  const Switch = ({ checked, onChange, label, description }) => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0">
        <div>
          <div className="font-medium text-gray-700">{label}</div>
          {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-900 flex items-center">
        <FaBell className="mr-2" />
        Communication Preferences
      </h3>
      <p className="mb-6 text-gray-600">
        Configure email and SMS notification settings, message templates, and communication preferences.
      </p>
      
      {loading && Object.keys(settings).length === 0 ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
          <p className="text-gray-500">Loading communication settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBell className="inline-block mr-2" />
                Notification Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'email'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaEnvelope className="inline-block mr-2" />
                Email Configuration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sms')}
                className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'sms'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaSms className="inline-block mr-2" />
                SMS Configuration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'templates'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaFileAlt className="inline-block mr-2" />
                Message Templates
              </button>
            </nav>
          </div>
          
          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex items-center">
                <FaBell className="mr-2 text-indigo-600" />
                Notification Preferences
              </div>
              
              <Switch 
                checked={settings.enableEmailNotifications}
                onChange={(e) => handleChange('enableEmailNotifications', e.target.checked)}
                label="Enable Email Notifications"
                description="Send notifications to patients via email"
              />
              
              <Switch 
                checked={settings.enableSmsNotifications}
                onChange={(e) => handleChange('enableSmsNotifications', e.target.checked)}
                label="Enable SMS Notifications"
                description="Send notifications to patients via SMS"
              />
              
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Notification Events</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      id="notifyAppointmentBooking"
                      type="checkbox"
                      checked={settings.notifyAppointmentBooking}
                      onChange={(e) => handleChange('notifyAppointmentBooking', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyAppointmentBooking" className="ml-2 block text-sm text-gray-700">
                      Appointment Booking
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyAppointmentReminder"
                      type="checkbox"
                      checked={settings.notifyAppointmentReminder}
                      onChange={(e) => handleChange('notifyAppointmentReminder', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyAppointmentReminder" className="ml-2 block text-sm text-gray-700">
                      Appointment Reminder
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyAppointmentCancellation"
                      type="checkbox"
                      checked={settings.notifyAppointmentCancellation}
                      onChange={(e) => handleChange('notifyAppointmentCancellation', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyAppointmentCancellation" className="ml-2 block text-sm text-gray-700">
                      Appointment Cancellation
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyAppointmentReschedule"
                      type="checkbox"
                      checked={settings.notifyAppointmentReschedule}
                      onChange={(e) => handleChange('notifyAppointmentReschedule', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyAppointmentReschedule" className="ml-2 block text-sm text-gray-700">
                      Appointment Rescheduling
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyPaymentReceived"
                      type="checkbox"
                      checked={settings.notifyPaymentReceived}
                      onChange={(e) => handleChange('notifyPaymentReceived', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyPaymentReceived" className="ml-2 block text-sm text-gray-700">
                      Payment Received
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyPrescriptionIssued"
                      type="checkbox"
                      checked={settings.notifyPrescriptionIssued}
                      onChange={(e) => handleChange('notifyPrescriptionIssued', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyPrescriptionIssued" className="ml-2 block text-sm text-gray-700">
                      Prescription Issued
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifyTestResultsAvailable"
                      type="checkbox"
                      checked={settings.notifyTestResultsAvailable}
                      onChange={(e) => handleChange('notifyTestResultsAvailable', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyTestResultsAvailable" className="ml-2 block text-sm text-gray-700">
                      Test Results Available
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Reminder Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointmentReminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Reminder Time
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <input 
                        type="number" 
                        id="appointmentReminderTime" 
                        value={settings.appointmentReminderTime}
                        onChange={(e) => handleChange('appointmentReminderTime', parseInt(e.target.value, 10))}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="1"
                        max="72"
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        hours before appointment
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        id="followupReminderEnabled"
                        type="checkbox"
                        checked={settings.followupReminderEnabled}
                        onChange={(e) => handleChange('followupReminderEnabled', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="followupReminderEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                        Enable Follow-up Reminders
                      </label>
                    </div>
                    
                    {settings.followupReminderEnabled && (
                      <div className="flex rounded-md shadow-sm mt-2">
                        <input 
                          type="number" 
                          id="followupReminderDays" 
                          value={settings.followupReminderDays}
                          onChange={(e) => handleChange('followupReminderDays', parseInt(e.target.value, 10))}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          min="1"
                          max="30"
                        />
                        <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          days after appointment
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'email' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex items-center">
                <FaEnvelope className="mr-2 text-indigo-600" />
                Email Configuration
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Sender Name
                    </label>
                    <input 
                      type="text" 
                      id="senderName" 
                      value={settings.senderName}
                      onChange={(e) => handleChange('senderName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Clinic Name"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Name that will appear as the sender of emails
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Sender Email
                    </label>
                    <input 
                      type="email" 
                      id="senderEmail" 
                      value={settings.senderEmail}
                      onChange={(e) => handleChange('senderEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="notifications@example.com"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email address that will appear as the sender
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="replyToEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input 
                    type="email" 
                    id="replyToEmail" 
                    value={settings.replyToEmail}
                    onChange={(e) => handleChange('replyToEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="info@example.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Email address that patients can reply to
                  </p>
                </div>
                
                <div>
                  <label htmlFor="emailFooter" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Footer
                  </label>
                  <textarea 
                    id="emailFooter" 
                    value={settings.emailFooter}
                    onChange={(e) => handleChange('emailFooter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows="3"
                    placeholder="Enter text to appear at the bottom of all emails"
                  />
                </div>
                
                <div>
                  <label htmlFor="emailProvider" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Provider
                  </label>
                  <select 
                    id="emailProvider" 
                    value={settings.emailProvider}
                    onChange={(e) => handleChange('emailProvider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="smtp">SMTP Server</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailchimp">Mailchimp</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                
                {settings.emailProvider === 'smtp' && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-3">SMTP Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Host
                        </label>
                        <input 
                          type="text" 
                          id="smtpHost" 
                          value={settings.smtpHost}
                          onChange={(e) => handleChange('smtpHost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="smtp.example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Port
                        </label>
                        <input 
                          type="text" 
                          id="smtpPort" 
                          value={settings.smtpPort}
                          onChange={(e) => handleChange('smtpPort', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="587"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Username
                        </label>
                        <input 
                          type="text" 
                          id="smtpUsername" 
                          value={settings.smtpUsername}
                          onChange={(e) => handleChange('smtpUsername', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="username@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Password
                        </label>
                        <input 
                          type="password" 
                          id="smtpPassword" 
                          value={settings.smtpPassword}
                          onChange={(e) => handleChange('smtpPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-1">
                        Encryption
                      </label>
                      <select 
                        id="smtpEncryption" 
                        value={settings.smtpEncryption}
                        onChange={(e) => handleChange('smtpEncryption', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="none">None</option>
                        <option value="ssl">SSL</option>
                        <option value="tls">TLS</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'sms' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex items-center">
                <FaSms className="mr-2 text-indigo-600" />
                SMS Configuration
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="smsProvider" className="block text-sm font-medium text-gray-700 mb-1">
                    SMS Provider
                  </label>
                  <select 
                    id="smsProvider" 
                    value={settings.smsProvider}
                    onChange={(e) => handleChange('smsProvider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="textlocal">TextLocal</option>
                    <option value="twilio">Twilio</option>
                    <option value="msg91">MSG91</option>
                    <option value="gupshup">GupShup</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="senderPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Sender Phone Number
                    </label>
                    <input 
                      type="text" 
                      id="senderPhoneNumber" 
                      value={settings.senderPhoneNumber}
                      onChange={(e) => handleChange('senderPhoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+919876543210"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Phone number to send SMS from (if supported by provider)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="smsSenderId" className="block text-sm font-medium text-gray-700 mb-1">
                      Sender ID
                    </label>
                    <input 
                      type="text" 
                      id="smsSenderId" 
                      value={settings.smsSenderId}
                      onChange={(e) => handleChange('smsSenderId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="CLINIC"
                      maxLength="6"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      6-character ID that appears as the sender (India specific)
                    </p>
                  </div>
                </div>
                
                {settings.smsProvider === 'twilio' && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-3">Twilio Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700 mb-1">
                          Account SID
                        </label>
                        <input 
                          type="text" 
                          id="twilioAccountSid" 
                          value={settings.twilioAccountSid}
                          onChange={(e) => handleChange('twilioAccountSid', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="AC123456789"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700 mb-1">
                          Auth Token
                        </label>
                        <input 
                          type="password" 
                          id="twilioAuthToken" 
                          value={settings.twilioAuthToken}
                          onChange={(e) => handleChange('twilioAuthToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {(settings.smsProvider === 'textlocal' || settings.smsProvider === 'msg91' || settings.smsProvider === 'gupshup') && (
                  <div>
                    <label htmlFor="smsApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input 
                      type="password" 
                      id="smsApiKey" 
                      value={settings.smsApiKey}
                      onChange={(e) => handleChange('smsApiKey', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center">
                    <input
                      id="smsCharacterLimit"
                      type="checkbox"
                      checked={settings.smsCharacterLimit}
                      onChange={(e) => handleChange('smsCharacterLimit', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsCharacterLimit" className="ml-2 block text-sm text-gray-700">
                      Enforce SMS character limit (160 characters per message)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="smsOptInRequired"
                      type="checkbox"
                      checked={settings.smsOptInRequired}
                      onChange={(e) => handleChange('smsOptInRequired', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsOptInRequired" className="ml-2 block text-sm text-gray-700">
                      Require patient opt-in for SMS notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'templates' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex items-center">
                <FaFileAlt className="mr-2 text-indigo-600" />
                Message Templates
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Template to Edit
                  </label>
                  <select
                    id="templateSelect"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="appointmentConfirmation">Appointment Confirmation</option>
                    <option value="appointmentReminder">Appointment Reminder</option>
                    <option value="appointmentCancellation">Appointment Cancellation</option>
                    <option value="appointmentReschedule">Appointment Reschedule</option>
                  </select>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-4">
                  <div className="mb-4">
                    <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      id="emailSubject"
                      value={settings.templates[selectedTemplate].emailSubject}
                      onChange={(e) => handleTemplateChange(selectedTemplate, 'emailSubject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700">
                        Email Template
                      </label>
                      <div className="text-xs text-gray-500">
                        Available variables: {'{patientName}'}, {'{doctorName}'}, {'{appointmentDate}'}, {'{appointmentTime}'}, {'{clinicName}'}
                      </div>
                    </div>
                    <textarea
                      id="emailTemplate"
                      value={settings.templates[selectedTemplate].emailTemplate}
                      onChange={(e) => handleTemplateChange(selectedTemplate, 'emailTemplate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows="6"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="smsTemplate" className="block text-sm font-medium text-gray-700">
                        SMS Template
                      </label>
                      <div className="text-xs text-gray-500">
                        Available variables: {'{patientName}'}, {'{doctorName}'}, {'{appointmentDate}'}, {'{appointmentTime}'}, {'{clinicName}'}
                      </div>
                    </div>
                    <textarea
                      id="smsTemplate"
                      value={settings.templates[selectedTemplate].smsTemplate}
                      onChange={(e) => handleTemplateChange(selectedTemplate, 'smsTemplate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows="3"
                    />
                    {settings.smsCharacterLimit && (
                      <div className={`text-xs mt-1 ${settings.templates[selectedTemplate].smsTemplate.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {settings.templates[selectedTemplate].smsTemplate.length}/160 characters
                        {settings.templates[selectedTemplate].smsTemplate.length > 160 && ' (exceeds limit)'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => resetTemplate(selectedTemplate)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset to Default
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => previewTemplate(selectedTemplate)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <FaEye className="mr-1" /> Preview
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommunicationPrefsSettings;
